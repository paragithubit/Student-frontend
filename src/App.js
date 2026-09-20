import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { loadTheme } from "./utils/theme";

// AUTH COMPONENTS
import Login from "./pages/Login/Login";
import ResetPassword from "./pages/Login/ResetPassword";

// ADMIN PAGES
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Attdences from "./pages/Admin/Attdences";
import Results from "./pages/Admin/Results";
import Subjects from "./pages/Admin/Subjects";
import Departments from "./pages/Admin/Departments";
import Semesters from "./pages/Admin/Semesters";
import Divisions from "./pages/Admin/Divisions";
import Timetable from "./pages/Admin/Timetable";
import Notices from "./pages/Admin/Notices";
import Leaves from "./pages/Admin/Leaves";

// TEACHER PAGES
import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import Attendance from "./pages/Teacher/Attendance";
import Result from "./pages/Teacher/Result";
import TeacherTimetable from "./pages/Teacher/TeacherTimetable";
import TeacherLeaves from "./pages/Teacher/TeacherLeaves";
import TeacherNotices from "./pages/Teacher/TeacherNotices";

// STUDENT PAGES
import StudentDashboard from "./pages/Student/StudentDashboard";
import MyAttendance from "./pages/Student/MyAttendance";
import MyResults from "./pages/Student/MyResults";
import StudentTimetable from "./pages/Student/StudentTimetable";
import StudentLeaves from "./pages/Student/StudentLeaves";
import StudentNotices from "./pages/Student/StudentNotices";

// LAYOUT STRUCTURE
import Layout from "./components/Layout";

// ==========================================
// CENTRALIZED ROUTE ARCHITECTURE MATRIX
// ==========================================
const ROUTES_CONFIG = [
  // ADMIN DEPLOYMENT MAPPINGS
  { path: "/admin", role: "admin", element: <AdminDashboard /> },
  { path: "/admin/attendance", role: "admin", element: <Attdences /> },
  { path: "/admin/results", role: "admin", element: <Results /> },
  { path: "/admin/subjects", role: "admin", element: <Subjects /> },
  { path: "/admin/departments", role: "admin", element: <Departments /> },
  { path: "/admin/semesters", role: "admin", element: <Semesters /> },
  { path: "/admin/divisions", role: "admin", element: <Divisions /> },
  { path: "/admin/timetable", role: "admin", element: <Timetable /> },
  { path: "/admin/notices", role: "admin", element: <Notices /> },
  { path: "/admin/leaves", role: "admin", element: <Leaves /> },

  // TEACHER DEPLOYMENT MAPPINGS
  { path: "/teacher", role: "teacher", element: <TeacherDashboard /> },
  { path: "/attendance", role: "teacher", element: <Attendance /> },
  { path: "/results", role: "teacher", element: <Result /> },
  { path: "/teacher/timetable", role: "teacher", element: <TeacherTimetable /> },
  { path: "/teacher/leaves", role: "teacher", element: <TeacherLeaves /> },
  { path: "/teacher/notices", role: "teacher", element: <TeacherNotices /> },

  // STUDENT DEPLOYMENT MAPPINGS
  { path: "/student", role: "student", element: <StudentDashboard /> },
  { path: "/my-attendance", role: "student", element: <MyAttendance /> },
  { path: "/my-results", role: "student", element: <MyResults /> },
  { path: "/student/timetable", role: "student", element: <StudentTimetable /> },
  { path: "/student/leaves", role: "student", element: <StudentLeaves /> },
  { path: "/student/notices", role: "student", element: <StudentNotices /> }
];

// ==========================================
// ROLE BASED GUARD & LAYOUT ROUTE WRAPPER
// ==========================================
const ProtectedElement = ({ isAuth, currentRole, targetRole, children }) => {
  if (isAuth && currentRole === targetRole) {
    return <Layout>{children}</Layout>;
  }
  return <Navigate to="/" replace />;
};

// ==========================================
// CORE APP ROUTER CONFIGURATION
// ==========================================
function App() {
  const token =sessionStorage.getItem("token") ||  localStorage.getItem("token");
  const role =sessionStorage.getItem("role")|| localStorage.getItem("role");
  const isAuth = !!(token && role);

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ENGINE CODES */}
        <Route
          path="/"
          element={!isAuth ? <Login /> : <Navigate to={`/${role}`} replace />}
        />
        <Route 
          path="/reset-password/:token" 
          element={<ResetPassword />} 
        />

        {/* ITERATIVE COMPILATION OF AUTH CORE SCHEMAS */}
        {ROUTES_CONFIG.map(({ path, role: targetRole, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedElement isAuth={isAuth} currentRole={role} targetRole={targetRole}>
                {element}
              </ProtectedElement>
            }
          />
        ))}

        {/* CATCH ALL WILDCARD REDIRECT FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// ```</Layout></Routes>