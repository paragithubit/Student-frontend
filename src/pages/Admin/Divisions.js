import { useEffect, useState, useRef } from "react";
import API from "../../services/api";
import { 
  Network, Layers, PlusCircle, Trash2, Edit2, Loader2, AlertCircle,
  FolderPlus, Users, UserCheck, GraduationCap, CalendarDays, ChevronDown
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function Divisions() {
  const [data, setData] = useState({ divisions: [], departments: [], semesters: [], students: [], teachers: [] });
  const [filtered, setFiltered] = useState({ students: [], teachers: [] });
  const [selected, setSelected] = useState({ students: [], teachers: [] });
  const [dropdown, setDropdown] = useState({ students: false, teachers: false });
  const [form, setForm] = useState({ name: "", department: "", semester: "" });
  
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const refs = { students: useRef(null), teachers: useRef(null) };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [divs, depts, sems, stus, tchs] = await Promise.all([
        API.get("/divisions"), API.get("/departments"), API.get("/semesters"), API.get("/users/students"), API.get("/users/teachers")
      ]);
      setData({
        divisions: divs.data, departments: depts.data, semesters: sems.data,
        students: stus.data.filter(s => s._id), teachers: tchs.data.filter(t => t._id)
      });
    } catch { toast.error("Network sync failed"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const closeDropdowns = (e) => {
      Object.keys(refs).forEach(key => {
        if (refs[key].current && !refs[key].current.contains(e.target)) {
          setDropdown(prev => ({ ...prev, [key]: false }));
        }
      });
    };
    document.addEventListener("mousedown", closeDropdowns);
    return () => document.removeEventListener("mousedown", closeDropdowns);
  }, []);

  useEffect(() => {
    if (form.department) {
      setFiltered({
        students: data.students.filter(s => s.firstName && s.role === "student"),
        teachers: data.teachers.filter(t => t.firstName && t.role === "teacher")
      });
    } else { setFiltered({ students: [], teachers: [] }); }
  }, [form.department, data.students, data.teachers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.department || !form.semester) return toast.error("Please fill all fields");

    const toastId = toast.loading(editId ? "Updating Division..." : "Adding Division...");
    try {
      setActionLoading(true);
      const payload = { ...form, students: selected.students, teachers: selected.teachers };
      editId ? await API.put(`/divisions/${editId}`, payload) : await API.post("/divisions", payload);
      toast.success(`Division ${editId ? "Updated" : "Added"}`, { id: toastId });
      handleReset(); fetchData();
    } catch { toast.error("Error saving division", { id: toastId }); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this division?")) return;
    const toastId = toast.loading("Deleting division...");
    try {
      await API.delete(`/divisions/${id}`);
      toast.success("Division Deleted", { id: toastId });
      fetchData();
    } catch { toast.error("Delete failed", { id: toastId }); }
  };

  const handleEdit = (div) => {
    setEditId(div._id);
    setForm({ name: div.name, department: div.department?._id || "", semester: div.semester?._id || "" });
    setSelected({ students: div.students?.map(s => s._id) || [], teachers: div.teachers?.map(t => t._id) || [] });
    toast("Editing mode enabled", { icon: "📝" });
  };

  const handleReset = () => {
    setForm({ name: "", department: "", semester: "" });
    setSelected({ students: [], teachers: [] });
    setEditId(null);
  };

  const toggleSelect = (type, id) => {
    setSelected(prev => ({
      ...prev,
      [type]: prev[type].includes(id) ? prev[type].filter(item => item !== id) : [...prev[type], id]
    }));
  };

  const renderDropdownItems = (type) => (
    filtered[type].length > 0 ? filtered[type].map(user => (
      <label key={user._id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
        <input type="checkbox" checked={selected[type].includes(user._id)} onChange={() => toggleSelect(type, user._id)} />
        <span>{user.firstName} {user.lastName}</span>
      </label>
    )) : <p className="p-4 text-sm text-slate-400">No {type} found (Select a department)</p>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 text-slate-800 dark:text-slate-100 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Network className="text-indigo-600 dark:text-indigo-400" size={32} /> Division Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Manage divisions, students and teachers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 p-6 sticky top-6">
          <div className="flex items-center gap-2 mb-6">
            <FolderPlus className="text-indigo-500" size={20} />
            <h2 className="text-xl font-bold tracking-tight">{editId ? "Modify Details" : "Create Division"}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Division Name</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4">
                <Layers size={16} className="text-slate-400 mr-2.5" />
                <input type="text" placeholder="e.g. Division A" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-transparent py-3 outline-none text-slate-900 dark:text-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Department</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4">
                <GraduationCap size={16} className="text-slate-400 mr-2.5" />
                <select 
                  value={form.department} 
                  onChange={e => setForm({ ...form, department: e.target.value })} 
                  className="w-full bg-transparent py-3 outline-none text-slate-900 dark:text-white"
                >
                  <option value="" className="bg-white dark:bg-slate-900 text-slate-400">Select Department</option>
                  {data.departments.map(dept => (
                    <option key={dept._id} value={dept._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Semester</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4">
                <CalendarDays size={16} className="text-slate-400 mr-2.5" />
                <select 
                  value={form.semester} 
                  onChange={e => setForm({ ...form, semester: e.target.value })} 
                  className="w-full bg-transparent py-3 outline-none text-slate-900 dark:text-white"
                >
                  <option value="" className="bg-white dark:bg-slate-900 text-slate-400">Select Semester</option>
                  {data.semesters.map(sem => (
                    <option key={sem._id} value={sem._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      Semester {sem.semesterNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* STUDENTS DROPDOWN */}
            <div className="space-y-2 relative" ref={refs.students}>
              <label className="flex items-center gap-2 font-semibold text-sm"><Users size={16} /> Students</label>
              <button type="button" onClick={() => setDropdown(prev => ({ ...prev, students: !prev.students }))} className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-left flex items-center justify-between text-slate-900 dark:text-white">
                <span className="truncate">{selected.students.length > 0 ? `${selected.students.length} Students Selected` : "Select Students"}</span>
                <ChevronDown size={18} />
              </button>
              {dropdown.students && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-64 overflow-y-auto text-slate-900 dark:text-white">
                  {renderDropdownItems("students")}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {selected.students.map(id => {
                  const s = data.students.find(x => x._id === id);
                  return s ? <span key={id} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-3 py-1 rounded-full">{s.firstName} {s.lastName}</span> : null;
                })}
              </div>
            </div>

            {/* TEACHERS DROPDOWN */}
            <div className="space-y-2 relative" ref={refs.teachers}>
              <label className="flex items-center gap-2 font-semibold text-sm"><UserCheck size={16} /> Teachers</label>
              <button type="button" onClick={() => setDropdown(prev => ({ ...prev, teachers: !prev.teachers }))} className="w-full border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-left flex items-center justify-between text-slate-900 dark:text-white">
                <span className="truncate">{selected.teachers.length > 0 ? `${selected.teachers.length} Teachers Selected` : "Select Teachers"}</span>
                <ChevronDown size={18} />
              </button>
              {dropdown.teachers && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-64 overflow-y-auto text-slate-900 dark:text-white">
                  {renderDropdownItems("teachers")}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {selected.teachers.map(id => {
                  const t = data.teachers.find(x => x._id === id);
                  return t ? <span key={id} className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs px-3 py-1 rounded-full">{t.firstName} {t.lastName}</span> : null;
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              {editId && <button type="button" onClick={handleReset} className="w-1/3 bg-slate-100 dark:bg-slate-700 rounded-xl py-3 text-sm font-medium">Cancel</button>}
              <button type="submit" disabled={actionLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2">
                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <><PlusCircle size={16} /> {editId ? "Update Division" : "Add Division"}</>}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700"><h2 className="text-xl font-bold tracking-tight">Active Academic Branches</h2></div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-slate-400"><Loader2 className="animate-spin text-indigo-500" size={28} /><span>Loading...</span></div>
            ) : data.divisions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2"><AlertCircle size={36} /><p>No divisions found</p></div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 text-xs font-bold uppercase text-slate-400 bg-slate-50/50 dark:bg-slate-900/20">
                    <th className="p-4">#</th><th className="p-4">Division</th><th className="p-4">Department</th><th className="p-4">Semester</th><th className="p-4">Students</th><th className="p-4">Teachers</th><th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.divisions.map((div, index) => (
                    <tr key={div._id} className="border-b border-slate-100 dark:border-slate-700/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="p-4 text-sm text-slate-500">{index + 1}</td>
                      <td className="p-4 font-bold">{div.name}</td>
                      <td className="p-4 text-sm">{div.department?.name}</td>
                      <td className="p-4 text-sm">Semester {div.semester?.semesterNumber}</td>
                      <td className="p-4 text-sm">{div.students?.length || 0}</td>
                      <td className="p-4 text-sm">{div.teachers?.length || 0}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(div)} className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(div._id)} className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"><Trash2 size={16} /></button>
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

export default Divisions;