import { useEffect, useState } from "react";
import API from "../../services/api";
import { Megaphone, Calendar, Tag, Inbox, Loader2, Bookmark, Sparkles } from "lucide-react";

export default function TeacherNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/notices");
        setNotices(res.data.filter(n => n.audience === "teacher" || n.audience === "all").reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8 text-slate-800 dark:text-slate-100 min-h-screen bg-slate-50 dark:bg-slate-900/40 transition-colors duration-200">
      
      {/* BULLETIN HEADER PANEL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Megaphone className="text-indigo-600 dark:text-indigo-400 animate-pulse" size={30} />
            Faculty Communications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Review active institutional policy updates, internal directives, and event schedules.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-sm flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">Broadcast Counter:</span>
          <span className="text-sm font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg">{notices.length}</span>
        </div>
      </div>

      {/* RENDER ANNOUNCEMENT MATRIX GRID */}
      {loading ? (
        <div className="flex items-center justify-center py-32 text-slate-400 gap-2">
          <Loader2 className="animate-spin text-indigo-500" size={24} />
          <span className="font-bold text-sm">Syncing Live Bulletin Feeds...</span>
        </div>
      ) : notices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.map((notice) => (
            <div key={notice._id} className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-all flex flex-col justify-between group relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <Calendar size={13} /> <span>Memo Tracked</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
                    notice.audience === "all"
                      ? "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-200/40"
                      : "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200/40"
                  }`}>
                    <Tag size={10} /> {notice.audience}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">{notice.title}</h2>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">{notice.message}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-700/60 flex items-center justify-between text-slate-300 dark:text-slate-600">
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">Read Acknowledgement</span>
                <Bookmark size={14} className="group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 py-24 rounded-2xl text-center text-slate-400 flex flex-col items-center justify-center gap-3 shadow-sm">
          <div className="h-12 w-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500"><Inbox size={24} className="stroke-[1.5]" /></div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-black tracking-tight text-slate-700 dark:text-slate-300 uppercase">Board Clear</h3>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-xs mx-auto">There are currently no active internal notices or broadcast dispatches targeted to your department node.</p>
          </div>
        </div>
      )}
    </div>
  );
}