"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Icons } from "@/components/Icons";
import { Toast } from "@/components/Toast";
import {
  Promotion,
  fetchPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  socket,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Scheduled: "bg-indigo-100 text-indigo-700",
  Draft: "bg-slate-100 text-slate-700",
  Expired: "bg-red-100 text-red-700",
};

function PromotionModal({
  promoToEdit,
  onClose,
}: {
  promoToEdit?: Promotion | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);

  // Initialize state with existing data if we are editing, otherwise blank
  const [title, setTitle] = useState(promoToEdit?.title || "");
  const [description, setDescription] = useState(
    promoToEdit?.description || "",
  );
  const [category, setCategory] = useState(promoToEdit?.category || "All");
  const [status, setStatus] = useState<
    "Draft" | "Scheduled" | "Active" | "Expired"
  >(promoToEdit?.status || "Draft");

  // Format dates for the datetime-local input if editing
  const formatDateForInput = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toISOString().slice(0, 16) : "";
  const [startDate, setStartDate] = useState(
    formatDateForInput(promoToEdit?.start_date),
  );
  const [endDate, setEndDate] = useState(
    formatDateForInput(promoToEdit?.end_date),
  );

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  // ADDED: State to hold the image preview URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    promoToEdit?.image_url || null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File) => {
    if (!["image/jpeg", "image/png"].includes(f.type)) {
      setFileError("Only JPG or PNG files are accepted.");
      return false;
    }
    if (f.size > 2 * 1024 * 1024) {
      setFileError("File exceeds the 2MB maximum size.");
      return false;
    }
    setFileError("");
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && validateFile(dropped)) {
      setFile(dropped);
      // ADDED: Generate a local URL to preview the dropped image
      setPreviewUrl(URL.createObjectURL(dropped));
    }
  }, []);

  const handleSave = async () => {
    if (!title || !startDate || !endDate) {
      alert(
        "Please fill in the required fields (Title, Start Date, End Date).",
      );
      return;
    }

    setLoading(true);
    try {
      // If editing, use the old image URL by default. If creating, leave blank.
      let finalImageUrl = promoToEdit?.image_url || "";

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("promotions-banners")
          .upload(fileName, file);
        if (uploadError)
          throw new Error("Failed to upload image: " + uploadError.message);
        const { data: publicUrlData } = supabase.storage
          .from("promotions-banners")
          .getPublicUrl(fileName);
        finalImageUrl = publicUrlData.publicUrl;
      }

      const payload = {
        title,
        description,
        category,
        status,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        image_url:
          finalImageUrl ||
          "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80",
      };

      if (promoToEdit) {
        await updatePromotion(promoToEdit.id, payload);
      } else {
        await createPromotion(payload);
      }

      onClose();
    } catch (error) {
      console.error("Failed to save promotion:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save promotion.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="h-1 bg-linear-to-r from-indigo-500 to-violet-500 shrink-0" />
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2
              className="text-slate-800 text-lg font-bold"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {promoToEdit ? "Edit Promotion" : "Create Promotion"}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Fill in the details to launch a new campaign
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-lg transition-all"
          >
            <Icons.X />
          </button>
        </div>

        <div className="px-7 py-6 space-y-5 overflow-y-auto">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Flash Sale"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description…"
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="All">All</option>
                <option value="Fashion">Fashion</option>
                <option value="Electronics">Electronics</option>
                <option value="Education">Education</option>
                <option value="Rewards">Rewards</option>
                <option value="Health">Health</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as
                      | "Draft"
                      | "Scheduled"
                      | "Active"
                      | "Expired",
                  )
                }
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              >
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-1.5">
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-1.5">
              Banner Image
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-all ${fileError ? "border-red-300 bg-red-50" : dragOver ? "border-indigo-400 bg-indigo-50" : file ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && validateFile(f)) {
                    setFile(f);
                    // ADDED: Generate preview for manually selected files
                    setPreviewUrl(URL.createObjectURL(f));
                  }
                }}
              />

              {/* UPDATED: Renders the Image Preview if it exists, otherwise shows the upload icon */}
              {previewUrl ? (
                <div className="mx-auto mb-3 w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`mx-auto mb-3 w-10 h-10 rounded-xl flex items-center justify-center ${fileError ? "bg-red-100 text-red-500" : "bg-slate-100 text-slate-400"}`}
                >
                  <Icons.Upload />
                </div>
              )}

              {file && !fileError ? (
                <>
                  <p className="text-emerald-700 text-sm font-medium">
                    {file.name}
                  </p>
                  <p className="text-emerald-500 text-xs mt-0.5">
                    {(file.size / 1024).toFixed(0)} KB — ready to upload
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-600 text-sm font-medium">
                    Drop your banner here, or{" "}
                    <span className="text-indigo-600 font-semibold">
                      browse
                    </span>
                  </p>
                  <p className="text-slate-400 text-xs mt-1.5">
                    Requires JPG/PNG. Max size: 2MB.
                  </p>
                </>
              )}
            </div>
            {fileError && (
              <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                {fileError}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            disabled={loading}
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Promotion"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | "All">("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const data = await fetchPromotions();
        setPromotions(data);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPromotions();

    socket.connect();

    socket.on("promotionCreated", (newPromo) => {
      setPromotions((prev) => [newPromo, ...prev]);
      setToastMessage(`🎉 "${newPromo.title}" added!`);
      setTimeout(() => setToastMessage(""), 5000);
    });

    socket.on("promotionUpdated", (updatedPromo) => {
      setPromotions((prev) =>
        prev.map((p) => (p.id === updatedPromo.id ? updatedPromo : p)),
      );
      setToastMessage(`✏️ "${updatedPromo.title}" updated!`);
      setTimeout(() => setToastMessage(""), 5000);
    });

    socket.on("promotionRemoved", (deletedPromo) => {
      setPromotions((prev) => prev.filter((p) => p.id !== deletedPromo.id));
      setToastMessage(`🗑️ Promotion deleted.`);
      setTimeout(() => setToastMessage(""), 5000);
    });

    return () => {
      socket.off("promotionCreated");
      socket.off("promotionUpdated");
      socket.off("promotionRemoved");
      socket.disconnect();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await deletePromotion(id);
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete promotion.");
    }
  };

  const filtered = promotions.filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (dateFrom && new Date(p.start_date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(p.end_date) > new Date(dateTo)) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-slate-800 text-xl font-bold"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Active Promotions
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {filtered.length} promotions matching filters
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Icons.Plus /> New Promotion
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 mb-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            Status
          </label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Expired">Expired</option>
              <option value="Draft">Draft</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Icons.ChevronDown />
            </div>
          </div>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="flex items-center gap-2">
          <label className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        {(statusFilter !== "All" || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setStatusFilter("All");
              setDateFrom("");
              setDateTo("");
            }}
            className="text-slate-400 hover:text-slate-700 text-xs font-medium transition-colors ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {[
                "Banner",
                "Title",
                "Status",
                "Start Date",
                "End Date",
                "Actions",
              ].map((h, i) => (
                <th
                  key={h}
                  className={`text-slate-500 font-medium text-xs uppercase tracking-wider px-6 py-3.5 ${i === 5 ? "text-right" : "text-left"}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  Loading promotions...
                </td>
              </tr>
            ) : (
              filtered.map((promo) => (
                <tr
                  key={promo.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="w-20 h-11 rounded-md overflow-hidden bg-slate-100">
                      <img
                        src={promo.image_url || "/placeholder-image.jpg"}
                        alt={promo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <p className="text-slate-800 font-medium">{promo.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5 truncate max-w-[200px]">
                      {promo.description}
                    </p>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_COLORS[promo.status] || "bg-slate-100 text-slate-700"}`}
                    >
                      {promo.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                    {new Date(promo.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                    {new Date(promo.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingPromo(promo)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                      >
                        <Icons.Edit />
                      </button>

                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                      >
                        <Icons.Delete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-400 text-sm"
                >
                  No promotions match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <Toast
            message={toastMessage}
            type="info"
            onClose={() => setToastMessage("")}
          />
        </div>
      )}

      {isCreating && <PromotionModal onClose={() => setIsCreating(false)} />}
      {editingPromo && (
        <PromotionModal
          promoToEdit={editingPromo}
          onClose={() => setEditingPromo(null)}
        />
      )}
    </div>
  );
}
