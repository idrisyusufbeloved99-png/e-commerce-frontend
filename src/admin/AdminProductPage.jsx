import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Upload,
  ChevronDown,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../hooks/useAdminProducts";
import { useCategories } from "../hooks/useCategories";
import { formatCurrency } from "../utils/formatCurrency";

const EMOJI_MAP = {
  Gadgets: "📱",
  Fashion: "👗",
  Kitchenware: "🍳",
  Beauty: "✨",
};

function ProductForm({ product, categories, onClose, onSave, isSaving }) {
  const [images, setImages] = useState(() => {
    if (!product) return [];
    const all = [];
    if (product.imageUrl) all.push(product.imageUrl);
    if (product.images?.length) all.push(...product.images);
    return all;
  });
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (images.length >= 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/products/upload-image`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );
      const data = await res.json();
      console.log("Upload response:", res.ok, data); // ← add this
      if (!res.ok) throw new Error(data.error);
      setImages((prev) => [...prev, data.imageUrl]);
      toast.success("Image uploaded!");
    } catch (err) {
      console.log("Upload error:", err); // ← and this
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: product
      ? {
          name: product.name,
          categoryId: product.categoryId,
          unitPrice: product.unitPrice,
          originalPrice: product.originalPrice || "",
          stock: product.stock,
          description: product.description || "",
          homeFeature: product.homeFeature || false,
        }
      : {
          name: "",
          categoryId: categories[0]?.id || "",
          unitPrice: "",
          originalPrice: "",
          stock: "",
          description: "",
          homeFeature: false
        },
  });

  // ✅ imageUrl correctly included here
  function onSubmit(data) {
    onSave({
      id: product?.id,
      name: data.name,
      categoryId: data.categoryId,
      unitPrice: parseFloat(data.unitPrice),
      originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
      stock: parseInt(data.stock),
      description: data.description,
      imageUrl: images[0] || null, // first image = main
      images: images.slice(1), // rest = gallery
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-lg">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-6 py-5 flex flex-col gap-4"
        >
          {/* Image gallery upload */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">
              Product Images (max 4)
            </label>

            {/* Uploaded images grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200"
                  >
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Main badge */}
                    {index === 0 && (
                      <span className="absolute top-1 left-1 text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-md">
                        Main
                      </span>
                    )}
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Add more button — shows if under 4 */}
                {images.length < 4 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50">
                    {uploading ? (
                      <p className="text-[10px] text-blue-500 font-medium text-center px-1">
                        Uploading...
                      </p>
                    ) : (
                      <>
                        <Upload size={16} className="text-gray-400 mb-1" />
                        <p className="text-[10px] text-gray-400 text-center">
                          Add image
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            )}

            {/* Empty state — no images yet */}
            {images.length === 0 && (
              <label className="border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-400 transition-colors cursor-pointer bg-gray-50">
                <div className="p-6 flex flex-col items-center gap-2 text-center">
                  {uploading ? (
                    <p className="text-sm text-blue-500 font-medium">
                      Uploading...
                    </p>
                  ) : (
                    <>
                      <Upload size={20} className="text-gray-400" />
                      <p className="text-sm text-gray-400">
                        Click to upload product images
                      </p>
                      <p className="text-xs text-gray-300">
                        PNG, JPG, WEBP up to 5MB · max 4 images
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
          {/* Name */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
              Product Name *
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              placeholder="e.g. Wireless Earbuds Pro"
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                ${errors.name ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
              Category *
            </label>
            <div className="relative">
              <select
                {...register("categoryId", { required: true })}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-blue-400 transition-colors cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Price + Original Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                Price ($) *
              </label>
              <input
                {...register("unitPrice", {
                  required: "Required",
                  min: { value: 0, message: "Must be positive" },
                })}
                type="number"
                step="0.01"
                placeholder="49.99"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                  ${errors.unitPrice ? "border-red-400 bg-red-50" : "border-gray-200"}`}
              />
              {errors.unitPrice && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.unitPrice.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                Original Price ($)
              </label>
              <input
                {...register("originalPrice")}
                type="number"
                step="0.01"
                placeholder="79.99 (optional)"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
              Stock Quantity *
            </label>
            <input
              {...register("stock", {
                required: "Required",
                min: { value: 0, message: "Must be 0 or more" },
              })}
              type="number"
              placeholder="45"
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                ${errors.stock ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            {errors.stock && (
              <p className="text-red-400 text-xs mt-1">
                {errors.stock.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="Describe the product..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors resize-none"
            />
          </div>

          {/* Home Feature */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <input
              type="checkbox"
              id="homeFeature"
              {...register("homeFeature")}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <label
              htmlFor="homeFeature"
              className="text-sm font-semibold text-blue-700 cursor-pointer flex-1"
            >
              Feature on Homepage
              <span className="block text-xs font-normal text-blue-500 mt-0.5">
                This product will appear in the Featured Products section
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-600 font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-200"
            >
              {isSaving
                ? "Saving..."
                : product
                  ? "Save Changes"
                  : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProductPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: products = [], isLoading } = useAdminProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const isSaving = createProduct.isPending || updateProduct.isPending;

  function handleSave(data) {
    if (editing) {
      updateProduct.mutate(data, {
        onSuccess: () => {
          toast.success("Product updated!");
          closeForm();
        },
        onError: () => toast.error("Failed to update product"),
      });
    } else {
      createProduct.mutate(data, {
        onSuccess: () => {
          toast.success("Product added!");
          closeForm();
        },
        onError: () => toast.error("Failed to add product"),
      });
    }
  }

  function handleDelete(product) {
    deleteProduct.mutate(product.id, {
      onSuccess: () => toast.error(`"${product.name}" deleted`),
      onError: () => toast.error("Failed to delete product"),
    });
  }

  function openEdit(product) {
    setEditing(product);
    setShowForm(true);
  }
  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }
  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {showForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={closeForm}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Products</h1>
            <p className="text-gray-400 text-sm mt-1">
              {products.length} total products
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-200"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 max-w-sm shadow-sm focus-within:border-blue-400 transition-colors">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        EMOJI_MAP[p.category?.name] || "🛍️"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {p.category?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-black text-gray-900 text-sm">
                         {formatCurrency(p.unitPrice)}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full
                          ${p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}
                        >
                          {p.status === "ACTIVE" ? "Active" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold py-2 rounded-lg transition-colors"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold py-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {[
                        "Product",
                        "Category",
                        "Price",
                        "Stock",
                        "Status",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                              {p.imageUrl ? (
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                EMOJI_MAP[p.category?.name] || "🛍️"
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {p.name}
                              </p>
                              <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                {p.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {p.category?.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-gray-900">
                            {formatCurrency(p.unitPrice)}
                          </span>
                          {p.originalPrice && (
                            <span className="text-xs text-gray-400 line-through ml-1">
                              {formatCurrency(p.originalPrice)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{p.stock}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full
                            ${p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"}`}
                          >
                            {p.status === "ACTIVE" ? "Active" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(p)}
                              className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
