import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GroundZeroNews] Uncaught component error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('gz_news_lang');
      localStorage.removeItem('gz_theme');
      sessionStorage.clear();
    } catch {
      // Ignore storage errors
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 selection:bg-red-600 selection:text-white">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
            {/* Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                Ground Zero Wire Notice
              </span>
              <h1 className="text-2xl font-black text-white font-['Plus_Jakarta_Sans']">
                News Stream Interrupted
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                The terminal encountered an unexpected rendering anomaly. Your saved preferences and article dispatches remain secure.
              </p>
            </div>

            {/* Error Message Details */}
            {this.state.error && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-left text-[11px] font-mono text-red-300 overflow-x-auto max-h-32">
                <p className="font-bold text-red-400 mb-1">Diagnostic Log:</p>
                <p>{this.state.error.message || 'Unknown render exception'}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload News Stream</span>
              </button>
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reset Cache & Return</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
