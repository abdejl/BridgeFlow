const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// ── Firebase Admin ────────────────────────────────────────────────
// Render: uses FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
// Local:  falls back to GOOGLE_APPLICATION_CREDENTIALS
const firebaseConfig = process.env.FIREBASE_PROJECT_ID
  ? {
      credential: admin.credential.cert({
        project_id:  process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key:  process.env.FIREBASE_PRIVATE_KEY
          ?.replace(/\\n/g, "\n")
          ?.replace(/\\r\\n/g, "\n")
          ?.trim(),
      }),
    }
  : {
      credential: admin.credential.applicationDefault(),
    };

admin.initializeApp(firebaseConfig);
const db = admin.firestore();

// ── Constants ─────────────────────────────────────────────────────
const VALID_STATUSES = ["normal", "warning", "critical"];

// ── Validation ────────────────────────────────────────────────────
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

  return null;
}

// ── Health ────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Ingest sensor data ────────────────────────────────────────────
app.post("/api/readings", async (req, res) => {
  // 1. Method check (redundant with Express but matches spec)
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  // 2. API key check
  const apiKey = req.headers["x-sensor-api-key"];
  if (!apiKey || apiKey !== process.env.SENSOR_API_KEY) {
    return res.status(401).json({ error: "Unauthorized: invalid or missing API key." });
  }

  // 3. Validate body
  const error = validateSectors(req.body?.sectors);
  if (error) {
    return res.status(400).json({ error });
  }

  // 4. Upsert each sector into Firestore
  try {
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
});

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BridgeFlow backend listening on port ${PORT}`);
});
