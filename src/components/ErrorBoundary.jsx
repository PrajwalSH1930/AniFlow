import React, { Component } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AniFlow ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-dark text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
            <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertOctagon className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Oops! Something went wrong
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected error occurred while rendering this view. Don't worry, your watchlist is safe in local storage.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reload Page
              </button>

              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-primary/25 transition-all"
              >
                <Home className="w-3.5 h-3.5" /> Back Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}