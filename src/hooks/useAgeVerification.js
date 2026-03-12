// AgeID verification hook
// AgeID verifies age anonymously, returns a reusable token
// That token seeds the keypair — same token = same identity forever

const AGE_TOKEN_KEY = "conduit_age_token";
const AGE_VERIFIED_KEY = "conduit_age_verified";
const TOKEN_EXPIRY_DAYS = 365;

export function getAgeToken() {
  return localStorage.getItem(AGE_TOKEN_KEY);
}

export function isAgeVerified() {
  const verified = localStorage.getItem(AGE_VERIFIED_KEY);
  if (!verified) return false;
  const { timestamp } = JSON.parse(verified);
  const expiry = TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp < expiry;
}

export async function storeAgeToken(token) {
  localStorage.setItem(AGE_TOKEN_KEY, token);
  localStorage.setItem(AGE_VERIFIED_KEY, JSON.stringify({ timestamp: Date.now() }));
}

export function clearAgeVerification() {
  localStorage.removeItem(AGE_TOKEN_KEY);
  localStorage.removeItem(AGE_VERIFIED_KEY);
  localStorage.removeItem("conduit_keypair");
}

// Hash the AgeID token using SHA-256 to use as keypair seed
export async function hashTokenToSeed(token) {
  const encoded = new TextEncoder().encode(token);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", encoded);
  return new Uint8Array(hashBuffer);
}

// Simulate AgeID callback for development
// In production replace this with real AgeID OAuth redirect
export function launchAgeIDVerification(callbackFn) {
  // Production: redirect to AgeID OAuth
  // window.location.href = `https://www.ageid.com/oauth/authorize?client_id=${AGEID_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=token`;

  // Development simulation — replace with real AgeID integration
  const mockToken = "ageid_" + Array.from(
    window.crypto.getRandomValues(new Uint8Array(32))
  ).map(b => b.toString(16).padStart(2, "0")).join("");

  callbackFn(mockToken);
}
