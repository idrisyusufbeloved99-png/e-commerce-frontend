import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const password = watch("password");
  const { register: registerUser, login } = useAuth();

  async function onSubmit(data) {
    setLoading(true);
    try {
      await registerUser(data.username, data.email, data.password);
      // auto log them in right after signup
      await login(data.email, data.password);
      toast.success("Account created! Welcome 🎉", {
        description: "You can now start shopping.",
      });
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-[#0f172a] flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, #f97316 0%, transparent 60%), radial-gradient(circle at 80% 20%, #3b82f6 0%, transparent 40%)`,
          }}
        />
        <Link to="/" className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-black text-white text-2xl">
            My<span className="text-orange-400">Store</span>
          </span>
        </Link>
        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl font-black text-white leading-tight">
            Join thousands of
            <br />
            <span className="text-orange-400">happy shoppers.</span>
          </h2>
          <p className="text-slate-400">
            Create your account and start shopping the best deals today.
          </p>
        </div>
        <p className="text-slate-600 text-sm relative z-10">© 2026 MyStore</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-black text-gray-800 text-xl">
              My<span className="text-orange-500">Store</span>
            </span>
          </Link>

          <h1 className="text-3xl font-black text-gray-900 mb-1">
            Create account
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Sign up and start shopping today
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                  Username
                </label>
                <input
                  {...register("username", {
                    required: "Required",
                    minLength: { value: 3, message: "Min 3 characters" },
                  })}
                  placeholder="johndoe"
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
      ${errors.username ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
                />
                {errors.username && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <input
                {...register("email", {
                  required: "Required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
                placeholder="john@example.com"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                  ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Required",
                    minLength: { value: 6, message: "Min 6 characters" },
                  })}
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 pr-11 transition-colors
                    ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                Confirm Password
              </label>
              <input
                {...register("confirmPassword", {
                  required: "Required",
                  validate: (v) => v === password || "Passwords don't match",
                })}
                type="password"
                placeholder="••••••••"
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors
                  ${errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer mt-1">
              <input
                type="checkbox"
                className="accent-blue-600 mt-0.5 shrink-0"
                required
              />
              I agree to the{" "}
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Privacy Policy
              </a>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-200 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating
                  account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-bold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
