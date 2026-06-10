// src/components/OperatorActions.jsx
import { useState, useCallback } from "react";
import { useAuth, hasOperatorRole } from "../context/AuthContext";

function SectionCard({ title, icon, children }) {
  return (
    <div className="ops-card">
      <div className="ops-card-header">
        <div className="ops-icon" style={{ background: "#eff6ff", color: "#0ea5e9" }}>
          {icon}
        </div>
        <span className="ops-title">{title}</span>
      </div>
      {children}
    </div>
  );
}

function FlowThreshold({ sectorName, onAction }) {
  const [value, setValue] = useState(10);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      onAction({
        event: `Flow threshold updated to ${value} L/min for ${sectorName}`,
        type: "info",
      });
      setTimeout(() => setSaved(false), 2500);
    }, 800);
  }, [value, sectorName, onAction]);

  return (
    <SectionCard
      title="Set Flow Threshold"
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="21" x2="4" y2="14"/>
          <line x1="4" y1="10" x2="4" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12" y2="3"/>
          <line x1="20" y1="21" x2="20" y2="16"/>
          <line x1="20" y1="12" x2="20" y2="3"/>
          <line x1="1" y1="14" x2="7" y2="14"/>
          <line x1="9" y1="8" x2="15" y2="8"/>
          <line x1="17" y1="16" x2="23" y2="16"/>
        </svg>
      }
    >
      <p className="ops-desc">
        Set the warning trigger level for {sectorName}. When flow rate drops below this threshold, the node will enter warning state.
      </p>
      <div style={{ marginTop: "0.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>Threshold</span>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
            {value} <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#64748b" }}>L/min</span>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={30}
          step={0.5}
          value={value}
          onChange={(e) => { setValue(parseFloat(e.target.value)); setSaved(false); }}
          style={{ width: "100%", accentColor: "#0ea5e9", cursor: "pointer" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#94a3b8", marginTop: 2 }}>
          <span>0</span>
          <span>15</span>
          <span>30 L/min</span>
        </div>
      </div>
      <button
        className="btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: "0.75rem", width: "100%" }}
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Threshold"}
      </button>
      {saved && (
        <div style={{
          marginTop: "0.5rem",
          padding: "6px 10px",
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          borderRadius: 8,
          color: "#059669",
          fontSize: "0.78rem",
          fontWeight: 600,
          textAlign: "center",
        }}>
          Threshold saved successfully
        </div>
      )}
    </SectionCard>
  );
}

function SchedulePump({ sectorName, onAction }) {
  const [pumpOn, setPumpOn] = useState("06:00");
  const [pumpOff, setPumpOff] = useState("22:00");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      onAction({
        event: `Pump schedule set for ${sectorName}: ON at ${pumpOn}, OFF at ${pumpOff}`,
        type: "info",
      });
      setTimeout(() => setSaved(false), 2500);
    }, 600);
  }, [pumpOn, pumpOff, sectorName, onAction]);

  return (
    <SectionCard
      title="Schedule Pump"
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      }
    >
      <p className="ops-desc">
        Schedule pump ON/OFF times for the next 24 hours on {sectorName}.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
            Pump ON
          </label>
          <input
            type="time"
            value={pumpOn}
            onChange={(e) => { setPumpOn(e.target.value); setSaved(false); }}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: "0.85rem",
              color: "#0f172a",
              background: "#fff",
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
            Pump OFF
          </label>
          <input
            type="time"
            value={pumpOff}
            onChange={(e) => { setPumpOff(e.target.value); setSaved(false); }}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: "0.85rem",
              color: "#0f172a",
              background: "#fff",
              outline: "none",
            }}
          />
        </div>
      </div>
      <button
        className="btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: "0.75rem", width: "100%" }}
      >
        {saving ? "Scheduling..." : saved ? "Scheduled!" : "Save Schedule"}
      </button>
      {saved && (
        <div style={{
          marginTop: "0.5rem",
          padding: "6px 10px",
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          borderRadius: 8,
          color: "#059669",
          fontSize: "0.78rem",
          fontWeight: 600,
          textAlign: "center",
        }}>
          Schedule saved for next 24 hours
        </div>
      )}
    </SectionCard>
  );
}

function RecalibrateSensor({ sectorName, onAction }) {
  const [progress, setProgress] = useState(null);

  const handleRecalibrate = useCallback(() => {
    if (progress !== null) return;
    setProgress(0);
    const steps = [10, 25, 40, 55, 70, 85, 95, 100];
    let i = 0;
    const timer = setInterval(() => {
      i++;
      if (i < steps.length) {
        setProgress(steps[i]);
      } else {
        clearInterval(timer);
        setProgress(100);
        onAction({
          event: `Sensor recalibration completed on ${sectorName}`,
          type: "success",
        });
        setTimeout(() => setProgress(null), 3000);
      }
    }, 400);
  }, [progress, sectorName, onAction]);

  return (
    <SectionCard
      title="Recalibrate Sensor"
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 16h5v5"/>
        </svg>
      }
    >
      <p className="ops-desc">
        Trigger a full recalibration sequence on {sectorName}&apos;s sensors. This will temporarily pause readings.
      </p>
      {progress !== null ? (
        <div style={{ marginTop: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: progress === 100 ? "#059669" : "#0f172a" }}>
              {progress === 100 ? "Calibration Complete" : "Calibrating..."}
            </span>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: progress === 100 ? "#059669" : "#0ea5e9" }}>
              {progress}%
            </span>
          </div>
          <div style={{
            width: "100%",
            height: 8,
            background: "#e2e8f0",
            borderRadius: 999,
            overflow: "hidden",
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              background: progress === 100
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #0ea5e9, #0284c7)",
              borderRadius: 999,
              transition: "width 0.4s ease-out",
            }} />
          </div>
          {progress === 100 && (
            <div style={{
              marginTop: "0.5rem",
              padding: "6px 10px",
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              borderRadius: 8,
              color: "#059669",
              fontSize: "0.78rem",
              fontWeight: 600,
              textAlign: "center",
            }}>
              Sensors recalibrated — readings nominal
            </div>
          )}
        </div>
      ) : (
        <button
          className="btn-warning"
          onClick={handleRecalibrate}
          style={{ marginTop: "0.75rem", width: "100%" }}
        >
          Start Recalibration
        </button>
      )}
    </SectionCard>
  );
}

export default function OperatorActions({ sectorName, onAction }) {
  const { user } = useAuth();

  if (!user || !hasOperatorRole(user.role)) {
    return (
      <div className="glass-card" style={{ marginTop: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 500 }}>
            Operator actions require Field Operator access or above.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2 className="section-label">Operator Actions</h2>
      <div className="ops-controls-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <FlowThreshold sectorName={sectorName} onAction={onAction} />
        <SchedulePump sectorName={sectorName} onAction={onAction} />
        <RecalibrateSensor sectorName={sectorName} onAction={onAction} />
      </div>
    </div>
  );
}
