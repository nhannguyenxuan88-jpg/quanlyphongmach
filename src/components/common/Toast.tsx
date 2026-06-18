/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  confirm: (message: string, onConfirm: () => void, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    message: string;
    title: string;
    onConfirm: () => void;
  } | null>(null);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = "toast-" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const confirm = useCallback((message: string, onConfirm: () => void, title: string = "Xác nhận hành động") => {
    setConfirmState({
      isOpen: true,
      message,
      title,
      onConfirm: () => {
        onConfirm();
        setConfirmState(null);
      }
    });
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-indigo-500 shrink-0" />;
    }
  };

  const getToastColors = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-emerald-100 bg-emerald-50/90 text-emerald-800 shadow-emerald-100/30";
      case "error":
        return "border-rose-100 bg-rose-50/90 text-rose-800 shadow-rose-100/30";
      case "warning":
        return "border-amber-100 bg-amber-50/90 text-amber-800 shadow-amber-100/30";
      default:
        return "border-indigo-100 bg-indigo-50/90 text-indigo-800 shadow-indigo-100/30";
    }
  };

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* TOASTS FLOATING CONTAINER */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100%-2rem)] pointer-events-none select-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start gap-3 transition-all duration-300 animate-toast-slide-in ${getToastColors(
              t.type
            )}`}
          >
            {getToastIcon(t.type)}
            <div className="flex-1 text-xs font-bold leading-relaxed">{t.message}</div>
            <button
              onClick={() => dismissToast(t.id)}
              className="p-0.5 rounded-lg hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition-colors pointer-events-auto cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* CONFIRMATION DIALOG MODAL (PREMIUM REPLACEMENT FOR native confirm()) */}
      {confirmState?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in">
          <div
            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 flex flex-col gap-4 z-10 transform transition-all duration-300 animate-scale-up text-left"
            role="dialog"
            aria-modal="true"
          >
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                {confirmState.title}
              </h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {confirmState.message}
              </p>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={confirmState.onConfirm}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-sm cursor-pointer"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
