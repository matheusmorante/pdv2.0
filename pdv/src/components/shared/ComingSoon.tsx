import React from 'react';

const ComingSoon = ({ title }: { title: string }) => {
    return (
        <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30">
            <div className="bg-white p-10 rounded-full shadow-2xl shadow-slate-100 mb-8 border border-slate-50">
                <i className="bi bi-hammer text-6xl text-slate-200" />
            </div>
            <h3 className="text-slate-800 font-black text-xl mb-2">{title}</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                Esta funcionalidade está sendo desenvolvida
            </p>
        </div>
    );
};

export default ComingSoon;
