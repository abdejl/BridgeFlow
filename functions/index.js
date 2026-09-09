// functions/index.js
const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineString, defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Firebase Admin (required for params/secrets to work).
initializeApp();

// ── Secret reference (never hardcoded) ──────────────────────
const GEMINI_API_KEY = defineString("GEMINI_API_KEY");
const SENSOR_API_KEY = defineString("SENSOR_API_KEY");

// ── Model constants ─────────────────────────────────────────
const MODEL_NAME = "gemini-2.0-flash";
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT_MS = 30_000;

// ── System prompt ───────────────────────────────────────────
const SYSTEM_PROMPT = `You are a Rural Water Management Consultant specialized in Moroccan water infrastructure.

Your role:
- Analyze real-time water sensor data from rural irrigation sectors (called "Boutbira" sectors).
- Provide concise, actionable advice grounded in Moroccan agricultural water practices.
- Consider seasonal patterns, typical flow rates for drip/gravitation systems, and local water scarcity conditions.

Rules:
- Always respond with a SINGLE valid JSON object. No markdown, no explanation, no wrapping.
- All text fields must be in English.
- AlertLevel must be exactly one of: "low", "medium", "high".
- PotentialSavingsLiters must be a non-negative number.
- Keep OptimizationAdvice under 2 sentences.
- Keep RecommendedAction as a single imperative sentence.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    AlertLevel:            { type: "string", enum: ["low", "medium", "high"] },
    OptimizationAdvice:    { type: "string" },
    PotentialSavingsLiters:{ type: "number" },
    RecommendedAction:     { type: "string" },
  },
  required: ["AlertLevel", "OptimizationAdvice", "PotentialSavingsLiters", "RecommendedAction"],
};

// ── Input validation ────────────────────────────────────────
function validateInput(data) {
  if (!data || typeof data !== "object") {
    throw new HttpsError("invalid-argument", "Request body must be a JSON object.");
  }

  const { sensorData } = data;

  if (!Array.isArray(sensorData) || sensorData.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "sensorData must be a non-empty array of sector objects."
    );
  }

  for (const [i, sector] of sensorData.entries()) {
    if (sector.waterLevel == null || sector.flowRate == null) {
      throw new HttpsError(
        "invalid-argument",
        `sensorData[${i}] is missing required fields (waterLevel, flowRate).`
      );
    }
    if (typeof sector.waterLevel !== "number" || typeof sector.flowRate !== "number") {
      throw new HttpsError(
        "invalid-argument",
        `sensorData[${i}].waterLevel and flowRate must be numbers.`
      );
    }
  }
}

// ── Call Gemini with retry ──────────────────────────────────
async function callGemini(genAI, prompt) {
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.4,
      maxOutputTokens: 300,
    },
  });

  let lastError;

  for (attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Double-check: parse to validate shape before returning.
      const parsed = JSON.parse(text);
      if (
        !parsed.AlertLevel ||
        parsed.PotentialSavingsLiters == null ||
        !parsed.OptimizationAdvice ||
        !parsed.RecommendedAction
      ) {
        throw new Error("Incomplete response shape");
      }

      // Clamp savings to non-negative.
      parsed.PotentialSavingsLiters = Math.max(0, parsed.PotentialSavingsLiters);

      return parsed;
    } catch (err) {
      lastError = err;
      console.warn(`Gemini attempt ${attempt + 1} failed:`, err.message);
    }
  }

  throw lastError;
}

// ── Sector validation (ingest) ─────────────────────────────
const VALID_STATUSES = ["normal", "warning", "critical"];

function validateSectors(sectors) {
  if (!Array.isArray(sectors) || sectors.length === 0) {
    return "sectors must be a non-empty array.";
  }

  for (const [i, s] of sectors.entries()) {
    if (!Number.isInteger(s.sectorId) || s.sectorId < 1) {
      return `sectors[${i}].sectorId must be a positive integer.`;
    }
    if (typeof s.sectorName !== "string" || s.sectorName.trim() === "") {
      return `sectors[${i}].sectorName must be a non-empty string.`;
    }
    if (typeof s.waterLevel !== "number" || s.waterLevel < 0 || s.waterLevel > 100) {
      return `sectors[${i}].waterLevel must be a number between 0 and 100.`;
    }
    if (typeof s.flowRate !== "number" || s.flowRate < 0) {
      return `sectors[${i}].flowRate must be a non-negative number.`;
    }
    if (!VALID_STATUSES.includes(s.status)) {
      return `sectors[${i}].status must be one of: ${VALID_STATUSES.join(", ")}.`;
    }
  }

  return null; // valid
}

// ── Cloud Functions ─────────────────────────────────────────
exports.ingestSensorData = onRequest(
  {
    timeoutSeconds: 10,
    memory: "256MiB",
  },
  async (req, res) => {
    // 1. Method check
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    // 2. API key check
    const apiKey = req.headers["x-sensor-api-key"];
    if (!apiKey || apiKey !== SENSOR_API_KEY.value()) {
      return res.status(401).json({ error: "Unauthorized: invalid or missing API key." });
    }

    // 3. Validate body
    const error = validateSectors(req.body?.sectors);
    if (error) {
      return res.status(400).json({ error });
    }

    // 4. Upsert each sector into Firestore
    try {
      const db = getFirestore();
      const now = new Date().toISOString();

      const writes = req.body.sectors.map((s) => {
        const docId = `boutbira${s.sectorId}`;
        return db.collection("water_data").doc(docId).set(
          {
            sectorId: s.sectorId,
            sectorName: s.sectorName,
            waterLevel: s.waterLevel,
            flowRate: s.flowRate,
            status: s.status,
            lastUpdated: now,
          },
          { merge: true }
        );
      });

      await Promise.all(writes);

      return res.status(200).json({ success: true, count: writes.length });
    } catch (err) {
      console.error("Firestore write error:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
);

exports.getWaterInsights = onCall(
  {
    secrets: [GEMINI_API_KEY],
    timeoutSeconds: Math.ceil(REQUEST_TIMEOUT_MS / 1000),
    memory: "256MiB",
  },
  async (request) => {
    // 1. Auth check
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    // 2. Input validation
    validateInput(request.data);

    const { sensorData } = request.data;

    // 3. Build the user prompt
    const sectorSummaries = sensorData.map((s, i) => {
      const name = s.sectorName || `Sector ${i + 1}`;
      return [
        `  Sector: ${name}`,
        `    Water Level : ${s.waterLevel}%`,
        `    Flow Rate   : ${s.flowRate} L/min`,
        `    Status      : ${s.status || "unknown"}`,
      ].join("\n");
    });

    const userPrompt = [
      "Analyze the following sensor readings and return a JSON insight.",
      "",
      "Sensor Data:",
      ...sectorSummaries,
      "",
      "Respond with the JSON object only.",
    ].join("\n");

    // 4. Call Gemini
    let insight;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      insight = await callGemini(genAI, userPrompt);
    } catch (err) {
      console.error("Gemini API error:", err);

      // Graceful fallback: return a safe default instead of crashing.
      if (err.message?.includes("API key")) {
        throw new HttpsError("failed-precondition", "AI service is not configured.");
      }
      throw new HttpsError("internal", "AI analysis failed. Please try again later.");
    }

    // 5. Return structured response
    return {
      insight,
      meta: {
        model: MODEL_NAME,
        sectorsAnalyzed: sensorData.length,
        generatedAt: new Date().toISOString(),
      },
    };
  }
);
