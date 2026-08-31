import { useEffect, useState } from "react";
import API from "../../services/api";
import { CalendarDays, Clock, User, BookOpen, Layers, Inbox, Loader2, Sparkles } from "lucide-react";

// ==========================================
// STATIC CONSTANTS DEFINITION
// ==========================================
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ==========================================
// INDIVIDUAL SCHEDULE SLOT CARD PRIMITIVE
// ==========================================
const TimetableCard = ({ item }) => (
  <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/30 dark:hover:border-indigo-400/20 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden">
    {/* Dynamic Accent border */}
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="space-y-5">
      {/* Time Indicator Block */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-xs font-bold shadow-inner">
          <Clock size={14} className="animate-pulse" />
          <span>{item.startTime} — {item.endTime}</span>
        </div>
        
        {/* Division Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/40 dark:border-slate-700/40">
          <Layers size={11} />
          <span>Div {item.division?.name || "N/A"}</span>
        </div>
      </div>

      {/* Subject & Core Meta Info */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-300">
            <BookOpen size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Course Name</span>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white transition-colors duration-200">
              {item.subject?.name}
            </h2>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/60 text-slate-500 dark:text-slate-400 shrink-0 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors duration-300">
            <User size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Instructor</span>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 font-semibold">
              {item.teacher?.firstName} {item.teacher?.lastName}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Card Footer Accents */}
    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
      <span>In-person Lecture</span>
      <span className="text-slate-300 dark:text-slate-700">•</span>
      <span>Room Verified</span>
    </div>
  </div>
);

// ==========================================
// MAIN TIMETABLE DISPLAY SYSTEM
// ==========================================
export default function StudentTimetable() {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("Monday");

  useEffect(() => {
    (async () => {
      try {
        const response = await API.get("/timetables");
        setTimetables(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredSchedules = timetables.filter(
    (item) => item.day?.toLowerCase() === activeDay.toLowerCase()
  );

  return (
    <div className="p-4 md:p-8 space-y-10 text-slate-800 dark:text-slate-100 min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      
      {/* EYE-CATCHING HERO HEADER PANEL */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-900/30">
            <Sparkles size={12} />
            <span>Academic Pipeline</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-slate-100 bg-clip-text text-transparent">
            Lecture Schedule
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            Track daily routines, academic assignments, core division metrics, and teacher lineups effortlessly.
          </p>
        </div>

        {/* Calendar Metadata Widget */}
        <div className="flex items-center gap-4 bg-gradient-to-tr from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-inner w-full md:w-auto shrink-0 relative z-10">
          <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl shadow-md shadow-indigo-500/20 dark:shadow-none">
            <CalendarDays size={22} />
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Logged Slots</span>
            <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{timetables.length} Matrix Items</span>
          </div>
        </div>
      </div>

      {/* SMART CONTROLS: WEEKDAY FILTER BAR */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
        <div className="flex bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 w-max md:w-full justify-between gap-2 shadow-sm">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-5 py-3 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer text-center flex-1 min-w-[100px] ${
                activeDay === day
                  ? "bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-indigo-600 dark:to-violet-600 text-white shadow-md"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* TIMETABLE CONTENT VIEW */}
      {loading ? (
        <div className="bg-white/40 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-3xl py-40 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={28} />
          <span className="font-bold text-sm md:text-base tracking-wide text-slate-500">Compiling calendar architecture...</span>
        </div>
      ) : filteredSchedules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.map((item) => (
            <TimetableCard key={item._id} item={item} />
          ))}
        </div>
      ) : (
        /* VACANT NOTIFICATION LOGIC */
        <div className="bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl py-32 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-4 shadow-sm">
          <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl text-slate-400 dark:text-slate-600">
            <Inbox size={40} className="stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">No Classes on {activeDay}</p>
            <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 max-w-sm mx-auto px-6">
              There are no scheduled routines tracked for this specific day block. Take this time to catch up on self-guided courses!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}