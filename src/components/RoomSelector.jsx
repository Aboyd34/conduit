/**
 * RoomSelector — topic-based room switcher
 * Rooms are just topic filters on the existing feed
 * No backend changes needed — posts already have a topic field
 */

import React from 'react';

const DEFAULT_ROOMS = [
  { id: 'public', label: '# general' },
  { id: 'crypto', label: '# crypto' },
  { id: 'tech', label: '# tech' },
  { id: 'random', label: '# random' },
];

export function RoomSelector({ activeRoom, onRoomChange }) {
  return (
    <div className="room-selector">
      {DEFAULT_ROOMS.map((room) => (
        <button
          key={room.id}
          className={`room-btn ${activeRoom === room.id ? 'room-btn--active' : ''}`}
          onClick={() => onRoomChange(room.id)}
        >
          {room.label}
        </button>
      ))}
    </div>
  );
}

export default RoomSelector;
