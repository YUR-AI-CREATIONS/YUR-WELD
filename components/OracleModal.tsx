import React, { useState } from "react";
import { submitGovernanceReview } from "../services/apiService";

interface ReviewEntry { role: "user" | "oracle"; text: string; }

const OracleModal: React.FC = () => {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<ReviewEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (context: Record<string, unknown> = {}) => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    setHistory((h) => [...h, { role: "user", text: trimmed }]);
    setQuery("");
    setLoading(true);

    try {
      const result = await submitGovernanceReview(trimmed, context);
      const responseText =
        result.review || result.analysis || result.message || JSON.stringify(result, null, 2);
      setHistory((h) => [...h, { role: "oracle", text: responseText }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "UNKNOWN_ERROR";
      setHistory((h) => [...h, { role: "oracle", text: `ERROR: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "20px", gap: "16px" }}>
      <div style={{ flex: 1, overflowY: "auto", color: "#00ff9c", fontSize: "12px", lineHeight: "1.6", fontFamily: "monospace" }}>
        <div style={{ marginBottom: "12px", fontWeight: "bold", color: "#a733ff" }}>◇ COMPLIANCE ORACLE</div>

        {history.length === 0 && (
          <div style={{ opacity: 0.8 }}>
            Governance framework analysis: Active
            <br />
            Standard compliance: OSHA, EPA, ISO
            <br />
            Risk assessment: Real-time
            <br />
            <br />
            Ready to process construction queries and governance compliance validation.
          </div>
        )}

        {history.map((entry, i) => (
          <div key={i} style={{ marginBottom: "12px", padding: "8px", borderRadius: "4px", border: entry.role === "oracle" ? "1px solid rgba(167, 51, 255, 0.3)" : "1px solid rgba(0, 255, 156, 0.2)", background: entry.role === "oracle" ? "rgba(167, 51, 255, 0.05)" : "rgba(0, 255, 156, 0.05)" }}>
            <div style={{ fontSize: "9px", fontWeight: "bold", marginBottom: "4px", color: entry.role === "oracle" ? "#a733ff" : "#00ff9c", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {entry.role === "oracle" ? "◇ ORACLE" : "▸ QUERY"}
            </div>
            <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{entry.text}</div>
          </div>
        ))}

        {loading && (
          <div style={{ opacity: 0.5, fontStyle: "italic" }}>ORACLE_PROCESSING...</div>
        )}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter governance query..."
        disabled={loading}
        style={{ padding: "8px 12px", borderRadius: "4px", border: "1px solid rgba(0, 255, 156, 0.3)", background: "rgba(0, 0, 0, 0.4)", color: "#00ff9c", fontSize: "12px", fontFamily: "monospace" }}
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => handleSubmit({ mode: "analyze" })} disabled={loading || !query.trim()} style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #00ff9c", background: "rgba(0, 255, 156, 0.1)", color: "#00ff9c", fontSize: "11px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, transition: "all 200ms" }}>ANALYZE</button>
        <button onClick={() => handleSubmit({ mode: "validate" })} disabled={loading || !query.trim()} style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #a733ff", background: "rgba(167, 51, 255, 0.1)", color: "#a733ff", fontSize: "11px", fontWeight: "bold", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, transition: "all 200ms" }}>VALIDATE</button>
      </div>
    </div>
  );
};

export default OracleModal;
