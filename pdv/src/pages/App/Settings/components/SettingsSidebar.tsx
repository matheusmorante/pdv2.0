import React from "react";

interface Category {
    id: string;
    label: string;
    icon: string;
}

interface SettingsSidebarProps {
    categories: Category[];
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ categories }) => {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <aside className="lg:col-span-3 flex flex-col gap-2 sticky top-32 h-fit">
            {categories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => scrollToSection(cat.id)}
                    className="flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-slate-500 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-900 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none group text-left"
                >
                    <i className={`bi ${cat.icon} text-base transition-transform group-hover:scale-110`} />
                    {cat.label}
                </button>
            ))}
        </aside>
    );
};

export default SettingsSidebar;
