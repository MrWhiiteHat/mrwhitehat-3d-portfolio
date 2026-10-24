import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL CLIENT ERROR CAUGHT BY BOUNDARY:', error, errorInfo);
  }

  handleReset = () => {
    try {
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(ellipse at center, #0b1510 0%, #030705 100%)',
            color: '#e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
            padding: '24px',
            zIndex: 999999,
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              padding: '28px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.15)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2
              style={{
                fontSize: '18px',
                letterSpacing: '0.1em',
                color: '#f87171',
                margin: '0 0 8px',
                fontWeight: 700,
              }}
            >
              KERNEL RECOVERY ENGAGED
            </h2>

            <p
              style={{
                fontSize: '13px',
                color: '#94a3b8',
                lineHeight: 1.6,
                margin: '0 0 20px',
              }}
            >
              The 3D portfolio subsystem caught a graphic pipeline state issue. Click below to reboot into safe mode.
            </p>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '11px',
                color: '#fca5a5',
                textAlign: 'left',
                wordBreak: 'break-all',
                maxHeight: '120px',
                overflowY: 'auto',
                marginBottom: '20px',
              }}
            >
              {this.state.error?.toString() || 'Unknown runtime error'}
            </div>

            <button
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              }}
            >
              <RotateCcw size={15} />
              REBOOT STUDIO SUBSYSTEMS
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
