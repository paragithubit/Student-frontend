import { Link } from "react-router-dom";
import {
  FaCalendarCheck,
  FaBookOpen,
  FaUsers,
  FaClipboardList,
  FaChalkboardTeacher,
  FaCamera,
  FaTrashAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import toast, { Toaster } from "react-hot-toast";

const QUICK_ACTIONS = [
  {
    to: "/attendance",
    label: "Mark Attendance",
    desc: "Manage daily student attendance",
    icon: <FaCalendarCheck />,
    bg: "bg-blue-100 dark:bg-blue-950/40",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    to: "/results",
    label: "Upload Results",
    desc: "Add, evaluate, and manage marks",
    icon: <FaClipboardList />,
    bg: "bg-emerald-100 dark:bg-emerald-950/40",
    text: "text-emerald-600 dark:text-emerald-400",
  },
];

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({ students: [], subjects: [] });

  // Retrieve user with sessionStorage priority for multi-tab isolation
  const getInitialUser = () => {
    try {
      const raw = sessionStorage.getItem("user") || localStorage.getItem("user");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const [currentUser, setCurrentUser] = useState(getInitialUser);
  const [profilePic, setProfilePic] = useState("");
  const fileInputRef = useRef(null);

  // Compute teacher display names
  const teacherName = (() => {
    const sessionName = sessionStorage.getItem("name") || localStorage.getItem("name");
    if (sessionName && sessionName !== "Teacher") return sessionName;

    const combined = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ");
    if (combined) return combined;

    return currentUser?.name || "Teacher";
  })();

  const teacherFirstName = currentUser?.firstName || teacherName.split(" ")[0] || "Teacher";

  // Compute initials (e.g., Pavan Laskari -> PL)
  const initials = (() => {
    const fn = currentUser?.firstName ? currentUser.firstName.trim()[0] : "";
    const ln = currentUser?.lastName ? currentUser.lastName.trim()[0] : "";
    if (fn || ln) return `${fn}${ln}`.toUpperCase();
    
    // Fallback to splitting display name
    const parts = teacherName.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || "T").toUpperCase();
  })();

  // 🔹 Load isolated profile picture strictly for this specific user ID
  useEffect(() => {
    if (!currentUser?._id) return;

    const userSpecificKey = `profilePic_${currentUser._id}`;
    const userStoredPic =
      sessionStorage.getItem(userSpecificKey) ||
      localStorage.getItem(userSpecificKey) ||
      currentUser?.profilePic ||
      currentUser?.avatar ||
      currentUser?.photo;

    if (userStoredPic) {
      setProfilePic(userStoredPic);
    } else {
      setProfilePic("");
    }
  }, [currentUser?._id]);

  // 🔹 Handle local device image selection isolated to THIS user
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setProfilePic(base64String);

      // Save strictly with user-specific keys (Never generic "profilePic")
      const userKey = currentUser?._id ? `profilePic_${currentUser._id}` : "profilePic";
      sessionStorage.setItem(userKey, base64String);
      localStorage.setItem(userKey, base64String);

      // Clean up legacy global key if it exists
      sessionStorage.removeItem("profilePic");
      localStorage.removeItem("profilePic");

      try {
        const updated = { ...currentUser, profilePic: base64String };
        setCurrentUser(updated);
        sessionStorage.setItem("user", JSON.stringify(updated));
        localStorage.setItem("user", JSON.stringify(updated));

        // Sync with backend API
        await API.put("/users/profile", { profilePic: base64String }).catch(() => null);
      } catch (err) {
        console.error("Failed to update user object in storage", err);
      }

      toast.success("Profile picture updated successfully! 📸");
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Remove Profile Picture & Revert to Initials Badge
  const handleRemoveProfilePic = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Remove profile picture and use initials?")) return;

    const userKey = currentUser?._id ? `profilePic_${currentUser._id}` : "profilePic";
    setProfilePic("");
    sessionStorage.removeItem(userKey);
    localStorage.removeItem(userKey);
    sessionStorage.removeItem("profilePic");
    localStorage.removeItem("profilePic");

    try {
      const updated = { ...currentUser, profilePic: "" };
      setCurrentUser(updated);
      sessionStorage.setItem("user", JSON.stringify(updated));
      localStorage.setItem("user", JSON.stringify(updated));

      // Clear in backend database
      await API.put("/users/profile", { profilePic: "" }).catch(() => null);
      toast.success("Profile picture removed! 🏷️");
    } catch (err) {
      console.error("Failed to remove profile pic", err);
      toast.error("Failed to sync change with server");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [stu, sub, profile] = await Promise.all([
          API.get("/users/students"),
          API.get("/subjects/my"),
          API.get("/auth/me").catch(() => null),
        ]);

        if (profile?.data) {
          const userProfile = profile.data.user || profile.data;
          if (userProfile.firstName || userProfile.name) {
            const freshName =
              userProfile.name ||
              `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim();
            setCurrentUser(userProfile);
            sessionStorage.setItem("user", JSON.stringify(userProfile));
            sessionStorage.setItem("name", freshName);
          }

          // Use user-isolated key for fetched profile picture
          if (userProfile._id && userProfile.profilePic) {
            const userKey = `profilePic_${userProfile._id}`;
            setProfilePic(userProfile.profilePic);
            sessionStorage.setItem(userKey, userProfile.profilePic);
            localStorage.setItem(userKey, userProfile.profilePic);
          }
        }

        setDashboardData({
          students: Array.isArray(stu.data) ? stu.data : [],
          subjects: Array.isArray(sub.data) ? sub.data : [],
        });
      } catch (err) {
        console.error("Failed to load teacher dashboard data", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const infoCards = [
    {
      title: "Total Subjects",
      value: dashboardData.subjects.length,
      icon: <FaBookOpen />,
      style: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Students",
      value: dashboardData.students.length,
      icon: <FaUsers />,
      style: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Faculty Status",
      value: "Active",
      icon: <FaChalkboardTeacher />,
      style: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
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

      {/* Teacher Profile & Welcome Header */}
      <header className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            Welcome, <span className="text-blue-600 dark:text-blue-400">{teacherFirstName}</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Manage attendance, results, and assigned courses.
          </p>
        </div>

        <div className="flex items-center gap-3.5 sm:pl-4 sm:border-l sm:border-slate-200 dark:sm:border-slate-800">
          <div className="text-left sm:text-right">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{teacherName}</p>
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              Teacher Panel
            </p>
          </div>

          {/* Hidden File Input for Device Image Selection */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />

          <div className="flex items-center gap-2">
            {/* Clickable Profile Picture / Initials Badge */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer h-11 w-11 rounded-2xl overflow-hidden shadow-md border-2 border-indigo-400/30 bg-[#4F46E5] flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95"
              title="Click to change profile picture from your device"
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  className="w-full h-full object-cover"
                  alt="profile"
                />
              ) : (
                /* Native Blue Initials Badge (Exact match to screenshot) */
                <span className="text-white font-extrabold text-base tracking-wider select-none">
                  {initials}
                </span>
              )}

              {/* Hover Camera Icon Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCamera size={14} className="text-white" />
              </div>
            </div>

            {/* Quick Remove Button (Shown only when photo is active) */}
            {profilePic && (
              <button
                type="button"
                onClick={handleRemoveProfilePic}
                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs"
                title="Remove photo and use initials badge"
              >
                <FaTrashAlt size={12} />
              </button>
            )}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center animate-pulse text-slate-400 text-base font-semibold">
          Loading Teacher Dashboard...
        </div>
      ) : (
        <>
          {/* Primary Metric KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden"
            >
              <p className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Assigned Subjects
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400 mt-2">
                {dashboardData.subjects.length}
              </h2>
              <FaBookOpen
                size={110}
                className="absolute -bottom-4 -right-4 text-slate-100 dark:text-slate-800/40 rotate-12 pointer-events-none"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden"
            >
              <p className="text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Students
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-emerald-500 dark:text-emerald-400 mt-2">
                {dashboardData.students.length}
              </h2>
              <FaUsers
                size={110}
                className="absolute -bottom-4 -right-4 text-slate-100 dark:text-slate-800/40 rotate-12 pointer-events-none"
              />
            </motion.div>
          </div>

          {/* Secondary Info Stat Cards */}
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
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
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

          {/* Assigned Subjects Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-5">
              My Assigned Subjects
            </h2>
            {dashboardData.subjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardData.subjects.map((sub) => (
                  <div
                    key={sub._id}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/30 transition-all"
                  >
                    <h3 className="font-black text-blue-600 dark:text-blue-400 text-base sm:text-lg truncate">
                      {sub.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Code: <span className="font-semibold text-slate-700 dark:text-slate-300">{sub.code}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No subjects currently assigned.</p>
            )}
          </div>

          {/* Students Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Enrolled Students
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">First Name</th>
                    <th className="py-3.5 px-4 sm:px-6">Last Name</th>
                    <th className="py-3.5 px-4 sm:px-6">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {dashboardData.students.map((stu) => (
                    <tr
                      key={stu._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-medium">{stu.firstName}</td>
                      <td className="py-3.5 px-4 sm:px-6 font-medium">{stu.lastName}</td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-500 dark:text-slate-400">
                        {stu.email}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Action Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {QUICK_ACTIONS.map((item) => (
              <Link key={item.to} to={item.to} className="group block">
                <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all flex items-center gap-4 sm:gap-5 shadow-xs group-hover:shadow-md">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 ${item.bg} ${item.text} rounded-2xl flex items-center justify-center text-xl sm:text-2xl group-hover:scale-105 transition-transform shrink-0`}
                  >
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