"use client";
import { useEffect, useState } from "react";

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

const icons = { success: "✅", error: "❌", info: "ℹ️" };
const colors = {
  success: "bg-gray-900 text-white",
  error:   "bg-red-500 text-white",
  info:    "bg-amber-500 text-white",
};

export default function Toast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function handler(e: Event) {
      const { message, type } = (e as CustomEvent).detail;
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
    }
    window.addEventListener("showToast", handler);
    return () => window.removeEventListener("showToast", handler);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold animate-slide-in ${colors[t.type]}`}
        >
          <span>{icons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slideIn 0.25s ease-out both; }
      `}</style>
    </div>
  );
}
