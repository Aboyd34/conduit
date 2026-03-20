export type NetworkProfile = 'fast' | 'normal' | 'slow';

export function detectNetworkProfile(): NetworkProfile {
  const conn = (navigator as any).connection;
  const type = conn?.effectiveType as string | undefined;
  if (!type) return 'normal';
  if (type === '4g') return 'fast';
  if (type === '3g') return 'normal';
  return 'slow';
}

export function getRootMargin(profile: NetworkProfile): string {
  switch (profile) {
    case 'fast': return '300px';
    case 'slow': return '1200px';
    default:     return '600px';
  }
}
