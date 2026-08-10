import { useState } from "react";
import { Plus, Trash2, X, Upload, ToggleLeft, ToggleRight, Image } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminBanners, useCreateBanner, useToggleBanner, useDeleteBanner } from "../hooks/useBanners";

function BannerForm({ onClose }) {
  const [imageUrl, setImageUrl]   = useState("");
  const [uploading, setUploading] = useState(false);
  const createBanner = useCreateBanner();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { order: 0 },
  });

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("banner", file);
    setUploading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/banners/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImageUrl(data.imageUrl);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(data) {
    if (!imageUrl) {
      toast.error("Please upload a banner image");
      return;
    }
    createBanner.mutate(
      { ...data, imageUrl },
      {
        onSuccess: () => {
          toast.success("Banner created!");
          onClose();
        },
        onError: () => toast.error("Failed to create banner"),
      }
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-lg">Add Banner</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 flex flex-col gap-4">
          {/* Image upload */}
          <div className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 transition-colors cursor-pointer bg-gray-50">
            <label className="block cursor-pointer">
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="Banner" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-bold">Change Image</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center gap-2 text-center">
                  {uploading ? (
                    <p className="text-sm text-blue-500 font-medium">Uploading...</p>
                  ) : (
                    <>
                      <Upload size={24} className="text-gray-400" />
                      <p className="text-sm text-gray-400">Click to upload banner image</p>
                      <p className="text-xs text-gray-300">Recommended: 1200×400px</p>
                    </>
                  )}
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Title *</label>
            <input
              {...register("title", { required: "Title is required" })}
              placeholder="e.g. Summer Sale — Up to 50% Off"
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                ${errors.title ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Subtitle</label>
            <input
              {...register("subtitle")}
              placeholder="e.g. Shop the best deals of the season"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Link */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Link (optional)</label>
            <input
              {...register("link")}
              placeholder="e.g. /shop or /shop?category=xxx"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Order */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">Display Order</label>
            <input
              {...register("order")}
              type="number"
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1">Lower number = shown first</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-bold py-3 rounded-xl text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={createBanner.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-200">
              {createBanner.isPending ? "Creating..." : "Create Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBannerPage() {
  const [showForm, setShowForm] = useState(false);
  const { data: banners = [], isLoading } = useAdminBanners();
  const toggleBanner = useToggleBanner();
  const deleteBanner = useDeleteBanner();

  function handleToggle(banner) {
    toggleBanner.mutate(banner.id, {
      onSuccess: () => toast.success(`Banner ${banner.active ? "deactivated" : "activated"}`),
      onError: () => toast.error("Failed to update banner"),
    });
  }

  function handleDelete(banner) {
    deleteBanner.mutate(banner.id, {
      onSuccess: () => toast.error(`Banner deleted`),
      onError: () => toast.error("Failed to delete banner"),
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <>
      {showForm && <BannerForm onClose={() => setShowForm(false)} />}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Banners</h1>
            <p className="text-gray-400 text-sm mt-1">{banners.length} banners · {banners.filter(b => b.active).length} active</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200">
            <Plus size={16} /> Add Banner
          </button>
        </div>

        {banners.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Image size={40} className="text-gray-200 mx-auto mb-3" />
            <h3 className="font-black text-gray-700 mb-1">No banners yet</h3>
            <p className="text-gray-400 text-sm mb-4">Create banners to show promotional content on your homepage.</p>
            <button onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Add First Banner
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Banner image preview */}
                <div className="relative h-40 bg-gray-100">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                    <p className="text-white font-black text-lg">{banner.title}</p>
                    {banner.subtitle && <p className="text-white/80 text-sm">{banner.subtitle}</p>}
                  </div>
                  <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full
                    ${banner.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {banner.active ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50">
                  <div className="text-xs text-gray-400">
                    {banner.link && <span>→ {banner.link}</span>}
                    <span className="ml-2">Order: {banner.order}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggle(banner)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                        ${banner.active ? "bg-gray-50 hover:bg-gray-100 text-gray-500" : "bg-green-50 hover:bg-green-100 text-green-600"}`}>
                      {banner.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    </button>
                    <button onClick={() => handleDelete(banner)}
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}