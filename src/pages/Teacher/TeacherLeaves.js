import { useEffect, useState } from "react";
import API from "../../services/api";
import { FileText, Calendar, SendHorizontal, Clock, CheckCircle2, XCircle, Layers, Inbox, Loader2, ArrowRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function TeacherLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ reason: "", fromDate: "", toDate: "" });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try { setLeaves((await API.get("/leaves/my")).data); } 
    catch { toast.error("Failed to sync leave history"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading("Transmitting leave protocol...");
    try {
      await API.post("/leaves", form);
      toast.success("Leave Request Archived Successfully", { id: toastId });
      setForm({ reason: "", fromDate: "", toDate: "" });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol rejection error.", { id: toastId });
    } finally { setSubmitting(false); }
  };

  const statusMap = {
    Approved: { bg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200/50", icon: <CheckCircle2 size={14} /> },
    Rejected: { bg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200/50", icon: <XCircle size={14} /> },
    Pending:  { bg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200/50", icon: <Clock size={14} /> }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F1A]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <span className="font-black text-[10px] tracking-widest uppercase text-slate-400">Syncing Leave Logs...</span>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 text-slate-800 dark:text-slate-200 min-h-screen bg-slate-50 dark:bg-[#0B0F1A]">
      <Toaster position="top-right" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20"><Layers size={24} /></div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            Leave <span className="text-indigo-600 dark:text-indigo-400 underline decoration-2 underline-offset-4">Matrix</span>
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em] ml-1">Teacher Administrative Interface v2.6</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* INPUT WORKSPACE */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2">Apply Absence</h2>
            <div className="h-1 w-12 bg-indigo-600 rounded-full" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Operational Context</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 core-transition" size={18} />
                <textarea
                  placeholder="State the reason for leave dispatch..."
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  required rows="4"
                  className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl pl-12 pr-4 py-4 border-2 border-transparent dark:border-slate-800 text-sm font-bold outline-none focus:border-indigo-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 resize-none shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["fromDate", "toDate"].map((field) => (
                <div key={field} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">
                    {field === "fromDate" ? "Protocol Start" : "Protocol End"}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="date" value={form[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl pl-12 pr-4 py-4 border-2 border-transparent dark:border-slate-800 text-xs font-black outline-none focus:border-indigo-600 transition-all shadow-inner"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit" disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
              {submitting ? "Transmitting..." : "Initialize Leave Dispatch"}
            </button>
          </form>
        </div>

        {/* REGISTRY TIMELINE */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Registry Archive</h2>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-black text-slate-500">{leaves.length} ENTRIES</span>
          </div>

          {leaves.length > 0 ? (
            <div className="grid gap-4">
              {leaves.map((leave) => {
                const config = statusMap[leave.status] || statusMap.Pending;
                return (
                  <div key={leave._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm group hover:shadow-md hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full group-hover:h-8 transition-all" />
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight leading-relaxed">{leave.reason}</p>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 font-black tracking-wider bg-slate-50 dark:bg-slate-950 w-fit px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <Calendar size={14} className="text-indigo-500" />
                        <span>{new Date(leave.fromDate).toLocaleDateString()}</span>
                        <ArrowRight size={12} className="text-slate-300" />
                        <span>{new Date(leave.toDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="shrink-0 flex md:justify-end">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 ${config.bg} transition-transform group-hover:scale-105`}>
                        {config.icon} {leave.status || "Processing"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] py-28 text-center flex flex-col items-center justify-center gap-4">
              <div className="p-5 bg-slate-100 dark:bg-slate-800/50 rounded-full"><Inbox size={40} className="text-slate-300 dark:text-slate-600" /></div>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Zero Registry Logs</p>
                <p className="text-[11px] font-bold text-slate-400/60 max-w-[250px] leading-relaxed italic">No time-off requests detected in the current organizational timeframe.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}