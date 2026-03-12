import React, { useEffect, useState } from "react";
import { fetchGovernancePolicies, fetchGovernanceProtocols } from "../services/apiService";

interface Policy { id?: string; name?: string; status?: string; [key: string]: unknown; }

const GovernancePanel: React.FC = () => {
  const [riskLevel, setRiskLevel] = useState(30);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [protocols, setProtocols] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchGovernancePolicies().catch((e: Error) => ({ _error: e.message })),
      fetchGovernanceProtocols().catch((e: Error) => ({ _error: e.message })),
    ]).then(([policiesRes, protocolsRes]) => {
      if (cancelled) return;
      // Handle policies — may be array or { policies: [...] }
      if (policiesRes && !policiesRes._error) {
        const list = Array.isArray(policiesRes) ? policiesRes : (policiesRes.policies ?? [policiesRes]);
        setPolicies(list);
      }
      if (protocolsRes && !protocolsRes._error) {
        setProtocols(protocolsRes);
      }
      if (policiesRes?._error && protocolsRes?._error) {
        setError("TRINITY_OFFLINE");
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "12px", gap: "12px", overflow: "auto" }}>
      {/* Trinity Connection Status */}
      <div style={{ padding: "12px", borderRadius: "6px", background: "rgba(167, 51, 255, 0.1)", border: "1px solid rgba(167, 51, 255, 0.2)", color: "#a733ff", fontSize: "11px" }}>
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>◇ TRINITY LINK</div>
        <div>{loading ? "Connecting..." : error ? error : "CONNECTED"}</div>
      </div>

      {/* Live Policies from Trinity */}
      <div style={{ padding: "12px", borderRadius: "6px", background: "rgba(0, 255, 156, 0.05)", border: "1px solid rgba(0, 255, 156, 0.2)", color: "#00ff9c", fontSize: "11px" }}>
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>◆ POLICIES ({policies.length})</div>
        {policies.length === 0 && !loading && <div style={{ opacity: 0.6 }}>No policies loaded</div>}
        {policies.map((p, i) => (
          <div key={p.id || i} style={{ padding: "4px 0", borderBottom: "1px solid rgba(0,255,156,0.1)" }}>
            {p.name || p.id || JSON.stringify(p).slice(0, 60)}
            {p.status && <span style={{ marginLeft: "8px", opacity: 0.6 }}>[{p.status}]</span>}
          </div>
        ))}
      </div>

      {/* Protocols */}
      {protocols && (
        <div style={{ padding: "12px", borderRadius: "6px", background: "rgba(167, 51, 255, 0.05)", border: "1px solid rgba(167, 51, 255, 0.15)", color: "#a733ff", fontSize: "10px", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          <div style={{ fontWeight: "bold", marginBottom: "4px", fontSize: "11px" }}>◇ PROTOCOLS</div>
          {JSON.stringify(protocols, null, 2)}
        </div>
      )}

      {/* Risk */}
      <div style={{ padding: "12px", borderRadius: "6px", background: "rgba(255, 100, 100, 0.05)", border: "1px solid rgba(255, 100, 100, 0.2)", color: "#ff6464", fontSize: "11px" }}>
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>RISK LEVEL</div>
        <div>{riskLevel}%</div>
      </div>
      <div style={{ padding: "12px", gap: "8px", display: "flex", flexDirection: "column" }}>
        <label style={{ color: "#a733ff", fontSize: "11px", fontWeight: "bold" }}>Risk Slider:</label>
        <input type="range" min="0" max="100" value={riskLevel} onChange={(e) => setRiskLevel(parseInt(e.target.value))} style={{ width: "100%", cursor: "pointer" }} />
      </div>
    </div>
  );
};

export default GovernancePanel;
