import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, Send } from "lucide-react";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

const AuthInput = ({ label, icon: Icon, type, name, placeholder, value, onChange, children }) => (
  <div className="space-y-2">
    <label className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</label>
    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3.5 border-2 border-transparent focus-within:border-blue-500 transition-all">
      <Icon size={18} className="text-slate-400 mr-3" />
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className="bg-transparent w-full outline-none text-sm font-bold text-slate-700 dark:text-slate-200"
        required
      />
      {children}
    </div>
  </div>
);

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email?.trim());

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (status.msg) setStatus({ type: "", msg: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = form.email?.trim().toLowerCase();

    if (!validateEmail(cleanEmail)) {
      return setStatus({ type: "error", msg: "Please enter a valid email address." });
    }
    if (!form.password) {
      return setStatus({ type: "error", msg: "Password is required." });
    }

    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", {
        email: cleanEmail,
        password: form.password,
      });

      // Determine proper user object structure from response
      const resolvedUser = data.user || {
        firstName: data.firstName || (data.name ? data.name.split(" ")[0] : ""),
        lastName: data.lastName || (data.name ? data.name.split(" ").slice(1).join(" ") : ""),
        name: data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        role: data.role,
        email: data.email || cleanEmail,
        rollNumber: data.rollNumber || "N/A",
      };

      // Store in sessionStorage to ensure tab isolation
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("role", data.role);
      sessionStorage.setItem("name", resolvedUser.name || data.name || "");
      sessionStorage.setItem("user", JSON.stringify(resolvedUser));

      if (data.profilePic) {
        sessionStorage.setItem("profilePic", data.profilePic);
      }

      setStatus({ type: "success", msg: "Login successful! Redirecting..." });
      setTimeout(() => {
        window.location.href = `/${data.role}`;
      }, 800);
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.msg ||
        "Invalid email or password.";
      setStatus({ type: "error", msg: serverMsg });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 REFACTORED: Displays exact server error messages rather than hardcoded "Account not found."
  const handleForgotPassword = async () => {
    const cleanEmail = form.email?.trim().toLowerCase();

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      return setStatus({
        type: "error",
        msg: "Please enter your registered email address above first.",
      });
    }

    try {
      setResetLoading(true);
      setStatus({ type: "", msg: "" });

      const res = await API.post("/auth/forgot-password", {
        email: cleanEmail,
      });

      setStatus({
        type: "success",
        msg: res.data?.message || "Password reset link sent to your email!",
      });
    } catch (err) {
      console.error("Forgot Password Error:", err.response?.data);
      // 🔹 Extract actual error details from backend response
      const serverError =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to send reset link. Please check your credentials or try again later.";

      setStatus({
        type: "error",
        msg: serverError,
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-900 transition-colors">
      {/* LEFT SIDE ARTWORK */}
      <div className="hidden lg:flex lg:w-3/5 bg-slate-900 justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 p-12 text-center"
        >
          <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
            Centralized <span className="text-blue-500">Academic</span> Hub
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto font-medium">
            Access records, view results, and track performance in real-time.
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE WORKSPACE */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 sm:px-16 lg:px-20 bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">Sign In</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Portal Access Authorization
            </p>
          </div>

          {/* DYNAMIC ALERT BANNER */}
          <AnimatePresence mode="wait">
            {status.msg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-start gap-2 ${
                  status.type === "success"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                <span>{status.msg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORM NODE */}
          <form onSubmit={handleLogin} className="space-y-6">
            <AuthInput
              label="Email Address"
              icon={Mail}
              type="email"
              name="email"
              value={form.email}
              placeholder="name@university.edu"
              onChange={handleChange}
            />

            <AuthInput
              label="Password"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              placeholder="••••••••"
              onChange={handleChange}
            >
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-blue-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </AuthInput>

            <button
              type="submit"
              disabled={loading || resetLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Login"}
            </button>
          </form>

          {/* INTERACTION FOOTER */}
          <div className="mt-8 text-center">
            <button
              type="button"
              disabled={resetLoading || loading}
              onClick={handleForgotPassword}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-50"
            >
              {resetLoading ? (
                <>
                  <Loader2 className="animate-spin text-blue-600" size={16} />
                  <span className="text-blue-600">Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Forgot your password?</span>
                  <span className="text-blue-600 inline-flex items-center gap-1">
                    Request Reset <Send size={14} />
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;