import React, { useState } from "react";
import { publishPost } from "../api/gateway.js";
import { getPublicKey } from "../ConduitKeyManager.js";
import { signMessage } from "../crypto/conduit-crypto.js";

export default function PostBox() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;
    const stored = JSON.parse(localStorage.getItem("conduit_keypair"));
    if (!stored) {
      setStatus("⚠️ Generate keys first.");
      return;
    }
    if (!stored.signingPrivateKey) {
      setStatus("⚠️ Old keys found. Click Delete Keys then Generate Keys again.");
      return;
    }
    try {
      const signature = await signMessage(content, stored.signingPrivateKey);
      const pubKey = getPublicKey();
      await publishPost(content, signature, pubKey);
      setContent("");
      setStatus("✅ Post published.");
    } catch (e) {
      setStatus("❌ Failed: " + e.message);
    }
  };

  return (
    <div className="post-box">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? (signed + encrypted)"
        rows={3}
      />
      <button onClick={handleSubmit}>Publish Post</button>
      {status && <p className="status">{status}</p>}
    </div>
  );
}
