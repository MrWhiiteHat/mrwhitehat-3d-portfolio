import React from 'react';

/**
 * 3D Model Error Boundary
 * Prevents any GLTF or texture loading failure from crashing the React Three Fiber canvas.
 */
export default class Model3DBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Safe 3D Model load fallback triggered:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}
