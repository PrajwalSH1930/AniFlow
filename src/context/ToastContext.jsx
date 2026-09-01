import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  AlertTriangle,
} from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: {
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    Icon: CheckCircle2,
  },
  error: {
    border: 'border-rose-500/30',
    iconColor: 'text-rose-400',
    Icon: AlertCircle,
  },
  warning: {
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    Icon: AlertTriangle,
  },
  info: {
    border: 'border-brand-primary/30',
    iconColor: 'text-brand-primary',
    Icon: Info,
  },
};

const DEFAULT_DURATION = 3000;
const MAX_TOASTS = 5;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'success', duration = DEFAULT_DURATION) => {
      if (!message) return;

      const toastType = TOAST_STYLES[type] ? type : 'info';
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const newToast = {
        id,
        message: String(message),
        type: toastType,
      };

      setToasts((prev) => {
        let updated = [...prev, newToast];
        if (updated.length > MAX_TOASTS) {
          const removed = updated[0];
          const timer = timersRef.current.get(removed.id);
          if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(removed.id);
          }
          updated = updated.slice(1);
        }
        return updated;
      });

      if (duration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [removeToast]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const contextValue = useMemo(
    () => ({ addToast, removeToast }),
    [addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 w-full max-w-sm px-4 sm:px-0 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          const Icon = style.Icon;

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border ${style.border} bg-slate-900/95 backdrop-blur-md shadow-2xl shadow-black/50 text-xs font-medium text-slate-200 transition-all duration-300 animate-in slide-in-from-bottom-5`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${style.iconColor}`}
                  aria-hidden="true"
                />
                <span className="truncate">{toast.message}</span>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                className="shrink-0 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}