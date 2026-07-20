import { Component, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** 'toast' (default) shows a small corner alert; 'screen' shows a calm full-page message. */
  variant?: 'toast' | 'screen';
};
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

    if (this.props.variant === 'screen') {
      return (
        <div
          role="alert"
          className="min-h-screen flex items-center justify-center px-6 text-center"
        >
          <div className="max-w-md">
            <p className="font-heading text-2xl text-srf-blue">The reading paused for a moment</p>
            <p className="mt-3 text-gray-700">
              Something interrupted the app, but your saved readings and personal notes remain safe on
              this device.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-srf-blue px-6 py-2 text-white transition-colors hover:bg-srf-blue-700"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        role="alert"
        className="fixed bottom-4 right-4 z-[100] max-w-sm rounded-lg border p-4 shadow-lg"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          We couldn't load that panel. Your reading is safe.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-srf-blue px-3 py-1 text-sm text-white hover:bg-srf-blue-700"
          >
            Reload
          </button>
          <button
            onClick={this.reset}
            className="rounded-full border px-3 py-1 text-sm"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }
}
