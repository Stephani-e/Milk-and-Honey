"use client";
import React from "react";

type SkeletonVariant =
    | "sermon-card"
    | "next-event-card"
    | "sidebar-ad"
    | "gallery-item"
    | "sermon-list"
    | "sermon-list-id"
    | "gallery-list"
    | "gallery-list-id"
    | "event-list"
    | "weekly-event-list"
    | "text-block"
    | "filter-bar"
    | "page-header";

interface SkeletonProps {
    variant: SkeletonVariant;
    count?: number;
    className?: string;
}

export default function SkeletonLoader({variant, count = 1, className = ""}: SkeletonProps) {
    // The base animation class applied to every skeleton shape
    const shimmer = "animate-pulse bg-slate-200";

    const renderSkeleton = () => {
        switch (variant) {
            case "sermon-card":
                return (
                    <div
                        className={`bg-slate-50 rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 flex flex-col w-full h-full ${className}`}>
                        {/* Video/Image Thumbnail */}
                        <div className={`h-40 w-full ${shimmer}`}/>
                        <div className="p-4 md:p-5 flex flex-col flex-grow w-full">
                            {/* Tags */}
                            <div className="flex gap-2 mb-3">
                                <div className={`h-4 w-16 ${shimmer} rounded-md`}/>
                                <div className={`h-4 w-24 ${shimmer} rounded-md`}/>
                            </div>
                            {/* Title (Two lines) */}
                            <div className={`h-5 w-full ${shimmer} rounded-md mb-2`}/>
                            <div className={`h-5 w-3/4 ${shimmer} rounded-md mb-4`}/>
                            {/* Bottom row (Preacher & Date) */}
                            <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between">
                                <div className={`h-3 w-24 ${shimmer} rounded-sm`}/>
                                <div className={`h-3 w-16 ${shimmer} rounded-sm`}/>
                            </div>
                        </div>
                    </div>
                );

            case "next-event-card":
                return (
                    <div
                        className={`bg-slate-50 rounded-2xl md:rounded-3xl overflow-hidden border border-gray-100 flex flex-col w-full h-full ${className}`}>
                        {/* Video/Image Thumbnail */}
                        <div className={`h-40 w-full ${shimmer}`}/>
                        <div className="p-4 md:p-5 flex flex-col flex-grow w-full">
                            {/* Tags */}
                            <div className="flex gap-2 mb-3">
                                <div className={`h-4 w-16 ${shimmer} rounded-md`}/>
                                <div className={`h-4 w-24 ${shimmer} rounded-md`}/>
                            </div>

                            {/* Title (Two lines) */}
                            <div className={`h-5 w-full ${shimmer} rounded-md mb-2`}/>
                            <div className={`h-5 w-3/4 ${shimmer} rounded-md mb-4`}/>

                            {/* Bottom row (Location & View Calendar) */}
                            <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between">
                                <div className={`h-3 w-24 ${shimmer} rounded-sm`}/>
                                <div className={`h-3 w-16 ${shimmer} rounded-sm`}/>
                            </div>
                        </div>
                    </div>
                );

            case "sidebar-ad":
                return (
                    <div
                        className={`bg-slate-100 rounded-3xl h-[300px] lg:h-[400px] w-full flex flex-col justify-end p-6 border border-gray-100 overflow-hidden relative ${className}`}>
                        <div className={`absolute inset-0 ${shimmer} opacity-50`}/>

                        <div className="relative z-10 w-full">
                            {/* Fake Featured Badge */}
                            <div className={`h-6 w-24 ${shimmer} bg-white/60 rounded-full mb-4`}/>

                            {/* Fake Title (Two lines) */}
                            <div className={`h-8 w-3/4 ${shimmer} bg-white/60 rounded-lg mb-2`}/>
                            <div className={`h-8 w-1/2 ${shimmer} bg-white/60 rounded-lg mb-4`}/>

                            {/* Fake Description */}
                            <div className={`h-3 w-full ${shimmer} bg-white/60 rounded-sm mb-2`}/>
                            <div className={`h-3 w-4/5 ${shimmer} bg-white/60 rounded-sm mb-6`}/>

                            {/* Fake Button */}
                            <div className={`h-12 w-full ${shimmer} bg-white/60 rounded-xl`}/>
                        </div>
                    </div>
                );

            case "gallery-item":
                return (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pointer-events-none">
                        {/* Column 1 */}
                        <div className="flex flex-col gap-4 translate-y-8">
                            <SkeletonLoader variant="text-block" className="h-48 rounded-3xl w-full"/>
                            <SkeletonLoader variant="text-block" className="h-64 rounded-3xl w-full"/>
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col gap-4">
                            <SkeletonLoader variant="text-block" className="h-64 rounded-3xl w-full"/>
                            <SkeletonLoader variant="text-block" className="h-48 rounded-3xl w-full"/>
                        </div>

                        {/* Column 3 (Hidden on mobile) */}
                        <div className="hidden md:flex flex-col gap-4 translate-y-12">
                            <SkeletonLoader variant="text-block" className="h-40 rounded-3xl w-full"/>
                            <SkeletonLoader variant="text-block" className="h-72 rounded-3xl w-full"/>
                        </div>
                    </div>
                );

            case "sermon-list":
                return (
                    <div className="max-w-7xl mx-auto px-4 md:px-6 mb-24 w-full -mt-8 relative z-20">
                        {/* 1. Fake Featured Sermon Card */}
                        <SkeletonLoader
                            variant="text-block"
                            className="max-w-5xl mx-auto h-48 md:h-72 lg:h-80 rounded-[20px] mb-12 shadow-2xl"
                        />

                        {/* 2. Fake Search & Filter Bar */}
                        <SkeletonLoader variant="filter-bar" className="mb-10 shadow-lg"/>

                        {/* 3. Fake Year Header */}
                        <SkeletonLoader variant="page-header"/>

                        {/* 4. Fake Month Container & Grid of Sermon Cards */}
                        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm w-full">
                            {/* Fake Month Title */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <SkeletonLoader variant="text-block" className="h-8 w-32"/>
                                <SkeletonLoader variant="text-block" className="h-4 w-8 rounded-full"/>
                            </div>

                            {/* Fake Grid of 4 Sermon Cards */}
                            <SkeletonLoader variant="sermon-card" count={4}/>
                        </div>
                    </div>
                )

            case "sermon-list-id":
                return (
                    <div className="bg-slate-50 min-h-screen pb-24 relative">
                        {/* 1. Fake Top Nav */}
                        <div
                            className="w-full max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-4 flex items-center justify-between">
                            <SkeletonLoader variant="text-block" className="h-8 w-48 rounded-full"/>
                        </div>

                        {/* 2. Fake Hero Header */}
                        <div className="w-full px-4 md:px-6 mb-8 md:mb-12">
                            <div className="max-w-6xl mx-auto">
                                <SkeletonLoader
                                    variant="text-block"
                                    className="h-[35vh] md:h-[45vh] lg:h-[50vh] rounded-[2rem] md:rounded-[3rem] w-full shadow-2xl bg-white"
                                />
                            </div>
                        </div>

                        {/* 3. Fake Main Content Area */}
                        <div className="max-w-6xl mx-auto px-4 md:px-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
                                {/* Left Column: Notes & Bible Text */}
                                <div className="lg:col-span-2 space-y-8 md:space-y-10">
                                    {/* Fake Bible Text */}
                                    <SkeletonLoader variant="text-block"
                                                    className="h-32 md:h-40 rounded-3xl md:rounded-[2rem] shadow-sm bg-white"/>

                                    {/* Fake Sermon Notes */}
                                    <div
                                        className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[2rem] border border-gray-100 shadow-sm">
                                        <SkeletonLoader variant="text-block" className="h-8 w-40 mb-6"/>
                                        <SkeletonLoader variant="text-block" className="h-64"/>
                                    </div>
                                </div>

                                {/* Right Column: Sticky Sidebar Elements */}
                                <div className="lg:col-span-1 space-y-6 md:space-y-8">
                                    <SkeletonLoader variant="text-block"
                                                    className="h-64 rounded-3xl border border-gray-100 shadow-sm bg-white"/>
                                    <SkeletonLoader variant="text-block"
                                                    className="h-48 rounded-3xl border border-gray-100 shadow-sm bg-white"/>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case "gallery-list":
                return (
                    <div className="max-w-7xl mx-auto px-4 md:px-6 mb-24 w-full -mt-8 relative z-20">
                        {/* 1. Fake the Search & Filter Bar */}
                        <SkeletonLoader variant="filter-bar" className="mb-12 shadow-xl"/>

                        {/* 2. Fake the Year Header */}
                        <SkeletonLoader variant="page-header"/>

                        {/* 3. Fake the Month Container & Grid of Albums */}
                        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm w-full">
                            {/* Fake Month Title */}
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <SkeletonLoader variant="text-block" className="h-8 w-32"/>
                                <SkeletonLoader variant="text-block" className="h-4 w-8 rounded-full"/>
                            </div>

                            {/* We use sermon-card here because the Gallery Albums look like sermon cards (cover image with the text below), while Gallery Items (individual photos) are just squares. */}
                            <SkeletonLoader variant="sermon-card" count={4}/>
                        </div>
                    </div>
                )

            case "gallery-list-id":
                return (
                    <div className="bg-slate-50 min-h-screen pb-24 relative">
                        {/* 1. Fake Top Nav */}
                        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-4">
                            <SkeletonLoader variant="text-block" className="h-8 w-40 rounded-full"/>
                        </div>

                        {/* 2. Fake Hero Banner */}
                        <div className="w-full px-4 md:px-6 mb-8 md:mb-12">
                            <div className="max-w-6xl mx-auto">
                                <SkeletonLoader
                                    variant="text-block"
                                    className="h-[35vh] md:h-[45vh] lg:h-[50vh] rounded-[2rem] md:rounded-[3rem] w-full shadow-lg"
                                />
                            </div>
                        </div>

                        {/* 3. Fake Content Area */}
                        <div className="max-w-6xl mx-auto px-4 md:px-6">
                            {/* Fake Media Header & Filter Tabs */}
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
                                <SkeletonLoader variant="text-block" className="h-8 w-48"/>
                                <SkeletonLoader variant="text-block" className="h-8 w-40 rounded-full hidden sm:block"/>
                            </div>

                            {/* Fake Grid of 6 Photos */}
                            <SkeletonLoader variant="gallery-item" count={6}/>
                        </div>
                    </div>
                );

            case "event-list":
                return (
                    <div className="bg-slate-50 min-h-screen pb-24">
                        {/* 1. Fake Hero Section */}
                        <div className="pt-24 pb-20 px-6 relative overflow-hidden bg-slate-900">
                            <div className="max-w-6xl mx-auto flex flex-col items-center">
                                <SkeletonLoader variant="text-block"
                                                className="h-4 w-40 bg-slate-800 rounded-full mb-4"/>
                                <SkeletonLoader variant="text-block"
                                                className="h-12 md:h-16 w-3/4 max-w-2xl bg-slate-800 rounded-xl mb-6"/>
                                <SkeletonLoader variant="text-block" className="h-4 w-1/2 bg-slate-800 rounded-full"/>
                            </div>
                        </div>

                        <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-10 relative z-20">
                            {/* 2. Fake Weekly Rhythm */}
                            <div className="mt-20 mb-20">
                                <div className="flex justify-between items-end mb-6 px-2">
                                    <SkeletonLoader variant="text-block" className="h-8 w-64"/>
                                    <SkeletonLoader variant="text-block"
                                                    className="h-10 w-48 rounded-full hidden md:block"/>
                                </div>
                                <div className="flex gap-4 overflow-hidden">
                                    <SkeletonLoader variant="text-block"
                                                    className="flex-1 min-w-[250px] h-32 rounded-2xl bg-white shadow-sm"/>
                                    <SkeletonLoader variant="text-block"
                                                    className="flex-1 min-w-[250px] h-32 rounded-2xl bg-white shadow-sm"/>
                                    <SkeletonLoader variant="text-block"
                                                    className="flex-1 min-w-[250px] h-32 rounded-2xl bg-white shadow-sm hidden md:block"/>
                                </div>
                            </div>

                            {/* 3. Fake Monthly Calendar */}
                            <div>
                                <div
                                    className="bg-white rounded-t-3xl p-4 md:p-6 flex justify-between shadow-sm z-10 relative border-b border-gray-100">
                                    <SkeletonLoader variant="text-block" className="h-8 w-48 md:w-64"/>
                                    <SkeletonLoader variant="text-block" className="h-10 w-32 md:w-48 rounded-2xl"/>
                                </div>
                                <div
                                    className="bg-white rounded-b-3xl p-4 md:p-8 shadow-sm min-h-[400px] space-y-4 md:space-y-6">

                                    {/* Fake List of 3 Event Cards */}
                                    {[1, 2, 3].map(i => (
                                        <div key={i}
                                             className="flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 rounded-3xl border border-gray-100">
                                            {/* Date Block */}
                                            <SkeletonLoader variant="text-block"
                                                            className="w-full md:w-32 h-24 md:h-32 rounded-2xl"/>

                                            {/* Info Block */}
                                            <div className="flex-1 flex flex-col justify-center">
                                                <div className="flex gap-2 mb-3">
                                                    <SkeletonLoader variant="text-block"
                                                                    className="h-5 w-20 rounded-md"/>
                                                </div>
                                                <SkeletonLoader variant="text-block" className="h-6 w-3/4 mb-2"/>
                                                <SkeletonLoader variant="text-block" className="h-4 w-1/2 mb-4"/>
                                                <div className="mt-auto flex gap-6 pt-4 border-t border-gray-100">
                                                    <SkeletonLoader variant="text-block" className="h-4 w-24"/>
                                                    <SkeletonLoader variant="text-block" className="h-4 w-32"/>
                                                </div>
                                            </div>

                                            {/* Image Block */}
                                            <SkeletonLoader variant="text-block"
                                                            className="w-full md:w-56 h-32 md:h-full rounded-2xl hidden md:block"/>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        </div>
                    </div>
                )

            case "weekly-event-list":
                return (
                    <div className="bg-slate-50 min-h-screen pb-24">
                        {/* 1. Fake Top Nav */}
                        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-4">
                            <SkeletonLoader variant="text-block" className="h-8 w-48 rounded-full"/>
                        </div>

                        <div className="max-w-5xl mx-auto px-4 md:px-6">
                            {/* 2. Fake Header */}
                            <div
                                className="mb-10 text-center md:text-left flex flex-col items-center md:items-start gap-3">
                                <SkeletonLoader variant="text-block" className="h-10 md:h-12 w-3/4 max-w-md"/>
                                <SkeletonLoader variant="text-block" className="h-4 w-64"/>
                            </div>

                            {/* 3. Fake List of Weekly Tracker Cards */}
                            <div className="flex flex-col gap-6">
                                {[1, 2].map(i => (
                                    <div key={i}
                                         className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10">
                                        {/* Left Side: Fake Countdown / Status */}
                                        <div
                                            className="flex flex-col items-center justify-center w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200/50 pb-6 md:pb-0 md:pr-10">
                                            <SkeletonLoader variant="text-block"
                                                            className="w-16 h-16 rounded-full mb-3"/>
                                            <SkeletonLoader variant="text-block" className="h-8 w-32 mb-2"/>
                                            <SkeletonLoader variant="text-block" className="h-3 w-24"/>
                                        </div>

                                        {/* Right Side: Fake Info & Sub-sessions */}
                                        <div className="flex-grow flex flex-col justify-center">
                                            {/* Fake Badges */}
                                            <div className="flex justify-center md:justify-start gap-2 mb-3">
                                                <SkeletonLoader variant="text-block" className="h-6 w-24 rounded-full"/>
                                                <SkeletonLoader variant="text-block" className="h-6 w-32 rounded-full"/>
                                            </div>

                                            {/* Fake Title & Location */}
                                            <SkeletonLoader variant="text-block" className="h-8 w-full md:w-3/4 mb-4"/>
                                            <SkeletonLoader variant="text-block"
                                                            className="h-4 w-48 mb-6 mx-auto md:mx-0"/>

                                            {/* Fake Sub-sessions Box */}
                                            <div
                                                className="bg-slate-50 rounded-2xl border border-gray-100 p-4 space-y-3">
                                                <SkeletonLoader variant="text-block" className="h-3 w-32 mb-1"/>
                                                <SkeletonLoader variant="text-block"
                                                                className="h-14 w-full rounded-xl"/>
                                                <SkeletonLoader variant="text-block"
                                                                className="h-14 w-full rounded-xl"/>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )

            case "filter-bar":
                return (
                    <div
                        className={`bg-white p-3 md:p-4 shadow-sm border border-gray-100 rounded-xl w-full flex flex-col gap-4 ${className}`}>
                        <div className="flex gap-4 items-center">
                            <div className={`h-10 w-24 ${shimmer} rounded-full`}/>
                            <div className={`h-10 w-24 ${shimmer} rounded-full`}/>
                            <div className={`h-10 w-24 ${shimmer} rounded-full`}/>
                            <div className={`h-10 flex-1 ${shimmer} rounded-full ml-auto`}/>
                        </div>
                    </div>
                );

            case "page-header":
                return (
                    <div
                        className={`flex items-center justify-between w-full pb-2 mb-6 border-b-[3px] border-gray-200 ${className}`}>
                        <div className="flex items-center gap-4">
                            <div className={`h-10 md:h-14 w-32 md:w-48 ${shimmer} rounded-lg`}/>
                            <div className={`h-6 w-20 ${shimmer} rounded-full mt-2`}/>
                        </div>
                        <div className={`h-10 w-10 ${shimmer} rounded-full`}/>
                    </div>
                );

            case "text-block":
            default:
                return (
                    <div className={`w-full ${shimmer} rounded-lg ${className}`}/>
                );
        }
    };

    // If count > 1, wrap it in the responsive grid you use across the site
    if (count > 1) {
        return (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full ${className}`}>
                {Array.from({length: count}).map((_, i) => (
                    <React.Fragment key={i}>
                        {renderSkeleton()}
                    </React.Fragment>
                ))}
            </div>
        );
    }

    // Otherwise, return a single skeleton
    return <>{renderSkeleton()}</>;
}