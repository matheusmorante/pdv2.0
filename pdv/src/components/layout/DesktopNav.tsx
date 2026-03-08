import { Link } from "react-router-dom";

type MenuKey = 'stock' | 'salesOrder' | 'registrations' | null;

interface DesktopNavProps {
    activeMenu: MenuKey;
    setActiveMenu: (menu: MenuKey) => void;
}

const dropdownClass = "absolute top-[calc(100%-8px)] left-0 w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl p-2 flex flex-col gap-1 animate-slide-up";
const dropdownItemClass = "p-3 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-xs uppercase tracking-widest";
const navLinkClass = "flex items-center gap-2 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all font-bold text-sm";

const menuBtnClass = (isActive: boolean) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`;

const chevronClass = (isActive: boolean) =>
    `bi bi-chevron-down transition-transform text-[10px] ${isActive ? 'rotate-180' : ''}`;

const DesktopNav = ({ activeMenu, setActiveMenu }: DesktopNavProps) => {
    const toggle = (key: MenuKey) => setActiveMenu(activeMenu === key ? null : key);

    return (
        <nav className="hidden xl:flex items-center gap-2 h-full">
            <Link to="/" className={navLinkClass}>
                <i className="bi bi-grid-fill"></i>
                Dashboard
            </Link>

            <Link to="/registrations/products" className={navLinkClass}>
                <i className="bi bi-box-seam"></i>
                Produtos e Serviços
            </Link>

            {/* Pessoas */}
            <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu('registrations')}
                onMouseLeave={() => setActiveMenu(null)}
            >
                <button onClick={() => toggle('registrations')} className={menuBtnClass(activeMenu === 'registrations')}>
                    <i className="bi bi-people-fill"></i>
                    Pessoas
                    <i className={chevronClass(activeMenu === 'registrations')}></i>
                </button>
                {activeMenu === 'registrations' && (
                    <div className={dropdownClass}>
                        <Link to="/registrations/customers" onClick={() => setActiveMenu(null)} className={dropdownItemClass}>Clientes</Link>
                        <Link to="/registrations/suppliers" onClick={() => setActiveMenu(null)} className={dropdownItemClass}>Fornecedores</Link>
                        <Link to="/registrations/employees" onClick={() => setActiveMenu(null)} className={dropdownItemClass}>Funcionários</Link>
                    </div>
                )}
            </div>

            {/* Estoque */}
            <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu('stock')}
                onMouseLeave={() => setActiveMenu(null)}
            >
                <button onClick={() => toggle('stock')} className={menuBtnClass(activeMenu === 'stock')}>
                    <i className="bi bi-box-seam-fill"></i>
                    Estoque
                    <i className={chevronClass(activeMenu === 'stock')}></i>
                </button>
                {activeMenu === 'stock' && (
                    <div className={dropdownClass}>
                        <Link to="/stock" onClick={() => setActiveMenu(null)} className={dropdownItemClass}>Controle de Saldo</Link>
                        <Link to="/stock/launch" onClick={() => setActiveMenu(null)} className={dropdownItemClass}>Histórico / Lançamentos</Link>
                    </div>
                )}
            </div>

            {/* Pedidos */}
            <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveMenu('salesOrder')}
                onMouseLeave={() => setActiveMenu(null)}
            >
                <button onClick={() => toggle('salesOrder')} className={menuBtnClass(activeMenu === 'salesOrder')}>
                    <i className="bi bi-cart-fill"></i>
                    Pedidos
                    <i className={chevronClass(activeMenu === 'salesOrder')}></i>
                </button>
                {activeMenu === 'salesOrder' && (
                    <div className={dropdownClass}>
                        <Link to="/sales-order" onClick={() => setActiveMenu(null)} className={dropdownItemClass}>Lista de Pedidos</Link>
                        <Link to="/delivery-schedule" onClick={() => setActiveMenu(null)} className={dropdownItemClass}>Cronograma Logístico</Link>
                    </div>
                )}
            </div>


            <Link to="/reports" className={navLinkClass}>
                <i className="bi bi-bar-chart-fill"></i>
                Relatórios
            </Link>
        </nav>
    );
};

export default DesktopNav;
