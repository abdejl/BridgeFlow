// src/components/StatusBadge.jsx

const BADGE_CONFIG = {
  live:     { label: "Live",     dotClass: "status-dot--live",     badgeClass: "status-badge--live" },
  syncing:  { label: "Syncing",  dotClass: "status-dot--syncing",  badgeClass: "status-badge--syncing" },
  error:    { label: "Offline",  dotClass: "status-dot--error",    badgeClass: "status-badge--error" },
  idle:     { label: "Preview",  dotClass: "status-dot--idle",     badgeClass: "status-badge--syncing" },
};

export default function StatusBadge({ status = "idle", error = null }) {
  const key = error ? "error" : status;
  const config = BADGE_CONFIG[key] ?? BADGE_CONFIG.idle;

  return (
    <span className={`status-badge ${config.badgeClass}`}>
      <span className={`status-dot ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
