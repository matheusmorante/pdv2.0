import React, { useState } from "react";
import StockList from "./components/StockList";
import StockLaunchModal from "./components/StockLaunchModal";
import Product from "../../types/product.type";

const StockPage = () => {
    const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleLaunch = (product?: Product) => {
        setSelectedProduct(product || null);
        setIsLaunchModalOpen(true);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] xl:h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-10">
                <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-6 md:mb-10 gap-4 xl:gap-0">
                    <div className="flex items-start xl:items-center gap-4 xl:gap-6">
                        <div className="w-12 h-12 xl:w-16 xl:h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-200 dark:shadow-none">
                            <i className="bi bi-box-seam-fill text-2xl xl:text-3xl"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl xl:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">
                                Gestão de Estoque
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm xl:text-lg hidden sm:block">
                                Monitore e movimente o saldo de seus produtos
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleLaunch()}
                            className="flex items-center justify-center gap-2 xl:gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 xl:px-8 xl:py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-200 dark:shadow-none transition-all active:scale-95 w-full sm:w-auto"
                        >
                            <i className="bi bi-lightning-charge-fill text-lg xl:text-xl" />
                            Novo Lançamento
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-all">
                    <StockList onLaunch={handleLaunch} />
                </div>
            </div>

            {/* Launch Modal */}
            <StockLaunchModal
                isOpen={isLaunchModalOpen}
                onClose={() => {
                    setIsLaunchModalOpen(false);
                    setSelectedProduct(null);
                }}
                targetProduct={selectedProduct}
            />
        </div>
    );
};

export default StockPage;
