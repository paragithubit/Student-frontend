import { useEffect, useState } from "react";
import { FaUsers, FaUserGraduate, FaChalkboardTeacher, FaPlus, FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa";
import { MdDashboard, MdLogout } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = { firstName: "", lastName: "", email: "", password: "", role: "student" };
const emptySub = { name: "", code: "", teacherId: "", department: "", semester: "", credits: "", description: "" };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [subForm, setSubForm] = useState(emptySub);

  const fetchUsers = async () => {
    try {
      setUsers((await API.get("/users")).data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/");
        toast.error("Session expired. Please login again.");
      }
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInput = (setter) => (e) => setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading(editId ? "Updating user..." : "Adding user...");
    try {
      if (editId) await API.put(`/users/${editId}`, form);
      else await API.post("/users/add", form);
      toast.success(`User ${editId ? "updated" : "added"} successfully!`, { id: loadToast });
      setForm(emptyForm);
      setEditId(null);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to save user. Please try again.", { id: loadToast });
    }
  };

  const handleAction = async (type, payload) => {
    try {
      if (type === "delete" && window.confirm("Are you sure you want to delete this user?")) {
        await API.delete(`/users/${payload}`);
        toast.success("User deleted successfully");
        fetchUsers();
      } else if (type === "edit") {
        setEditId(payload._id);
        setForm({ ...payload, password: "" });
        toast("Editing mode enabled", { icon: '📝' });
      } else if (type === "assign") {
        await API.post("/subjects/assign", subForm);
        toast.success("Subject Assigned Successfully");
        setSubForm(emptySub);
      }
    } catch (err) {
      toast.error("Operation failed. Check connection.");
    }
  };

  const filteredUsers = users.filter((u) => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#0F172A] text-slate-900 dark:text-white">
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 font-medium rounded-xl', duration: 4000 }} />
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg">E</div>
              <div><h1 className="font-bold text-xl">EduOS</h1><p className="text-xs text-slate-500">Admin Panel</p></div>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <div className="flex items-center gap-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-xl font-semibold"><MdDashboard size={20} /> Dashboard</div>
          </nav>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button onClick={() => { localStorage.clear(); navigate("/"); toast.success("Logged out successfully"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-300 hover:text-red-600 transition"><MdLogout size={20} /> Sign Out</button>
          </div>
        </aside>
        <main className="flex-1 p-6 overflow-hidden">
          <header className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 shadow-sm">
            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-3 top-3.5 text-slate-400 text-sm" />
              <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right"><p className="text-sm font-bold">Admin User</p><p className="text-xs text-slate-500">Super Admin</p></div>
                <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="profile" className="h-10 w-10 rounded-xl border" />
              </div>
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center">
                <div><p className="text-sm text-slate-500">Total Users</p><h2 className="text-4xl font-black mt-2">{users.length}</h2></div>
                <div className="p-4 rounded-2xl bg-blue-100 text-blue-600"><FaUsers size={22} /></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center">
                <div><p className="text-sm text-slate-500">Students</p><h2 className="text-4xl font-black mt-2">{users.filter(u => u.role === "student").length}</h2></div>
                <div className="p-4 rounded-2xl bg-emerald-100 text-emerald-600"><FaUserGraduate size={22} /></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center">
                <div><p className="text-sm text-slate-500">Teachers</p><h2 className="text-4xl font-black mt-2">{users.filter(u => u.role === "teacher").length}</h2></div>
                <div className="p-4 rounded-2xl bg-indigo-100 text-indigo-600"><FaChalkboardTeacher size={22} /></div>
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold mb-8">{editId ? "Update User" : "Add New User"}</h2>
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleInput(setForm)} required className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleInput(setForm)} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleInput(setForm)} required className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                <select name="role" value={form.role} onChange={handleInput(setForm)} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
                <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleInput(setForm)} required={!editId} className="md:col-span-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                <button className="md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"><FaPlus /> {editId ? "Update User" : "Add User"}</button>
              </form>
            </section>
            <section className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold mb-6">Assign Subject</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleAction("assign"); }} className="space-y-5">
                <input name="name" placeholder="Subject Name" value={subForm.name} onChange={handleInput(setSubForm)} required className="w-full bg-white/10 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-400" />
                <input name="code" placeholder="Subject Code" value={subForm.code} onChange={handleInput(setSubForm)} required className="w-full bg-white/10 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-400" />
                <select name="teacherId" value={subForm.teacherId} onChange={handleInput(setSubForm)} required className="w-full bg-white/10 border border-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-400">
                  <option value="">Select Teacher</option>
                  {users.filter(u => u.role === "teacher").map((t) => (<option key={t._id} value={t._id} className="text-black">{t.firstName} {t.lastName}</option>))}
                </select>
                <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-blue-100 transition-all active:scale-95">Assign Subject</button>
              </form>
            </section>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800"><h2 className="text-lg font-bold">Users List</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="text-left p-4">User</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">{u.firstName?.[0]}{u.lastName?.[0]}</div>
                          <div><p className="font-semibold">{u.firstName} {u.lastName}</p><p className="text-sm text-slate-500">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === "teacher" ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"}`}>{u.role}</span></td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => handleAction("edit", u)} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"><FaEdit /></button>
                        <button onClick={() => handleAction("delete", u._id)} className="p-2 rounded-lg hover:bg-red-100 text-red-600"><FaTrashAlt /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}