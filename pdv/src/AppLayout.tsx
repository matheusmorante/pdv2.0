import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

export default function AppLayout() {
  const [open, setOpen] = useState<'stock' | 'salesOrder' | null>(null)
  return (
    <div >
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        draggable
      />

      <aside>
        <h3>ERP</h3>

        <nav className="flex gap-2">
          <Link to="/">Dashboard</Link><br />
          <div>
            <Link to="/stock" onClick={() => setOpen('stock')}>Estoque</Link><br />
            {open === 'stock' ?
              <div>
                <Link to="/stock/launch">Lançamento de Estoque</Link>
                <Link to="/stock/reports">Relatórios de Estoque</Link>
              </div> : null
            }
          </div>
          <div>
            <Link to="/sales-order"onClick={() => setOpen('salesOrder')}>Pedidos</Link>
            {open === 'salesOrder' ?
              <div>
                <Link to="/sales-order">Pedidos</Link>
              </div> : null
            }
          </div>
          <Link to="/sales">Vendas</Link><br />
          <Link to="/reports">Relatórios</Link><br />
          <Link to="/settings">Configurações</Link>
        </nav>
      </aside>

      <main>
        <Outlet />
      </main>

    </div>
  );
}