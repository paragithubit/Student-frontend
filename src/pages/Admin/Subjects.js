import { useEffect, useState } from "react";
import API from "../../services/api";
import { MdOutlineAutoStories, MdPersonSearch, MdRefresh, MdEdit, MdDelete } from "react-icons/md";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    setLoading(true);
    try { setSubjects((await API.get("/subjects")).data || []); } 
    catch (err) { console.error("Error fetching subjects:", err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSubjects(); }, []);

  // Handle Delete Subject
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await API.delete(`/subjects/${id}`);
        setSubjects(subjects.filter((s) => s._id !== id));
      } catch (err) {
        console.error("Error deleting subject:", err);
        alert(err.response?.data?.message || "Failed to delete subject");
      }
    }
  };

  // Handle Edit Subject (Connect to your Edit Modal/Form logic here)
  const handleEdit = (subject) => {
    console.log("Edit subject clicked:", subject);
    // Example: openEditModal(subject);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] p-4 md:p-8 transition-colors text-black dark:text-white">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MdOutlineAutoStories className="text-indigo-500 text-2xl" />
            <h1 className="text-2xl font-black tracking-tight">Curriculum Mapping</h1>
          </div>
          <p className="text-slate-500 text-sm">Overview of subjects and faculty assignments</p>
        </div>

        <button onClick={fetchSubjects} className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all shadow-sm active:scale-95">
          <MdRefresh size={20} className={loading ? "animate-spin" : ""} />
          <span className="text-sm font-bold">Refresh Data</span>
        </button>
      </div>

      {/* DATA VIEW AREA */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-medium animate-pulse">Syncing database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  {["#", "Subject Details", "Course Code", "Assigned Faculty", "Email", "Actions"].map((h, i) => (
                    <th key={h} className={`px-6 py-4 ${i === 2 ? "text-center" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-16 text-center text-slate-400">
                      <div className="flex flex-col items-center opacity-40"><MdPersonSearch size={48} /><p className="mt-2 font-medium">No subjects recorded in system</p></div>
                    </td>
                  </tr>
                ) : (
                  subjects.map((s, index) => (
                    <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-slate-400">{(index + 1).toString().padStart(2, '0')}</td>
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight">{s.name || "Unnamed Subject"}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-lg font-mono text-xs font-bold border border-indigo-100 dark:border-indigo-800">{s.code || "N/A"}</span>
                      </td>
                      <td className="px-6 py-4">
                        {s.teacher ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 font-bold text-xs">
                              {s.teacher.firstName?.[0]}{s.teacher.lastName?.[0]}
                            </div>
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{s.teacher.firstName} {s.teacher.lastName}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded uppercase tracking-tighter">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 italic">{s.teacher?.email || "—"}</td>
                      
                      {/* ACTIONS COLUMN (RIGHT SIDE OF EMAIL) */}
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEdit(s)}
                            className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                            title="Edit Subject"
                          >
                            <MdEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(s._id)}
                            className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                            title="Delete Subject"
                          >
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER STATUS */}
      <div className="mt-4 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">
        <span>System Status: Operational</span>
        <span>Total Subjects: {subjects.length}</span>
      </div>
    </div>
  );
}

export default Subjects;