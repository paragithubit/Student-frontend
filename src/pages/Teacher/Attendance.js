import { useEffect, useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { FaBars, FaUserCircle, FaGraduationCap, FaCalendarCheck, FaSignOutAlt, FaUsers, FaClipboardCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STATUSES = ["Present", "Absent", "Late", "Excused"];

export default function Attendance() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [data, setData] = useState({ students: [], subjects: [] });

  const today = new Date().toISOString().split("T")[0];
  const teacherName = localStorage.getItem("name") || "Teacher";
  const profilePic = localStorage.getItem("profilePic");

  useEffect(() => {
    (async () => {
      try {
        const [stu, sub] = await Promise.all([API.get("/users/students"), API.get("/subjects/my")]);
        setData({
          students: stu.data.map(s => ({ ...s, status: "Present" })),
          subjects: sub.data,
        });
        if (sub.data.length > 0) setSelectedSubject(sub.data[0]._id);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load attendance data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateStudentField = (index, field, value) => {
    const updatedStudents = [...data.students];
    updatedStudents[index][field] = value;
    setData({ ...data, students: updatedStudents });
  };

  const handleBulkSubmit = async () => {
    if (!selectedSubject) return toast.error("Please select subject");
    try {
      await API.post("/attendance/mark-bulk", { students: data.students, subject: selectedSubject, date: today });
      toast.success("Attendance Saved Successfully");
    } catch (error) {
      console.error(error);
      toast.error("Attendance Save Failed");
    }
  };

  const updateSingle = async (student) => {
    try {
      await API.put(`/users/${student._id}`, { studentId: student.studentId, firstName: student.firstName, lastName: student.lastName });
      await API.post("/attendance/mark-bulk", { students: [student], subject: selectedSubject, date: today });
      toast.success("Student Updated");
      setEditRow(null);
    } catch (error) {
      console.error(error);
      toast.error("Update Failed");
    }
  };

  const logout = () => { localStorage.clear(); window.location.href = "/"; };
  const menu = [{ to: "/teacher", label: "Dashboard", icon: <FaGraduationCap /> }, { to: "/attendance", label: "Attendance", icon: <FaCalendarCheck /> }];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-500 text-xl font-bold">
        Loading Attendance...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      <ToastContainer position="top-right" autoClose={2000} />

      <aside className={`bg-white dark:bg-slate-900 border-r dark:border-slate-800 transition-all flex flex-col ${sidebarOpen ? "w-72" : "w-20"}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><FaGraduationCap size={24} /></div>
          {sidebarOpen && <h2 className="text-xl font-black dark:text-white">EduCloud</h2>}
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2">
          {menu.map((m) => (
            <Link key={m.to} to={m.to} className={`flex items-center gap-4 p-3 rounded-xl transition-all ${window.location.pathname === m.to ? "bg-blue-100 dark:bg-slate-800 text-blue-600" : "hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
              <span className="text-xl">{m.icon}</span>
              {sidebarOpen && <span className="font-bold">{m.label}</span>}
            </Link>
          ))}
        </nav>

        <button onClick={logout} className="m-4 p-3 flex items-center gap-4 text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
          <FaSignOutAlt className="text-xl" />
          {sidebarOpen && "Sign Out"}
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 px-8 flex justify-between items-center sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"><FaBars /></button>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-4 border-l dark:border-slate-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold dark:text-white">{teacherName}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase">Teacher</p>
              </div>
              {profilePic ? <img src={profilePic} className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover" alt="profile" /> : <FaUserCircle size={32} className="text-slate-300" />}
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black dark:text-white flex items-center gap-3"><FaClipboardCheck className="text-blue-600" />Attendance Management</h1>
              <p className="text-slate-500 font-medium mt-1">Mark and manage student attendance.</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="border border-slate-300 dark:border-slate-700 px-4 py-3 rounded-xl dark:bg-slate-800 dark:text-white outline-none font-medium">
                {data.subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.name} ({subject.code})</option>)}
              </select>
              <button onClick={handleBulkSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold shadow-md transition-all">Save Attendance</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[{ label: "Total Students", val: data.students.length, color: "text-blue-600" }, { label: "Present Today", val: data.students.filter(s => s.status === "Present").length, color: "text-emerald-500" }, { label: "Date", val: today, color: "text-purple-600" }].map((stat, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm">
                <p className="text-sm uppercase font-bold text-slate-400">{stat.label}</p>
                <h2 className={`${idx === 2 ? "text-2xl" : "text-4xl"} font-black ${stat.color} mt-2`}>{stat.val}</h2>
              </motion.div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-4 text-left uppercase text-xs text-slate-500">#</th>
                    <th className="p-4 text-left uppercase text-xs text-slate-500">Student</th>
                    {STATUSES.map((status) => <th key={status} className="p-4 text-center uppercase text-xs text-slate-500">{status}</th>)}
                    <th className="p-4 text-center uppercase text-xs text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((student, index) => (
                    <tr key={student._id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/20">
                      <td className="p-4 font-bold text-slate-400">{index + 1}</td>
                      <td className="p-4 font-semibold dark:text-white">
                        {editRow === student._id ? (
                          <div className="flex gap-2">
                            <input type="text" value={student.firstName} onChange={(e) => updateStudentField(index, "firstName", e.target.value)} className="border dark:border-slate-700 dark:bg-slate-700 px-2 py-1 rounded-lg text-sm" />
                            <input type="text" value={student.lastName} onChange={(e) => updateStudentField(index, "lastName", e.target.value)} className="border dark:border-slate-700 dark:bg-slate-700 px-2 py-1 rounded-lg text-sm" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600"><FaUsers /></div>
                            <div>
                              <p>{student.firstName} {student.lastName}</p>
                              <p className="text-xs text-slate-400">{student.email}</p>
                            </div>
                          </div>
                        )}
                      </td>
                      {STATUSES.map((status) => (
                        <td key={status} className="p-4 text-center">
                          <input type="radio" checked={student.status === status} onChange={() => updateStudentField(index, "status", status)} className="w-4 h-4 cursor-pointer" />
                        </td>
                      ))}
                      <td className="p-4 text-center">
                        {editRow === student._id ? (
                          <div className="flex justify-center gap-3">
                            <button onClick={() => updateSingle(student)} className="text-emerald-600 font-bold">Save</button>
                            <button onClick={() => setEditRow(null)} className="text-slate-500 font-bold">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setEditRow(student._id)} className="text-blue-600 font-bold">Edit</button>
                        )}
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