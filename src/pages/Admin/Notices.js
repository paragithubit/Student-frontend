import { useEffect, useState } from "react";
import API from "../../services/api";
import { Megaphone, Send, UserCheck, Users, GraduationCap, Heading, FileText, Trash2, Edit, X, Loader2, Inbox } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const AUDIENCE_MAP = {
  student: { text: "Students", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", icon: <GraduationCap size={12} /> },
  teacher: { text: "Teachers", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: <UserCheck size={12} /> },
  all: { text: "Everyone", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", icon: <Users size={12} /> }
};

function Notices() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await API.get("/notices");
      setNotices(response.data);
    } catch { toast.error("Failed to load notices"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !message) return toast.error("Please fill all fields");

    const toastId = toast.loading(editId ? "Updating notice..." : "Publishing notice...");
    try {
      setSubmitting(true);
      const payload = { title, message, audience };
      if (editId) {
        await API.put(`/notices/${editId}`, payload);
        toast.success("Notice updated successfully", { id: toastId });
      } else {
        await API.post("/notices", payload);
        toast.success("Notice published successfully", { id: toastId });
      }
      handleCancel();
      fetchNotices();
    } catch { toast.error("Something went wrong", { id: toastId }); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    const toastId = toast.loading("Deleting notice...");
    try {
      await API.delete(`/notices/${id}`);
      toast.success("Notice deleted successfully", { id: toastId });
      fetchNotices();
    } catch { toast.error("Failed to delete notice", { id: toastId }); }
  };

  const handleEdit = (notice) => {
    setEditId(notice._id);
    setTitle(notice.title || "");
    setMessage(notice.message || "");
    setAudience(notice.audience || "all");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("Edit mode enabled", { icon: "✏️" });
  };

  const handleCancel = () => {
    setTitle("");
    setMessage("");
    setAudience("all");
    setEditId(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors duration-300">
      <Toaster position="top-right" />

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Megaphone size={34} className="text-indigo-600 dark:text-indigo-400" /> Notice Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Publish announcements for students and teachers</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 shadow-sm">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Total Notices</p>
          <h2 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{notices.length}</h2>
        </div>
      </div>

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* COMPOSER FORM */}
        <div className="xl:col-span-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                {editId ? <><Edit size={20} className="text-amber-500" /> Edit Notice</> : <><Send size={20} className="text-indigo-600 dark:text-indigo-400" /> Create Notice</>}
              </h2>
              {editId && (
                <button onClick={handleCancel} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 text-xs uppercase tracking-widest font-bold text-slate-400">Notice Title</label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4">
                  <Heading size={16} className="text-slate-400 mr-2" />
                  <input type="text" placeholder="Enter notice title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent py-3 outline-none text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-xs uppercase tracking-widest font-bold text-slate-400">Audience</label>
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4">
                  <Users size={16} className="text-slate-400 mr-2" />
                  <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full bg-transparent py-3 outline-none text-sm font-semibold text-slate-800 dark:text-slate-100">
                    <option value="all" className="bg-white dark:bg-slate-900">Everyone</option>
                    <option value="student" className="bg-white dark:bg-slate-900">Students</option>
                    <option value="teacher" className="bg-white dark:bg-slate-900">Teachers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-xs uppercase tracking-widest font-bold text-slate-400">Message</label>
                <div className="flex items-start bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                  <FileText size={16} className="text-slate-400 mr-2 mt-1" />
                  <textarea rows="6" placeholder="Write your notice message..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-transparent outline-none resize-none text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400" />
                </div>
              </div>

              <button type="submit" disabled={submitting} className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 ${editId ? "bg-amber-600 hover:bg-amber-500" : "bg-indigo-600 hover:bg-indigo-700"} ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}>
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                {editId ? "Update Notice" : "Publish Notice"}
              </button>
            </form>
          </div>
        </div>

        {/* NOTICES LIST SYSTEM */}
        <div className="xl:col-span-8 space-y-5">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl py-24 flex flex-col items-center justify-center gap-4">
              <Loader2 size={35} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              <p className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-sm">Loading Notices...</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl py-24 flex flex-col items-center justify-center gap-4">
              <div className="p-5 rounded-full bg-slate-100 dark:bg-slate-800"><Inbox size={40} className="text-slate-400" /></div>
              <div className="text-center">
                <h3 className="font-black text-lg">No Notices Found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Publish your first announcement</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {notices.map((notice) => {
                const badge = AUDIENCE_MAP[notice.audience] || AUDIENCE_MAP.all;
                return (
                  <div key={notice._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h2 className="font-black text-lg leading-tight text-slate-900 dark:text-white">{notice.title}</h2>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] uppercase font-black tracking-widest ${badge.className}`}>
                          {badge.icon} {badge.text}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">{notice.message}</p>
                    </div>

                    <div className="flex justify-end items-center gap-2 pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={() => handleEdit(notice)} className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(notice._id)} className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notices;