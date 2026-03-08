import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import DesktopNav from "./components/layout/DesktopNav";
import MobileNav from "./components/layout/MobileNav";
import AIChatAssistant from "./components/shared/AIChatAssistant";

type MenuKey = 'stock' | 'salesOrder' | 'registrations' | null;

export default function AppLayout() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen font-['Inter',_sans-serif] transition-colors duration-300">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        theme={theme === 'dark' ? 'dark' : 'colored'}
        draggable
      />

      {/* Header */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 xl:px-8 h-16 xl:h-20 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-4 xl:gap-8 h-full">
          <button
            className="xl:hidden p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className="bi bi-list text-2xl"></i>
          </button>

          <Link to="/" className="flex items-center gap-2 xl:gap-3">
            <div className="w-8 h-8 xl:w-10 xl:h-10 bg-blue-600 rounded-lg xl:rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 flex items-center justify-center">
              <span className="text-white font-black text-lg xl:text-xl italic leading-none">P</span>
            </div>
            <h3 className="text-lg xl:text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight hidden sm:block">PDV ERP</h3>
          </Link>

          <DesktopNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
        </div>

        <div className="flex items-center gap-2 xl:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 xl:p-3 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-yellow-400 transition-all rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
          >
            {theme === 'light' ? (
              <i className="bi bi-moon-stars-fill text-lg xl:text-xl"></i>
            ) : (
                <i className="bi bi-sun-fill text-lg xl:text-xl"></i>
            )}
          </button>

          <Link to="/settings" className="hidden sm:block p-2 xl:p-3 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all">
            <i className="bi bi-gear-fill text-lg xl:text-xl"></i>
          </Link>
          <button
            onClick={logout}
            className="hidden sm:flex p-2 xl:p-3 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10"
            title="Sair do Sistema"
          >
            <i className="bi bi-box-arrow-right text-lg xl:text-xl"></i>
          </button>
          <div className="w-8 h-8 xl:w-10 xl:h-10 bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700"></div>
        </div>
      </header>

      {/* Mobile Nav */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <main className="flex-1 p-4 xl:p-8 overflow-x-hidden">
        <Outlet />
      </main>

      <AIChatAssistant />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slide-up { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slide-right { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-right { animation: slide-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}