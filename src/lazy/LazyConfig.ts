import { detectNetworkProfile, NetworkProfile } from './NetworkProfile';

export const LazyConfig: {
  enabled: boolean;
  debug: boolean;
  networkProfile: NetworkProfile;
} = {
  enabled: true,
  debug: false,
  networkProfile: detectNetworkProfile(),
};
