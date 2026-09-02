import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="text-center py-16 px-6 bg-white rounded-3xl border border-rose-200 shadow-soft max-w-md mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-extrabold text-slate-800 mb-1.5">Database Error</h3>
      <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
        {message || 'Unable to load your birthdays from local storage. Please tap retry below.'}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-soft transition-all active:scale-95"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </button>
    </div>
  );
};
