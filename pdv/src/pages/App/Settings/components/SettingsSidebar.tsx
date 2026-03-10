import React from "react";

export interface Category {
    id: string;
    label: string;
    icon: string;
    group: 'system' | 'user';
    keywords: string[];
}

interface SettingsSidebarProps {
    categories: Category[];
    isAdmin: boolean;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ categories, isAdmin }) => {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const userCats = categories.filter(c => c.group === 'user');
    const systemCats = categories.filter(c => c.group === 'system');

    return (
        <aside className="lg:col-span-3 flex flex-col gap-6 sticky top-32 h-fit">
            
            {/* User Preferences */}
            <div className="flex flex-col gap-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-2">
                    Minha Conta
                </h3>
                {userCats.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => scrollToSection(cat.id)}
                        className="flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-slate-500 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-900 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none group text-left"
                    >
                        <i className={`bi ${cat.icon} text-base transition-transform group-hover:scale-110`} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* System Preferences (Admin Only) */}
            {isAdmin && systemCats.length > 0 && (
                <div className="flex flex-col gap-2 relative">
                    <div className="absolute -top-4 left-0 w-full h-px bg-slate-100 dark:bg-slate-800" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 px-2 flex items-center justify-between">
                        Sistema 
                        <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-[8px]">Admin</span>
                    </h3>
                    {systemCats.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => scrollToSection(cat.id)}
                            className="flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-slate-500 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-900 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none group text-left"
                        >
                            <i className={`bi ${cat.icon} text-base transition-transform group-hover:scale-110`} />
                            {cat.label}
                        </button>
                    ))}
                </div>
            )}
        </aside>
    );
};

export default SettingsSidebar;
