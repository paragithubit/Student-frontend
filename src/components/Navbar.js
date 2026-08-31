import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { MdOutlineLightMode, MdOutlineDarkMode, MdLogout, MdMenu } from "react-icons/md";

// Move navigation config outside to keep component body clean
const NAV_CONFIG = {
  admin: [
    { name: "Dashboard", path: "/admin" },

    { name: "Attendance", path: "/admin/attendance" },

    { name: "Results", path: "/admin/results" },

    { name: "Subjects", path: "/admin/subjects" },

    { name: "Departments", path: "/admin/departments" },

    { name: "Semesters", path: "/admin/semesters" },

    { name: "Divisions", path: "/admin/divisions" },

    { name: "Timetable", path: "/admin/timetable" },

    { name: "Notices", path: "/admin/notices" },

    { name: "Leaves", path: "/admin/leaves" },

  ],


  teacher: [
    { name: "Dashboard", path: "/teacher" },

    { name: "Attendance", path: "/attendance" },

    { name: "Results", path: "/results" },

    { name: "Timetable", path: "/teacher/timetable" },

    { name: "Leaves", path: "/teacher/leaves" },

    { name: "Notices", path: "/teacher/notices" },
  ],

  student: [
    { name: "Dashboard", path: "/student" },

    { name: "Attendance", path: "/my-attendance" },

    { name: "Results", path: "/my-results" },

    { name: "Timetable", path: "/student/timetable" },

    // { name: "Fees", path: "/student/fees" },

    { name: "Leaves", path: "/student/leaves" },

    { name: "Notices", path: "/student/notices" },
  ],
};

function Navbar() {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `relative px-3 py-2 text-sm font-semibold transition-all duration-300 ${isActive
        ? "text-indigo-400 after:content-[''] after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-[3px] after:bg-indigo-500 after:rounded-full"
        : "text-slate-300 hover:text-white"
      }`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#1E293B]/95 backdrop-blur-md border-b border-slate-700/50 text-white px-8 py-3 flex justify-between items-center shadow-lg">

      {/* BRAND & DYNAMIC NAVIGATION */}
      <div className="flex gap-10 items-center">
        <Link to={`/${role || ''}`} className="flex items-center gap-2 cursor-pointer group">
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-indigo-500/20 shadow-lg group-hover:scale-110 transition-transform">
            <div className="w-5 h-5 border-2 border-white rounded-sm"></div>
          </div>
          <h2 className="font-black text-lg tracking-tighter uppercase">EduCloud</h2>
        </Link>

        <div className="hidden md:flex gap-4 items-center">
          {NAV_CONFIG[role]?.map((link) => (
            <Link key={link.path} to={link.path} className={getLinkClass(link.path)}>
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* TOOLS & PROFILE */}
      <div className="flex gap-3 items-center">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:text-indigo-400 transition-all text-slate-400"
          aria-label="Toggle theme"
        >
          {darkMode ? <MdOutlineLightMode size={20} /> : <MdOutlineDarkMode size={20} />}
        </button>

        <div className="h-6 w-[1px] bg-slate-700 mx-2 hidden sm:block"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-red-500/10 border border-red-500/20"
        >
          <MdLogout size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>

        <button className="md:hidden p-2 text-slate-400 hover:text-white">
          <MdMenu size={24} />
        </button>
      </div>
    </nav>
  );
}

export default Navbar;