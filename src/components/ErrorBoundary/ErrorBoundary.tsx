import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  private reset = () => this.setState({ hasError: false });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="fixed bottom-4 right-4 z-[100] max-w-sm rounded-lg border border-red-200 bg-white p-4 shadow-lg"
      >
        <p className="text-sm text-gray-700">
          We couldn't load that panel. Your reading is safe.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-srf-blue px-3 py-1 text-sm text-white hover:bg-srf-blue/90"
          >
            Reload
          </button>
          <button
            onClick={this.reset}
            className="rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }
}
