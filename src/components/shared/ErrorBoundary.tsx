"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center">
          <h2 className="font-display font-bold text-lg text-[#A31D1D] mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-[#2A1810]/60 mb-4">
            We&apos;re sorry for the inconvenience. Please refresh the page or try again later.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-2 bg-[#A31D1D] text-[#FCE9D5] font-display font-bold text-xs uppercase tracking-widest rounded-full shadow-[3px_3px_0_#2A1810] hover:shadow-[4px_4px_0_#2A1810] transition-shadow"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
