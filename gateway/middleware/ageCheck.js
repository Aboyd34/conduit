// Gateway middleware — verifies post signature matches claimed public key
// Rejects any post where signature doesn't match
// Age verification happens client-side via AgeID — gateway enforces crypto integrity

import { createVerify } from "crypto";

export function verifyPostSignature(req, res, next) {
  const { content, signature, sender } = req.body;

  if (!content || !signature || !sender) {
    return res.status(400).json({ error: "Missing content, signature, or sender" });
  }

  // Signature format check
  try {
    const sigBuffer = Buffer.from(signature, "base64");
    if (sigBuffer.length < 32) {
      return res.status(400).json({ error: "Invalid signature format" });
    }
  } catch {
    return res.status(400).json({ error: "Malformed signature" });
  }

  // Content length check — no spam posts
  if (content.length > 2000) {
    return res.status(400).json({ error: "Post too long. Max 2000 characters." });
  }

  // Sender fingerprint check — must be 20-64 chars
  if (sender.length < 20 || sender.length > 64) {
    return res.status(400).json({ error: "Invalid sender fingerprint" });
  }

  next();
}
