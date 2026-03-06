import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

export default function AppLayout() {
  const [activeMenu, setActiveMenu] = useState<'stock' | 'salesOrder' | 'registrations' | null>(null)

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen font-['Inter',_sans-serif]">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        theme="colored"
        draggable
      />

      {/* Horizontal Header */}
      <header className="w-full bg-white border-b border-slate-100 px-8 h-20 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-8 h-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center">
              <span className="text-white font-black text-xl italic leading-none">P</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">PDV ERP</h3>
          </Link>

          <nav className="flex items-center gap-2 h-full">
            <Link to="/" className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-sm">
              <i className="bi bi-grid-fill"></i>
              Dashboard
            </Link>

            <div className="relative h-full flex items-center">
              <button
                onClick={() => setActiveMenu(activeMenu === 'registrations' ? null : 'registrations')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${activeMenu === 'registrations' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
              >
                <i className="bi bi-person-lines-fill"></i>
                Cadastros
                <i className={`bi bi-chevron-down transition-transform text-[10px] ${activeMenu === 'registrations' ? 'rotate-180' : ''}`}></i>
              </button>
              {activeMenu === 'registrations' && (
                <div className="absolute top-[calc(100%-8px)] left-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 flex flex-col gap-1 animate-slide-up">
                  <Link to="/registrations/products" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Produtos</Link>
                  <Link to="/registrations/customers" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Clientes</Link>
                  <Link to="/registrations/suppliers" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Fornecedores</Link>
                  <Link to="/registrations/employees" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Funcionários</Link>
                </div>
              )}
            </div>

            <div className="relative h-full flex items-center">
              <button
                onClick={() => setActiveMenu(activeMenu === 'stock' ? null : 'stock')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${activeMenu === 'stock' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
              >
                <i className="bi bi-box-seam-fill"></i>
                Estoque
                <i className={`bi bi-chevron-down transition-transform text-[10px] ${activeMenu === 'stock' ? 'rotate-180' : ''}`}></i>
              </button>
              {activeMenu === 'stock' && (
                <div className="absolute top-[calc(100%-8px)] left-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 flex flex-col gap-1 animate-slide-up">
                  <Link to="/stock/launch" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Lançamentos</Link>
                  <Link to="/stock/reports" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Relatórios de Estoque</Link>
                </div>
              )}
            </div>

            <div className="relative h-full flex items-center">
              <button
                onClick={() => setActiveMenu(activeMenu === 'salesOrder' ? null : 'salesOrder')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${activeMenu === 'salesOrder' ? 'text-blue-600 bg-blue-50' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
              >
                <i className="bi bi-cart-fill"></i>
                Pedidos
                <i className={`bi bi-chevron-down transition-transform text-[10px] ${activeMenu === 'salesOrder' ? 'rotate-180' : ''}`}></i>
              </button>
              {activeMenu === 'salesOrder' && (
                <div className="absolute top-[calc(100%-8px)] left-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 flex flex-col gap-1 animate-slide-up">
                  <Link to="/sales-order" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Lista de Pedidos</Link>
                  <Link to="/delivery-schedule" onClick={() => setActiveMenu(null)} className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest">Cronograma de Entrega</Link>
                </div>
              )}
            </div>

            <Link to="/sales" className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-sm">
              <i className="bi bi-cash-stack"></i>
              Vendas
            </Link>
            <Link to="/reports" className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-sm">
              <i className="bi bi-bar-chart-fill"></i>
              Relatórios
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/settings" className="p-3 text-slate-400 hover:text-slate-800 transition-all">
            <i className="bi bi-gear-fill text-xl"></i>
          </Link>
          <div className="w-10 h-10 bg-slate-100 rounded-full border-2 border-slate-200"></div>
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