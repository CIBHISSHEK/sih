import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-sm text-center">
            <p className="text-4xl mb-2">⚠️</p>
            <h1 className="text-lg font-bold text-gray-800">Something went wrong</h1>
            <p className="text-sm text-gray-500 mt-1">{this.state.error.message}</p>
            <button
              className="mt-4 bg-brand-600 text-white font-semibold px-5 py-2 rounded-lg"
              onClick={() => {
                this.setState({ error: null });
                window.location.href = "/login";
              }}
            >
              Back to login
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
