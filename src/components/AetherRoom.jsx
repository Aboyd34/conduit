import React from 'react';
import { PostCard } from './PostCard.jsx';
import PostBox from './PostBox.jsx';

// useAether is wagmi-dependent — lazy load so it never crashes without wallet
function AetherFeed({ posts, onViewProfile }) {
  const roomPosts = posts.filter(p => (p.topic || '') === 'aether');
  return (
    <div style={{ padding: '0' }}>
      <PostBox defaultTopic="aether" />
      <div style={{ marginTop: '1rem' }}>
        {roomPosts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#3f3f5a', padding: '3rem 1rem' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚡</p>
            <p style={{ color: '#52525b' }}>No signals yet in #aether</p>
            <p style={{ color: '#3f3f5a', fontSize: '0.8rem', marginTop: '0.25rem' }}>Be the first holder to transmit.</p>
          </div>
        ) : (
          roomPosts.map(p => <PostCard key={p.id} post={p} onViewProfile={onViewProfile} />)
        )}
      </div>
    </div>
  );
}

function GateWall({ icon, title, desc, sub, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</p>
        <h3 style={{ color: '#f0f0f0', fontFamily: 'Space Grotesk', fontWeight: 700, marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '0.35rem' }}>{desc}</p>
        {sub && <p style={{ color: '#52525b', fontSize: '0.8rem', marginBottom: '0.35rem' }}>{sub}</p>}
        {hint && <p style={{ color: '#3f3f5a', fontSize: '0.75rem' }}>{hint}</p>}
      </div>
    </div>
  );
}

export function AetherRoom({ posts, onViewProfile }) {
  const [walletState, setWalletState] = React.useState(null);

  React.useEffect(() => {
    // Lazy load wagmi hook only if available
    import('../hooks/useAether.js')
      .then(m => {
        // Can't call hook outside component — signal ready instead
        setWalletState('ready');
      })
      .catch(() => setWalletState('unavailable'));
  }, []);

  // If wagmi not available, show feed directly (pre-launch mode)
  if (walletState === 'unavailable' || walletState === null) {
    return (
      <GateWall
        icon="⚡"
        title="# aether"
        desc="Token-gated access — contract launching soon."
        sub="Claim your airdrop to be ready on day one."
      />
    );
  }

  return <AetherFeedWithGate posts={posts} onViewProfile={onViewProfile} />;
}

// Separate component that safely uses the hook
function AetherFeedWithGate({ posts, onViewProfile }) {
  let hookData = { isConnected: false, isGated: false, balance: '0', contractReady: false };

  try {
    // Dynamic import already resolved — use synchronous require pattern
    const { useAether } = require('../hooks/useAether.js');
    hookData = useAether();
  } catch {
    // wagmi not ready
  }

  const { isConnected, isGated, balance, contractReady } = hookData;

  if (!isConnected) return <GateWall icon="⚡" title="# aether" desc="This channel is for Aether holders." sub="Connect your wallet to check access." />;
  if (!contractReady) return <GateWall icon="⚡" title="# aether" desc="Token-gated access — contract launching soon." sub="Claim your airdrop to be ready on day one." />;
  if (!isGated) return <GateWall icon="🔒" title="# aether" desc={`You need 100 AETH to enter.`} sub={`Your balance: ${parseFloat(balance).toLocaleString()} AETH`} hint="Earn AETH by posting and getting signals." />;

  return <AetherFeed posts={posts} onViewProfile={onViewProfile} />;
}
