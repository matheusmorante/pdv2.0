import * as React from 'react';

interface SettingsSectionProps {
    id: string;
    title: string;
    icon: string;
    isVisible: boolean;
    children: React.ReactNode;
}

export default function SettingsSection({ id, title, icon, isVisible, children }: SettingsSectionProps) {
    if (!isVisible) return null;

    return (
        <section id={id} className="scroll-mt-32 animate-fade-in mb-16">
            <div className="flex items-center gap-3 mb-6 ml-1">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                    <i className={`bi ${icon} text-lg`} />
                </div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">{title}</h2>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none divide-y divide-slate-50 dark:divide-slate-800/50 overflow-hidden">
                {children}
            </div>
        </section>
    );
}


