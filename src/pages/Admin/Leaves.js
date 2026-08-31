import { useEffect, useState } from "react";
import API from "../../services/api";
import { 
  FileSpreadsheet, User, Mail, Briefcase, CalendarDays, CheckCircle, 
  XCircle, Clock, HelpCircle, Loader2, FolderOpen, ArrowRight, ShieldCheck, ShieldX
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const STATUS_MAP = {
  Approved: { bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", icon: <CheckCircle size={14} /> },
  Rejected: { bg: "bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/30", text: "text-rose-700 dark:text-rose-400", icon: <XCircle size={14} /> },
  Pending: { bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: <Clock size={14} /> }
};

function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leaves");
      setLeaves(res.data);
    } catch { toast.error("Critical failure: Could not synchronize leave registry"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const updateStatus = async (id, status) => {
    const toastId = toast.loading(`Committing ${status} status to matrix...`);
    setProcessingId(id);
    try {
      await API.put(`/leaves/${id}`, { status });
      toast.success(`Request ${status} successfully`, { id: toastId });
      fetchLeaves();
    } catch { toast.error("Protocol error: Update failed", { id: toastId }); }
    finally { setProcessingId(null); }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 text-slate-800 dark:text-slate-100 min-h-screen bg-slate-50/50 dark:bg-slate-900/40 transition-colors duration-200">
      <Toaster position="top-right" />
      
      {/* HEADER META CARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-900 dark:text-white">
            <FileSpreadsheet className="text-indigo-600 dark:text-indigo-400" size={32} /> Leave Registry
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Review, validate, and manage operational absence logs for students and faculty.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-5 py-3 rounded-2xl shadow-sm text-right flex items-center gap-6 shrink-0">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Pending Reviews</span>
            <span className="text-2xl font-black text-amber-500 tabular-nums">{leaves.filter(l => !["Approved", "Rejected"].includes(l.status)).length}</span>
          </div>
          <div className="h-10 w-px bg-slate-100 dark:bg-slate-700/50"></div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Total Logs</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{leaves.length}</span>
          </div>
        </div>
      </div>

      {/* LEAVE STREAM CONTAINER */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Active Processing Queue</h2>
          <div className="h-px grow bg-slate-200 dark:bg-slate-800/60"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
            <div className="relative"><Loader2 className="animate-spin text-indigo-500" size={40} /><div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse"></div></div>
            <span className="font-black text-xs tracking-widest uppercase opacity-70">Synchronizing Leave Arrays...</span>
          </div>
        ) : leaves.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {leaves.map((leave) => {
              const meta = STATUS_MAP[leave.status] || STATUS_MAP.Pending;
              const isProcessing = processingId === leave._id;

              return (
                <div key={leave._id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6 group relative overflow-hidden">
                  {!["Approved", "Rejected"].includes(leave.status) && <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-[60px] rounded-full -mr-10 -mt-10"></div>}

                  <div className="flex justify-between items-start gap-4 z-10">
                    <div className="flex gap-4 items-center">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-center text-slate-400 shrink-0 group-hover:border-indigo-500/30 transition-colors"><User size={22} /></div>
                      <div className="space-y-0.5">
                        <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{leave.user ? `${leave.user.firstName} ${leave.user.lastName}` : "Legacy Account"}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-400">
                          <span className="inline-flex items-center gap-1.5 uppercase tracking-wide"><Briefcase size={12} className="text-slate-300" />{leave.user?.role || "System"}</span>
                          <span className="h-1 w-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                          <span className="items-center gap-1.5 font-mono text-[11px] hidden sm:inline-flex"><Mail size={12} className="text-slate-300" />{leave.user?.email || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm ${meta.bg} ${meta.text}`}>{meta.icon}{leave.status}</span>
                  </div>

                  <div className="space-y-3 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/40 rounded-2xl p-4 transition-colors group-hover:bg-slate-50 dark:group-hover:bg-slate-900">
                    <div className="flex items-center gap-3 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"><CalendarDays size={14} className="text-indigo-500" />{new Date(leave.fromDate).toLocaleDateString()}</div>
                      <ArrowRight size={14} className="text-slate-300" />
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">{new Date(leave.toDate).toLocaleDateString()}</div>
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-start gap-2.5 leading-relaxed italic"><HelpCircle size={16} className="text-slate-400 mt-0.5 shrink-0" /><span>"{leave.reason}"</span></p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => updateStatus(leave._id, "Rejected")}
                      disabled={leave.status === "Rejected" || isProcessing}
                      className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                        leave.status === "Rejected" ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-50" : "bg-white dark:bg-slate-900 text-rose-600 border-rose-100 dark:border-rose-900/30 hover:bg-rose-600 hover:text-white shadow-sm"
                      }`}
                    >
                      <ShieldX size={14} /> Reject
                    </button>
                    <button
                      onClick={() => updateStatus(leave._id, "Approved")}
                      disabled={leave.status === "Approved" || isProcessing}
                      className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                        leave.status === "Approved" ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed opacity-50" : "bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 active:scale-95"
                      }`}
                    >
                      {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Approve
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 py-24 text-center text-slate-400 shadow-sm flex flex-col items-center justify-center gap-4">
            <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-full"><FolderOpen size={44} className="text-slate-300 dark:text-slate-600" /></div>
            <div className="space-y-1">
              <span className="text-sm font-black uppercase tracking-[0.2em] block text-slate-500">Archive Clear</span>
              <p className="text-xs font-medium text-slate-400">No leave documents detected in the current cycle.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaves;