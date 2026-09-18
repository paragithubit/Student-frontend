import { Link } from "react-router-dom";
import { 
  FaUserCircle, 
  FaGraduationCap, 
  FaCalendarCheck, 
  FaChartLine, 
  FaBookOpen, 
  FaUniversity, 
  FaLayerGroup,
  FaCamera 
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const QUICK_ACTIONS = [
  { 
    to: "/my-attendance", 
    label: "Attendance Analytics", 
    desc: "Presence per subject", 
    icon: <FaCalendarCheck />, 
    bg: "bg-blue-100 dark:bg-blue-900/30", 
    text: "text-blue-600 dark:text-blue-400" 
  },
  { 
    to: "/my-results", 
    label: "Performance Insights", 
    desc: "GPA and marks trends", 
    icon: <FaChartLine />, 
    bg: "bg-emerald-100 dark:bg-emerald-900/30", 
    text: "text-emerald-600 dark:text-emerald-400" 
  },
];

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    attendance: 0,
    grade: "-",
    department: "",
    semester: "",
    division: "",
    rollNumber: "",
  });

  const fileInputRef = useRef(null);
  const [profilePic, setProfilePic] = useState("");

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const studentName =
    localStorage.getItem("name") ||
    [storedUser.firstName, storedUser.lastName].filter(Boolean).join(" ") ||
    "Student";

  useEffect(() => {
    const storedPic = localStorage.getItem("profilePic") || storedUser.profilePic || storedUser.avatar || storedUser.photo;
    if (storedPic) {
      setProfilePic(storedPic);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setProfilePic(base64String);
      localStorage.setItem("profilePic", base64String);

      try {
        const userObj = JSON.parse(localStorage.getItem("user") || "{}");
        userObj.profilePic = base64String;
        localStorage.setItem("user", JSON.stringify(userObj));
      } catch (err) {
        console.error("Failed to update user object in storage", err);
      }

      toast.success("Profile photo updated successfully!");
    };
    reader.readAsDataURL(file);
  };

  const finalProfilePic = profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=4F46E5&color=fff`;

  useEffect(() => {
    (async () => {
      try {
        const [att, res, profile] = await Promise.all([
          API.get("/attendance/my"),
          API.get("/results/my"),
          API.get("/auth/me"),
        ]);

        const percent = att.data?.length
          ? Math.round((att.data.filter((a) => a.status === "Present").length / att.data.length) * 100)
          : 0;

        const latestGrade = res.data?.length ? res.data[res.data.length - 1].grade : "-";
        const userProfile = profile.data?.user || profile.data || {};
        const divInfo = userProfile.division || {};

        const roll =
          userProfile.rollNumber ||
          userProfile.rollNo ||
          localStorage.getItem("rollNumber") ||
          storedUser.rollNumber ||
          "N/A";

        setDashboardData({
          attendance: percent,
          grade: latestGrade,
          department: divInfo.department?.name || userProfile.department?.name || "N/A",
          semester: divInfo.semester?.semesterNumber ? `Semester ${divInfo.semester.semesterNumber}` : userProfile.semester?.semesterNumber ? `Semester ${userProfile.semester.semesterNumber}` : "N/A",
          division: divInfo.name || userProfile.division?.name || "N/A",
          rollNumber: roll,
        });

        if (userProfile.profilePic && !localStorage.getItem("profilePic")) {
          setProfilePic(userProfile.profilePic);
          localStorage.setItem("profilePic", userProfile.profilePic);
        }
      } catch (err) {
        console.error("Failed to load student dashboard info", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const infoCards = [
    { 
      title: "Department", 
      value: dashboardData.department, 
      icon: <FaUniversity />, 
      style: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
    },
    { 
      title: "Semester", 
      value: dashboardData.semester, 
      icon: <FaBookOpen />, 
      style: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" 
    },
    { 
      title: "Division", 
      value: dashboardData.division, 
      icon: <FaLayerGroup />, 
      style: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" 
    },
  ];

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: "dark:bg-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 font-medium rounded-xl",
          duration: 4000,
        }}
      />

      {/* Student Welcome & Profile Header */}
      <header className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Hello, <span className="text-blue-600 dark:text-blue-400">{studentName.split(" ")[0]}!</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Here is your academic overview and status.
          </p>
        </div>

        <div className="flex items-center gap-3.5 sm:pl-4 sm:border-l sm:border-slate-200 dark:sm:border-slate-800">
          <div className="text-left sm:text-right">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{studentName}</p>
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              Roll No: {dashboardData.rollNumber}
            </p>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer shrink-0"
            title="Click to choose a photo from your device"
          >
            <img 
              src={finalProfilePic} 
              className="w-11 h-11 rounded-xl border-2 border-blue-500 object-cover shadow-xs group-hover:opacity-85 transition-opacity" 
              alt="profile" 
            />
            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <FaCamera size={14} className="text-white" />
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center animate-pulse text-slate-400 text-base font-semibold">
          Loading Academic Records...
        </div>
      ) : (
        <>
          {/* Primary Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Attendance Rate Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden"
            >
              <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                Attendance Rate
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-emerald-500 mt-2">
                {dashboardData.attendance}%
              </h2>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mt-6 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${dashboardData.attendance}%` }} 
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="bg-emerald-500 h-full rounded-full" 
                />
              </div>
              <FaCalendarCheck 
                size={110} 
                className="absolute -bottom-4 -right-4 text-slate-100 dark:text-slate-800/40 rotate-12 pointer-events-none" 
              />
            </motion.div>

            {/* Current Grade Card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden"
            >
              <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                Current Grade
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400 mt-2">
                {dashboardData.grade}
              </h2>
              <p className="mt-5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 w-fit px-3.5 py-1.5 rounded-full">
                Latest Assessment
              </p>
              <FaGraduationCap 
                size={110} 
                className="absolute -bottom-4 -right-4 text-slate-100 dark:text-slate-800/40 rotate-12 pointer-events-none" 
              />
            </motion.div>
          </div>

          {/* Academic Profile Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {infoCards.map((card, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-3.5 rounded-2xl text-xl ${card.style} shrink-0`}>
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      {card.title}
                    </p>
                    <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white truncate">
                      {card.value}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Action Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {QUICK_ACTIONS.map((item) => (
              <Link key={item.to} to={item.to} className="group block">
                <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex items-center gap-4 sm:gap-5 shadow-xs group-hover:shadow-md">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${item.bg} ${item.text} rounded-2xl flex items-center justify-center text-xl sm:text-2xl group-hover:scale-105 transition-transform shrink-0`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}