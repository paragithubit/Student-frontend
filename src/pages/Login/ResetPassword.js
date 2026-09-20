import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../services/api";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      return setStatus({
        type: "error",
        msg: "Reset token missing from URL. Please request a new link.",
      });
    }

    if (!password.trim()) {
      return setStatus({ type: "error", msg: "Please enter your new password." });
    }

    if (password.length < 6) {
      return setStatus({
        type: "error",
        msg: "Password must be at least 6 characters long.",
      });
    }

    if (password !== confirmPassword) {
      return setStatus({ type: "error", msg: "Passwords do not match." });
    }

    try {
      setLoading(true);
      setStatus({ type: "", msg: "" });

      // Note: If your authRoute defines router.post, change to API.post
      // Trying PUT first (matching your original code), fallback handled safely
      const res = await API.put(`/auth/reset-password/${token}`, {
        password: password.trim(),
      });

      setStatus({
        type: "success",
        msg: res.data?.message || "Password reset successful! Redirecting to login...",
      });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error("Reset Password error:", err.response?.data);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid or expired reset token. Please request a new link.";
      setStatus({ type: "error", msg: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900">
            <Lock className="text-indigo-600 dark:text-indigo-400" size={26} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">
            Set New Password
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
            Enter and confirm your new account password below.
          </p>
        </div>

        {/* ALERT NOTIFICATION */}
        <AnimatePresence mode="wait">
          {status.msg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-start gap-2.5 ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
              )}
              <span>{status.msg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              New Password
            </label>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3.5 border-2 border-transparent focus-within:border-indigo-500 transition-all">
              <Lock size={18} className="text-slate-400 mr-3 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                className="bg-transparent w-full outline-none text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-indigo-500 transition ml-2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              Confirm Password
            </label>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3.5 border-2 border-transparent focus-within:border-indigo-500 transition-all">
              <Lock size={18} className="text-slate-400 mr-3 shrink-0" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-type new password"
                className="bg-transparent w-full outline-none text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-indigo-500 transition ml-2"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Updating Password...</span>
              </>
            ) : (
              "Save & Continue to Login"
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;