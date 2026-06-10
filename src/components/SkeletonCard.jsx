// src/components/SkeletonCard.jsx
const shimmer = `
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;

function Bar({ width, height = 14, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
        backgroundSize: "800px 100%",
        animation: "shimmer 1.5s infinite linear",
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "1.5rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        borderTop: "4px solid #e2e8f0",
      }}
    >
      <style>{shimmer}</style>
      <Bar width="60%" height={16} />
      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ marginBottom: 6 }}>
            <Bar width={70} height={10} />
          </div>
          <Bar width={50} height={28} />
        </div>
        <div>
          <div style={{ marginBottom: 6 }}>
            <Bar width={70} height={10} />
          </div>
          <Bar width={60} height={28} />
        </div>
      </div>
      <div style={{ marginTop: "0.75rem" }}>
        <Bar width={80} height={10} />
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "1.5rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        marginTop: "2rem",
      }}
    >
      <style>{shimmer}</style>
      <Bar width="40%" height={16} style={{ marginBottom: "1rem" }} />
      <Bar width="100%" height={260} style={{ borderRadius: 8 }} />
    </div>
  );
}

export function SkeletonInsight() {
  return (
    <div
      style={{
        marginTop: "1.5rem",
        background: "#fff",
        borderRadius: 12,
        padding: "1.5rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        borderLeft: "4px solid #e2e8f0",
      }}
    >
      <style>{shimmer}</style>
      <Bar width="35%" height={16} />
      <Bar width="80%" height={12} style={{ marginTop: "1rem" }} />
      <Bar width="60%" height={12} style={{ marginTop: 8 }} />
    </div>
  );
}
