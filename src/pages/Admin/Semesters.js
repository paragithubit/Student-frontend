import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import { 
  CalendarDays, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  Loader2, 
  X, 
  AlertCircle, 
  ExternalLink 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// 🔹 Clean form state without semesterNumber
const INITIAL_FORM = { name: "", department: "" };

function Semesters() {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSemesters = async () => {
    try { 
      const res = await API.get("/semesters");
      setSemesters(res.data); 
    } catch { 
      toast.error("Failed to fetch semesters"); 
    }
  };

  const fetchDepartments = async () => {
    try { 
      const res = await API.get("/departments");
      setDepartments(res.data); 
    } catch { 
      toast.error("Failed to fetch departments"); 
    }
  };

  useEffect(() => { 
    fetchSemesters(); 
    fetchDepartments(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate only semester name
    if (!form.name || form.name.trim() === "") {
      return toast.error("Semester Name is required");
    }

    try {
      setLoading(true);
      
      const payload = {
        name: form.name.trim(),
        department: form.department && form.department !== "" ? form.department : null,
      };

      if (editId) {
        await API.put(`/semesters/${editId}`, payload);
        toast.success("Semester Updated");
      } else {
        await API.post("/semesters", payload);
        toast.success("Semester Added");
      }
      handleCancel();
      fetchSemesters();
    } catch (err) { 
      toast.error(err.response?.data?.message || "Error saving semester"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this semester?")) return;
    try {
      await API.delete(`/semesters/${id}`);
      toast.success("Semester Deleted");
      fetchSemesters();
    } catch (err) { 
      toast.error(err.response?.data?.message || "Delete failed"); 
    }
  };

  const handleEdit = (sem) => {
    setEditId(sem._id);
    setForm({ 
      name: sem.name, 
      department: sem.department?._id || "" 
    });
  };

  const handleCancel = () => { 
    setForm(INITIAL_FORM); 
    setEditId(null); 
  };

  // 🔹 Clickable Redirections
  const handleSemesterClick = (semId) => {
    navigate(`/subjects?semesterId=${semId}`);
  };

  const handleDepartmentClick = (deptId) => {
    if (!deptId) return;
    navigate(`/departments`);
  };

  return (
    <div className="min-h-screen p-6 md:p-8 bg-slate-50 dark:bg-[#0B1120] text-black dark:text-white transition-all">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <CalendarDays className="text-indigo-500" /> Semester Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Add and manage academic semesters
          </p>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* COMPOSER FORM */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border dark:border-slate-700 p-6 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="text-indigo-500" />
            <h2 className="text-xl font-bold">{editId ? "Update Semester" : "Add Semester"}</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Semester Name */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Semester Name</label>
              <input 
                type="text" 
                placeholder="e.g. Semester 1 or Fall 2026" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 text-black dark:text-white placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>

            {/* Department */}
            <div>
              <label className="text-sm font-semibold mb-2 block">Department</label>
              <select 
                value={form.department} 
                onChange={(e) => setForm({ ...form, department: e.target.value })} 
                className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 text-black dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No Department (Global)</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id} className="bg-white dark:bg-slate-900">
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              {editId && (
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  className="p-3 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                >
                  <X size={18} />
                </button>
              )}
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : editId ? "Update Semester" : <><PlusCircle size={18} />Add Semester</>}
              </button>
            </div>
          </form>
        </div>

        {/* DATA LIST SYSTEM */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">Semester List</h2>
            <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-semibold">
              {semesters.length} Total
            </span>
          </div>
          <div className="overflow-x-auto">
            {semesters.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                <AlertCircle size={40} />
                <p className="mt-3">No semesters found</p>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-700 text-black dark:text-white">
                    {/* Headers: Number column removed */}
                    {["#", "Name", "Department", "Actions"].map((h, i) => (
                      <th key={h} className={`p-4 ${i === 3 ? "text-center" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {semesters.map((sem, index) => (
                    <tr 
                      key={sem._id} 
                      className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
                    >
                      <td className="p-4">{index + 1}</td>
                      
                      {/* NAME COLUMN (Clickable Redirect) */}
                      <td className="p-4 font-semibold">
                        <button
                          type="button"
                          onClick={() => handleSemesterClick(sem._id)}
                          className="group flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition text-left"
                          title="View subjects for this semester"
                        >
                          <span>{sem.name}</span>
                          <ExternalLink size={13} className="opacity-0 group-hover:opacity-100 transition text-slate-400" />
                        </button>
                      </td>

                      {/* DEPARTMENT COLUMN (Clickable Department Badge) */}
                      <td className="p-4">
                        {sem.department ? (
                          <button
                            type="button"
                            onClick={() => handleDepartmentClick(sem.department?._id)}
                            className="group flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:underline transition text-left"
                            title="Go to department"
                          >
                            <GraduationCap size={16} className="text-emerald-500 shrink-0" />
                            <span className="font-medium">{sem.department?.name}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400 italic">
                            <GraduationCap size={16} className="text-slate-400 shrink-0" />
                            <span>Global / None</span>
                          </div>
                        )}
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          <button 
                            onClick={() => handleEdit(sem)} 
                            title="Edit semester"
                            className="p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(sem._id)} 
                            title="Delete semester"
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
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

export default Semesters;