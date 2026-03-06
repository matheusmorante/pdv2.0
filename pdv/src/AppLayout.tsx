import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useTheme } from "./context/ThemeContext";

export default function AppLayout() {
  const [activeMenu, setActiveMenu] = useState<'stock' | 'salesOrder' | 'registrations' | null>(null)
  const { theme, toggleTheme } = useTheme();

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

      {/* Horizontal Header */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-8 h-20 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-8 h-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 flex items-center justify-center">
              <span className="text-white font-black text-xl italic leading-none">P</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">PDV ERP</h3>
          </Link>

          <nav className="flex items-center gap-2 h-full">
            <Link to="/" className="flex items-center gap-2 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-sm">
              <i className="bi bi-grid-fill"></i>
              Dashboard
            </Link>

            <div className="relative h-full flex items-center">
              <button
                onClick={() => setActiveMenu(activeMenu === 'registrations' ? null : 'registrations')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${activeMenu === 'registrations' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
              >
                <i className="bi bi-person-lines-fill"></i>
                Cadastros
                <i className={`bi bi-chevron-down transition-transform text-[10px] ${activeMenu === 'registrations' ? 'rotate-180' : ''}`}></i>
              </button>
              {activeMenu === 'registrations' && (
                <div className="absolute top-[calc(100%-8px)] left-0 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl p-2 flex flex-col gap-1 animate-slide-up">
                  <Link to="/registrations/products" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Produtos</Link>
                  <Link to="/registrations/customers" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Clientes</Link>
                  <Link to="/registrations/suppliers" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Fornecedores</Link>
                  <Link to="/registrations/employees" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Funcionários</Link>
                </div>
              )}
            </div>

            <div className="relative h-full flex items-center">
              <button
                onClick={() => setActiveMenu(activeMenu === 'stock' ? null : 'stock')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${activeMenu === 'stock' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
              >
                <i className="bi bi-box-seam-fill"></i>
                Estoque
                <i className={`bi bi-chevron-down transition-transform text-[10px] ${activeMenu === 'stock' ? 'rotate-180' : ''}`}></i>
              </button>
              {activeMenu === 'stock' && (
                <div className="absolute top-[calc(100%-8px)] left-0 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl p-2 flex flex-col gap-1 animate-slide-up">
                  <Link to="/stock/launch" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Lançamentos</Link>
                  <Link to="/stock/reports" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Relatórios de Estoque</Link>
                </div>
              )}
            </div>

            <div className="relative h-full flex items-center">
              <button
                onClick={() => setActiveMenu(activeMenu === 'salesOrder' ? null : 'salesOrder')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${activeMenu === 'salesOrder' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}
              >
                <i className="bi bi-cart-fill"></i>
                Pedidos
                <i className={`bi bi-chevron-down transition-transform text-[10px] ${activeMenu === 'salesOrder' ? 'rotate-180' : ''}`}></i>
              </button>
              {activeMenu === 'salesOrder' && (
                <div className="absolute top-[calc(100%-8px)] left-0 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl p-2 flex flex-col gap-1 animate-slide-up">
                  <Link to="/sales-order" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Lista de Pedidos</Link>
                  <Link to="/delivery-schedule" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Cronograma de Entrega</Link>
                </div>
              )}
            </div>

            <Link to="/sales" className="flex items-center gap-2 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-sm">
              <i className="bi bi-cash-stack"></i>
              Vendas
            </Link>
            <Link to="/reports" className="flex items-center gap-2 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-sm">
              <i className="bi bi-bar-chart-fill"></i>
              Relatórios
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-3 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-yellow-400 transition-all rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
          >
            {theme === 'light' ? (
              <i className="bi bi-moon-stars-fill text-xl"></i>
            ) : (
              <i className="bi bi-sun-fill text-xl"></i>
            )}
          </button>

          <Link to="/settings" className="p-3 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all">
            <i className="bi bi-gear-fill text-xl"></i>
          </Link>
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-slate-200 dark:border-slate-700"></div>
        </div>
      </header>

      <main className="flex-1 p-8">
        <Outlet />
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slide-up { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}