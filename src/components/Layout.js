import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#0F172A] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Global Responsive Sticky Navbar */}
      <Navbar />

      {/* Main Content Area: Centered, auto-padded, with horizontal overflow protection */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden overflow-y-auto">
        {children}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default Layout;