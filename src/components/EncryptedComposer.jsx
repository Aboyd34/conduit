import React, { useState } from "react";

export default function EncryptedComposer({ onSend }) {
  const [text, setText] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <form className="composer" onSubmit={submit}>
      <textarea
        className="composer-input"
        placeholder="Send encrypted message to Aether…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button className="composer-btn" type="submit">
        SEND
      </button>
    </form>
  );
}
