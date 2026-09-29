"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastItem = { id: number; message: string; type: "success" | "error" };
type ToastContextValue = { show: (message: string, type?: "success" | "error") => void };

const ToastContext = createContext<ToastContextValue | null>(null);

/** Fire-and-forget floating confirmations for actions that don't have a
 * natural inline spot to report success — favoriting a product, booking a
 * session, opening a slot. Errors that need explaining stay as inline
 * FormMessage text next to the form that caused them; this is just for
 * "yep, that worked." */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 200,
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} className={`mk-toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
