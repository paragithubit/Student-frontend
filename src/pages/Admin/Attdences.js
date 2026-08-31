import { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "All", search: "", teacher: "All", subject: "All", from: "", to: "" });

  const fetchAttendance = async () => {
    try {
      const { data } = await API.get("/attendance");
      setAttendance(data.filter(a => a.student));
    } catch (err) {
      toast.error("Error fetching attendance ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const handleFilter = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Optimizing derived data
  const { filteredData, teachers, subjects, stats } = useMemo(() => {
    const teachs = ["All", ...new Set(attendance.map(a => a.teacher?.firstName).filter(Boolean))];
    const subjs = ["All", ...new Set(attendance.map(a => a.subject?.name).filter(Boolean))];

    const filtered = attendance.filter(a => {
      const d = new Date(a.date);
      const matchesSearch = `${a.student?.firstName} ${a.student?.lastName} ${a.teacher?.firstName}`.toLowerCase().includes(filters.search.toLowerCase());
      return (filters.status === "All" || a.status === filters.status) &&
             (filters.teacher === "All" || a.teacher?.firstName === filters.teacher) &&
             (filters.subject === "All" || a.subject?.name === filters.subject) &&
             (!filters.from || d >= new Date(filters.from)) &&
             (!filters.to || d <= new Date(filters.to)) && matchesSearch;
    });

    const present = filtered.filter(a => a.status === "Present").length;
    return { 
      filteredData: filtered, 
      teachers: teachs, 
      subjects: subjs, 
      stats: { total: filtered.length, present, percent: filtered.length ? ((present / filtered.length) * 100).toFixed(1) : 0 }
    };
  }, [attendance, filters]);

  const exportCSV = () => {
    const headers = "Student,Teacher,Subject,Date,Status\n";
    const rows = filteredData.map(a => [
      `${a.student?.firstName} ${a.student?.lastName}`,
      a.teacher ? `${a.teacher.firstName} ${a.teacher.lastName}` : "N/A",
      a.subject?.name || "N/A",
      new Date(a.date).toLocaleDateString(),
      a.status
    ].join(",")).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    Object.assign(a, { href: url, download: "attendance.csv" }).click();
    toast.success("CSV exported 📁");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white p-6">
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📊 Attendance Management</h2>
        <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Export CSV</button>
      </div>

      {/* FILTERS */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 flex flex-wrap gap-3">
        <input name="search" type="text" placeholder="Search..." className="border p-2 rounded dark:bg-gray-700" onChange={handleFilter} />
        <select name="teacher" onChange={handleFilter} className="border p-2 rounded dark:bg-gray-700">{teachers.map(t => <option key={t}>{t}</option>)}</select>
        <select name="subject" onChange={handleFilter} className="border p-2 rounded dark:bg-gray-700">{subjects.map(s => <option key={s}>{s}</option>)}</select>
        <input name="from" type="date" onChange={handleFilter} className="border p-2 rounded dark:bg-gray-700" />
        <input name="to" type="date" onChange={handleFilter} className="border p-2 rounded dark:bg-gray-700" />
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {[["Total", stats.total, "blue"], ["Present", stats.present, "green"], ["Attendance %", `${stats.percent}%`, "purple"]].map(([label, val, color]) => (
          <div key={label} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow">
            <p className="text-sm opacity-70">{label}</p>
            <h2 className={`text-xl font-bold text-${color}-600`}>{val}</h2>
          </div>
        ))}
      </div>

      <div className="mb-4 flex gap-3">
        {["All", "Present", "Absent"].map(f => (
          <button key={f} onClick={() => setFilters(p => ({ ...p, status: f }))} className={`px-4 py-2 rounded-lg ${filters.status === f ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 shadow"}`}>{f}</button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {loading ? <div className="p-6 text-center">Loading...</div> : (
          <div className="max-h-[450px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 uppercase text-xs">
                <tr>{["#", "Student", "Teacher", "Subject", "Date", "Status"].map(h => <th key={h} className="p-4">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredData.map((a, i) => (
                  <tr key={a._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="p-4">{i + 1}</td>
                    <td className="p-4 font-medium">{a.student?.firstName} {a.student?.lastName}</td>
                    <td className="p-4">{a.teacher?.firstName || "N/A"}</td>
                    <td className="p-4">{a.subject?.name || "N/A"}</td>
                    <td className="p-4 text-xs">{new Date(a.date).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${a.status === "Present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && <div className="p-6 text-center text-gray-500">No data found</div>}
          </div>
        )}
      </div>
    </div>
  );
}