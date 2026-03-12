/**
 * useAgeGate — React hook for age verification state
 *
 * Usage:
 *   const { verified, confirm, revoke, pending } = useAgeGate();
 */

import { useState, useEffect, useCallback } from 'react';
import { issueAgeToken, validateAgeToken, revokeAgeToken } from './AgeVerification';

export function useAgeGate() {
  const [verified, setVerified] = useState(false);
  const [pending, setPending] = useState(true);

  useEffect(() => {
    const { valid } = validateAgeToken();
    setVerified(valid);
    setPending(false);
  }, []);

  const confirm = useCallback(async () => {
    await issueAgeToken();
    setVerified(true);
  }, []);

  const revoke = useCallback(() => {
    revokeAgeToken();
    setVerified(false);
  }, []);

  return { verified, confirm, revoke, pending };
}
