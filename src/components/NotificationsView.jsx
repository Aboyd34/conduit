import React from 'react';

const TYPE_ICON = {
  reply:   '💬',
  signal:  '⚡',
  amplify: '🔁',
};

const TYPE_LABEL = {
  reply:   'replied to your signal',
  signal:  'signaled your post',
  amplify: 'amplified your post',
};

export function NotificationsView({ notifications, onClear, onMarkRead }) {
  return (
    <div className="notif-view">
      <div className="notif-header-row">
        <div>
          <h2 className="view-title">🔔 Notifications</h2>
          <p className="view-sub">Activity on your signals</p>
        </div>
        {notifications.length > 0 && (
          <button className="notif-clear-btn" onClick={onClear}>Clear all</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="feed-empty">
          <p className="feed-empty-icon">🔔</p>
          <p className="feed-empty-text">No notifications yet</p>
          <p className="feed-empty-sub">You'll see activity here when someone replies or signals your posts</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <div key={n.id} className="notif-item">
              <span className="notif-icon">{TYPE_ICON[n.type] || '🔔'}</span>
              <div className="notif-body">
                <p className="notif-label">{TYPE_LABEL[n.type] || 'Activity on your post'}</p>
                {n.preview && <p className="notif-preview">"{n.preview}{n.preview.length >= 60 ? '…' : ''}"</p>}
              </div>
              <span className="notif-time">{new Date(n.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
