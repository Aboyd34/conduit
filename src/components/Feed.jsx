import React, { useEffect, useState } from "react";
import { fetchFeed } from "../api/gateway.js";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeed()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));

    const interval = setInterval(() => {
      fetchFeed().then(setPosts).catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-muted">Loading feed...</p>;
  if (!posts.length) return <p className="text-muted">No posts yet. Be the first.</p>;

  return (
    <div className="feed">
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <p className="post-sender">🔑 {post.sender?.slice(0, 16)}...</p>
          <p className="post-content">{post.content}</p>
          <p className="post-time">{new Date(post.timestamp).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
