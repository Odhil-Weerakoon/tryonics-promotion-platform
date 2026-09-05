export type View = "landing" | "login" | "admin" | "operator";
export type Role = "Admin" | "Operator";
export type PromotionStatus = "Active" | "Scheduled" | "Expired" | "Draft";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface Promotion {
  id: number;
  title: string;
  description: string;
  status: PromotionStatus;
  startDate: string;
  endDate: string;
  image: string;
  category: string;
}

export const STATUS_COLORS: Record<PromotionStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Scheduled: "bg-blue-100 text-blue-700 border border-blue-200",
  Expired: "bg-slate-100 text-slate-500 border border-slate-200",
  Draft: "bg-amber-100 text-amber-700 border border-amber-200",
};

export const STATUS_PUBLIC_LABEL: Record<PromotionStatus, string> = {
  Active: "Live Now",
  Scheduled: "Coming Soon",
  Expired: "Ended",
  Draft: "Preview",
};

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
}
