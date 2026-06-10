// src/components/InsightCard.jsx
import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useWaterData } from "../hooks/useWaterData";

export default function InsightCard() {
  const { data } = useWaterData();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);

    try {
      const functions   = getFunctions();
      const getInsights = httpsCallable(functions, "getWaterInsights");
      const result      = await getInsights({ sensorData: data });

      // Function now returns { insight, meta } — extract the insight.
      setInsight(result.data.insight ?? result.data);
    } catch (err) {
      console.error("getWaterInsights error:", err);

      // Map Firebase HttpsError codes to friendly messages.
      const code = err.code?.replace("functions/", "") ?? err.code;
      const messages = {
        unauthenticated:  "You must be signed in to run analysis.",
        "invalid-argument":"Invalid sensor data received.",
        "failed-precondition": "AI service is not configured on the server.",
        internal:         "AI analysis failed. Please try again later.",
        unavailable:      "Service is temporarily unavailable.",
      };
      setError(messages[code] || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const alertColors = { low: "#10b981", medium: "#f59e0b", high: "#ef4444" };
  const color = alertColors[insight?.AlertLevel] ?? "#94a3b8";

  return (
    <div className="glass-card-accent" style={{ marginTop: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, color: "#334155" }}>
          Smart Insights
        </h2>
        <button
          className="btn-primary"
          onClick={analyze}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Now"}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          marginTop: "1rem",
          padding: "0.75rem 1rem",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 8,
          color: "#dc2626",
          fontSize: "0.85rem",
        }}>
          {error}
        </div>
      )}

      {/* Insight result */}
      {insight && (
        <div style={{ marginTop: "1rem" }}>
          <p style={{ color, fontWeight: 600, textTransform: "capitalize" }}>
            Alert Level: {insight.AlertLevel}
          </p>
          <p style={{ color: "#475569" }}>{insight.OptimizationAdvice}</p>
          <p style={{ color: "#475569" }}>
            Potential Savings: <strong>{insight.PotentialSavingsLiters}L</strong>
          </p>
          <p style={{ color: "#475569" }}>
            Recommended: {insight.RecommendedAction}
          </p>
        </div>
      )}

      {!insight && !loading && !error && (
        <p style={{ color: "#94a3b8", marginTop: "1rem" }}>
          Click "Analyze Now" to get AI-powered optimization advice.
        </p>
      )}
    </div>
  );
}
