import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-8">
        <p className="text-[8rem] sm:text-[12rem] font-black text-gray-100 leading-none select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-[#0f172a] rounded-2xl flex items-center justify-center shadow-2xl">
            <Zap size={36} className="text-orange-400" />
          </div>
        </div>
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3">Page not found</h1>
      <p className="text-gray-400 max-w-sm mb-8 text-sm">
        Looks like this page went out of stock. Let's get you back to shopping.
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-200"
        >
          <ArrowLeft size={15} /> Go Home
        </Link>
        <Link
          to="/shop"
          className="flex items-center gap-2 border border-gray-200 hover:border-blue-300 text-gray-600 hover:text-blue-600 font-bold px-6 py-3 rounded-xl text-sm transition-colors"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  );
}
