'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import AppLogo from './ui/AppLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#080a10] p-6 text-center">
          <div className="bg-[#0d1017] p-8 rounded-3xl border border-white/[0.05] shadow-2xl max-w-md">
            <div className="mb-6 flex justify-center">
              <div className="bg-red-500/10 p-4 rounded-full">
                <AppLogo size={40} />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Wave Spectrum encountered an unexpected error. Don't worry, your music is safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              Reload Application
            </button>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 text-slate-500 text-xs hover:text-slate-300 transition-colors"
            >
              Try to recover
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

