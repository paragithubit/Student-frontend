import { useEffect, useState } from "react";
import API from "../../services/api";
import { PlusCircle, Edit2, Trash2, Layers, FolderPlus, Loader2, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDepartments = async () => {
    try { setDepartments((await API.get("/departments")).data); }
    catch (err) { toast.error("Failed to load departments"); }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code) return toast.error("Please fill all fields");
    const id = toast.loading(editId ? "Updating department..." : "Creating department...");
    try {
      setLoading(true);
      if (editId) await API.put(`/departments/${editId}`, { name, code });
      else await API.post("/departments", { name, code });
      toast.success(`Department ${editId ? "Updated" : "Added"}`, { id });
      handleCancelEdit();
      fetchDepartments();
    } catch (err) {
      toast.error("Error saving department", { id });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    const toastId = toast.loading("Deleting department...");
    try {
      await API.delete(`/departments/${id}`);
      toast.success("Department Deleted", { id: toastId });
      fetchDepartments();
    } catch (err) { toast.error("Error deleting department", { id: toastId }); }
  };

  const handleEdit = (dept) => {
    setEditId(dept._id);
    setName(dept.name);
    setCode(dept.code);
    toast("Editing mode enabled", { icon: "📝" });
  };

  const handleCancelEdit = () => { setName(""); setCode(""); setEditId(null); };

  return (
    <div className="p-4 md:p-8 space-y-8 text-slate-800 dark:text-slate-100 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Toaster position="top-right" reverseOrder={false} />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Layers className="text-indigo-600 dark:text-indigo-400" size={32} /> Department Directory
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">Configure, expand, and structure institutional departments.</p>
        </div>
        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 w-fit">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Departments</p>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 text-right">{departments.length}</p>
        </div>
      </div>

      {/* WORKSPACE SIDE-BY-SIDE SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: THE INPUT CONTAINER */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 p-6 sticky top-6">
          <div className="flex items-center gap-2 mb-6"><FolderPlus className="text-indigo-500" size={20} /><h2 className="text-xl font-bold tracking-tight">{editId ? "Modify Details" : "Create Department"}</h2></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Department Name</label>
              <input type="text" placeholder="e.g. Computer Science Engineering" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Department Code</label>
              <input type="text" placeholder="e.g. CSE" value={code} onChange={(e) => setCode(e.target.value)} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono text-sm font-bold tracking-wider" />
            </div>
            <div className="flex gap-3 pt-2">
              {editId && <button type="button" onClick={handleCancelEdit} className="w-1/3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl py-3 font-semibold text-sm transition-all">Cancel</button>}
              <button type="submit" disabled={loading} className={`flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                {loading ? <Loader2 className="animate-spin" size={16} /> : editId ? "Save Structural Changes" : <><PlusCircle size={16} /> Add to System</>}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: DATA DIRECTORY CONTAINER */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50"><h2 className="text-xl font-bold tracking-tight">Active Faculty Branches</h2></div>
          <div className="overflow-x-auto">
            {departments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-2">
                <AlertCircle size={36} className="text-slate-300 dark:text-slate-600" />
                <p className="font-bold tracking-wide text-sm uppercase">No registry records found</p>
                <p className="text-xs text-slate-400">Fill in details on the left to initialize.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/70 dark:bg-slate-800/30">
                    <th className="p-4 w-16 text-center">Index</th>
                    <th className="p-4">Department Name</th>
                    <th className="p-4 w-40">System Code</th>
                    <th className="p-4 w-32 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium text-sm">
                  {departments.map((department, index) => (
                    <tr key={department._id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-900/20 transition-colors group ${editId === department._id ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''}`}>
                      <td className="p-4 text-center font-bold text-slate-400">{index + 1}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{department.name}</td>
                      <td className="p-4"><span className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200/50 dark:border-slate-800 tracking-wide">{department.code}</span></td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => handleEdit(department)} title="Edit Record" className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(department._id)} title="Purge Record" className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"><Trash2 size={16} /></button>
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