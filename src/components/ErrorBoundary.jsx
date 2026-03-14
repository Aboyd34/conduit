import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[Conduit] Component error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#13131a',
          border: '1px solid #2a2a3e',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
          color: '#888',
          margin: '1rem 0'
        }}>
          <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️</p>
          <p style={{ marginBottom: '1rem', color: '#e0e0e0' }}>Something went wrong loading this section.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ fontSize: '0.85rem' }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
