import { useState, useEffect } from "react";

function loadIdentity() {
  try {
    const raw = localStorage.getItem("conduit_identity");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.pubkey) return parsed;
    }
  } catch {}
  return null;
}

function generateKey() {
  try {
    const arr = new Uint8Array(16);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      crypto.getRandomValues(arr);
    } else {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    }
    return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return Date.now().toString(16) + Math.random().toString(16).slice(2);
  }
}

function ensureIdentity() {
  let id = loadIdentity();
  if (!id) {
    const pubkey = generateKey();
    id = { pubkey, created: Date.now() };
    try { localStorage.setItem("conduit_identity", JSON.stringify(id)); } catch {}
  }
  return id;
}

export default function IdentityPanel() {
  const [identity, setIdentity] = useState(null);

  useEffect(() => {
    setIdentity(ensureIdentity());
  }, []);

  function rotate() {
    const pubkey = generateKey();
    const id = { pubkey, created: Date.now() };
    try { localStorage.setItem("conduit_identity", JSON.stringify(id)); } catch {}
    setIdentity(id);
  }

  const shortKey = identity?.pubkey
    ? identity.pubkey.slice(0, 4).toUpperCase() + ".." + identity.pubkey.slice(-4).toUpperCase()
    : "GENERATING...";

  const created = identity?.created
    ? new Date(identity.created).toLocaleDateString()
    : "—";

  return (
    <div className="w-56 bg-panel flex flex-col flex-shrink-0">
      <div className="px-4 py-3 border-b border-zinc-800">
        <p className="text-xs font-semibold text-white">Identity</p>
        <p className="text-xs text-zinc-600 mt-0.5">Local key — never transmitted</p>
      </div>
      <div className="p-4 flex flex-col gap-4 flex-1">
        {/* Key display */}
        <div className="bg-bg border border-zinc-800 rounded-xl p-3">
          <p className="text-xs text-zinc-600 mb-1">Fingerprint</p>
          <p className="font-mono text-sm text-accent font-bold tracking-widest">{shortKey}</p>
          <p className="text-xs text-zinc-700 mt-1">Since {created}</p>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-signal pulse" />
          <span className="text-xs text-zinc-500">Key active</span>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-1.5">
          {[
            { label: "Encryption", value: "AES-256" },
            { label: "Signing",    value: "Local only" },
            { label: "Storage",    value: "Device only" },
          ].map(s => (
            <div key={s.label} className="flex justify-between text-xs">
              <span className="text-zinc-600">{s.label}</span>
              <span className="text-zinc-400 font-mono">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Rotate */}
        <button
          onClick={rotate}
          className="mt-auto w-full py-2 rounded-xl text-xs font-semibold border border-accent/25 text-accent hover:bg-accent/10 transition-all"
        >
          🔄 Rotate Key
        </button>
      </div>
    </div>
  );
}
