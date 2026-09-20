import { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrashAlt, FaTimes, FaSave } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [dbTeachers, setDbTeachers] = useState([]);
  const [dbSubjects, setDbSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Single date picker state
  const [filters, setFilters] = useState({
    status: "All",
    search: "",
    teacher: "All",
    subject: "All",
    date: "",
  });

  // Modal edit state
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "Present",
    date: "",
  });

  // Fetch attendance records, all teachers, and all subjects directly from DB
  const fetchData = async () => {
    try {
      setLoading(true);
      const [attRes, usersRes, subRes] = await Promise.all([
        API.get("/attendance"),
        API.get("/users"),
        API.get("/subjects"),
      ]);

      setAttendance(
        Array.isArray(attRes.data) ? attRes.data.filter((a) => a.student) : []
      );

      // Filter all users with role 'teacher' from database
      const allTeachers = Array.isArray(usersRes.data)
        ? usersRes.data.filter((u) => u.role?.toLowerCase() === "teacher")
        : [];
      setDbTeachers(allTeachers);

      // Store all subjects from database
      setDbSubjects(Array.isArray(subRes.data) ? subRes.data : []);
    } catch (err) {
      toast.error("Error fetching data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Filter attendance based on search, teacher, subject, single date, and status
  const { filteredData, stats } = useMemo(() => {
    const filtered = attendance.filter((a) => {
      // Normalize record date to YYYY-MM-DD
      const recordDate = a.date ? new Date(a.date).toISOString().split("T")[0] : "";

      const studentFullName = `${a.student?.firstName || ""} ${a.student?.lastName || ""}`.trim();
      const teacherFullName = a.teacher
        ? `${a.teacher.firstName || ""} ${a.teacher.lastName || ""}`.trim()
        : "N/A";
      const subjectTitle = a.subject?.name || "N/A";

      const matchesSearch = `${studentFullName} ${teacherFullName}`
        .toLowerCase()
        .includes(filters.search.toLowerCase());

      const matchesTeacher =
        filters.teacher === "All" ||
        teacherFullName.toLowerCase() === filters.teacher.toLowerCase() ||
        a.teacher?._id === filters.teacher ||
        a.teacher?.firstName === filters.teacher;

      const matchesSubject =
        filters.subject === "All" ||
        subjectTitle.toLowerCase() === filters.subject.toLowerCase() ||
        a.subject?._id === filters.subject;

      // Single exact date filter comparison
      const matchesDate = !filters.date || recordDate === filters.date;

      const matchesStatus = filters.status === "All" || a.status === filters.status;

      return matchesSearch && matchesTeacher && matchesSubject && matchesDate && matchesStatus;
    });

    const present = filtered.filter((a) => a.status === "Present").length;
    return {
      filteredData: filtered,
      stats: {
        total: filtered.length,
        present,
        percent: filtered.length
          ? ((present / filtered.length) * 100).toFixed(1)
          : 0,
      },
    };
  }, [attendance, filters]);

  // Handle Delete with Confirmation Dialog
  const handleDelete = async (id, studentName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the attendance record for ${studentName || "this student"}?`
    );

    if (confirmDelete) {
      try {
        await API.delete(`/attendance/${id}`);
        toast.success("Attendance record deleted successfully");
        setAttendance((prev) => prev.filter((item) => item._id !== id));
      } catch (err) {
        toast.error(err.response?.data?.msg || err.response?.data?.message || "Failed to delete record");
      }
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    const d = new Date(record.date);
    const formattedDate = !isNaN(d.getTime())
      ? d.toISOString().split("T")[0]
      : "";

    setEditForm({
      status: record.status || "Present",
      date: formattedDate,
    });
  };

  // Save Edit Updates
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      await API.put(`/attendance/${editingRecord._id}`, {
        status: editForm.status,
        date: editForm.date,
      });

      toast.success("Attendance updated successfully!");

      setAttendance((prev) =>
        prev.map((item) =>
          item._id === editingRecord._id
            ? {
                ...item,
                status: editForm.status,
                date: editForm.date,
              }
            : item
        )
      );

      setEditingRecord(null);
    } catch (err) {
      toast.error(err.response?.data?.msg || err.response?.data?.message || "Failed to update attendance");
    }
  };

  const exportCSV = () => {
    const headers = "Student,Teacher,Subject,Date,Status\n";
    const rows = filteredData
      .map((a) =>
        [
          `${a.student?.firstName || ""} ${a.student?.lastName || ""}`.trim(),
          a.teacher ? `${a.teacher.firstName || ""} ${a.teacher.lastName || ""}`.trim() : "N/A",
          a.subject?.name || "N/A",
          new Date(a.date).toLocaleDateString(),
          a.status,
        ].join(",")
      )
      .join("\n");

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
        <button
          onClick={exportCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          Export CSV
        </button>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow mb-6 flex flex-wrap items-center gap-3">
        {/* Search input */}
        <input
          name="search"
          type="text"
          value={filters.search}
          placeholder="Search student or teacher..."
          className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleFilter}
        />

        {/* All Teachers dropdown populated from DB */}
        <select
          name="teacher"
          value={filters.teacher}
          onChange={handleFilter}
          className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Teachers</option>
          {dbTeachers.map((t) => {
            const fullName = `${t.firstName || ""} ${t.lastName || ""}`.trim();
            return (
              <option key={t._id} value={fullName}>
                {fullName}
              </option>
            );
          })}
        </select>

        {/* All Subjects dropdown populated from DB */}
        <select
          name="subject"
          value={filters.subject}
          onChange={handleFilter}
          className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Subjects</option>
          {dbSubjects.map((s) => (
            <option key={s._id} value={s.name}>
              {s.name} {s.code ? `(${s.code})` : ""}
            </option>
          ))}
        </select>

        {/* Single Date Picker */}
        <input
          name="date"
          type="date"
          value={filters.date}
          onChange={handleFilter}
          className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:[color-scheme:dark]"
        />

        {/* Quick Reset for Date Filter */}
        {filters.date && (
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, date: "" }))}
            className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 dark:bg-red-900/20 transition"
          >
            Clear Date
          </button>
        )}
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {[
          ["Total", stats.total, "text-blue-600"],
          ["Present", stats.present, "text-green-600"],
          ["Attendance %", `${stats.percent}%`, "text-purple-600"],
        ].map(([label, val, colorClass]) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm opacity-70">{label}</p>
            <h2 className={`text-2xl font-black ${colorClass} mt-1`}>{val}</h2>
          </div>
        ))}
      </div>

      {/* STATUS TABS */}
      <div className="mb-4 flex gap-3">
        {["All", "Present", "Absent", "Late"].map((f) => (
          <button
            key={f}
            onClick={() => setFilters((p) => ({ ...p, status: f }))}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              filters.status === f
                ? "bg-blue-600 text-white shadow"
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-bold">
            Loading Attendance Records...
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-700/70 sticky top-0 uppercase text-[11px] font-black tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4">#</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Teacher</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                {filteredData.map((a, i) => {
                  const studentName = `${a.student?.firstName || ""} ${a.student?.lastName || ""}`.trim();
                  return (
                    <tr
                      key={a._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition"
                    >
                      <td className="p-4 text-gray-400 font-semibold">{i + 1}</td>
                      <td className="p-4 font-bold text-gray-900 dark:text-gray-100">
                        {studentName || "N/A"}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {a.teacher?.firstName
                          ? `${a.teacher.firstName} ${a.teacher?.lastName || ""}`.trim()
                          : "N/A"}
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">
                        {a.subject?.name || "N/A"}
                      </td>
                      <td className="p-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                        {new Date(a.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            a.status === "Present"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : a.status === "Late"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(a)}
                            className="h-8 w-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition shadow-xs"
                            title="Edit Attendance"
                          >
                            <FaEdit size={13} />
                          </button>

                          <button
                            onClick={() => handleDelete(a._id, studentName)}
                            className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center transition shadow-xs"
                            title="Delete Record"
                          >
                            <FaTrashAlt size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="p-12 text-center text-gray-400 font-medium">
                No attendance records match your criteria.
              </div>
            )}
          </div>
        )}
      </div>

      {/* EDIT RECORD MODAL */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Update Attendance Log</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Student: {editingRecord.student?.firstName} {editingRecord.student?.lastName}
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Attendance Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Record Date
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  required
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:[color-scheme:dark]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20"
                >
                  <FaSave /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}