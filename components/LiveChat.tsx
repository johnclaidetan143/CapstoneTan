"use client";
import { useState } from "react";

export default function LiveChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 no-print">
      {open && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-56 flex flex-col gap-2 animate-fade-in">
          <p className="text-xs font-bold text-gray-700 mb-1">Chat with us 💬</p>
          <a href="https://m.me/chenicraftshop" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
            <span className="text-xl">📘</span>
            <span className="text-sm font-semibold text-blue-700">Messenger</span>
          </a>
          <a href="https://wa.me/639123456789" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
            <span className="text-xl">💬</span>
            <span className="text-sm font-semibold text-green-700">WhatsApp</span>
          </a>
          <a href="https://instagram.com/chenicraftshop" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors">
            <span className="text-xl">📸</span>
            <span className="text-sm font-semibold text-pink-700">Instagram</span>
          </a>
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-white shadow-lg flex items-center justify-center text-2xl transition-all hover:scale-110">
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
