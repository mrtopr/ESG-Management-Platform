import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, Info, AlertTriangle, AlertCircle, Award } from 'lucide-react';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast List Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-3 bg-card border border-border shadow-xl rounded-2xl p-4 pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300 relative overflow-hidden"
          >
            {/* Color accent bars */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              t.type === 'success' ? 'bg-primary' :
              t.type === 'badge' ? 'bg-esg-points' :
              t.type === 'info' ? 'bg-esg-social' :
              t.type === 'warning' ? 'bg-amber-500' : 'bg-destructive'
            }`} />

            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle className="w-5 h-5 text-primary" />}
              {t.type === 'badge' && <Award className="w-5 h-5 text-esg-points" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-esg-social" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-destructive" />}
            </div>

            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground leading-snug">
                {t.type === 'badge' ? '🏆 Badge Unlocked!' : 'Notification'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground text-[10px] font-bold p-1 self-start"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
