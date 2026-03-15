import React, { useEffect, useState } from 'react';
import { useConduitSocket } from '../hooks/useConduitSocket.js';

export function PulseView() {
  const { posts, connected } = useConduitSocket();
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    // Build activity log from posts — newest first, max 50
    const events = posts.slice(0, 50).map((p) => ({
      id: p.id,
      type: 'post',
      room: p.topic || 'public',
      sender: p.displaySender || (p.sender ? p.sender.slice(0, 8) + '…' : 'anon'),
      preview: p.content?.slice(0, 80) + (p.content?.length > 80 ? '…' : ''),
      timestamp: p.timestamp,
      replies: p.replies?.length || 0,
      signals: p.signals || 0,
    }));
    setActivity(events);
  }, [posts]);

  const totalSignals = posts.reduce((acc, p) => acc + (p.signals || 0), 0);
  const totalReplies = posts.reduce((acc, p) => acc + (p.replies?.length || 0), 0);

  return (
    <div className="pulse-view">
      <div className="pulse-header">
        <h2 className="view-title">⚡ Pulse</h2>
        <p className="view-sub">Live network activity</p>
      </div>

      <div className="pulse-stats">
        <div className="stat-card">
          <span className="stat-value">{posts.length}</span>
          <span className="stat-label">Signals</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalReplies}</span>
          <span className="stat-label">Replies</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalSignals}</span>
          <span className="stat-label">⚡ Boosts</span>
        </div>
        <div className="stat-card">
          <span className={`stat-value ${connected ? 'stat-online' : 'stat-offline'}`}>
            {connected ? 'LIVE' : 'OFF'}
          </span>
          <span className="stat-label">Network</span>
        </div>
      </div>

      <div className="pulse-feed">
        {activity.length === 0 ? (
          <div className="feed-empty">
            <p className="feed-empty-icon">📡</p>
            <p className="feed-empty-text">No activity yet.</p>
          </div>
        ) : (
          activity.map((ev) => (
            <div key={ev.id} className="pulse-item">
              <div className="pulse-item-left">
                <span className="pulse-room">#{ev.room}</span>
                <span className="pulse-sender">{ev.sender}</span>
              </div>
              <p className="pulse-preview">{ev.preview}</p>
              <div className="pulse-item-meta">
                {ev.replies > 0 && <span className="pulse-meta-tag">💬 {ev.replies}</span>}
                {ev.signals > 0 && <span className="pulse-meta-tag">⚡ {ev.signals}</span>}
                <span className="pulse-time">{new Date(ev.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
