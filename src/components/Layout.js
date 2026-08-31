import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">

      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <main className="flex-1 w-full px-4 py-6 overflow-y-auto">
        {children}
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default Layout;