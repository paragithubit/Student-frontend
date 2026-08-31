import { useEffect, useState } from "react";
import API from "../../services/api";
import { FileText,  Calendar,  SendHorizontal,  Clock,  CheckCircle2, XCircle, History, Inbox,Loader2,PlusCircle,ArrowRight} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// ==========================================
// STATIC STATUS CONFIGURATION
// ==========================================
const STATUS_MAP = {
  Approved: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200/50",
    icon: <CheckCircle2 size={14} />
  },
  Rejected: {
    bg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200/50",
    icon: <XCircle size={14} />
  },
  Pending: {
    bg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200/50",
    icon: <Clock size={14} />
  }
};

// ==========================================
// HISTORIC ENTRY COMPONENT
// ==========================================
const LeaveRow = ({ leave }) => {
  const currentStatus = leave.status || "Pending";
  const style = STATUS_MAP[currentStatus] || STATUS_MAP.Pending;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm group hover:border-indigo-500/30 transition-all">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full group-hover:h-8 transition-all" />
          <p className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-relaxed">
            {leave.reason}
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-[11px] text-slate-400 font-black tracking-wider bg-slate-50 dark:bg-slate-950 w-fit px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
          <Calendar size={14} className="text-indigo-500" />
          <span>{new Date(leave.fromDate).toLocaleDateString()}</span>
          <ArrowRight size={12} className="text-slate-300" />
          <span>{new Date(leave.toDate).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="shrink-0">
        <span className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 ${style.bg} transition-transform group-hover:scale-105`}>
          {style.icon}
          {currentStatus}
        </span>
      </div>
    </div>
  );
};

// ==========================================
// MAIN RECOGNITION CONTAINER
// ==========================================
export default function StudentLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async () => {
    try {
      const response = await API.get("/leaves/my");
      setLeaves(response.data);
    } catch {
      toast.error("Critical error syncing leave logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || !fromDate || !toDate) {
      return toast.error("Protocol error: All fields required");
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Transmitting leave request...");

    try {
      await API.post("/leaves", { reason, fromDate, toDate });
      toast.success("Request Logged Successfully", { id: loadingToast });
      setReason("");
      setFromDate("");
      setToDate("");
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Transmission failed", { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F1A]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <span className="font-black text-[10px] tracking-widest uppercase text-slate-400">Loading Leave Matrix...</span>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 text-slate-800 dark:text-slate-200 min-h-screen transition-colors duration-200 bg-slate-50 dark:bg-[#0B0F1A]">
      <Toaster position="top-right" />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20 text-white">
            <History size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
               <span className="text-indigo-600 dark:text-indigo-400 underline decoration-2 underline-offset-4">Registry</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">
              Student Request Management System
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* FORM MODULE */}
        <div className="lg:col-span-5 h-fit">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8 sticky top-10">
            <div className="flex items-center gap-2">
              <PlusCircle className="text-indigo-500" size={20} />
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">New Request</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Reason for Absence</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                  <textarea
                    placeholder="Enter concisely reason here..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows="3"
                    className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl pl-12 pr-4 py-4 border-2 border-transparent dark:border-slate-800 text-sm font-bold outline-none focus:border-indigo-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl pl-12 pr-4 py-4 border-2 border-transparent dark:border-slate-800 text-xs font-black outline-none focus:border-indigo-600 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl pl-12 pr-4 py-4 border-2 border-transparent dark:border-slate-800 text-xs font-black outline-none focus:border-indigo-600 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
                {submitting ? "Processing..." : "Dispatch Request"}
              </button>
            </form>
          </div>
        </div>

        {/* LOG HISTORY */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Request History</h2>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full font-black text-slate-500">
              {leaves.length} Applications
            </span>
          </div>

          {leaves.length > 0 ? (
            <div className="grid gap-4">
              {leaves.map((leave) => (
                <LeaveRow key={leave._id} leave={leave} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] py-28 text-center flex flex-col items-center justify-center gap-4">
              <div className="p-5 bg-slate-100 dark:bg-slate-800/50 rounded-full">
                <Inbox size={40} className="text-slate-300 dark:text-slate-600" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Registry Empty</p>
                <p className="text-[11px] font-bold text-slate-400/60 italic max-w-[200px] mx-auto">
                  No leave requests found in the archive.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}