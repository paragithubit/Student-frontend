import { Link } from "react-router-dom";
import { FaUserCircle,FaBars,FaGraduationCap, FaCalendarCheck, FaChartLine, FaSignOutAlt, FaBookOpen, FaUniversity, FaLayerGroup,} from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import API from "../../services/api";

const SIDEBAR_MENU = [
  { to: "/student", label: "Dashboard", icon: <FaChartLine /> },
  { to: "/my-attendance", label: "Attendance", icon: <FaCalendarCheck /> },
  { to: "/my-results", label: "Results", icon: <FaGraduationCap /> },
];

const QUICK_ACTIONS = [
  { to: "/my-attendance", label: "Attendance Analytics", desc: "Presence per subject", icon: <FaCalendarCheck />, bg: "bg-blue-100", text: "text-blue-600" },
  { to: "/my-results", label: "Performance Insights", desc: "GPA and marks trends", icon: <FaChartLine />, bg: "bg-emerald-100", text: "text-emerald-600" },
];

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    attendance: 0,
    grade: "-",
    department: "",
    semester: "",
    division: "",
    rollNumber: "",
  });

  const studentName = localStorage.getItem("name") || "Student";
  const profilePic = localStorage.getItem("profilePic");

  useEffect(() => {
    (async () => {
      try {
        const [att, res, profile] = await Promise.all([
          API.get("/attendance/my"),
          API.get("/results/my"),
          API.get("/auth/me"),
        ]);

        const percent = att.data.length
          ? Math.round((att.data.filter((a) => a.status === "Present").length / att.data.length) * 100)
          : 0;

        const latestGrade = res.data.length ? res.data[res.data.length - 1].grade : "-";
        const divInfo = profile.data.division || {};

        setDashboardData({
          attendance: percent,
          grade: latestGrade,
          department: divInfo.department?.name || "N/A",
          semester: divInfo.semester?.semesterNumber || "N/A",
          division: divInfo.name || "N/A",
          rollNumber: profile.data.rollNumber || "N/A",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const infoCards = [
    { title: "Department", value: dashboardData.department, icon: <FaUniversity />, style: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
    { title: "Semester", value: `Semester ${dashboardData.semester}`, icon: <FaBookOpen />, style: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
    { title: "Division", value: dashboardData.division, icon: <FaLayerGroup />, style: "bg-purple-100 dark:bg-purple-900/30 text-purple-600" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className={`bg-white dark:bg-slate-900 border-r dark:border-slate-800 transition-all flex flex-col ${sidebarOpen ? "w-72" : "w-20"}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <FaGraduationCap size={24} />
          </div>
          {sidebarOpen && <h2 className="text-xl font-black dark:text-white">EduCloud</h2>}
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-2">
          {SIDEBAR_MENU.map((m) => (
            <Link key={m.to} to={m.to} className="flex items-center gap-4 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 group transition-all">
              <span className="text-xl group-hover:scale-110 transition-transform">{m.icon}</span>
              {sidebarOpen && <span className="font-bold">{m.label}</span>}
            </Link>
          ))}
        </nav>

        <button onClick={logout} className="m-4 p-3 flex items-center gap-4 text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all">
          <FaSignOutAlt className="text-xl" />
          {sidebarOpen && "Sign Out"}
        </button>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col">
        
        {/* TOP BAR BAR */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 px-8 flex justify-between items-center sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
            <FaBars />
          </button>

          <div className="flex items-center gap-6 pl-4 border-l dark:border-slate-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold dark:text-white">{studentName}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase">Roll No: {dashboardData.rollNumber}</p>
            </div>
            {profilePic ? (
              <img src={profilePic} className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover" alt="profile" />
            ) : (
              <FaUserCircle size={32} className="text-slate-300" />
            )}
          </div>
        </header>

        {/* CONTROLLER SPACE */}
        <main className="p-8 max-w-7xl mx-auto w-full flex-1">
          <div className="mb-10">
            <h2 className="text-3xl font-black dark:text-white">
              Hello, <span className="text-blue-600">{studentName.split(" ")[0]}!</span> 👋
            </h2>
            <p className="text-slate-500 font-medium mt-1">Here is your academic overview.</p>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center animate-pulse text-slate-400 text-lg font-semibold">
              Loading Dashboard...
            </div>
          ) : (
            <>
              {/* PRIMARY KPI STATS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                
                {/* ATTENDANCE CARD */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                  <p className="text-sm font-bold text-slate-400 uppercase">Attendance Rate</p>
                  <h2 className="text-5xl font-black text-emerald-500 mt-2">{dashboardData.attendance}%</h2>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mt-6">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${dashboardData.attendance}%` }} className="bg-emerald-500 h-full rounded-full" />
                  </div>
                  <FaCalendarCheck size={120} className="absolute -bottom-4 -right-4 text-slate-50 dark:text-slate-700/30 rotate-12" />
                </motion.div>

                {/* GRADE MATRIX CARD */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm relative overflow-hidden">
                  <p className="text-sm font-bold text-slate-400 uppercase">Current Grade</p>
                  <h2 className="text-5xl font-black text-blue-600 mt-2">{dashboardData.grade}</h2>
                  <p className="mt-6 text-sm font-medium text-slate-500 bg-slate-50 dark:bg-slate-700/50 w-fit px-4 py-2 rounded-full">Latest Assessment</p>
                  <FaGraduationCap size={120} className="absolute -bottom-4 -right-4 text-slate-50 dark:text-slate-700/30 rotate-12" />
                </motion.div>
              </div>

              {/* PROPERTY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {infoCards.map((card, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl ${card.style}`}>{card.icon}</div>
                      <div>
                        <p className="text-sm text-slate-400 font-bold uppercase">{card.title}</p>
                        <h3 className="font-black text-lg dark:text-white">{card.value}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SHORTCUT BANNER MATRIX */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {QUICK_ACTIONS.map((item) => (
                  <Link key={item.to} to={item.to} className="group">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-800 hover:border-blue-500 transition-all flex items-center gap-6 shadow-sm">
                      <div className={`w-14 h-14 ${item.bg} ${item.text} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-black dark:text-white">{item.label}</h3>
                        <p className="text-sm text-slate-500">{item.desc}</p>
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