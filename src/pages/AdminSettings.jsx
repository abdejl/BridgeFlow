// src/pages/AdminSettings.jsx
import { useState, useCallback } from "react";

// ── Mock Data ──────────────────────────────────────────────

const INITIAL_USERS = [
  {
    id: 1,
    name: "Ahmed Tazi",
    role: "Association President",
    roleKey: "admin",
    email: "ahmed.tazi@bridgeflow.ma",
    permissions: ["Full Access", "System Config", "User Management"],
    admin: true,
  },
  {
    id: 2,
    name: "Karim Benani",
    role: "Lead Technician",
    roleKey: "tech",
    email: "karim.benani@bridgeflow.ma",
    permissions: ["Sector Control", "Sensor Calibration", "Alerts"],
    admin: false,
  },
  {
    id: 3,
    name: "Fatima Ouarzazi",
    role: "Resident Representative",
    roleKey: "resident",
    email: "fatima.ouarzazi@bridgeflow.ma",
    permissions: ["View Dashboard", "View Reports"],
    admin: false,
  },
  {
    id: 4,
    name: "Youssef Alami",
    role: "Field Operator",
    roleKey: "tech",
    email: "youssef.alami@bridgeflow.ma",
    permissions: ["Sector Control", "Manual Override"],
    admin: false,
  },
  {
    id: 5,
    name: "Nadia Berrada",
    role: "Data Analyst",
    roleKey: "resident",
    email: "nadia.berrada@bridgeflow.ma",
    permissions: ["View Dashboard", "Export Reports"],
    admin: false,
  },
];

const AUDIT_LOGS = [
  { id: 1, time: "2026-06-08 11:30:00", message: "Pressure setting updated to 3.5 bar", user: "Admin_Jellal" },
  { id: 2, time: "2026-06-08 11:15:22", message: "Emergency flush triggered on Boutbira 2", user: "Karim_B" },
  { id: 3, time: "2026-06-08 10:48:10", message: "User Fatima Ouarzazi role changed to Resident Rep", user: "Admin_Jellal" },
  { id: 4, time: "2026-06-08 10:30:00", message: "Sensor Boutbira-3 recalibrated successfully", user: "Youssef_A" },
  { id: 5, time: "2026-06-08 09:55:41", message: "Daily backup completed — 12 sensors synced", user: "System" },
  { id: 6, time: "2026-06-08 09:20:18", message: "Flow rate threshold lowered to 8 L/min for Boutbira 1", user: "Admin_Jellal" },
  { id: 7, time: "2026-06-08 08:45:00", message: "Night-mode schedule activated", user: "System" },
  { id: 8, time: "2026-06-08 08:00:05", message: "System startup — all 12 sensors online", user: "System" },
  { id: 9, time: "2026-06-07 22:10:33", message: "Network latency spike detected (240ms)", user: "System" },
  { id: 10, time: "2026-06-07 18:30:00", message: "Weekly report exported by Nadia Berrada", user: "Nadia_B" },
];

// ── SVG Icons ──────────────────────────────────────────────

function IconUptime() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  );
}

function IconSensors() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  );
}

function IconNetwork() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
      <circle cx="12" cy="20" r="1"/>
    </svg>
  );
}

function IconValve() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>
  );
}

function IconFlush() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

// ── Components ─────────────────────────────────────────────

function ConfirmationModal({ title, description, onConfirm, onCancel, danger }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div
          className="modal-icon"
          style={{ background: danger ? "#fef2f2" : "#fffbeb" }}
        >
          <IconWarning />
        </div>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-desc">{description}</p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={danger ? "btn-danger" : "btn-warning"}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function HealthCard({ icon, label, value, status, iconBg }) {
  return (
    <div className="health-card">
      <div className="health-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="health-info">
        <span className="health-label">{label}</span>
        <span className="health-value">{value}</span>
        <span className="health-status">
          <span className="status-dot status-dot--live" style={{ width: 7, height: 7 }} />
          {status}
        </span>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────

export default function AdminSettings() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [modal, setModal] = useState(null);

  const toggleAdmin = useCallback((userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, admin: !u.admin } : u
      )
    );
  }, []);

  const handleValveShutdown = () => {
    setModal({
      title: "Main Valve Shutdown",
      description:
        "This will immediately close the main supply valve across all sectors. This action will stop all water flow to Boutbira 1, 2, and 3. Only proceed in case of emergency.",
      danger: true,
      onConfirm: () => {
        setModal(null);
        // In production: call Firebase function
      },
    });
  };

  const handleFlush = () => {
    setModal({
      title: "Flush System",
      description:
        "This will initiate a full system flush, purging sediment and air from all sector pipelines. Flow rates will temporarily spike. Continue?",
      danger: false,
      onConfirm: () => {
        setModal(null);
        // In production: call Firebase function
      },
    });
  };

  return (
    <div className="page-fade" style={{ padding: "2rem" }}>
      {/* ── Page Header ────────────────────────────────── */}
      <div className="sector-detail-header">
        <h1>Admin Control Panel</h1>
        <span className="status-badge status-badge--live">
          <span className="status-dot status-dot--live" />
          All Systems Operational
        </span>
      </div>

      {/* ── Section 1: System Health ───────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 className="section-label">System Health Overview</h2>
        <div className="health-grid">
          <HealthCard
            icon={<IconUptime />}
            iconBg="#ecfdf5"
            label="Total System Uptime"
            value="99.97%"
            status="Optimal"
          />
          <HealthCard
            icon={<IconSensors />}
            iconBg="#eff6ff"
            label="Active Sensors"
            value="12 / 12"
            status="All Online"
          />
          <HealthCard
            icon={<IconNetwork />}
            iconBg="#f5f3ff"
            label="Network Connectivity"
            value="98.2%"
            status="Optimal"
          />
        </div>
      </div>

      {/* ── Section 2: Access Control ──────────────────── */}
      <div className="glass-card" style={{ marginBottom: "2rem" }}>
        <h2 className="section-label">Access Control — Role Management</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="roles-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Permissions</th>
                <th style={{ textAlign: "right" }}>Admin Rights</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div>
                      <span className="role-name">{user.name}</span>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge role-badge--${user.roleKey}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {user.permissions.map((perm) => (
                        <span
                          key={perm}
                          style={{
                            fontSize: "0.68rem",
                            background: "#f1f5f9",
                            color: "#475569",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontWeight: 500,
                          }}
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={user.admin}
                        onChange={() => toggleAdmin(user.id)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 3: Audit Logs ─────────────────────── */}
      <div className="glass-card" style={{ marginBottom: "2rem" }}>
        <h2 className="section-label">System Audit Trail</h2>
        <div className="audit-log">
          {AUDIT_LOGS.map((entry) => (
            <div key={entry.id} className="audit-entry">
              <span className="audit-timestamp">{entry.time}</span>
              <span className="audit-message">
                {entry.message}{" "}
                <span className="audit-user">by {entry.user}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Operational Controls ────────────── */}
      <div>
        <h2 className="section-label">Operational Controls</h2>
        <div className="ops-controls-grid">
          {/* Emergency Valve Shutdown */}
          <div className="ops-card">
            <div className="ops-card-header">
              <div className="ops-icon" style={{ background: "#fef2f2" }}>
                <IconValve />
              </div>
              <span className="ops-title">Emergency Override</span>
            </div>
            <p className="ops-desc">
              Immediately shut down the main supply valve across all sectors.
              Use only in case of pipe rupture, flood, or critical pressure failure.
            </p>
            <button className="btn-danger" onClick={handleValveShutdown}>
              Main Valve Shutdown
            </button>
          </div>

          {/* Flush System */}
          <div className="ops-card">
            <div className="ops-card-header">
              <div className="ops-icon" style={{ background: "#fffbeb" }}>
                <IconFlush />
              </div>
              <span className="ops-title">Flush System</span>
            </div>
            <p className="ops-desc">
              Initiate a full pipeline flush to purge sediment, air pockets, and
              mineral buildup. Flow rates will temporarily increase during the cycle.
            </p>
            <button className="btn-warning" onClick={handleFlush}>
              Flush System
            </button>
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal ─────────────────────────── */}
      {modal && (
        <ConfirmationModal
          title={modal.title}
          description={modal.description}
          danger={modal.danger}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
