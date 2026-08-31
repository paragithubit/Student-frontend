import { useEffect, useState } from "react";
import API from "../../services/api";
import { CalendarClock, Layers, BookOpen, User, Calendar, Clock, Edit3, Trash2, Plus, Loader2, X, AlertCircle, FolderPlus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const INITIAL_FORM = { division: "", subject: "", teacher: "", day: "", startTime: "", endTime: "" };

function Timetable() {
  const [timetables, setTimetables] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [r1, r2, r3, r4] = await Promise.all([
        API.get("/timetables"),
        API.get("/divisions"),
        API.get("/subjects"),
        API.get("/users/teachers"),
      ]);
      setTimetables(r1.data); setDivisions(r2.data); setSubjects(r3.data); setTeachers(r4.data);
    } catch { toast.error("Failed to load timetable data"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(form).some(val => !val)) return toast.error("Please fill all fields");

    const toastId = toast.loading(editId ? "Updating timetable..." : "Creating timetable...");
    try {
      setActionLoading(true);
      if (editId) {
        await API.put(`/timetables/${editId}`, form);
        toast.success("Timetable Updated", { id: toastId });
      } else {
        await API.post("/timetables", form);
        toast.success("Timetable Added", { id: toastId });
      }
      handleClear();
      fetchData();
    } catch { toast.error("Error saving timetable", { id: toastId }); } 
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this timetable?")) return;
    const toastId = toast.loading("Deleting...");
    try {
      await API.delete(`/timetables/${id}`);
      toast.success("Deleted Successfully", { id: toastId });
      fetchData();
    } catch { toast.error("Delete Failed", { id: toastId }); }
  };

  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({
      division: item.division?._id || "",
      subject: item.subject?._id || "",
      teacher: item.teacher?._id || "",
      day: item.day || "",
      startTime: item.startTime || "",
      endTime: item.endTime || ""
    });
    toast("Edit Mode Enabled ✏️");
  };

  const handleClear = () => { setForm(INITIAL_FORM); setEditId(null); };

  const wrapStyle = "flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all";
  const inputStyle = "w-full bg-transparent py-3 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none font-medium text-sm cursor-pointer";
  const optStyle = "bg-white dark:bg-slate-800 text-slate-900 dark:text-white";

  return (
    <div className="p-4 md:p-8 space-y-8 text-slate-800 dark:text-slate-100 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <CalendarClock className="text-indigo-600 dark:text-indigo-400" size={32} /> Timetable Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Configure, organize, and track institutional class schedules seamlessly.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 px-5 py-2.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 min-w-36">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Schedules</p>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 text-right">{timetables.length}</p>
        </div>
      </div>

      {/* MAIN LAYOUT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ACTION WORKSPACE */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 p-6 sticky top-6">
          <div className="flex items-center gap-2 mb-6"><FolderPlus className="text-indigo-500" size={20} /><h2 className="text-xl font-bold tracking-tight">{editId ? "Modify Schedule" : "Create Schedule"}</h2></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Division", icon: Layers, value: form.division, key: "division", data: divisions, placeholder: "Select Division" },
              { label: "Subject", icon: BookOpen, value: form.subject, key: "subject", data: subjects, placeholder: "Select Subject" },
              { label: "Teacher", icon: User, value: form.teacher, key: "teacher", data: teachers, display: (t) => `${t.firstName} ${t.lastName}`, placeholder: "Select Teacher" },
              { label: "Day", icon: Calendar, value: form.day, key: "day", data: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], placeholder: "Select Day", rawStrings: true }
            ].map((f) => (
              <div key={f.label} className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{f.label}</label>
                <div className={wrapStyle}>
                  <f.icon size={16} className="text-slate-400 mr-2.5 shrink-0" />
                  <select value={f.value} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className={inputStyle}>
                    <option value="" className={optStyle}>{f.placeholder}</option>
                    {f.data.map((item) => (
                      <option key={f.rawStrings ? item : item._id} value={f.rawStrings ? item : item._id} className={optStyle}>
                        {f.rawStrings ? item : f.display ? f.display(item) : item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            {/* START & END TIME GRID */}
            <div className="grid grid-cols-2 gap-4">
              {["startTime", "endTime"].map((timeKey) => (
                <div key={timeKey} className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{timeKey === "startTime" ? "Starts At" : "Ends At"}</label>
                  <div className={wrapStyle}>
                    <Clock size={16} className="text-slate-400 mr-2 shrink-0" />
                    <input type="time" value={form[timeKey]} onChange={(e) => setForm({ ...form, [timeKey]: e.target.value })} className="w-full bg-transparent py-3 text-slate-900 dark:text-white outline-none font-medium text-sm" />
                  </div>
                </div>
              ))}
            </div>

            {/* BUTTON SUBMIT AREA */}
            <div className="flex gap-3 pt-3">
              {editId && <button type="button" onClick={handleClear} className="w-1/3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl py-3 font-semibold text-sm transition-all flex items-center justify-center gap-1.5"><X size={15} /> Cancel</button>}
              <button type="submit" disabled={actionLoading} className={`flex-1 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${editId ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/10" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/10"} ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}{editId ? "Update Schedule" : "Add to System"}
              </button>
            </div>
          </form>
        </div>

        {/* DATA MANAGEMENT NODE */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50"><h2 className="text-xl font-bold tracking-tight">Active Academic Rotations</h2></div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-slate-400"><Loader2 className="animate-spin text-indigo-500" size={28} /><span className="font-medium text-sm">Syncing with Grid Registry...</span></div>
            ) : timetables.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-slate-400 gap-2">
                <AlertCircle size={36} className="text-slate-300 dark:text-slate-600" />
                <p className="font-bold tracking-wide text-sm uppercase">No active schedule nodes</p>
                <p className="text-xs text-slate-400">Add operational time grids on the dashboard left panel.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/70 dark:bg-slate-800/30">
                    {["Division", "Subject", "Instructor", "Day", "Timeline Window", "Actions"].map((h, i) => <th key={h} className={`p-4 ${i === 5 ? "w-32 text-center" : ""}`}>{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium text-sm">
                  {timetables.map((item) => (
                    <tr key={item._id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/20 transition-colors group ${editId === item._id ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}`}>
                      <td className="p-4 font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.division?.name}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{item.subject?.name}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{item.teacher?.firstName} {item.teacher?.lastName}</td>
                      <td className="p-4"><span className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs px-2.5 py-1 rounded-md border border-slate-200/50 dark:border-slate-800">{item.day}</span></td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 font-mono tracking-tight text-xs">{item.startTime} — {item.endTime}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(item)} className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"><Edit3 size={16} /></button>
                          <button onClick={() => handleDelete(item._id)} className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timetable;