"use client";
// 1. Pull the Promotion type from your new API file
import { Promotion } from "@/lib/api";
import { Icons } from "./Icons";
// 2. Keep importing your utility functions from types, but remove the Promotion type
import { STATUS_PUBLIC_LABEL, formatDate } from "../lib/types";

export function PromotionCard({ promo }: { promo: Promotion }) {
  const isActive = promo.status === "Active";
  const isComingSoon = promo.status === "Scheduled";

  return (
    <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      {/* Banner image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={promo.image_url || "/placeholder-image.jpg"} // <-- Updated to image_url with a fallback
          alt={promo.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient overlay for badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Status badge over the image */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
              isActive
                ? "bg-emerald-500/90 text-white"
                : isComingSoon
                  ? "bg-indigo-500/90 text-white"
                  : "bg-slate-700/80 text-slate-200"
            }`}
          >
            {isActive && (
              <span
                className="w-1.5 h-1.5 bg-white rounded-full"
                style={{ animation: "pulseGreen 1.5s ease infinite" }}
              />
            )}
            {STATUS_PUBLIC_LABEL[promo.status]}
          </span>
        </div>

        {/* Category chip */}
        <div className="absolute top-3 right-3">
          <span className="text-[11px] font-medium bg-white/90 backdrop-blur-sm text-slate-600 px-2 py-0.5 rounded-full">
            {promo.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3
          className="text-slate-800 font-bold text-base leading-snug mb-2 group-hover:text-indigo-700 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {promo.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
          {promo.description}
        </p>

        {/* Date row */}
        <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
          <Icons.Calendar />
          <span>
            {
              isActive ? (
                <>
                  Ends{" "}
                  <span className="font-semibold text-slate-600">
                    {formatDate(promo.end_date)}
                  </span>
                </> // <-- Updated to end_date
              ) : isComingSoon ? (
                <>
                  Starts{" "}
                  <span className="font-semibold text-slate-600">
                    {formatDate(promo.start_date)}
                  </span>
                </> // <-- Updated to start_date
              ) : (
                <>Ended {formatDate(promo.end_date)}</>
              ) // <-- Updated to end_date
            }
          </span>
        </div>

        {/* CTA button */}
        <button
          disabled={promo.status === "Expired"}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            isActive
              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 hover:shadow-indigo-300"
              : isComingSoon
                ? "bg-slate-100 hover:bg-indigo-50 text-indigo-600 border border-indigo-200 hover:border-indigo-300"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isActive ? (
            <>
              <Icons.Zap />
              <span>Claim Offer</span>
            </>
          ) : isComingSoon ? (
            <>
              <Icons.Bell />
              <span>Notify Me</span>
            </>
          ) : (
            "Offer Ended"
          )}
        </button>
      </div>
    </article>
  );
}
