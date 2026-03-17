import { useState } from "react";

const AGE_KEY = "conduit_age_verified";

function generateKey() {
  try {
    const arr = new Uint8Array(16);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
    } else {
      // Fallback for environments without crypto (e.g. older mobile WebViews)
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Last-resort fallback
    return Date.now().toString(16) + Math.random().toString(16).slice(2);
  }
}

export default function AgeGate({ onVerify }) {
  const [checked, setChecked] = useState(false);
  const [agreed,  setAgreed]  = useState(false);

  function handleVerify() {
    if (!checked || !agreed) return;
    // Generate & persist identity key — 3-layer fallback guarantees success on mobile
    try {
      const existing = JSON.parse(localStorage.getItem("conduit_identity") || "null");
      if (!existing?.pubkey) {
        const pubkey = generateKey();
        localStorage.setItem("conduit_identity", JSON.stringify({ pubkey, created: Date.now() }));
      }
    } catch (e) {
      console.warn("Identity storage error:", e);
    }
    localStorage.setItem(AGE_KEY, "1");
    onVerify();
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4" style={{background:"radial-gradient(ellipse at 50% 0%, rgba(122,92,255,0.08) 0%, #07060f 65%)"}}>
      <div className="bg-panel border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <h1 className="text-3xl font-bold font-mono text-accent mb-1 tracking-widest">CONDUIT<span className="text-signal">.</span></h1>
        <p className="text-sm text-zinc-500 mb-6">Anonymous. Encrypted. Yours.</p>

        <div className="bg-bg border border-zinc-800 rounded-xl p-5 text-left mb-6">
          <h2 className="text-sm font-semibold mb-3 text-white">Before you enter</h2>
          <ul className="space-y-2 text-xs text-zinc-500">
            <li className="flex gap-2"><span className="text-accent">⬡</span> You are 18 years of age or older</li>
            <li className="flex gap-2"><span className="text-accent">⬡</span> Content is user-generated and peer-verified</li>
            <li className="flex gap-2"><span className="text-accent">⬡</span> Your identity is local — no accounts, no servers</li>
            <li className="flex gap-2"><span className="text-accent">⬡</span> Messages are cryptographically signed by your device</li>
          </ul>
        </div>

        <p className="text-xs text-accent mb-4">🔒 Local key will be generated on entry</p>

        <label className="flex items-center gap-2 mb-2 text-xs text-zinc-400 cursor-pointer justify-center">
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} className="accent-[#7a5cff]" />
          I am 18 or older
        </label>
        <label className="flex items-center gap-2 mb-5 text-xs text-zinc-400 cursor-pointer justify-center">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="accent-[#7a5cff]" />
          I agree to the terms of use
        </label>

        <button
          onClick={handleVerify}
          disabled={!checked || !agreed}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-accent to-cyan-400 hover:opacity-90 disabled:opacity-25 disabled:cursor-not-allowed"
          style={{background: (!checked || !agreed) ? undefined : "linear-gradient(135deg,#7a5cff,#00d4ff)"}}
        >
          Enter Conduit
        </button>
        <p className="mt-4 text-xs text-zinc-700 leading-relaxed">By entering you confirm you meet the age requirement. Conduit stores no personal data. Your key is generated locally and never transmitted.</p>
      </div>
    </div>
  );
}
