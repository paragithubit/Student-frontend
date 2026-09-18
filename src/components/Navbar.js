import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  MdOutlineLightMode, 
  MdOutlineDarkMode, 
  MdLogout, 
  MdMenu, 
  MdClose 
} from "react-icons/md";

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
    { name: "Leaves", path: "/student/leaves" },
    { name: "Notices", path: "/student/notices" },
  ],
};

function Navbar() {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const currentNavLinks = NAV_CONFIG[role] || [];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#1E293B]/95 backdrop-blur-md border-b border-slate-700/50 text-white px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center shadow-lg">
        {/* Brand */}
        <div className="flex gap-6 lg:gap-10 items-center">
          <Link to={`/${role || ""}`} className="flex items-center gap-2.5 group">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-500/20 shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-5 h-5 border-2 border-white rounded-sm" />
            </div>
            <h2 className="font-black text-xl tracking-tighter uppercase">EduCloud</h2>
          </Link>

          {/* Desktop Navigation Links (Increased text size to text-base and bold for high visibility) */}
          <div className="hidden xl:flex gap-2.5 items-center">
            {currentNavLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2.5 rounded-xl text-base font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-200 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Tools & Mobile Menu Button */}
        <div className="flex gap-2.5 sm:gap-3.5 items-center">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:text-indigo-400 transition-all text-slate-300"
            aria-label="Toggle theme"
          >
            {darkMode ? <MdOutlineLightMode size={22} /> : <MdOutlineDarkMode size={22} />}
          </button>

          <div className="h-6 w-[1px] bg-slate-700 mx-1 hidden sm:block" />

          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-red-500/10 border border-red-500/20"
          >
            <MdLogout size={18} />
            <span>Logout</span>
          </button>

          {/* Mobile Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:border-indigo-500 transition-colors"
            aria-label="Open Navigation Menu"
          >
            {mobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 xl:hidden transition-opacity"
        />
      )}

      {/* Slide-Out Mobile Navigation Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-[#1E293B] text-white z-50 p-6 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out xl:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <div className="w-4 h-4 border-2 border-white rounded-xs" />
            </div>
            <span className="font-extrabold text-lg tracking-wide uppercase">Menu</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Scrollable Mobile Links (Larger text for mobile as well) */}
        <div className="flex-1 py-5 space-y-2 overflow-y-auto">
          {currentNavLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4.5 py-3.5 rounded-2xl text-base font-bold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-200 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{link.name}</span>
                {isActive && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </div>

        {/* Mobile Logout Button */}
        <div className="pt-4 border-t border-slate-700">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-base font-bold transition shadow-lg shadow-red-600/20"
          >
            <MdLogout size={20} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;