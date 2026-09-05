"use client";
import { useEffect } from "react";
import { Icons } from "./Icons";

export function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "info" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: "bg-emerald-600 text-white",
    info: "bg-indigo-600 text-white",
    error: "bg-red-600 text-white",
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium ${styles[type]}`}
      style={{ animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}
    >
      <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0">
        {type === "success" ? (
          <Icons.Check />
        ) : type === "info" ? (
          <Icons.Signal />
        ) : (
          <Icons.X />
        )}
      </span>
      {message}
      <button
        onClick={onClose}
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
      >
        <Icons.X />
      </button>
    </div>
  );
}

// Updated to accept both title and action props
export function LiveOfferToast({
  title,
  action, // <-- ADDED
  onClose,
}: {
  title?: string;
  action?: string; // <-- ADDED type definition
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 7000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="flex items-start gap-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-black/10 px-5 py-4 w-80"
      style={{ animation: "slideUp 0.5s cubic-bezier(0.16,1,0.3,1)" }}
    >
      <div className="relative mt-0.5 shrink-0">
        <div className="w-9 h-9 bg-linear-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
          <Icons.Zap />
        </div>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span
            className="text-white font-black"
            style={{ fontSize: "8px", lineHeight: 1 }}
          >
            NEW
          </span>
        </span>
        <span
          className="absolute inset-0 rounded-xl bg-indigo-400 opacity-0"
          style={{ animation: "ping 1.5s ease-out 0.5s" }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {/* UPDATED: Dynamic Action injected here */}
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            {action ? action : "Just went live"}
          </span>
          <span
            className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
            style={{ animation: "pulseGreen 1.5s ease infinite" }}
          />
        </div>
        {/* Dynamic Title injected here */}
        <p className="text-slate-800 text-sm font-semibold leading-snug">
          {title ? title : "Exciting New Offer!"}
        </p>
        <p className="text-slate-500 text-xs mt-0.5 leading-snug">
          has just gone live! Tap to explore this limited deal.
        </p>
        <button className="mt-2.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
          View Offer <Icons.ArrowRight />
        </button>
      </div>

      <button
        onClick={onClose}
        className="text-slate-300 hover:text-slate-500 transition-colors mt-0.5 shrink-0"
      >
        <Icons.X />
      </button>
    </div>
  );
}
