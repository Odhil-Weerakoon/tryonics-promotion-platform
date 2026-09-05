import { io } from "socket.io-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  status: "Scheduled" | "Active" | "Expired" | "Draft";
  start_date: string;
  end_date: string;
  image_url?: string;
  category: string;
  created_at: string;
}

// Define the exact shape of the data expected by the backend
export interface CreatePromotionPayload {
  title: string;
  description?: string;
  status?: "Scheduled" | "Active" | "Expired" | "Draft";
  start_date: string | Date;
  end_date: string | Date;
  image_url?: string;
  category: string;
}

// 1. REST API Methods
export const fetchPromotions = async () => {
  const response = await fetch(`${API_BASE_URL}/promotions`);
  if (!response.ok) throw new Error("Failed to fetch promotions");
  return response.json();
};

// Replace 'any' with our new 'CreatePromotionPayload' interface
export const createPromotion = async (
  promotionData: CreatePromotionPayload,
) => {
  const response = await fetch(`${API_BASE_URL}/promotions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(promotionData),
  });
  if (!response.ok) throw new Error("Failed to create promotion");
  return response.json();
};

export const updatePromotion = async (
  id: string,
  promotionData: Partial<CreatePromotionPayload>,
) => {
  const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(promotionData),
  });
  if (!response.ok) throw new Error("Failed to update promotion");
  return response.json();
};

export const deletePromotion = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete promotion");
  return response.json();
};

// 2. WebSocket Connection
export const socket = io(API_BASE_URL, {
  autoConnect: false, // We will connect it manually in the UI components
});
