import { useEffect, useState } from "react";
import API from "../../services/api";
import { FaClipboardCheck, FaUsers, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const STATUSES = ["Present", "Absent", "Late", "Excused"];

export default function Attendance() {
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [editRow, setEditRow] = useState(null);
  const [data, setData] = useState({ students: [], subjects: [] });

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    (async () => {
      try {
        const [stu, sub] = await Promise.all([
          API.get("/users/students"), 
          API.get("/subjects/my")
        ]);
        setData({
          students: (stu.data || []).map(s => ({ ...s, status: "Present" })),
          subjects: sub.data || [],
        });
        if (sub.data?.length > 0) setSelectedSubject(sub.data[0]._id);
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
      await API.post("/attendance/mark-bulk", { 
        students: data.students, 
        subject: selectedSubject, 
        date: today 
      });
      toast.success("Attendance Saved Successfully");
    } catch (error) {
      console.error(error);
      toast.error("Attendance Save Failed");
    }
  };

  const updateSingle = async (student) => {
    try {
      await API.put(`/users/${student._id}`, { 
        studentId: student.studentId, 
        firstName: student.firstName, 
        lastName: student.lastName 
      });
      await API.post("/attendance/mark-bulk", { 
        students: [student], 
        subject: selectedSubject, 
        date: today 
      });
      toast.success("Student Updated");
      setEditRow(null);
    } catch (error) {
      console.error(error);
      toast.error("Update Failed");
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 font-semibold animate-pulse">
        Loading Attendance Records...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Header & Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <FaClipboardCheck className="text-indigo-600 dark:text-indigo-400" />
            Attendance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Mark and manage student attendance for your classes.
          </p>
        </div>

        {/* Subject Filter & Save Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select 
            value={selectedSubject} 
            onChange={(e) => setSelectedSubject(e.target.value)} 
            className="w-full sm:w-auto border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            {data.subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name} ({subject.code})
              </option>
            ))}
          </select>
          <button 
            onClick={handleBulkSubmit} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-indigo-600/20 transition active:scale-98"
          >
            Save Attendance
          </button>
        </div>
      </div>

      {/* Stats KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[
          { label: "Total Students", val: data.students.length, color: "text-blue-600 dark:text-blue-400" }, 
          { label: "Present Today", val: data.students.filter(s => s.status === "Present").length, color: "text-emerald-500" }, 
          { label: "Date", val: today, color: "text-indigo-600 dark:text-indigo-400" }
        ].map((stat, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs"
          >
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">{stat.label}</p>
            <h2 className={`${idx === 2 ? "text-xl sm:text-2xl" : "text-3xl sm:text-4xl"} font-black ${stat.color} mt-1 sm:mt-2`}>
              {stat.val}
            </h2>
          </motion.div>
        ))}
      </div>

      {/* Student Attendance List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                <th className="p-3.5 sm:p-4 text-left w-12">#</th>
                <th className="p-3.5 sm:p-4 text-left">Student</th>
                {STATUSES.map((status) => (
                  <th key={status} className="p-3.5 sm:p-4 text-center font-bold">
                    {status}
                  </th>
                ))}
                <th className="p-3.5 sm:p-4 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {data.students.map((student, index) => (
                <tr 
                  key={student._id} 
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3.5 sm:p-4 font-bold text-slate-400">{index + 1}</td>
                  <td className="p-3.5 sm:p-4 font-semibold">
                    {editRow === student._id ? (
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={student.firstName} 
                          onChange={(e) => updateStudentField(index, "firstName", e.target.value)} 
                          className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs w-28 outline-none focus:ring-1 focus:ring-indigo-500" 
                        />
                        <input 
                          type="text" 
                          value={student.lastName} 
                          onChange={(e) => updateStudentField(index, "lastName", e.target.value)} 
                          className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs w-28 outline-none focus:ring-1 focus:ring-indigo-500" 
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 text-xs font-bold">
                          {student.firstName?.[0]}{student.lastName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{student.email}</p>
                        </div>
                      </div>
                    )}
                  </td>
                  {STATUSES.map((status) => (
                    <td key={status} className="p-3.5 sm:p-4 text-center">
                      <input 
                        type="radio" 
                        name={`status-${student._id}`}
                        checked={student.status === status} 
                        onChange={() => updateStudentField(index, "status", status)} 
                        className="w-4 h-4 cursor-pointer accent-indigo-600" 
                      />
                    </td>
                  ))}
                  <td className="p-3.5 sm:p-4 text-center">
                    {editRow === student._id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => updateSingle(student)} 
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-100 transition"
                          title="Save"
                        >
                          <FaCheck size={14} />
                        </button>
                        <button 
                          onClick={() => setEditRow(null)} 
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition"
                          title="Cancel"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setEditRow(student._id)} 
                        className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition"
                        title="Edit Student Name"
                      >
                        <FaEdit size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}