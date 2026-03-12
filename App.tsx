import React, { useState } from "react";
import LiquidBackground from "./components/LiquidBackground";
import { ShootingStars } from "./components/VisualEffects";
import ExecutionLog from "./components/ExecutionLog";
import OracleModal from "./components/OracleModal";
import GovernancePanel from "./components/GovernancePanel";

const App: React.FC = () => {
  const [isThinking, setIsThinking] = useState(false);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const themeColor = "#00ff9c";

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "black" }}>
      {/* Glasmorphism Cognitive Mesh Background */}
      <LiquidBackground themeColor={themeColor} isThinking={isThinking} />
      
      {/* Shooting Stars - visible when thinking */}
      {isThinking && <ShootingStars themeColor={themeColor} />}
      
      {/* Header */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        height: "64px",
        borderBottom: "1px solid rgba(0, 255, 156, 0.2)",
        backdropFilter: "blur(12px)",
        background: "rgba(0, 0, 0, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: themeColor,
            boxShadow: `0 0 10px ${themeColor}`,
            animation: "pulse 2s infinite"
          }} />
          <h1 style={{ color: themeColor, textShadow: `0 0 20px ${themeColor}`, margin: 0, fontSize: "24px", fontWeight: "black", letterSpacing: "0.3em", textTransform: "uppercase" }}>
            YUR AI
          </h1>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: themeColor,
            boxShadow: `0 0 10px ${themeColor}`,
            animation: "pulse 2s infinite"
          }} />
        </div>
      </div>

      {/* Main Three-Column Layout */}
      <div style={{
        position: "fixed",
        top: "64px",
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        gap: "12px",
        padding: "12px",
        overflow: "hidden"
      }}>
        
        {/* LEFT PANEL - Sliding */}
        <div style={{
          transition: "all 300ms ease",
          flex: leftPanelOpen ? "0 0 320px" : "0 0 0px",
          opacity: leftPanelOpen ? 1 : 0,
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(0, 255, 156, 0.2)",
          borderRadius: "8px",
          backdropFilter: "blur(12px)",
          background: "rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          boxShadow: `0 0 20px rgba(0, 255, 156, 0.1)`
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0, 255, 156, 0.1)", fontSize: "12px", fontWeight: "black", letterSpacing: "0.1em", textTransform: "uppercase", color: themeColor }}>
            ◈ Synaptic Memory
          </div>
          <ExecutionLog />
        </div>

        {/* CENTER PANEL - Oracle */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(0, 255, 156, 0.2)",
          borderRadius: "8px",
          backdropFilter: "blur(12px)",
          background: "rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
          boxShadow: `0 0 30px rgba(0, 255, 156, 0.15), inset 0 0 20px rgba(0, 255, 156, 0.05)`
        }}>
          <OracleModal />
        </div>

        {/* RIGHT PANEL - Sliding */}
        <div style={{
          transition: "all 300ms ease",
          flex: rightPanelOpen ? "0 0 320px" : "0 0 0px",
          opacity: rightPanelOpen ? 1 : 0,
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(167, 51, 255, 0.2)",
          borderRadius: "8px",
          backdropFilter: "blur(12px)",
          background: "rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
          boxShadow: `0 0 20px rgba(167, 51, 255, 0.1)`
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(167, 51, 255, 0.1)", fontSize: "12px", fontWeight: "black", letterSpacing: "0.1em", textTransform: "uppercase", color: "#a733ff" }}>
            ◈ Governance Mesh
          </div>
          <GovernancePanel />
        </div>
      </div>

      {/* Toggle Buttons */}
      <div style={{ position: "fixed", bottom: "16px", right: "16px", display: "flex", gap: "8px", zIndex: 50 }}>
        <button onClick={() => setLeftPanelOpen(!leftPanelOpen)} style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "bold", borderRadius: "4px", border: `2px solid ${themeColor}`, color: themeColor, background: leftPanelOpen ? "rgba(0, 255, 156, 0.1)" : "transparent", cursor: "pointer", transition: "all 200ms" }}>
          ◀ VAULT
        </button>
        <button onClick={() => setIsThinking(!isThinking)} style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "bold", borderRadius: "4px", border: `2px solid ${themeColor}`, color: themeColor, background: isThinking ? "rgba(0, 255, 156, 0.2)" : "transparent", cursor: "pointer", transition: "all 200ms" }}>
          {isThinking ? "●" : "○"} THINKING
        </button>
        <button onClick={() => setRightPanelOpen(!rightPanelOpen)} style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "bold", borderRadius: "4px", border: "2px solid #a733ff", color: "#a733ff", background: rightPanelOpen ? "rgba(167, 51, 255, 0.1)" : "transparent", cursor: "pointer", transition: "all 200ms" }}>
          ORACLE ▶
        </button>
      </div>

      {/* Status Footer */}
      <div style={{ position: "fixed", bottom: "16px", left: "16px", fontSize: "12px", fontFamily: "monospace", opacity: 0.4, color: themeColor }}>
        <div>MESH: {isThinking ? "DYNAMIC" : "STATIC"}</div>
        <div>STATE: {leftPanelOpen ? "VAULT_ACTIVE" : "VAULT_HIDDEN"}</div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default App;
