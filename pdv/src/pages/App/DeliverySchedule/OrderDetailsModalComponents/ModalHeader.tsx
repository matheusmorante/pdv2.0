import React from "react";

interface Props {
    reference: string;
    onClose: () => void;
}

const ModalHeader = ({ reference, onClose }: Props) => (
    <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-5">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-100">
                <i className="bi bi-receipt text-white text-xl" />
            </div>
            <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Detalhes do Pedido</h2>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-1">
                    Referência: {reference}
                </p>
            </div>
        </div>
        <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all shadow-sm border border-slate-100 active:scale-95"
        >
            <i className="bi bi-x-lg text-lg" />
        </button>
    </div>
);

export default ModalHeader;
