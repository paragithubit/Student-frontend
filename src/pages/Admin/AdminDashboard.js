import { useEffect, useState, useRef } from "react";
import { 
  FaUsers, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaSearch,
  FaTimes,
  FaCamera
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = { firstName: "", lastName: "", rollNumber: "", email: "", password: "", role: "student" };
const emptySub = { name: "", code: "", teacherId: "", department: "", semester: "", credits: "", description: "" };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [subForm, setSubForm] = useState(emptySub);

  // Avatar file upload reference and state
  const fileInputRef = useRef(null);
  const [adminAvatar, setAdminAvatar] = useState(
    () => localStorage.getItem("admin_avatar") || ""
  );

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        setAdminAvatar(base64);
        localStorage.setItem("admin_avatar", base64);
        toast.success("Profile picture updated! 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/");
        toast.error("Session expired. Please login again.");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInput = (setter) => (e) =>
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadToast = toast.loading(editId ? "Updating user..." : "Adding user...");

    try {
      const roleStr = form.role.toLowerCase();
      const cleanRoll = form.rollNumber ? String(form.rollNumber).trim() : "N/A";

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        role: roleStr,
        rollNumber: roleStr === "student" ? cleanRoll : "N/A",
        studentId: roleStr === "student" ? cleanRoll : "N/A",
      };

      if (!editId) {
        payload.password = form.password;
        await API.post("/users/add", payload);
      } else {
        if (form.password && form.password.trim() !== "") {
          payload.password = form.password.trim();
        }
        await API.put(`/users/${editId}`, payload);

        if (roleStr === "student") {
          try {
            await API.put(`/users/set-roll/${editId}`, { rollNumber: cleanRoll });
          } catch (err) {
            console.warn("Direct roll update fallback hit:", err);
          }
        }
      }

      toast.success(`User ${editId ? "updated" : "added"} successfully!`, { id: loadToast });
      setForm(emptyForm);
      setEditId(null);
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.msg || err.response?.data?.error || "Failed to save user. Please try again.", { id: loadToast });
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
        const resolvedRole = (payload.role || "student").toLowerCase();
        setForm({
          firstName: payload.firstName || "",
          lastName: payload.lastName || "",
          rollNumber: payload.rollNumber && payload.rollNumber !== "N/A" ? payload.rollNumber : "",
          email: payload.email || "",
          role: resolvedRole,
          password: "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast("Editing user - Enter roll number above", { icon: "📝" });
      } else if (type === "assign") {
        await API.post("/subjects/assign", subForm);
        toast.success("Subject Assigned Successfully");
        setSubForm(emptySub);
      }
    } catch (err) {
      toast.error("Operation failed. Check connection.");
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.firstName || ""} ${u.lastName || ""} ${u.email || ""} ${u.rollNumber || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 font-medium rounded-xl",
          duration: 4000,
        }}
      />

      {/* Page Search & Admin Header Banner */}
      <header className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search users or roll numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 text-sm border border-transparent focus:border-indigo-500 transition"
          />
        </div>
        
        {/* Profile Card with WhatsApp-Style Local File Upload */}
        <div className="flex items-center justify-between sm:justify-end gap-3.5">
          <div className="text-left sm:text-right">
            <p className="text-sm font-bold leading-tight">Admin User</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Clickable Avatar Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer h-10 w-10 rounded-xl overflow-hidden shadow-xs border border-indigo-200 dark:border-slate-700 bg-indigo-600 flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95"
            title="Click to choose profile picture from device"
          >
            {adminAvatar ? (
              <img
                src={adminAvatar}
                alt="Admin Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-white font-black text-sm tracking-wider select-none">
                AD
              </span>
            )}

            {/* Hover Camera Icon Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <FaCamera size={13} />
            </div>
          </div>
        </div>
      </header>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500">Total Users</p>
              <h2 className="text-3xl sm:text-4xl font-black mt-1 sm:mt-2 text-slate-900 dark:text-white">
                {users.length}
              </h2>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <FaUsers size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500">Students</p>
              <h2 className="text-3xl sm:text-4xl font-black mt-1 sm:mt-2 text-slate-900 dark:text-white">
                {users.filter((u) => u.role?.toLowerCase() === "student").length}
              </h2>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <FaUserGraduate size={22} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs sm:col-span-2 lg:col-span-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-500">Teachers</p>
              <h2 className="text-3xl sm:text-4xl font-black mt-1 sm:mt-2 text-slate-900 dark:text-white">
                {users.filter((u) => u.role?.toLowerCase() === "teacher").length}
              </h2>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <FaChalkboardTeacher size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management Form */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 md:p-7 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-bold">
              {editId ? "Update User" : "Add New User"}
            </h2>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setForm(emptyForm);
                }}
                className="text-xs font-bold text-slate-500 hover:text-red-500 flex items-center gap-1.5 transition"
              >
                <FaTimes /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleInput(setForm)}
              required
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleInput(setForm)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleInput(setForm)}
              required
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
            <select
              name="role"
              value={form.role}
              onChange={handleInput(setForm)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full text-slate-900 dark:text-white"
            >
              <option value="student" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Student</option>
              <option value="teacher" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Teacher</option>
            </select>

            {/* Roll Number Input (Type text to allow alphanumeric formats) */}
            {form.role.toLowerCase() === "student" && (
              <input
                name="rollNumber"
                type="text"
                placeholder="Roll Number (e.g., CS-101, 24)"
                value={form.rollNumber}
                onChange={handleInput(setForm)}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:col-span-2 font-medium"
              />
            )}

            <input
              name="password"
              type="password"
              placeholder={editId ? "Leave blank to keep current password" : "Password"}
              value={form.password}
              onChange={handleInput(setForm)}
              required={!editId}
              className="sm:col-span-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full"
            />
            <button className="sm:col-span-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition active:scale-98 text-sm sm:text-base shadow-md shadow-indigo-600/20">
              <FaPlus /> {editId ? "Update User" : "Add User"}
            </button>
          </form>
        </section>

        {/* Assign Subject Form */}
        <section className="bg-[#1E293B] text-white rounded-2xl p-5 sm:p-6 md:p-7 shadow-lg border border-slate-700">
          <h2 className="text-lg sm:text-xl font-bold mb-5">Assign Subject</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAction("assign");
            }}
            className="space-y-4"
          >
            <input
              name="name"
              placeholder="Subject Name"
              value={subForm.name}
              onChange={handleInput(setSubForm)}
              required
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400 text-white"
            />
            <input
              name="code"
              placeholder="Subject Code"
              value={subForm.code}
              onChange={handleInput(setSubForm)}
              required
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400 text-white"
            />
            <select
              name="teacherId"
              value={subForm.teacherId}
              onChange={handleInput(setSubForm)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-400 text-white"
            >
              <option value="" className="bg-slate-900 text-slate-400">Select Teacher</option>
              {users
                .filter((u) => u.role?.toLowerCase() === "teacher")
                .map((t) => (
                  <option key={t._id} value={t._id} className="bg-slate-900 text-white">
                    {t.firstName} {t.lastName}
                  </option>
                ))}
            </select>
            <button className="w-full bg-white hover:bg-slate-100 text-slate-900 py-3 rounded-xl font-bold transition active:scale-98 text-sm sm:text-base shadow-sm">
              Assign Subject
            </button>
          </form>
        </section>
      </div>

      {/* Users List Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base sm:text-lg font-bold">Users List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="text-left p-3.5 sm:p-4">User</th>
                <th className="text-left p-3.5 sm:p-4">Role</th>
                <th className="text-left p-3.5 sm:p-4">Roll No</th>
                <th className="text-right p-3.5 sm:p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredUsers.map((u) => (
                <tr
                  key={u._id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-3.5 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.firstName?.[0]}
                        {u.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 sm:p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        u.role?.toLowerCase() === "teacher"
                          ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                          : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 sm:p-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {u.role?.toLowerCase() === "student" ? (
                      <span className="font-semibold">{u.rollNumber || "N/A"}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3.5 sm:p-4 text-right space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handleAction("edit", u)}
                      className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition"
                      title="Edit"
                    >
                      <FaEdit size={15} />
                    </button>
                    <button
                      onClick={() => handleAction("delete", u._id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition"
                      title="Delete"
                    >
                      <FaTrashAlt size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}