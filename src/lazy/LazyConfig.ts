import { detectNetworkProfile, NetworkProfile } from './NetworkProfile';

// Singleton — evaluated once on boot
export const LazyConfig: {
  enabled: boolean;
  debug: boolean;
  networkProfile: NetworkProfile;
} = {
  enabled: true,
  debug: false,
  networkProfile: detectNetworkProfile(),
};
