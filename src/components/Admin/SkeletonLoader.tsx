"use client";
import React from "react";
import SkeletonLoader from "@/components/UI/SkeletonLoader";

type AdminSkeletonVariant =
    | "navbar"
    | "module-grid"
    | "sermon-library"
    | "table"
    | "table-body-only"
    | "list-item"
    | "sermon-form"
    | "gallery-library"
    | "gallery-table"
    | "gallery-form"
    | "events-dashboard"
    | "events-form"
    | "personnel-management"
    | "ads-dashboard"
    | "ads-list"
    | "ads-form"
    | "settings-form"
    | "newsletter-library"
    | "newsletter-form";

interface AdminSkeletonProps {
    variant: AdminSkeletonVariant;
    count?: number;      // How many to render in a grid/list
    rows?: number;       // Specific to the "table" variant (default: 5)
    className?: string;
}

export default function AdminSkeletonLoader({variant, count = 1, rows = 5, className = ""}: AdminSkeletonProps) {
    const shimmer = "animate-pulse bg-slate-200";

    const renderSkeleton = () => {
        switch (variant) {

            case "navbar":
                return (
                    <nav
                        className="h-16 md:h-20 border-b border-gray-100 bg-white/90 px-4 md:px-6 flex items-center justify-between">
                        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                            {/* Logo & Text */}
                            <div className="flex items-center gap-3">
                                <div className={`h-11 w-11 ${shimmer} rounded-xl`}/>
                                <div className="hidden sm:flex flex-col gap-2">
                                    <div className={`h-4 w-24 ${shimmer} rounded-md`}/>
                                    <div className={`h-2 w-16 ${shimmer} rounded-md`}/>
                                </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-4">
                                {/* Profile Pill */}
                                <div className={`h-10 w-10 md:w-32 ${shimmer} rounded-full`}/>
                                <div className="hidden sm:block w-px h-6 bg-gray-100"/>
                                {/* Home Icon */}
                                <div className={`h-9 w-9 ${shimmer} rounded-xl`}/>
                                {/* Logout Button */}
                                <div className={`h-9 w-24 ${shimmer} rounded-full hidden xs:block`}/>
                            </div>
                        </div>
                    </nav>
                );

            case "module-grid":
                return (
                    <div className="min-h-[calc(100vh-80px)] bg-brand-surface p-6 md:p-12">
                        <div className="relative z-10 max-w-6xl mx-auto">
                            <div className="mb-10 text-center md:text-left">
                                {/* Pulse the header text */}
                                <div
                                    className={`h-10 md:h-12 w-64 md:w-96 animate-pulse bg-gray-200 rounded-xl mb-4 mx-auto md:mx-0`}/>
                                <div className={`h-4 w-48 animate-pulse bg-gray-100 rounded-lg mx-auto md:mx-0`}/>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {/* Standard Cards */}
                                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <div key={i}
                                         className={`bg-white p-8 rounded-3xl border border-gray-100 flex flex-col justify-between h-[300px] ${i === 7 ? 'sm:col-span-2 lg:col-span-2' : ''}`}>
                                        <div>
                                            <div className={`h-12 w-12 ${shimmer} rounded-xl mb-6`}/>
                                            <div className={`h-6 w-3/4 ${shimmer} rounded-lg mb-3`}/>
                                            <div className={`h-3 w-full ${shimmer} rounded-md mb-2`}/>
                                            <div className={`h-3 w-2/3 ${shimmer} rounded-md`}/>
                                        </div>
                                        <div className={`h-12 w-full ${shimmer} rounded-xl mt-6`}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case "sermon-library":
                return (
                    <div className="max-w-6xl mx-auto w-full">
                        {/* 1. Fake Breadcrumb & Tabs */}
                        <div className="mb-8">
                            <div className={`h-4 w-32 ${shimmer} rounded-md mb-8`}/>
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`h-8 w-24 bg-white/60 rounded-lg ${shimmer}`}/>
                                ))}
                            </div>
                        </div>

                        {/* 2. Header & Action Button */}
                        <div className="flex justify-between items-center mb-10">
                            <div className={`h-10 w-48 ${shimmer} rounded-lg`}/>
                            <div className={`h-12 w-32 ${shimmer} rounded-xl`}/>
                        </div>

                        {/* 3. Filter Bar */}
                        <div
                            className={`h-20 w-full bg-white border border-gray-100 rounded-2xl mb-10 ${shimmer} opacity-50`}/>

                        {/* 4. Desktop Table Skeleton */}
                        <div
                            className="hidden md:block bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="h-12 bg-slate-50 border-b border-gray-100 p-5 flex gap-20">
                                <div className={`h-3 w-32 ${shimmer} rounded-md`}/>
                                <div className={`h-3 w-40 ${shimmer} rounded-md`}/>
                            </div>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <div className="flex flex-col gap-3 flex-1">
                                        <div className={`h-3 w-20 ${shimmer} rounded-full`}/>
                                        <div className={`h-5 w-64 ${shimmer} rounded-md`}/>
                                        <div className={`h-3 w-32 ${shimmer} rounded-md`}/>
                                    </div>
                                    <div className="flex flex-col gap-3 flex-1">
                                        <div className={`h-4 w-32 ${shimmer} rounded-md`}/>
                                        <div className="flex gap-2">
                                            <div className={`h-4 w-4 ${shimmer} rounded-sm`}/>
                                            <div className={`h-4 w-4 ${shimmer} rounded-sm`}/>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className={`h-10 w-10 ${shimmer} rounded-xl`}/>
                                        <div className={`h-10 w-10 ${shimmer} rounded-xl`}/>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 5. Mobile Cards Skeleton */}
                        <div className="md:hidden space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-48">
                                    <div className={`h-4 w-20 ${shimmer} rounded-md mb-4`}/>
                                    <div className={`h-6 w-3/4 ${shimmer} rounded-md mb-2`}/>
                                    <div className={`h-4 w-1/2 ${shimmer} rounded-md`}/>
                                </div>
                            ))}
                        </div>
                    </div>
                );


            case "table":
                return (
                    <div
                        className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm w-full ${className}`}>
                        {/* 1. Table Header (Control Bar) */}
                        <div className="bg-slate-50 border-b border-gray-200 p-4 grid grid-cols-4 gap-4">
                            <div className={`h-3 w-full ${shimmer} rounded-md`}/>
                            <div className={`h-3 w-full ${shimmer} rounded-md`}/>
                            <div className={`h-3 w-full ${shimmer} rounded-md`}/>
                            <div className={`h-3 w-1/2 ml-auto ${shimmer} rounded-md`}/>
                        </div>

                        {/* 2. Table Rows (Iterative) */}
                        <div className="flex flex-col">
                            {Array.from({length: rows}).map((_, i) => (
                                <div key={i}
                                     className="p-4 border-b border-gray-100 last:border-none grid grid-cols-4 gap-4 items-center">
                                    <div className="flex items-center gap-3">
                                        {/* Representative Thumbnail/Icon */}
                                        <div className={`h-8 w-8 ${shimmer} rounded-md shrink-0`}/>
                                        <div className="flex flex-col gap-1.5 w-full">
                                            {/* Title Line */}
                                            <div className={`h-3 w-3/4 ${shimmer} rounded-md`}/>
                                            {/* Subtitle/Detail Line */}
                                            <div className={`h-2 w-1/2 ${shimmer} rounded-md`}/>
                                        </div>
                                    </div>
                                    {/* Middle Columns (e.g., Category/Author) */}
                                    <div className={`h-3 w-full ${shimmer} rounded-md`}/>
                                    <div className={`h-6 w-20 ${shimmer} rounded-full`}/>
                                    {/* Status Pill Badge */}

                                    {/* Actions Column */}
                                    <div className="flex justify-end gap-2">
                                        <div className={`h-8 w-8 ${shimmer} rounded-md`}/>
                                        <div className={`h-8 w-8 ${shimmer} rounded-md`}/>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 3. Pagination/Footer */}
                        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-slate-50/50">
                            <div className={`h-3 w-32 ${shimmer} rounded-md`}/>
                            <div className="flex gap-2">
                                <div className={`h-8 w-8 ${shimmer} rounded-md`}/>
                                <div className={`h-8 w-8 ${shimmer} rounded-md`}/>
                            </div>
                        </div>
                    </div>
                );

            case "table-body-only":
                return (
                    <div className="flex flex-col w-full animate-in fade-in duration-300">
                        {Array.from({length: rows}).map((_, i) => (
                            <div key={i} className="p-5 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex flex-col gap-3 flex-1">
                                    <div className={`h-3 w-20 ${shimmer} rounded-full`}/>
                                    <div className={`h-5 w-64 ${shimmer} rounded-md`}/>
                                    <div className={`h-3 w-32 ${shimmer} rounded-md`}/>
                                </div>
                                <div className="flex flex-col gap-3 flex-1 md:flex">
                                    <div className={`h-4 w-32 ${shimmer} rounded-md`}/>
                                    <div className="flex gap-2">
                                        <div className={`h-4 w-4 ${shimmer} rounded-sm`}/>
                                        <div className={`h-4 w-4 ${shimmer} rounded-sm`}/>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className={`h-10 w-10 ${shimmer} rounded-xl`}/>
                                    <div className={`h-10 w-10 ${shimmer} rounded-xl`}/>
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case "list-item":
                return (
                    <div
                        className={`flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl mb-3 shadow-sm ${className}`}>
                        <div className={`h-10 w-10 ${shimmer} rounded-full shrink-0`}/>
                        <div className="flex flex-col gap-2 w-full">
                            <div className={`h-3 w-1/3 ${shimmer} rounded-md`}/>
                            <div className={`h-2 w-1/4 ${shimmer} rounded-md`}/>
                        </div>
                        <div className={`h-8 w-8 ${shimmer} rounded-md shrink-0`}/>
                    </div>
                );


            case "sermon-form":
                return (
                    <div className="max-w-4xl mx-auto w-full animate-in fade-in duration-500">
                        {/* Fake Breadcrumb */}
                        <SkeletonLoader variant="text-block" className="h-4 w-48 mb-12"/>

                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <SkeletonLoader variant="text-block" className="h-10 w-64 mb-10"/>

                            {/* Step 1: Categories */}
                            <div className="space-y-4 mb-12">
                                <SkeletonLoader variant="text-block" className="h-3 w-32"/>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`h-24 w-full ${shimmer} rounded-2xl`}/>
                                    ))}
                                </div>
                            </div>

                            {/* Step 2: Input Grid */}
                            <div className="space-y-6">
                                <SkeletonLoader variant="text-block" className="h-3 w-40"/>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SkeletonLoader variant="text-block" className="h-12 rounded-lg"/>
                                    <SkeletonLoader variant="text-block" className="h-12 rounded-lg"/>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SkeletonLoader variant="text-block" className="h-12 rounded-lg"/>
                                    <SkeletonLoader variant="text-block" className="h-12 rounded-lg"/>
                                </div>
                            </div>

                            {/* Step 3: Editor Area */}
                            <div className="mt-12">
                                <SkeletonLoader variant="text-block" className="h-3 w-32 mb-4"/>
                                <SkeletonLoader variant="text-block" className="h-64 rounded-xl"/>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 mt-12">
                                <SkeletonLoader variant="text-block" className="h-14 flex-1 rounded-2xl"/>
                                <SkeletonLoader variant="text-block" className="h-14 flex-[2] rounded-2xl"/>
                            </div>
                        </div>
                    </div>
                );

            case "gallery-library":
                return (
                    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-500">
                        {/* 1. Breadcrumbs & Tabs */}
                        <div className="mb-8">
                            <SkeletonLoader variant="text-block" className="h-4 w-32 mb-8"/>
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`h-8 w-24 bg-white/60 rounded-lg ${shimmer}`}/>
                                ))}
                            </div>
                        </div>

                        {/* 2. Header */}
                        <div className="flex justify-between items-center mb-10">
                            <SkeletonLoader variant="text-block" className="h-10 w-48"/>
                            <SkeletonLoader variant="text-block" className="h-12 w-32 rounded-xl"/>
                        </div>

                        {/* 3. Filter Bar */}
                        <div
                            className={`h-20 w-full bg-white border border-gray-100 rounded-2xl mb-10 ${shimmer} opacity-40`}/>

                        {/* 4. Responsive Gallery Grid */}
                        <div
                            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5 mt-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                                <div key={i}
                                     className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col h-[280px] md:h-[350px]">
                                    {/* Thumbnail Area */}
                                    <div className={`aspect-[4/3] w-full ${shimmer}`}/>
                                    {/* Content Area */}
                                    <div className="p-3 md:p-5 flex flex-col flex-grow gap-3">
                                        <div className={`h-3 w-16 ${shimmer} rounded-full`}/>
                                        <div className={`h-4 w-full ${shimmer} rounded-md`}/>
                                        <div className={`h-4 w-2/3 ${shimmer} rounded-md`}/>
                                        <div className="mt-auto pt-3 border-t border-gray-50 flex justify-between">
                                            <div className={`h-3 w-12 ${shimmer} rounded-sm`}/>
                                            <div className={`h-3 w-12 ${shimmer} rounded-sm`}/>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case "gallery-table":
                return (
                    <>
                        {Array.from({length: 10}).map((_, i) => (
                            <div key={i}
                                 className={`bg-white rounded-2xl border border-gray-100 overflow-hidden h-[280px] md:h-[350px] animate-pulse`}>
                                <div className="aspect-[4/3] bg-slate-200"/>
                                <div className="p-4 space-y-3">
                                    <div className="h-3 w-16 bg-slate-100 rounded-full"/>
                                    <div className="h-4 w-full bg-slate-100 rounded-md"/>
                                </div>
                            </div>
                        ))
                        }
                    </>
                )

            case "gallery-form":
                return (
                    <div className="max-w-4xl mx-auto w-full animate-in fade-in duration-500">
                        {/* Breadcrumb */}
                        <SkeletonLoader variant="text-block" className="h-4 w-40 mb-10"/>

                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <SkeletonLoader variant="text-block" className="h-10 w-56 mb-10"/>

                            {/* Section 1: Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                <div className="space-y-4">
                                    <SkeletonLoader variant="text-block" className="h-3 w-24"/>
                                    <SkeletonLoader variant="text-block" className="h-12 rounded-xl"/>
                                </div>
                                <div className="space-y-4">
                                    <SkeletonLoader variant="text-block" className="h-3 w-24"/>
                                    <SkeletonLoader variant="text-block" className="h-12 rounded-xl"/>
                                </div>
                            </div>

                            {/* Section 2: THE MEDIA GRID (Unique to Gallery) */}
                            <div className="space-y-4 mb-12">
                                <SkeletonLoader variant="text-block" className="h-3 w-40"/>
                                <div
                                    className="bg-slate-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center gap-4">
                                    <div className={`h-12 w-12 ${shimmer} rounded-full`}/>
                                    <div className={`h-4 w-48 ${shimmer} rounded-md`}/>
                                </div>

                                {/* Fake Thumbnails of "already uploaded" files */}
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-6">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className={`aspect-square ${shimmer} rounded-xl`}/>
                                    ))}
                                </div>
                            </div>

                            {/* Section 3: Description/Social */}
                            <div className="space-y-6">
                                <SkeletonLoader variant="text-block" className="h-3 w-32"/>
                                <SkeletonLoader variant="text-block" className="h-32 rounded-2xl"/>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 mt-12">
                                <SkeletonLoader variant="text-block" className="h-14 flex-1 rounded-2xl"/>
                                <SkeletonLoader variant="text-block" className="h-14 flex-[2] rounded-2xl"/>
                            </div>
                        </div>
                    </div>
                );

            case "events-dashboard":
                return (
                    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-500">
                        {/* 1. Breadcrumbs & Header */}
                        <div className="flex justify-between items-center mb-8">
                            <SkeletonLoader variant="text-block" className="h-4 w-32"/>
                            <SkeletonLoader variant="text-block" className="h-8 w-24 rounded-lg"/>
                        </div>

                        {/* 2. Main Title & Tabs */}
                        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                            <SkeletonLoader variant="text-block" className="h-10 w-48"/>
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                                <div className={`h-8 w-32 bg-white rounded-lg ${shimmer}`}/>
                                <div className={`h-8 w-32 bg-white/50 rounded-lg ${shimmer}`}/>
                            </div>
                        </div>

                        {/* 3. Global Configuration Card */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
                            <div className="flex justify-between mb-6">
                                <div className="space-y-2">
                                    <SkeletonLoader variant="text-block" className="h-6 w-48"/>
                                    <SkeletonLoader variant="text-block" className="h-3 w-64"/>
                                </div>
                                <SkeletonLoader variant="text-block" className="h-8 w-24 rounded-xl"/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className={`h-20 col-span-2 ${shimmer} rounded-xl`}/>
                                <div className={`h-20 ${shimmer} rounded-xl`}/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`h-24 ${shimmer} rounded-2xl`}/>
                                <div className={`h-24 ${shimmer} rounded-2xl`}/>
                            </div>
                        </div>

                        {/* 4. Two-Column Event List */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {[1, 2].map(col => (
                                <div key={col} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`h-10 w-10 ${shimmer} rounded-lg`}/>
                                        <SkeletonLoader variant="text-block" className="h-6 w-40"/>
                                    </div>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex gap-4 p-4 border border-gray-50 rounded-2xl">
                                                <div className={`h-16 w-16 ${shimmer} rounded-xl shrink-0`}/>
                                                <div className="flex-1 space-y-2 py-1">
                                                    <div className={`h-3 w-20 ${shimmer} rounded-md`}/>
                                                    <div className={`h-4 w-full ${shimmer} rounded-md`}/>
                                                    <div className={`h-3 w-32 ${shimmer} rounded-md`}/>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case "events-form":
                return (
                    <div className="max-w-4xl mx-auto w-full animate-in fade-in duration-500">
                        {/* 1. Selection Screen Skeleton (Shows if no type is selected) */}
                        <div className="flex flex-col items-center justify-center min-h-[60vh]">
                            <SkeletonLoader variant="text-block" className="h-4 w-32 mb-12 self-start"/>
                            <div className="flex flex-col items-center mb-12">
                                <SkeletonLoader variant="text-block" className="h-10 w-64 md:w-96 mb-4"/>
                                <SkeletonLoader variant="text-block" className="h-4 w-48"/>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                {[1, 2, 3].map(i => (
                                    <div key={i}
                                         className={`bg-white p-8 rounded-3xl border border-gray-100 h-64 flex flex-col justify-center gap-4 ${shimmer} opacity-40`}/>
                                ))}
                            </div>
                        </div>

                        {/* 2. Form Body (Hidden in the switch but used for layout matching) */}
                        <div className="space-y-10 mt-12 bg-white p-10 rounded-3xl border border-gray-100">
                            <div className="flex items-center gap-4 border-b border-gray-50 pb-6 mb-8">
                                <div className={`h-10 w-10 ${shimmer} rounded-xl`}/>
                                <SkeletonLoader variant="text-block" className="h-8 w-64"/>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <SkeletonLoader variant="text-block" className="h-3 w-20"/>
                                    <SkeletonLoader variant="text-block" className="h-12 rounded-xl"/>
                                </div>
                                <div className="space-y-3">
                                    <SkeletonLoader variant="text-block" className="h-3 w-20"/>
                                    <SkeletonLoader variant="text-block" className="h-12 rounded-xl"/>
                                </div>
                            </div>

                            <div
                                className={`h-40 w-full bg-slate-50 border-2 border-dashed border-gray-200 rounded-3xl ${shimmer} opacity-30`}/>

                            <div className="flex justify-end pt-8 border-t border-gray-50">
                                <SkeletonLoader variant="text-block" className="h-14 w-48 rounded-2xl"/>
                            </div>
                        </div>
                    </div>
                );

            case "personnel-management":
                return (
                    <div className="p-4 md:p-12 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
                        {/* 1. Header & Slot Tracker */}
                        <div
                            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                            <div className="w-full md:w-auto">
                                <SkeletonLoader variant="text-block" className="h-10 w-64 mb-2"/>
                                <SkeletonLoader variant="text-block" className="h-4 w-48"/>
                            </div>
                            <div className="flex flex-col w-full md:w-auto items-center md:items-end gap-3">
                                <SkeletonLoader variant="text-block" className="h-12 w-full md:w-56 rounded-2xl"/>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <div className="flex-1 md:w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden"/>
                                    <SkeletonLoader variant="text-block" className="h-3 w-16"/>
                                </div>
                            </div>
                        </div>

                        {/* 2. Tabs & Search */}
                        <div className={`h-12 w-48 bg-gray-100 rounded-2xl mb-8 ${shimmer} opacity-40`}/>
                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div
                                className={`h-14 flex-1 bg-white border border-gray-100 rounded-2xl ${shimmer} opacity-20`}/>
                            <div className="flex gap-2">
                                <div
                                    className={`h-14 w-32 bg-white border border-gray-100 rounded-2xl ${shimmer} opacity-20`}/>
                                <div
                                    className={`h-14 w-32 bg-white border border-gray-100 rounded-2xl ${shimmer} opacity-20`}/>
                            </div>
                        </div>

                        {/* 3. Table Skeleton */}
                        <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="hidden md:block">
                                <div className="bg-slate-50 border-b border-gray-100 h-14"/>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i}
                                         className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className={`h-5 w-48 ${shimmer} rounded-md`}/>
                                            <div className={`h-3 w-32 ${shimmer} rounded-md`}/>
                                        </div>
                                        <div className={`h-6 w-24 ${shimmer} rounded-full`}/>
                                        <div className="flex gap-2">
                                            <div className={`h-10 w-10 ${shimmer} rounded-xl`}/>
                                            <div className={`h-10 w-10 ${shimmer} rounded-xl`}/>
                                            <div className={`h-10 w-10 ${shimmer} rounded-xl`}/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Mobile View */}
                            <div className="md:hidden p-5 space-y-8">
                                {[1, 2].map(i => (
                                    <div key={i} className="space-y-4">
                                        <div className="flex justify-between">
                                            <div className={`h-5 w-32 ${shimmer} rounded-md`}/>
                                            <div className={`h-6 w-16 ${shimmer} rounded-full`}/>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className={`h-12 flex-1 ${shimmer} rounded-xl`}/>
                                            <div className={`h-12 flex-1 ${shimmer} rounded-xl`}/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case "ads-dashboard":
                return (
                    <div className="max-w-6xl mx-auto w-full animate-in fade-in duration-500">
                        {/* 1. Breadcrumbs */}
                        <SkeletonLoader variant="text-block" className="h-4 w-32 mb-8"/>

                        {/* 2. Tabs Row */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`h-8 w-24 bg-white/60 rounded-lg ${shimmer}`}/>
                                ))}
                            </div>
                            <SkeletonLoader variant="text-block" className="h-4 w-48 hidden md:block"/>
                        </div>

                        {/* 3. Header & Action Button */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 ${shimmer} rounded-lg`}/>
                                <SkeletonLoader variant="text-block" className="h-10 w-48"/>
                            </div>
                            <SkeletonLoader variant="text-block" className="h-12 w-40 rounded-xl"/>
                        </div>

                        {/* 4. Complex Filter Bar */}
                        <div className="flex flex-col lg:flex-row items-start gap-4 mb-8">
                            <div
                                className={`h-14 flex-1 bg-white border border-gray-100 rounded-2xl w-full ${shimmer} opacity-20`}/>
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <div
                                    className={`h-14 w-full sm:w-48 bg-white border border-gray-100 rounded-2xl ${shimmer} opacity-20`}/>
                                <div
                                    className={`h-14 w-full sm:w-48 bg-white border border-gray-100 rounded-2xl ${shimmer} opacity-20`}/>
                            </div>
                        </div>

                        {/* 5. Responsive Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i}
                                     className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col h-[380px]">
                                    <div className={`aspect-video w-full ${shimmer}`}/>
                                    <div className="p-5 flex flex-col flex-grow gap-3">
                                        <SkeletonLoader variant="text-block" className="h-6 w-3/4"/>
                                        <SkeletonLoader variant="text-block" className="h-3 w-full"/>
                                        <SkeletonLoader variant="text-block" className="h-3 w-1/2"/>
                                        <div
                                            className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                                            <div className={`h-4 w-16 ${shimmer} rounded-md`}/>
                                            <div className="flex gap-2">
                                                <div className={`h-8 w-8 ${shimmer} rounded-lg`}/>
                                                <div className={`h-8 w-8 ${shimmer} rounded-lg`}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case "ads-list":
                return (
                    <>
                        {Array.from({length: 8}).map((_, i) => (
                            <div key={i}
                                 className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-[380px] animate-pulse">
                                <div className="aspect-video bg-slate-200"/>
                                <div className="p-5 space-y-4">
                                    <div className="h-6 w-3/4 bg-slate-100 rounded-md"/>
                                    <div className="h-3 w-full bg-slate-50 rounded-md"/>
                                    <div className="h-3 w-1/2 bg-slate-50 rounded-md"/>
                                </div>
                            </div>
                        ))}
                    </>
                )

            case "ads-form":
                return (
                    <div className="max-w-4xl mx-auto w-full animate-in fade-in duration-500">
                        {/* Fake Breadcrumb */}
                        <SkeletonLoader variant="text-block" className="h-4 w-40 mb-10"/>

                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 ${shimmer} rounded-lg`}/>
                                    <SkeletonLoader variant="text-block" className="h-8 w-64"/>
                                </div>
                            </div>

                            {/* Step 1 & 2 Skeleton */}
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <SkeletonLoader variant="text-block" className="h-3 w-20"/>
                                        <div className={`h-12 w-full bg-slate-50 rounded-xl ${shimmer} opacity-20`}/>
                                    </div>
                                    <div className="space-y-3">
                                        <SkeletonLoader variant="text-block" className="h-3 w-20"/>
                                        <div className={`h-12 w-full bg-slate-50 rounded-xl ${shimmer} opacity-20`}/>
                                    </div>
                                </div>

                                {/* Step 3: Large Media Zone */}
                                <div className="space-y-6">
                                    <SkeletonLoader variant="text-block" className="h-3 w-48"/>
                                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                                        <div
                                            className={`w-full sm:w-64 aspect-video rounded-2xl ${shimmer} opacity-30`}/>
                                        <div className="flex-1 w-full space-y-4">
                                            <SkeletonLoader variant="text-block" className="h-4 w-full"/>
                                            <SkeletonLoader variant="text-block" className="h-12 w-48 rounded-xl"/>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 4: Delivery Grid */}
                                <div className="p-8 bg-slate-50 rounded-3xl space-y-6">
                                    <SkeletonLoader variant="text-block" className="h-3 w-32"/>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className={`h-12 bg-white rounded-xl ${shimmer} opacity-40`}/>
                                        <div className={`h-12 bg-white rounded-xl ${shimmer} opacity-40`}/>
                                        <div className={`h-12 bg-white rounded-xl ${shimmer} opacity-40`}/>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-4 mt-12 pt-8 border-t border-gray-50">
                                <SkeletonLoader variant="text-block" className="h-14 w-32 rounded-2xl"/>
                                <SkeletonLoader variant="text-block" className="h-14 w-56 rounded-2xl"/>
                            </div>
                        </div>
                    </div>
                );

            case "newsletter-library":
                return (
                    <div className="max-w-6xl mx-auto w-full">
                        {/* 1. Fake Breadcrumb & Tabs */}
                        <div className="mb-8">
                            <div className={`h-4 w-32 ${shimmer} rounded-md mb-8`}/>
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`h-8 w-24 bg-white/60 rounded-lg ${shimmer}`}/>
                                ))}
                            </div>
                        </div>

                        {/* 2. Header & Action Button */}
                        <div className="flex justify-between items-center mb-10">
                            <div className={`h-10 w-48 ${shimmer} rounded-lg`}/>
                            <div className={`h-12 w-32 ${shimmer} rounded-xl`}/>
                        </div>

                        {/* 3. Filter Bar */}
                        <div
                            className={`h-20 w-full bg-white border border-gray-100 rounded-2xl mb-10 ${shimmer} opacity-50`}/>

                        {/* 4. Desktop Table Skeleton */}
                        <div
                            className="hidden md:block bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="h-12 bg-slate-50 border-b border-gray-100 p-5 flex gap-20">
                                <div className={`h-3 w-32 ${shimmer} rounded-md`}/>
                                <div className={`h-3 w-40 ${shimmer} rounded-md`}/>
                            </div>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="p-6 border-b border-gray-50 flex items-center justify-between">
                                    <div className="flex flex-col gap-3 flex-1">
                                        <div className={`h-3 w-20 ${shimmer} rounded-full`}/>
                                        <div className={`h-5 w-64 ${shimmer} rounded-md`}/>
                                        <div className={`h-3 w-32 ${shimmer} rounded-md`}/>
                                    </div>
                                    <div className="flex flex-col gap-3 flex-1">
                                        <div className={`h-4 w-32 ${shimmer} rounded-md`}/>
                                        <div className="flex gap-2">
                                            <div className={`h-4 w-4 ${shimmer} rounded-sm`}/>
                                            <div className={`h-4 w-4 ${shimmer} rounded-sm`}/>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className={`h-10 w-10 ${shimmer} rounded-xl`}/>
                                        <div className={`h-10 w-10 ${shimmer} rounded-xl`}/>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 5. Mobile Cards Skeleton */}
                        <div className="md:hidden space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-48">
                                    <div className={`h-4 w-20 ${shimmer} rounded-md mb-4`}/>
                                    <div className={`h-6 w-3/4 ${shimmer} rounded-md mb-2`}/>
                                    <div className={`h-4 w-1/2 ${shimmer} rounded-md`}/>
                                </div>
                            ))}
                        </div>
                    </div>
                );


            case "settings-form":
                return (
                    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24 w-full">
                        {/* Header Skeleton */}
                        <div
                            className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 mb-8">
                            <div className="space-y-3">
                                <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
                                <div className="h-4 w-72 max-w-full bg-gray-100 rounded-md animate-pulse"></div>
                            </div>
                            <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse flex-shrink-0"></div>
                        </div>

                        {/* Cards Grid Skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Card 1 Skeleton */}
                            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 h-fit space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                    <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse"></div>
                                    <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                                </div>
                                {/* Input Skeletons */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-3 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                                        <div
                                            className="h-12 w-full bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Card 2 Skeleton (With a 2-column grid inside) */}
                            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 h-fit space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                    <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse"></div>
                                    <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                                </div>

                                <div className="space-y-2">
                                    <div className="h-3 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                                    <div
                                        className="h-12 w-full bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                                </div>

                                {/* Inner Grid for City/Country style inputs */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="h-3 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                                        <div
                                            className="h-12 w-full bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                                        <div
                                            className="h-12 w-full bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-6">
                                    <div className="h-3 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                                    <div
                                        className="h-12 w-full bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                                </div>
                            </div>

                            {/* Full Width Card Skeleton (for Socials) */}
                            <div
                                className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 lg:col-span-2 space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                                    <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse"></div>
                                    <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={`social-${i}`} className="space-y-2">
                                            <div className="h-3 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                                            <div
                                                className="h-12 w-full bg-gray-50 rounded-xl animate-pulse border border-gray-100"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                );
        }
    };

    // Return a single skeleton
    return <>{renderSkeleton()}</>;
}