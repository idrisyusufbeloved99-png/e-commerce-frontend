import { useState, useEffect } from "react";
import { User, Package, Heart, LogOut, Edit2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import {
  useProfile,
  useCreateProfile,
  useUpdateProfile,
} from "../hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useProfile(user?.id);
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    phoneNumber: "",
    city: "",
    state: "",
  });
  const [editing, setEditing] = useState(false);

  // populate form once profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || "",
        address: profile.address || "",
        phoneNumber: profile.phoneNumber || "",
        city: profile.city || "",
        state: profile.state || "",
      });
    }
  }, [profile]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    if (profile) {
      // already has a profile — update it
      updateProfile.mutate(
        { userId: user.id, ...form },
        {
          onSuccess: () => {
            toast.success("Profile updated successfully!");
            setEditing(false);
          },
          onError: () => toast.error("Failed to update profile"),
        },
      );
    } else {
      // no profile yet — create one
      createProfile.mutate(form, {
        onSuccess: () => {
          toast.success("Profile created successfully!");
          setEditing(false);
        },
        onError: () => toast.error("Failed to create profile"),
      });
    }
  }

  async function handleLogout() {
    await logout();
    toast.success("Logged out!");
    navigate("/");
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="flex flex-col lg:flex-row gap-6">
          <Skeleton className="lg:w-72 h-80 rounded-2xl" />
          <Skeleton className="flex-1 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  const isSaving = createProfile.isPending || updateProfile.isPending;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-8">My Profile</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-72 shrink-0 flex flex-col gap-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-black">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-black text-gray-800">{user.username}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {[
              {
                icon: <User size={16} />,
                label: "Personal Info",
                active: true,
              },
              {
                icon: <Package size={16} />,
                label: "My Orders",
                path: "/orders",
              },
              {
                icon: <Heart size={16} />,
                label: "Wishlist",
                path: "/wishlist",
              },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path || "#"}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-b border-gray-50 last:border-0
                  ${item.active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <span
                  className={item.active ? "text-blue-600" : "text-gray-400"}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-400 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-800">
              Personal Information
              {!profile && (
                <span className="text-xs font-normal text-gray-400 ml-2">
                  (Not set up yet)
                </span>
              )}
            </h2>
            {profile && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Edit2 size={13} /> Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { label: "Full Name", field: "fullName" },
              { label: "Phone Number", field: "phoneNumber" },
              { label: "City", field: "city" },
              { label: "State", field: "state" },
              { label: "Address", field: "address", span: true },
            ].map((f) => (
              <div key={f.field} className={f.span ? "sm:col-span-2" : ""}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  {f.label}
                </label>
                <input
                  value={form[f.field]}
                  onChange={(e) => handleChange(f.field, e.target.value)}
                  disabled={profile && !editing}
                  placeholder={`Enter your ${f.label.toLowerCase()}`}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-400 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            ))}
          </div>

          {(!profile || editing) && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-200"
            >
              {isSaving
                ? "Saving..."
                : profile
                  ? "Save Changes"
                  : "Create Profile"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
