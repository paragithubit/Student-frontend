import { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaExclamationTriangle, FaCalendarAlt } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

export default function MyAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setAttendance((await API.get("/attendance/my")).data); } 
      catch { toast.error("Failed to load records"); } 
      finally { setLoading(false); }
    })();
  }, []);

  const { stats, percentage, filteredData } = useMemo(() => {
    const total = attendance.length;
    const statsObj = { total, present: 0, absent: 0, late: 0 };
    
    attendance.forEach(a => {
      if (a.status === "Present") statsObj.present++;
      else if (a.status === "Absent") statsObj.absent++;
      else if (a.status === "Late") statsObj.late++;
    });

    const filtered = attendance.filter(a => 
      (filter === "All" || a.status === filter) && 
      new Date(a.date).toLocaleDateString('en-GB').includes(search)
    );

    return {
      stats: statsObj,
      percentage: total ? ((statsObj.present / total) * 100).toFixed(1) : 0,
      filteredData: filtered
    };
  }, [attendance, filter, search]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600" />
    </div>
  );

  const statusThemes = {
    Present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Late: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Absent: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#0f172a] p-4 md:p-8 transition-colors duration-300">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="max-w-7xl mx-auto">
        {/* HEADER PANEL */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
              <FaCalendarAlt className="text-blue-600" /> Attendance History
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Session: 2026-27</p>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search DD/MM/YYYY..." onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-3 w-full md:w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-all"
            />
          </div>
        </header>

        {/* STATS MATRIX GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Days", val: stats.total, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Present", val: stats.present, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "Absent", val: stats.absent, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
            { label: "Late", val: stats.late, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`${c.bg} p-5 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm`}>
              <p className="text-xs font-bold uppercase text-slate-500">{c.label}</p>
              <h3 className={`text-2xl font-black ${c.color} mt-1`}>{c.val}</h3>
            </motion.div>
          ))}

          <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border dark:border-slate-700">
            <div className="flex justify-between items-end mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase">Rate</p>
              <span className={`text-xl font-black ${percentage < 75 ? "text-rose-500" : "text-blue-600"}`}>{percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className={`h-full ${percentage < 75 ? "bg-rose-500" : "bg-blue-600"}`} />
            </div>
          </div>
        </div>

        {/* WORKFLOW CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-xl border dark:border-slate-700">
            {["All", "Present", "Absent", "Late"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-800 dark:hover:text-white"}`}>{f}</button>
            ))}
          </div>

          {percentage < 75 && (
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 px-4 py-2 rounded-lg border border-rose-100 dark:border-rose-900/30 text-xs font-bold animate-pulse"><FaExclamationTriangle /> Critical: Attendance below 75%</div>
          )}
        </div>

        {/* HISTORIC LOG DATA DISPLAY */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest font-black">
                {["Entry", "Date", "Day", "Status"].map(th => <th key={th} className="px-6 py-4">{th}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              <AnimatePresence mode="popLayout">
                {filteredData.map((item, idx) => {
                  const d = new Date(item.date);
                  return (
                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={item._id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-medium">#{idx + 1}</td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{d.toLocaleDateString('en-GB')}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{d.toLocaleDateString("en-US", { weekday: "long" })}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusThemes[item.status] || ""}`}>{item.status}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredData.length === 0 && <div className="py-20 text-center text-slate-400 font-bold italic">No records match your criteria.</div>}
        </div>
      </div>
    </div>
  );
}