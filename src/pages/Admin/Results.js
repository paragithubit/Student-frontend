import { useEffect, useState, useMemo } from "react";
import API from "../../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast, { Toaster } from "react-hot-toast";
import { 
  MdOutlinePostAdd, 
  MdSearch, 
  MdDeleteOutline, 
  MdEdit, 
  MdFileDownload, 
  MdAdd, 
  MdRemoveCircleOutline 
} from "react-icons/md";

const INITIAL_FORM = { 
  student: "", 
  semester: "", 
  subjects: [{ subjectId: "", marks: "", maxMarks: 100 }] 
};

export default function Results() {
  const [data, setData] = useState({ 
    students: [], 
    subjects: [], 
    results: [], 
    semesters: [] 
  });
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchData = async () => {
    try {
      const [stu, sub, res, sem] = await Promise.all([
        API.get("/users/students"), 
        API.get("/subjects"), 
        API.get("/results"), 
        API.get("/semesters")
      ]);

      // 🔹 Natural numerical sorting for semesters (1, 2, 3...)
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
        results: res.data || [], 
        semesters: sortedSemesters 
      });
    } catch { 
      toast.error("Failed to load data from server"); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const getGrade = (p) => p >= 90 ? "A+" : p >= 75 ? "A" : p >= 60 ? "B" : p >= 50 ? "C" : "F";
  const getStatus = (subjs, pct) => subjs.some((s) => s.marks < 33) || pct < 40 ? "Fail" : "Pass";

  const handleSubjectChange = (i, field, value) => {
    const updated = [...form.subjects];
    updated[i][field] = value;
    setForm({ ...form, subjects: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editId ? "Updating record..." : "Saving record...");
    const total = form.subjects.reduce((acc, s) => acc + Number(s.marks || 0), 0);
    const max = form.subjects.reduce((acc, s) => acc + Number(s.maxMarks || 100), 0);
    const payload = { ...form, total, percentage: max ? (total / max) * 100 : 0 };

    try {
      if (editId) {
        await API.put(`/results/${editId}`, payload);
        toast.success("Result updated successfully", { id: loadingToast });
      } else {
        await API.post("/results/add", payload);
        toast.success("New result added", { id: loadingToast });
      }
      setEditId(null);
      setForm(INITIAL_FORM);
      fetchData();
    } catch { 
      toast.error("Operation failed. Please try again.", { id: loadingToast }); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await API.delete(`/results/${id}`);
      toast.success("Record deleted");
      fetchData();
    } catch { 
      toast.error("Could not delete record"); 
    }
  };

  const filtered = useMemo(() => {
    return data.results.filter((r) => 
      `${r.student?.firstName} ${r.student?.lastName}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [data.results, search]);

  const downloadPDF = (r) => {
    const doc = new jsPDF();
    doc.setFontSize(20).text("EDUCLOUD ACADEMY", 105, 15, { align: "center" });
    doc.setFontSize(11)
      .text(`Student: ${r.student?.firstName || ""} ${r.student?.lastName || ""}`, 14, 38)
      .text(`Semester: ${r.semester?.name || "N/A"}`, 14, 46);
    autoTable(doc, {
      startY: 55,
      head: [["CODE", "SUBJECT", "MAX", "OBTAINED", "RESULT"]],
      body: (r.subjects || []).map((s, i) => [
        `SUB0${i + 1}`, 
        s.subjectId?.name || "N/A", 
        s.maxMarks || 100, 
        s.marks, 
        s.marks >= 33 ? "PASS" : "FAIL"
      ]),
      headStyles: { fillColor: [79, 70, 229] },
    });
    doc.save(`Result_${r.student?.firstName || "Student"}.pdf`);
    toast.success("PDF Downloaded");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F1A] p-4 md:p-8 transition-colors text-slate-800 dark:text-white">
      <Toaster position="top-right" />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black">Result Analytics</h1>
          <p className="text-slate-500 text-sm">Manage student performance</p>
        </div>
        <div className="relative w-full md:w-72">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            placeholder="Search students..." 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border rounded-xl outline-none" 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* CRUDS CORE FORM */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm sticky top-24 border dark:border-slate-700 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MdOutlinePostAdd className="text-indigo-600" /> {editId ? "Update Record" : "New Entry"}
            </h2>
            
            <select 
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border" 
              value={form.student} 
              onChange={(e) => setForm({ ...form, student: e.target.value })} 
              required
            >
              <option value="">Select Student</option>
              {data.students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>

            {/* 🔹 SEMESTER DROPDOWN (Numbered sequentially 1, 2, 3...) */}
            <select 
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border" 
              value={form.semester} 
              onChange={(e) => setForm({ ...form, semester: e.target.value })} 
              required
            >
              <option value="">Select Semester</option>
              {data.semesters.map((sem) => (
                <option key={sem._id} value={sem._id}>
                  {sem.name}
                </option>
              ))}
            </select>

            <div className="space-y-3">
              {form.subjects.map((s, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border space-y-2">
                  <select 
                    className="w-full p-2 text-sm rounded bg-white dark:bg-slate-800 border" 
                    value={s.subjectId} 
                    onChange={(e) => handleSubjectChange(i, "subjectId", e.target.value)} 
                    required
                  >
                    <option value="">Select Subject</option>
                    {data.subjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="Marks" 
                      className="w-full p-2 text-sm rounded bg-white dark:bg-slate-800 border" 
                      value={s.marks} 
                      onChange={(e) => handleSubjectChange(i, "marks", e.target.value)} 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setForm({ ...form, subjects: form.subjects.filter((_, idx) => idx !== i) })} 
                      className="text-red-500 p-2"
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setForm({ ...form, subjects: [...form.subjects, { subjectId: "", marks: "", maxMarks: 100 }] })} 
                className="w-full py-2 border-2 border-dashed rounded-xl text-xs flex justify-center items-center gap-1 hover:text-indigo-500"
              >
                <MdAdd /> Add Subject
              </button>
            </div>
            <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all">
              {editId ? "Update Result" : "Submit Result"}
            </button>
          </form>
        </div>

        {/* ANALYTICS VIEW TABLE */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-xs font-bold uppercase">
                <tr>
                  {["Student", "Sem", "Stats", "Result", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-700">
                {filtered.map((r) => {
                  const status = getStatus(r.subjects || [], r.percentage || 0);
                  return (
                    <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold">{r.student?.firstName} {r.student?.lastName}</div>
                        <div className="text-[10px] text-slate-400">ID: {r._id.slice(-6)}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">{r.semester?.name}</td>
                      <td className="px-6 py-4">
                        <div className="text-indigo-600 font-black">{Number(r.percentage || 0).toFixed(1)}%</div>
                        <div className="text-[10px] font-bold text-slate-400">GRADE {getGrade(r.percentage || 0)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${status === "Pass" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => { 
                              setEditId(r._id); 
                              setForm({ 
                                student: r.student?._id || "", 
                                semester: r.semester?._id || "", 
                                subjects: (r.subjects || []).map((s) => ({ 
                                  subjectId: s.subjectId?._id || "", 
                                  marks: s.marks, 
                                  maxMarks: s.maxMarks || 100 
                                })) 
                              }); 
                            }} 
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg"
                          >
                            <MdEdit />
                          </button>
                          <button onClick={() => downloadPDF(r)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg">
                            <MdFileDownload />
                          </button>
                          <button onClick={() => handleDelete(r._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                            <MdDeleteOutline />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-20 text-center text-slate-400">No records found.</div>}
        </div>
      </div>
    </div>
  );
}