import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (status.msg) setStatus({ type: "", msg: "" });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(form.email)) return setStatus({ type: "error", msg: "Invalid email address" });
    if (!form.password) return setStatus({ type: "error", msg: "Password is required" });

    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", form);
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("name", data.name);
      localStorage.setItem("profilePic", data.profilePic);

      setStatus({ type: "success", msg: "Login successful! Redirecting..." });
      setTimeout(() => { window.location.href = `/${data.role}`; }, 1000);
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.message || "Invalid credentials." });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!validateEmail(form.email)) return setStatus({ type: "error", msg: "Enter email for reset link" });

    try {
      setLoading(true);
      await API.post("/auth/forgot-password", { email: form.email });
      setStatus({ type: "success", msg: "Reset link sent to your email!" });
    } catch {
      setStatus({ type: "error", msg: "Account not found." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
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
      <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 sm:px-16 lg:px-20 bg-slate-50">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-800">Sign In</h2>
            <p className="text-slate-500 mt-2 font-medium">Portal Access Authorization</p>
          </div>

          {/* DYNAMIC ALERT BANNER */}
          <AnimatePresence mode="wait">
            {status.msg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 ${
                  status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {status.msg}
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
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Login"}
            </button>
          </form>

          {/* INTERACTION FOOTER */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
            >
              Forgot your password? <span className="text-blue-600">Request Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;