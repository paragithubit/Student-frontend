import { useEffect, useState } from "react";
import API from "../../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ToastContainer, toast } from "react-toastify";
import { FaFileDownload, FaAward } from "react-icons/fa";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

// ======================================================
// RESULT CARD
// ======================================================
const ResultCard = ({ resItem, onDownload }) => {
  let total = 0, max = 0, isPass = true;
  
  resItem.subjects.forEach(s => {
    total += Number(s.marks);
    max += Number(s.maxMarks || 100);
    if (s.marks < 35) isPass = false;
  });

  const stats = [
    { label: "Percentage", val: `${Number(resItem.percentage).toFixed(2)}%`, color: "text-blue-600" },
    { label: "Grade", val: resItem.grade, color: "text-slate-800 dark:text-white" },
    { label: "Marks", val: `${total}/${max}`, color: "text-slate-800 dark:text-white" },
    { label: "Result", val: isPass ? "Pass" : "Fail", color: isPass ? "text-emerald-500" : "text-rose-500" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border dark:border-slate-700 overflow-hidden mb-10">
      
      {/* HEADER */}
      <div className="bg-slate-900 dark:bg-slate-950 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
            {resItem.semester?.semesterNumber || "S"}
          </div>
          <div>
            <h2 className="text-white font-black text-xl uppercase">{resItem.semester?.name || "Semester"} Report</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Official Academic Record</p>
          </div>
        </div>
        <button onClick={() => onDownload(resItem)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all">
          <FaFileDownload /> PDF DOWNLOAD
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b dark:border-slate-700">
        {stats.map((s, i) => (
          <div key={i} className="p-6 border-r last:border-r-0 dark:border-slate-700 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b dark:border-slate-700">
              {["Code", "Subject", "Min", "Max", "Obtained", "Status"].map((h, i) => (
                <th key={h} className={`pb-4 ${i > 1 ? "text-center" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-700">
            {resItem.subjects.map((s, i) => {
              const itemPass = s.marks >= 35;
              return (
                <tr key={i} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 font-bold text-slate-400">SUB0{i + 1}</td>
                  <td className="py-4 font-black text-slate-700 dark:text-slate-200">{s.subjectId?.name || "N/A"}</td>
                  <td className="py-4 text-center font-bold text-slate-400">35</td>
                  <td className="py-4 text-center font-bold text-slate-400">{s.maxMarks || 100}</td>
                  <td className="py-4 text-center font-black text-blue-600">{s.marks}</td>
                  <td className="py-4 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${itemPass ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{itemPass ? "Pass" : "Fail"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// ======================================================
// MAIN COMPONENT
// ======================================================
export default function MyResults() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setData((await API.get("/results/my")).data); } 
      catch { toast.error("Error fetching results"); } 
      finally { setLoading(false); }
    })();
  }, []);

  const downloadPDF = (item) => {
    try {
      const doc = new jsPDF();
      let total = 0, isPass = true;
      
      item.subjects.forEach(s => {
        total += Number(s.marks);
        if (s.marks < 35) isPass = false;
      });

      // HEADER
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("ABC UNIVERSITY", 105, 18, { align: "center" });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("ACADEMIC PERFORMANCE TRANSCRIPT", 105, 28, { align: "center" });

      // DETAILS
      doc.setTextColor(40);
      doc.text([
        `Semester: ${item.semester?.name || "N/A"}`,
        `Grade: ${item.grade}`,
        `Aggregate: ${Number(item.percentage).toFixed(2)}%`,
        `Status: ${isPass ? "PASS" : "FAIL"}`,
      ], 14, 50);

      // DATA GRID TABLE
      autoTable(doc, {
        startY: 75,
        head: [["Code", "Subject", "Max", "Obtained", "Remark"]],
        body: item.subjects.map((s, i) => [`SUB0${i + 1}`, s.subjectId?.name || "Subject", s.maxMarks || 100, s.marks, s.marks >= 35 ? "PASS" : "FAIL"]),
        theme: "striped",
        headStyles: { fillColor: [30, 58, 138] },
      });

      doc.setFont("helvetica", "bold");
      doc.text(`GRAND TOTAL: ${total}`, 14, doc.lastAutoTable.finalY + 15);
      doc.save(`Transcript_${item.semester?.name || "Semester"}.pdf`);
      toast.success("Transcript Downloaded!");
    } catch {
      toast.error("PDF generation failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] p-4 md:p-8">
      <ToastContainer position="bottom-right" />
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER PANEL */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Academic <span className="text-blue-600">Records</span></h1>
            <p className="text-slate-500 font-medium mt-2">Download your semester-wise reports.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border dark:border-slate-700 flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600"><FaAward size={24} /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Overall Grade</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">{data.length ? data[data.length - 1].grade : "N/A"}</p>
            </div>
          </div>
        </header>

        {/* RECOGNITION MATRIX FLOW */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Fetching records...</div>
        ) : data.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-20 text-center border-2 border-dashed dark:border-slate-700">
            <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">No Transcripts Available</p>
          </div>
        ) : (
          data.map(item => <ResultCard key={item._id} resItem={item} onDownload={downloadPDF} />)
        )}
      </div>
    </div>
  );
}