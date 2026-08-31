import { FaGraduationCap, FaGithub, FaGlobe } from "react-icons/fa";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-[#0B0F1A] border-t border-slate-200 dark:border-slate-800 py-8 px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* BRAND & COPYRIGHT */}
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-2">
            <FaGraduationCap className="text-indigo-500 text-xl" />
            <span className="font-black tracking-tighter uppercase text-slate-800 dark:text-slate-200">
              EduCloud <span className="font-normal text-slate-400">v1.0</span>
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            © {currentYear} Student Attendance & Result Management System
          </p>
        </div>

        {/* PROJECT INFO */}
        <div className="text-center">
          <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
            IGNOU MCA Project
          </span>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            Developed by <span className="text-indigo-500">Parag Tanna</span>
          </p>
        </div>

        {/* SOCIAL/LINKS */}
        <div className="flex gap-4">
          <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:text-indigo-500 transition-colors shadow-sm">
            <FaGithub size={18} />
          </button>
          <button className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:text-indigo-500 transition-colors shadow-sm">
            <FaGlobe size={18} />
          </button>
        </div>

      </div>
      
      {/* SUB-FOOTER LINE */}
      <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-900 text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
          Secure Educational Infrastructure
        </p>
      </div>
    </footer>
  );
}

export default Footer;