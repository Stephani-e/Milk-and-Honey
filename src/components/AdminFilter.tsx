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
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-brand-accent">
            {/* Search Input */}
            <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-brand-primary focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
                <label className="text-[10px] font-black uppercase text-brand-secondary whitespace-nowrap">Sort By:</label>
                <select
                    value={sortValue}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-brand-primary outline-none focus:ring-2 focus:ring-brand-primary"
                >
                    {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}