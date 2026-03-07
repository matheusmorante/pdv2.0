import React from 'react';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: React.ReactNode;
    containerClassName?: string;
}

const ValidatedInput = ({
    error,
    label,
    containerClassName = '',
    className = '',
    ...props
}: ValidatedInputProps) => {
    return (
        <div className={`flex flex-col relative group ${containerClassName}`}>
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 ml-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    {...props}
                    className={`w-full bg-transparent border-0 border-b px-1 py-3 transition-all text-sm outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-300 ${error
                            ? 'border-red-500 dark:border-red-500/50 focus:border-red-600'
                            : 'border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500'
                        } ${className}`}
                />

                {error && (
                    <div className="absolute left-0 -top-8 hidden group-hover:flex items-center px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded shadow-lg z-50 whitespace-nowrap animate-in fade-in slide-in-from-bottom-1">
                        {error}
                        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-red-500 rotate-45" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ValidatedInput;
