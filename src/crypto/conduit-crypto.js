import _sodium from "libsodium-wrappers";

export async function signMessage(message, privateKeyB64) {
  await _sodium.ready;
  const sodium = _sodium;
  const priv = sodium.from_base64(privateKeyB64);
  const signed = sodium.crypto_sign_detached(sodium.from_string(message), priv);
  return sodium.to_base64(signed);
}

export async function verifyMessage(message, signatureB64, publicKeyB64) {
  await _sodium.ready;
  const sodium = _sodium;
  const pub = sodium.from_base64(publicKeyB64);
  const sig = sodium.from_base64(signatureB64);
  return sodium.crypto_sign_verify_detached(sig, sodium.from_string(message), pub);
}

export async function generateSigningKeys() {
  await _sodium.ready;
  const sodium = _sodium;
  const kp = sodium.crypto_sign_keypair();
  return {
    publicKey: sodium.to_base64(kp.publicKey),
    privateKey: sodium.to_base64(kp.privateKey),
  };
}
