import React from "react";

const ExecutionLog: React.FC = () => {
  const entries = [
    { header: "[ANALYSIS]", content: "Parsing governance request framework..." },
    { header: "[SEMANTIC_CHECK]", content: "Query intent verified: CONSTRUCTION_COMPLIANCE..." },
    { header: "[CONSTRAINT_MAP]", content: "Cross-referencing OSHA standards..." },
    { header: "[RISK_ASSESSMENT]", content: "Risk surface analysis complete..." },
    { header: "[EXECUTION_READY]", content: "System ready for operation..." }
  ];

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "8px", fontFamily: "monospace", fontSize: "12px" }}>
      {entries.map((entry, i) => (
        <div key={i}>
          <div style={{ color: "#00ff9c", fontWeight: "bold", marginBottom: "4px" }}>{entry.header}</div>
          <div style={{ color: "#00ff9c", opacity: 0.7, fontSize: "10px", marginBottom: "8px" }}>{entry.content}</div>
          {i < entries.length - 1 && <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(0, 255, 156, 0.25), transparent)", margin: "8px 0" }} />}
        </div>
      ))}
    </div>
  );
};

export default ExecutionLog;
