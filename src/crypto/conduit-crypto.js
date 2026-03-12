export async function generateSigningKeys() {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  const pub = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const priv = await window.crypto.subtle.exportKey("jwk", keyPair.privateKey);
  return {
    publicKey: JSON.stringify(pub),
    privateKey: JSON.stringify(priv),
  };
}

export async function signMessage(message, signingPrivateKeyJson) {
  const jwk = JSON.parse(signingPrivateKeyJson);
  const privKey = await window.crypto.subtle.importKey(
    "jwk", jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false, ["sign"]
  );
  const encoded = new TextEncoder().encode(message);
  const signature = await window.crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    privKey,
    encoded
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export async function verifyMessage(message, signatureB64, signingPublicKeyJson) {
  const jwk = JSON.parse(signingPublicKeyJson);
  const pubKey = await window.crypto.subtle.importKey(
    "jwk", jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false, ["verify"]
  );
  const encoded = new TextEncoder().encode(message);
  const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
  return window.crypto.subtle.verify(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    pubKey,
    signature,
    encoded
  );
}
