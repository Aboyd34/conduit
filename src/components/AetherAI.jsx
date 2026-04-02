import React, { useState } from "react";
import AetherConsoleV2 from "./AetherConsoleV2.jsx";
import EncryptedComposer from "./EncryptedComposer.jsx";

export default function AetherAI({ session }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage(text) {
    const userMsg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-age-token": localStorage.getItem("age_token") || "",
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          system: "You are Aether, the operator-grade AI inside Conduit.",
        }),
      });

      const data = await res.json();
      const reply = data.reply || "No response.";

      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Signal lost. Try again." },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="aether-shell">
      <AetherConsoleV2 messages={messages} loading={loading} />
      <EncryptedComposer onSend={sendMessage} />
    </div>
  );
}
