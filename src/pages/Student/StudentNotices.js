import { useEffect, useState } from "react";
import API from "../../services/api";
import { BellRing, Sparkles, Inbox, Loader2,  Layers,  Globe,  ArrowRight, Pin} from "lucide-react";

// ==========================================
// INDIVIDUAL NOTICE PRIMITIVE CARD
// ==========================================
const NoticeCard = ({ notice }) => {
  const isAllAudience = notice.audience === "all";
  
  return (
    <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-400/20 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
      {/* Card Accent Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="space-y-4">
        {/* Meta Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500">
            <Pin size={14} className="text-indigo-500 rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            <span>Official Dispatch</span>
          </div>

          {/* Context Sensitive Audience Badges */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl border ${
            isAllAudience
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
              : "bg-indigo-50 text-indigo-700 border-indigo-200/60 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20"
          }`}>
            {isAllAudience ? <Globe size={12} /> : <Layers size={12} />}
            <span className="uppercase tracking-wider text-[10px]">{notice.audience}</span>
          </span>
        </div>

        {/* Main Content */}
        <div className="space-y-2">
          <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 line-clamp-2">
            {notice.title}
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-5">
            {notice.message}
          </p>
        </div>
      </div>

      {/* Decorative Footer Node */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-slate-400 dark:text-slate-600">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400/80 dark:text-slate-500">
          Acknowledge Memo
        </span>
        <ArrowRight size={16} className="group-hover:translate-x-1 text-slate-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-all" />
      </div>
    </div>
  );
};

// ==========================================
// MAIN BROADCAST COMPONENT
// ==========================================
export default function StudentNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await API.get("/notices");

        // Filter and reverse history logic inline to avoid layout mutation steps
        const filteredReversed = response.data
          .filter((n) => n.audience === "student" || n.audience === "all")
          .reverse();

        setNotices(filteredReversed);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-10 text-slate-800 dark:text-slate-100 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      
      {/* EYE-CATCHING GLASSMORPHISM HERO HEADER */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-900/30">
            <Sparkles size={12} className="animate-spin [animation-duration:4s]" />
            <span>Live Notice Stream</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-slate-100 bg-clip-text text-transparent">
            Student Broadcasts
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            Stay informed with crucial updates, institutional announcements, and dynamic campus feeds.
          </p>
        </div>

        {/* High-Fidelity Stats Counter Display */}
        <div className="flex items-center gap-4 bg-gradient-to-tr from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-inner w-full sm:w-auto shrink-0 relative z-10">
          <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20 dark:shadow-none">
            <BellRing size={22} className="animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Active Feeds</span>
            <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{notices.length} Updates</span>
          </div>
        </div>
      </div>

      {/* RENDER NOTICE BOARD SPACE */}
      {loading ? (
        <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-3xl py-40 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={28} />
          <span className="font-bold text-sm md:text-base tracking-wide text-slate-500">Syncing live dashboard parameters...</span>
        </div>
      ) : notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <NoticeCard key={notice._id} notice={notice} />
          ))}
        </div>
      ) : (
        /* VACANT NOTIFICATION LOGIC */
        <div className="bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl py-32 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-4 shadow-sm">
          <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-400 dark:text-slate-600">
            <Inbox size={40} className="stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">No Active Notices</p>
            <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 max-w-sm mx-auto px-6">
              Your tracking panel is clear of public announcements. Check back later for campus activity streams.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}