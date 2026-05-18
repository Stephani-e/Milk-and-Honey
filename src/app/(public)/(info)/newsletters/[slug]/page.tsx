import React from "react";
import Link from "next/link";
import {AlertTriangle, ArrowLeft, Calendar, Clock, User} from "lucide-react";
import {supabase} from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function NewsletterArticlePage({
                                                        params,
                                                        searchParams
                                                    }: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ preview?: string }>
}) {
    // 1. AWAIT the params before trying to read them! (This fixes the blank slug issue)
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const slug = resolvedParams.slug;
    const isPreview = resolvedSearchParams.preview === 'true';

    // 2. Build the query using the safely extracted 'slug'
    let query = supabase
        .from('newsletters')
        .select('*')
        .eq('slug', slug);

    // If it's NOT a preview, strictly enforce that it must be published
    if (!isPreview) {
        query = query.eq('is_published', true);
    }

    const {data: newsletter, error} = await query.single();

    // 3. SMART ERROR HANDLING
    if (error || !newsletter) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <AlertTriangle size={64} className="text-amber-500 mb-6 animate-pulse"/>
                <h1 className="text-3xl font-serif font-black text-brand-primary mb-2">Article Not Found</h1>
                <p className="text-gray-500 mb-8 max-w-md">We couldn't locate this update. It may have been deleted,
                    unpublished, or the URL might be incorrect.</p>

                {/* Admin Debug Box */}
                <div
                    className="bg-white p-6 rounded-2xl border border-red-100 shadow-lg text-left text-xs font-mono text-red-600 mb-8 max-w-lg w-full overflow-auto">
                    <strong className="text-red-800 uppercase tracking-widest text-[10px] block mb-2">Developer Debug
                        Info:</strong>
                    Requested Slug: <span
                    className="text-gray-900 font-bold bg-red-100 px-1">{slug || "UNDEFINED/BLANK"}</span><br/><br/>
                    Database Response:<br/>
                    {error?.message || "Error: 0 Rows Returned. The slug doesn't exist, or the post isn't published yet."}
                </div>

                <Link href="/newsletters"
                      className="bg-brand-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                    Return to Newsletters
                </Link>
            </div>
        );
    }

    // 4. SUCCESS: Render the Newsletter
    return (
        <div className="bg-slate-50 min-h-screen pb-24 font-sans">

            {/* Article Hero Header */}
            <section className="bg-brand-primary pt-12 pb-24 px-6 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="flex items-center justify-between mb-10">
                        <Link href="/newsletters"
                              className="inline-flex items-center gap-2 text-brand-secondary hover:text-white font-bold text-sm transition-colors">
                            <ArrowLeft size={16}/> Back to Updates
                        </Link>
                        {isPreview && (
                            <span
                                className="bg-amber-400 text-amber-950 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                                Admin Preview Mode
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-white leading-tight mb-6">
                        {newsletter.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-300">
                        <span className="flex items-center gap-2"><User size={16}
                                                                        className="text-brand-secondary"/> {newsletter.author_name}</span>
                        {newsletter.published_at ? (
                            <>
                                <span className="flex items-center gap-2"><Calendar size={16}
                                                                                    className="text-brand-secondary"/> {new Date(newsletter.published_at).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}</span>
                                <span className="flex items-center gap-2"><Clock size={16}
                                                                                 className="text-brand-secondary"/> {new Date(newsletter.published_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</span>
                            </>
                        ) : (
                            <span className="text-amber-400 font-bold italic">Unpublished Draft</span>
                        )}
                    </div>
                </div>
            </section>

            {/* Article Content Body */}
            <main className="max-w-5xl mx-auto px-6 -mt-12 relative z-20">
                <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden w-full">

                    {/* Optional Cover Image */}
                    {newsletter.cover_image_url && (
                        <div
                            className="w-full aspect-video md:aspect-[21/9] bg-slate-100 relative border-b border-gray-100">
                            <img
                                src={newsletter.cover_image_url}
                                alt={newsletter.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* The Rich Text Output */}
                    <div className="p-8 md:p-12 lg:p-16 w-full">
                        <div
                            className="text-black leading-loose text-lg
                                [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl
                                [&>h1]:text-4xl [&>h1]:font-serif [&>h1]:font-black [&>h1]:text-brand-primary [&>h1]:mb-6 [&>h1]:mt-10
                                [&>h2]:text-3xl [&>h2]:font-serif [&>h2]:font-bold [&>h2]:text-brand-primary [&>h2]:mb-4 [&>h2]:mt-8
                                [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-gray-900 [&>h3]:mb-3 [&>h3]:mt-6
                                [&>p]:mb-6 [&>p]:text-gray-600
                                [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2
                                [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2
                                [&>a]:text-brand-secondary [&>a]:underline [&>a]:font-bold [&>a]:break-all
                                [&>blockquote]:border-l-4 [&>blockquote]:border-brand-secondary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:bg-slate-50 [&>blockquote]:py-2 [&>blockquote]:mb-6"
                            dangerouslySetInnerHTML={{__html: newsletter.content.replace(/&nbsp;/g, ' ')}}
                        />
                    </div>
                </div>
            </main>

        </div>
    );
}