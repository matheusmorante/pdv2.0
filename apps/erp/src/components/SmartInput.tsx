import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "../pages/utils/supabaseConfig";

interface SmartInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    suggestions?: string[];
    tableName?: string;
    columnName?: string;
    patterns?: string[];
    onValueChange: (value: string) => void;
    icon?: string;
}

const SmartInput: React.FC<SmartInputProps> = ({
    label,
    suggestions = [],
    patterns = [],
    tableName,
    columnName,
    value,
    onValueChange,
    icon,
    className,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [inputValue, setInputValue] = useState(value || "");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    // Fetch dynamic suggestions if table and column are provided
    useEffect(() => {
        if (!tableName || !columnName) return;

        const fetchRecent = async () => {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select(columnName)
                    .not(columnName, 'is', null)
                    .order('created_at', { ascending: false })
                    .limit(30);

                if (error) throw error;

                if (data) {
                    const uniqueValues = Array.from(new Set(data.map((item: any) => String(item[columnName]))))
                        .filter(v => v.trim() !== "");
                    setDynamicSuggestions(uniqueValues as string[]);
                }
            } catch (err) {
                console.error("Error fetching dynamic suggestions:", err);
            }
        };

        fetchRecent();
    }, [tableName, columnName]);

    const allSuggestions = useMemo(() => {
        const combined = [...new Set([...patterns, ...suggestions, ...dynamicSuggestions])];
        return combined;
    }, [patterns, suggestions, dynamicSuggestions]);

    const filteredSuggestions = useMemo(() => {
        const query = (String(inputValue || "")).toLowerCase();
        if (!query) return allSuggestions.slice(0, 10); 

        const patternMatches = patterns.filter(s => s.toLowerCase().startsWith(query));
        const otherMatches = allSuggestions.filter(s => 
            s.toLowerCase().startsWith(query) && !patternMatches.includes(s)
        );
        const containsMatches = allSuggestions.filter(s => 
            s.toLowerCase().includes(query) && 
            !patternMatches.includes(s) && 
            !otherMatches.includes(s)
        );

        const results = [...patternMatches, ...otherMatches, ...containsMatches].slice(0, 10);
        
        // Add "Usar..." option for new entries if not an exact match
        if (query && !results.some(s => s.toLowerCase() === query)) {
            results.unshift(`Usar "${inputValue}"`);
        }

        return results;
    }, [inputValue, allSuggestions, patterns]);

    const handleSelect = (suggestion: string) => {
        let finalValue = suggestion;
        if (suggestion.startsWith('Usar "') && suggestion.endsWith('"')) {
            finalValue = suggestion.slice(6, -1);
        }
        setInputValue(finalValue);
        onValueChange(finalValue);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setInputValue(value || ""); // Revert on blur
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === "ArrowDown") setIsOpen(true);
            return;
        }

        if (e.key === "ArrowDown") {
            setActiveIndex((prev: number) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            setActiveIndex((prev: number) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(filteredSuggestions[activeIndex]);
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setInputValue(value || "");
        }
    };

    return (
        <div className="flex flex-col gap-2 relative w-full" ref={containerRef}>
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <i className={`bi ${icon} absolute left-4 top-1/2 -translate-y-1/2 text-slate-400`} />
                )}
                <input
                    {...props}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className={`w-full ${icon ? 'pl-11' : 'px-4'} py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold dark:text-slate-100 ${className}`}
                />

                {isOpen && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-2 flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredSuggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSelect(suggestion)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${index === activeIndex ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                                >
                                    <i className={`bi ${index === activeIndex ? 'bi-check2' : 'bi-plus'} text-sm opacity-50`} />
                                    <span className="text-sm font-bold">{suggestion}</span>
                                </button>
                            ))}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Sugestões inteligentes</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartInput;
