import React, { useState, KeyboardEvent, FocusEvent, useEffect, useMemo } from 'react';
import { getNoticeFrequency } from '../pages/utils/orderHistoryService';

interface NoticeInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    label?: string;
}

const NoticeInput = ({ value, onChange, placeholder = "Adicionar aviso...", className = "", label }: NoticeInputProps) => {
    const [inputValue, setInputValue] = useState("");
    const [frequencies, setFrequencies] = useState<Record<string, number>>({});
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Split string into array of tags
    const tags = useMemo(() => value ? value.split(';').map(t => t.trim()).filter(t => t !== "") : [], [value]);

    useEffect(() => {
        const loadFrequencies = async () => {
            const freq = await getNoticeFrequency();
            setFrequencies(freq);
        };
        loadFrequencies();
    }, []);

    const suggestions = useMemo(() => {
        const query = inputValue.toLowerCase().trim();
        return Object.entries(frequencies)
            .filter(([text]) => !tags.includes(text) && (query === "" || text.toLowerCase().includes(query)))
            .sort((a, b) => b[1] - a[1]) // Sort by frequency
            .slice(0, 10);
    }, [frequencies, inputValue, tags]);

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            const newTags = [...tags, trimmedTag];
            onChange(newTags.join('; '));
        }
        setInputValue("");
        setShowSuggestions(false);
    };

    const removeTag = (indexToRemove: number) => {
        const newTags = tags.filter((_, index) => index !== indexToRemove);
        onChange(newTags.join('; '));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue) addTag(inputValue);
        } else if (e.key === ',' || e.key === ';') {
            e.preventDefault();
            if (inputValue) addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        } else if (e.key === 'ArrowDown' && !showSuggestions) {
            setShowSuggestions(true);
        }
    };

    const getTagColor = (tag: string) => {
        const count = frequencies[tag] || 0;
        if (count >= 15) return "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30"; // Very Cold
        if (count >= 5) return "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"; // Neutral
        if (count >= 2) return "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30"; // Warm/Alert
        return "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30 shadow-sm shadow-red-100 dark:shadow-none font-black"; // Very Hot/Rare
    };

    return (
        <div className={`flex flex-col gap-2 relative ${className}`}>
            {label && (
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-2">
                    <i className="bi bi- megaphone text-red-500 animate-pulse" />
                    {label}
                </label>
            )}
            
            <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] min-h-[120px] items-start transition-all focus-within:border-red-500/30 focus-within:ring-4 focus-within:ring-red-500/5 shadow-inner">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[11px] border transition-all animate-in fade-in zoom-in-95 duration-300 ${getTagColor(tag)}`}
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="hover:scale-125 transition-transform"
                        >
                            <i className="bi bi-x-circle-fill opacity-50 hover:opacity-100 transition-opacity" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? placeholder : ""}
                    className="flex-1 min-w-[150px] bg-transparent outline-none text-sm py-2 placeholder:text-slate-300 dark:placeholder:text-slate-700 dark:text-slate-300 font-bold tracking-tight"
                />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-slide-up py-2">
                        <div className="px-5 py-2 border-b border-slate-50 dark:border-slate-800">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Sugestões (Mais Usados)</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {suggestions.map(([text, count]) => (
                                <button
                                    key={text}
                                    type="button"
                                    onClick={() => addTag(text)}
                                    className="w-full text-left px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-between group"
                                >
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:translate-x-1 transition-transform">{text}</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${count >= 5 ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/30' : 'bg-red-50 text-red-500 dark:bg-red-900/30'}`}>
                                        {count}x
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NoticeInput;
