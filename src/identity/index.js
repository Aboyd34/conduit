/**
 * Conduit Identity Protocol — Public API
 *
 * Future: replace issueAgeToken with ZKP-based proof (Semaphore/Circom)
 * The AgeGate component and useAgeGate hook remain unchanged.
 */

export { issueAgeToken, validateAgeToken, revokeAgeToken, isAgeVerified } from './AgeVerification';
export { useAgeGate } from './useAgeGate';
export { AgeGate } from './AgeGate';
