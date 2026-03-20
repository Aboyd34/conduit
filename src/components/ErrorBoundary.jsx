import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[Conduit] Render crash:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#07060f', color: '#f0f0f0', fontFamily: 'monospace', padding: '2rem'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡ CONDUIT</div>
          <div style={{ color: '#ff4466', marginBottom: '0.5rem', fontWeight: 'bold' }}>Something crashed</div>
          <div style={{
            background: '#1a1a2e', padding: '1rem', borderRadius: '8px',
            color: '#ff6688', fontSize: '0.75rem', maxWidth: '600px',
            wordBreak: 'break-all', marginBottom: '1.5rem'
          }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.6rem 1.5rem', borderRadius: '8px',
              background: 'linear-gradient(135deg,#7a5cff,#00d4ff)',
              color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
