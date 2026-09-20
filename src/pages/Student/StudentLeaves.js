import { useEffect, useState } from "react";
import API from "../../services/api";
import { 
  FileText,   
  Calendar,   
  SendHorizontal,   
  Clock,   
  CheckCircle2, 
  XCircle, 
  History, 
  Inbox, 
  Loader2, 
  PlusCircle, 
  ArrowRight 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// ==========================================
// STATIC STATUS CONFIGURATION (LIGHT & DARK ACCURATE)
// ==========================================
const STATUS_MAP = {
  Approved: {
    bg: "bg-emerald-100/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60",
    icon: <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
  },
  Rejected: {
    bg: "bg-rose-100/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800/60",
    icon: <XCircle size={14} className="text-rose-600 dark:text-rose-400" />
  },
  Pending: {
    bg: "bg-amber-100/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800/60",
    icon: <Clock size={14} className="text-amber-600 dark:text-amber-400" />
  }
};

// ==========================================
// HISTORIC ENTRY COMPONENT
// ==========================================
const LeaveRow = ({ leave }) => {
  const currentStatus = leave.status || "Pending";
  const style = STATUS_MAP[currentStatus] || STATUS_MAP.Pending;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:border-indigo-500/50 dark:hover:border-indigo-500/40 transition-all duration-200">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-indigo-600 dark:bg-indigo-500 rounded-full" />
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-relaxed">
            {leave.reason}
          </p>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-semibold bg-slate-100/80 dark:bg-slate-950/80 w-fit px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
          <Calendar size={14} className="text-indigo-600 dark:text-indigo-400" />
          <span>{new Date(leave.fromDate).toLocaleDateString()}</span>
          <ArrowRight size={12} className="text-slate-400 dark:text-slate-600" />
          <span>{new Date(leave.toDate).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="shrink-0">
        <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-xl border ${style.bg}`}>
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
      setLeaves(Array.isArray(response.data) ? response.data : []);
    } catch {
      toast.error("Failed to load your leave history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || !fromDate || !toDate) {
      return toast.error("Please fill in all fields");
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Submitting leave request...");

    try {
      await API.post("/leaves", { reason: reason.trim(), fromDate, toDate });
      toast.success("Leave Request Submitted Successfully!", { id: loadingToast });
      setReason("");
      setFromDate("");
      setToDate("");
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request", { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={36} />
        <span className="font-bold text-xs tracking-wider uppercase text-slate-500 dark:text-slate-400">Loading Records...</span>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: "dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 font-medium",
        }} 
      />
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-600 rounded-2xl shadow-md shadow-indigo-600/20 text-white flex items-center justify-center">
            <History size={26} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Leave <span className="text-indigo-600 dark:text-indigo-400 underline decoration-2 underline-offset-4">Portal</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider mt-0.5">
              Submit & Review Leave Applications
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FORM MODULE */}
        <div className="lg:col-span-5 h-fit">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 sticky top-6">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              <PlusCircle className="text-indigo-600 dark:text-indigo-400" size={18} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Apply for Leave
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                  Reason for Absence
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                  <textarea
                    placeholder="Enter reason for leave..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows="3"
                    className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl pl-11 pr-4 py-3 border border-slate-200 dark:border-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl pl-11 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-xs dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl pl-11 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-xs dark:[color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-2xl py-3.5 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
                {submitting ? "Submitting..." : "Submit Leave Request"}
              </button>
            </form>
          </div>
        </div>

        {/* LOG HISTORY */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Your Applications
            </h2>
            <span className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full font-bold text-slate-700 dark:text-slate-300 shadow-xs">
              {leaves.length} Total
            </span>
          </div>

          {leaves.length > 0 ? (
            <div className="grid gap-3.5">
              {leaves.map((leave) => (
                <LeaveRow key={leave._id} leave={leave} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl py-20 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500">
                <Inbox size={32} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  No Leave History
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  You haven't submitted any leave applications yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}