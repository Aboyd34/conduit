import React, { useState } from "react";

export default function AetherConsoleV2({ onSend, messages, loading }) {
  return (
    <div className="aether-console">
      <div className="aether-header">
        <span className="aether-title">AETHER CONSOLE</span>
        <span className="aether-status">ONLINE</span>
      </div>

      <div className="aether-log">
        {messages.map((m, i) => (
          <div key={i} className={`aether-msg ${m.role}`}>
            <span className="role">{m.role === "user" ? "YOU" : "AETHER"}</span>
            <p>{m.content}</p>
          </div>
        ))}

        {loading && (
          <div className="aether-msg assistant">
            <span className="role">AETHER</span>
            <p className="loading">…thinking</p>
          </div>
        )}
      </div>
    </div>
  );
}
