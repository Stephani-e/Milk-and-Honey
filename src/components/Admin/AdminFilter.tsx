"use client";
import React from "react";

interface FilterProps {
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (val: string) => void;
    sortValue: string;
    onSortChange: (val: string) => void;
    sortOptions: { label: string; value: string }[];
}

export default function AdminFilterBar({
                                           searchPlaceholder = "Search...",
                                           searchValue,
                                           onSearchChange,
                                           sortValue,
                                           onSortChange,
                                           sortOptions,
                                       }: FilterProps) {
    return (
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-8 bg-slate-50/50 p-3 md:p-4 rounded-2xl border border-brand-accent shadow-sm">
            {/* Search Input */}
            <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 md:py-2 bg-white border border-gray-200 rounded-xl md:text-sm text-base text-brand-primary placeholder:text-gray-400 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all shadow-sm"
                />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3">
                <div className="flex-1 md:flex-none relative">
                    <select
                        value={sortValue}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="w-full appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-3 md:py-2 text-sm font-bold text-brand-primary outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-sm cursor-pointer"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {/* Custom Chevron for the select so it looks better than the default browser one */}
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-brand-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                </div>
            </div>
        </div>
    );
}