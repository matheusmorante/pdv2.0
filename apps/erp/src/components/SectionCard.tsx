import React from "react";

interface SectionCardProps {
    icon: string;
    iconBg: string;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}

const SectionCard = ({ icon, iconBg, title, subtitle, children, className = "" }: SectionCardProps) => (
    <section className={`bg-slate-50/50 dark:bg-slate-800/20 rounded-[2.5rem] p-4 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
        <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
                <i className={`${icon} text-white text-xl`} />
            </div>
            <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{title}</h3>
                {subtitle && (
                    <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest">{subtitle}</p>
                )}
            </div>
        </div>
        {children}
    </section>
);

export default SectionCard;
