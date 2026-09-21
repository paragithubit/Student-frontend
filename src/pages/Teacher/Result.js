import { useEffect, useState } from "react";
import API from "../../services/api";
import jsPDF from "jspdf";
import { BarChart3, Search, Edit3, Download, PlusCircle, User, BookOpen, GraduationCap, Loader2, FileCheck } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const FormFieldSelect = ({ label, icon: Icon, value, onChange, options, placeholder }) => (
  <div className="space-y-1.5 sm:space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
      <select
        className="w-full pl-10 pr-8 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100"
        value={value}
        onChange={onChange}
        required
      >
        <option value="" className="bg-white dark:bg-slate-900 text-slate-400">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">{opt.label}</option>
        ))}
      </select>
    </div>
  </div>
);

export default function Results() {
  const [data, setData] = useState({ students: [], subjects: [], results: [] });
  const [semesters, setSemesters] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialForm = {
    student: "",
    semester: "",
    subjects: [{ subjectId: "", marks: "", maxMarks: 100 }],
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const load = async () => {
      try {
        const [stu, sub, res, sem] = await Promise.all([
          API.get("/users/students"),
          API.get("/subjects/my"),
          API.get("/results"),
          API.get("/semesters"),
        ]);

        // 🔹 Natural numerical sorting for semesters (Semester 1, Semester 2, Semester 3...)
        const sortedSemesters = [...(sem.data || [])].sort((a, b) => {
          const numA = parseInt(String(a.name || "").replace(/\D/g, ""), 10);
          const numB = parseInt(String(b.name || "").replace(/\D/g, ""), 10);

          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          return String(a.name || "").localeCompare(String(b.name || ""), undefined, { 
            numeric: true, 
            sensitivity: "base" 
          });
        });

        setData({ 
          students: stu.data || [], 
          subjects: sub.data || [], 
          results: res.data || [] 
        });
        setSemesters(sortedSemesters);
      } catch {
        toast.error("Failed to synchronize with matrix database");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleForm = (key, value, isSubject = false) => {
    if (isSubject) {
      const updated = [...form.subjects];
      updated[0][key] = value;
      setForm({ ...form, subjects: updated });
    } else {
      setForm({ ...form, [key]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Processing report card...");

    try {
      const existingResult = data.results.find(
        (r) => r.student?._id === form.student && r.semester?._id === form.semester
      );

      const newSubject = {
        subjectId: form.subjects[0].subjectId,
        marks: Number(form.subjects[0].marks),
        maxMarks: 100,
      };

      if (existingResult) {
        const alreadySubject = existingResult.subjects.find((s) => s.subjectId?._id === newSubject.subjectId);
        const updatedSubjects = alreadySubject
          ? existingResult.subjects.map((s) => s.subjectId?._id === newSubject.subjectId ? { ...s, marks: newSubject.marks } : s)
          : [...existingResult.subjects, newSubject];

        await API.put(`/results/${existingResult._id}`, { ...existingResult, subjects: updatedSubjects });
        toast.success("Result Matrix Updated", { id: loadingToast });
      } else {
        await API.post("/results/add", { ...form, subjects: [newSubject] });
        toast.success("Result Log Created", { id: loadingToast });
      }

      setForm(initialForm);
      setEditId(null);
      const res = await API.get("/results");
      setData((prev) => ({ ...prev, results: res.data || [] }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed ❌", { id: loadingToast });
    }
  };

  const handleEdit = (r) => {
    setEditId(r._id);
    setForm({
      student: r.student?._id || "",
      semester: r.semester?._id || "",
      subjects: [{
        subjectId: r.subjects?.[0]?.subjectId?._id || "",
        marks: r.subjects?.[0]?.marks || "",
        maxMarks: 100,
      }],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadPDF = (r) => {
    const doc = new jsPDF();
    const subject = r.subjects?.[0];
    const studentName = `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.trim() || "Student";
    const status = subject?.marks >= 33 ? "PASS" : "FAIL";

    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229);
    doc.text("EDUCLOUD ACADEMY", 105, 30, { align: "center" });
    
    doc.setDrawColor(79, 70, 229);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text(`Official Student Grade Report`, 105, 45, { align: "center" });

    doc.setTextColor(0);
    doc.text(`Student: ${studentName}`, 20, 65);
    doc.text(`Semester: ${r.semester?.name || "N/A"}`, 20, 75);
    doc.text(`Subject: ${subject?.subjectId?.name || "N/A"}`, 20, 85);
    doc.text(`Marks Obtained: ${subject?.marks || 0} / 100`, 20, 95);

    doc.setFontSize(16);
    doc.setTextColor(status === "PASS" ? 22 : 220, status === "PASS" ? 163 : 38, status === "PASS" ? 74 : 38);
    doc.text(`FINAL STATUS: ${status}`, 105, 120, { align: "center" });

    doc.save(`Result_${studentName.replace(/\s+/g, "_")}.pdf`);
    toast.success("PDF Generated Successfully");
  };

  const filtered = data.results.filter((r) =>
    `${r.student?.firstName || ""} ${r.student?.lastName || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <span className="font-black text-xs tracking-widest uppercase text-slate-400">Syncing Results...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] px-3.5 py-4 sm:p-6 md:p-8 dark:text-white transition-colors duration-300 w-full overflow-x-hidden">
      <Toaster position="top-right" />
      
      {/* ACTION WORKSPACE HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 md:mb-10 gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5 sm:gap-3">
            <BarChart3 className="text-indigo-500 shrink-0" size={28} />
            <span>Performance Tracker</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm mt-0.5 sm:mt-1">
            Academic result management and PDF dispatch
          </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            placeholder="Search Student..."
            className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs text-sm font-semibold"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* INPUT MANAGEMENT MATRIX */}
        <div className="w-full lg:col-span-4 h-fit lg:sticky lg:top-8">
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm sm:shadow-md">
            <div className="flex items-center gap-2 mb-5 sm:mb-6 md:mb-8">
              <PlusCircle className="text-indigo-500 shrink-0" size={20} />
              <h2 className="font-black text-base sm:text-lg uppercase tracking-tight">
                {editId ? "Update Record" : "New Entry"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <FormFieldSelect
                label="Student Identity"
                icon={User}
                value={form.student}
                placeholder="Select Student"
                options={data.students.map(s => ({ id: s._id, label: `${s.firstName} ${s.lastName}` }))}
                onChange={(e) => handleForm("student", e.target.value)}
              />

              {/* 🔹 SEMESTER DROPDOWN (Sorted sequentially 1, 2, 3...) */}
              <FormFieldSelect
                label="Semester Cycle"
                icon={GraduationCap}
                value={form.semester}
                placeholder="Select Semester"
                options={semesters.map(sem => ({ id: sem._id, label: sem.name }))}
                onChange={(e) => handleForm("semester", e.target.value)}
              />

              <FormFieldSelect
                label="Academic Subject"
                icon={BookOpen}
                value={form.subjects[0].subjectId}
                placeholder="Select Subject"
                options={data.subjects.map(s => ({ id: s._id, label: s.name }))}
                onChange={(e) => handleForm("subjectId", e.target.value, true)}
              />

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Evaluation Score (Max: 100)
                </label>
                <input
                  type="number"
                  placeholder="Enter Marks"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-colors text-slate-800 dark:text-slate-100"
                  value={form.subjects[0].marks}
                  onChange={(e) => handleForm("marks", e.target.value, true)}
                  required
                  min="0"
                  max="100"
                />
              </div>

              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all shadow-md shadow-indigo-600/20 active:scale-[0.98]">
                {editId ? "Update Matrix" : "Publish Score"}
              </button>
              
              {editId && (
                <button 
                  type="button" 
                  onClick={() => { setEditId(null); setForm(initialForm); }}
                  className="w-full text-slate-400 hover:text-slate-500 font-bold text-xs uppercase transition-colors pt-1"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>

        {/* METRICS DISPATCH TABULAR SHEET / MOBILE CARDS */}
        <div className="w-full lg:col-span-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-xs sm:shadow-sm overflow-hidden">
            
            {/* Desktop / Tablet Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[620px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    {["Student", "Semester", "Subject", "Score", "Outcome", "Actions"].map((h, idx) => (
                      <th key={h} className={`p-4 sm:p-5 ${idx < 3 ? "text-left" : idx < 5 ? "text-center" : "text-right"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 font-medium text-slate-700 dark:text-slate-300">
                  {filtered.map((r) => {
                    const pass = r.subjects?.[0]?.marks >= 33;
                    return (
                      <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors group">
                        <td className="p-4 sm:p-5">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-indigo-500 text-xs shrink-0">
                              {r.student?.firstName?.[0]}
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                              {r.student?.firstName} {r.student?.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 sm:p-5 text-slate-500 dark:text-slate-400">{r.semester?.name}</td>
                        <td className="p-4 sm:p-5 text-slate-500 dark:text-slate-400">{r.subjects?.[0]?.subjectId?.name}</td>
                        <td className="p-4 sm:p-5 text-center">
                          <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-black text-xs">
                            {r.subjects?.[0]?.marks}
                          </span>
                        </td>
                        <td className="p-4 sm:p-5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            pass ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20" : "bg-rose-100 text-rose-600 dark:bg-rose-900/20"
                          }`}>
                            {pass ? "PASS" : "FAIL"}
                          </span>
                        </td>
                        <td className="p-4 sm:p-5">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleEdit(r)}
                              className="p-1.5 sm:p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"
                              title="Edit Record"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => downloadPDF(r)}
                              className="p-1.5 sm:p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                              title="Download PDF"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Dedicated Mobile Card View (< 640px) */}
            <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-700/60">
              {filtered.map((r) => {
                const pass = r.subjects?.[0]?.marks >= 33;
                return (
                  <div key={r._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-indigo-500 text-xs shrink-0">
                          {r.student?.firstName?.[0]}
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">
                          {r.student?.firstName} {r.student?.lastName}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                        pass ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20" : "bg-rose-100 text-rose-600 dark:bg-rose-900/20"
                      }`}>
                        {pass ? "PASS" : "FAIL"}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Subject</span>
                        <span className="font-semibold text-right">{r.subjects?.[0]?.subjectId?.name || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Semester</span>
                        <span className="font-semibold">{r.semester?.name || "—"}</span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-slate-400 font-bold uppercase text-[10px]">Score</span>
                        <span className="font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-md">
                          {r.subjects?.[0]?.marks} / 100
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end items-center gap-2 pt-1">
                      <button
                        onClick={() => handleEdit(r)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg transition-all"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => downloadPDF(r)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-xs"
                      >
                        <Download size={14} /> PDF
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="p-12 sm:p-20 text-center text-slate-400">
                <FileCheck size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-xs sm:text-sm">No results found in the matrix</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}