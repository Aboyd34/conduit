import React from "react";

export default function LeftRail({ mode, active, onNav, badges }) {
  const nav = [
    { id: "rooms", label: "Rooms", icon: "💬" },
    { id: "pulse", label: "Feed", icon: "📡" },
    { id: "search", label: "Search", icon: "🔍" },
    { id: "airdrop", label: "Airdrop", icon: "🎁" },
    { id: "you", label: "You", icon: "👤" },
    { id: "ai", label: "AI", icon: "✨" },
  ];

  return (
    <aside className="op-left-rail">
      {nav.map((item) => (
        <button
          key={item.id}
          onClick={() => onNav(item.id)}
          className={`op-nav-item ${active === item.id ? "active" : ""}`}
        >
          <span className="op-nav-icon">{item.icon}</span>
          <span className="op-nav-label">{item.label}</span>

          {item.id === "direct" && badges?.direct > 0 && (
            <span className="op-badge">
              {badges.direct > 9 ? "9+" : badges.direct}
            </span>
          )}
        </button>
      ))}
    </aside>
  );
}
