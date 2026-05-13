import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error:", error, info);
    this.setState({ info });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, info: null });
    // optionally reload the page
    // window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              color: "white",
              padding: 20,
              fontFamily: "sans-serif",
              overflow: "auto",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {this.state.error && this.state.error.toString()}
            </pre>
            <details style={{ marginTop: 12, color: "#ccc" }}>
              {this.state.info && this.state.info.componentStack}
            </details>
            <div style={{ marginTop: 16 }}>
              <button
                onClick={this.handleRetry}
                style={{
                  background: "#0ea5e9",
                  color: "#001",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
              <button
                onClick={() => console.clear()}
                style={{
                  marginLeft: 8,
                  background: "#f97316",
                  color: "#001",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Clear Console
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
