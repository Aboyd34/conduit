import React from "react";

export default function Header({ title, rightSlot }) {
  return (
    <header className="op-header">
      <div className="op-header-left">
        <span className="op-title">CONDUIT</span>
        <span className="op-subtitle">{title}</span>
      </div>

      <div className="op-header-right">
        {rightSlot}
      </div>
    </header>
  );
}
