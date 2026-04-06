'use strict';
const { Router } = require('express');
const rateLimit = require('express-rate-limit');

const router = Router();

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.post('/chat', aiLimiter, async (req, res) => {
  const GROQ_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_KEY) return res.status(503).json({ error: 'AI not configured — set GROQ_API_KEY env var' });
  const { messages, system } = req.body;
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ error: 'messages array required' });
  const sanitized = messages.slice(-20).map(m => ({
    role: ['user', 'assistant'].includes(m.role) ? m.role : 'user',
    content: String(m.content).slice(0, 2000)
  }));
  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: system || 'You are Aether, the AI assistant inside Conduit. Be concise and helpful.' },
      ...sanitized
    ],
    max_tokens: 1024,
    temperature: 0.7
  };
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error('[Aether/Groq] error:', groqRes.status, err);
      return res.status(502).json({ error: 'upstream_error', status: groqRes.status });
    }
    const data = await groqRes.json();
    res.json({ reply: data.choices?.[0]?.message?.content || 'No response from Aether.' });
  } catch (e) {
    console.error('[Aether/Groq] fetch failed:', e.message);
    res.status(500).json({ error: 'internal_error', message: e.message });
  }
});

module.exports = router;
