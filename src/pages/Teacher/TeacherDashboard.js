import { Link } from "react-router-dom";
import {
  FaUserCircle, FaBars, FaGraduationCap, FaCalendarCheck, FaChartLine,
  FaSignOutAlt, FaBookOpen, FaUsers, FaClipboardList, FaChalkboardTeacher,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import API from "../../services/api";

const SIDEBAR_MENU = [
  { to: "/teacher", label: "Dashboard", icon: <FaChartLine /> },
  { to: "/attendance", label: "Attendance", icon: <FaCalendarCheck /> },
  { to: "/results", label: "Results", icon: <FaGraduationCap /> },
];

const QUICK_ACTIONS = [
  { to: "/attendance", label: "Mark Attendance", desc: "Manage daily attendance", icon: <FaCalendarCheck />, bg: "bg-blue-100 dark:bg-blue-950/40", text: "text-blue-600 dark:text-blue-400" },
  { to: "/results", label: "Upload Results", desc: "Add and manage marks", icon: <FaClipboardList />, bg: "bg-emerald-100 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400" },
];

export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({ students: [], subjects: [] });

  const teacherName = localStorage.getItem("name") || "Teacher";
  const profilePic = localStorage.getItem("profilePic");

  useEffect(() => {
    (async () => {
      try {
        const [stu, sub] = await Promise.all([API.get("/users/students"), API.get("/subjects/my")]);
        setDashboardData({ students: stu.data, subjects: sub.data });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = () => { localStorage.clear(); window.location.href = "/"; };

  // Combined metrics data array to eliminate multi-block duplicate layouts
  const cardsConfig = [
    { type: "hero", label: "Total Subjects", val: dashboardData.subjects.length, color: "text-blue-600 dark:text-blue-400", icon: <FaBookOpen size={120} /> },
    { type: "hero", label: "Total Students", val: dashboardData.students.length, color: "text-emerald-500 dark:text-emerald-400", icon: <FaUsers size={120} /> },
    { type: "info", title: "Total Subjects", value: dashboardData.subjects.length, icon: <FaBookOpen />, style: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
    { type: "info", title: "Students", value: dashboardData.students.length, icon: <FaUsers />, style: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
    { type: "info", title: "Teacher Role", value: "Faculty", icon: <FaChalkboardTeacher />, style: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all flex flex-col ${sidebarOpen ? "w-72" : "w-20"}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><FaGraduationCap size={24} /></div>
          {sidebarOpen && <h2 className="text-xl font-black text-slate-900 dark:text-white">EduCloud</h2>}
        </div>
        <nav className="flex-1 px-4 mt-4 space-y-2">
          {SIDEBAR_MENU.map((m) => (
            <Link key={m.to} to={m.to} className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 group transition-all">
              <span className="text-xl group-hover:scale-110 transition-transform">{m.icon}</span>
              {sidebarOpen && <span className="font-bold">{m.label}</span>}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="m-4 p-3 flex items-center gap-4 text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all">
          <FaSignOutAlt className="text-xl" />{sidebarOpen && "Sign Out"}
        </button>
      </aside>

      {/* MAIN SECTION */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-8 flex justify-between items-center sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"><FaBars /></button>
          <div className="flex items-center gap-6 pl-4 border-l border-slate-200 dark:border-slate-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{teacherName}</p>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Teacher Panel</p>
            </div>
            {profilePic ? <img src={profilePic} className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover" alt="profile" /> : <FaUserCircle size={32} className="text-slate-300 dark:text-slate-600" />}
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-8 max-w-7xl mx-auto w-full">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">Welcome, <span className="text-blue-600 dark:text-blue-400">{teacherName.split(" ")[0]}</span> 👋</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage attendance, results and students.</p>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center animate-pulse text-slate-400 dark:text-slate-500 text-lg font-semibold">Loading Dashboard...</div>
          ) : (
            <>
              {/* TOP HERO STATS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {cardsConfig.filter(c => c.type === "hero").map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800/50 relative overflow-hidden">
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase">{stat.label}</p>
                    <h2 className={`text-5xl font-black ${stat.color} mt-2`}>{stat.val}</h2>
                    <div className="absolute -bottom-4 -right-4 text-slate-100 dark:text-slate-700/20 rotate-12">{stat.icon}</div>
                  </motion.div>
                ))}
              </div>

              {/* INFO CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {cardsConfig.filter(c => c.type === "info").map((card, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${card.style}`}>{card.icon}</div>
                      <div>
                        <p className="text-sm text-slate-400 dark:text-slate-500 font-bold uppercase">{card.title}</p>
                        <h3 className="font-black text-lg text-slate-900 dark:text-white">{card.value}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SUBJECTS */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm mb-10 border border-slate-100 dark:border-slate-800">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">My Subjects</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dashboardData.subjects.length > 0 ? dashboardData.subjects.map((sub) => (
                    <div key={sub._id} className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-blue-500 dark:hover:border-blue-400 transition-all">
                      <h3 className="font-black text-blue-600 dark:text-blue-400 text-lg">{sub.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Code: {sub.code}</p>
                    </div>
                  )) : <div className="text-slate-500 dark:text-slate-400">No subjects assigned</div>}
                </div>
              </div>

              {/* STUDENTS TABLE */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm mb-10 border border-slate-100 dark:border-slate-800 overflow-x-auto">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Students List</h2>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-sm uppercase text-slate-400 dark:text-slate-500">
                      <th className="py-4">First Name</th><th className="py-4">Last Name</th><th className="py-4">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.students.map((stu) => (
                      <tr key={stu._id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-700 dark:text-slate-300 transition-colors">
                        <td className="py-4">{stu.firstName}</td><td className="py-4">{stu.lastName}</td><td className="py-4">{stu.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* QUICK ACTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {QUICK_ACTIONS.map((item) => (
                  <Link key={item.to} to={item.to} className="group">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all flex items-center gap-6 shadow-sm">
                      <div className={`w-14 h-14 ${item.bg} ${item.text} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>{item.icon}</div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">{item.label}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}