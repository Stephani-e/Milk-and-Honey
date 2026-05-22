"use client";
import React, {useEffect, useState} from "react";
import {supabase} from "@/lib/supabase";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {UploadButton} from "@/utils/uploadthing";
import {toast} from "sonner";
import ConfirmModal from "@/components/Admin/ConfirmModal";
import "react-quill-new/dist/quill.snow.css";
import dynamic from "next/dynamic";
import AdminSkeletonLoader from "@/components/Admin/SkeletonLoader";

const ReactQuill = dynamic(() => import("react-quill-new"), {ssr: false});

export default function NewNewsletterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    // Modal & Media State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [mediaAction, setMediaAction] = useState<{ action: 'delete' | 'change' } | null>(null);
    const [imageUploaded, setImageUploaded] = useState(false);

    // Publishing State
    const [publishStatus, setPublishStatus] = useState<"draft" | "publish_now" | "schedule">("draft");
    const [scheduleDate, setScheduleDate] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        author_name: "Admin Team",
        cover_image_url: "",
        is_celebration: false,
    });

    // Quill Toolbar Configuration
    const quillModules = {
        toolbar: [
            [{'header': [1, 2, 3, 4, 5, 6, false]}],
            [{'font': []}, {'size': ['small', false, 'medium', 'large', 'huge']}],
            ['bold', 'italic', 'underline', 'strike'],
            [{'script': 'sub'}, {'script': 'super'}],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'list': 'unordered'}],
            [{'color': []}, {'background': []}],
            [{'indent': '-1'}, {'indent': '+1'}],
            [{'align': []}],
            ['blockquote', 'code-block', 'link'],
            ['clean']
        ],
    };

    // Load Draft on Mount
    useEffect(() => {
        const savedDraft = localStorage.getItem("newsletter_draft");
        if (savedDraft) {
            const draft = JSON.parse(savedDraft);
            setFormData(draft.formData);
            setPublishStatus(draft.publishStatus || "draft");
            setScheduleDate(draft.scheduleDate || "");
            if (draft.formData.cover_image_url) setImageUploaded(true);
        }
        setInitialFetchDone(true);
    }, []);

    // Save Draft on Change
    useEffect(() => {
        if (initialFetchDone) {
            const draft = {formData, publishStatus, scheduleDate};
            localStorage.setItem("newsletter_draft", JSON.stringify(draft));
        }
    }, [formData, publishStatus, scheduleDate, initialFetchDone]);

    // Input Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setFormData({...formData, title, slug});
    };

    // --- LOAD TEMPLATE CONTENT ---
    const loadWeeklyTemplate = () => {
        const templateHTML = `
            <h2><strong>This Week at Milk &amp; Honey</strong></h2>
            <p>Happy Sunday family! Here is a quick look back at what God did this week, and everything you need to stay connected.</p>
            <p><br></p>
            <h3><strong> A Look Back</strong></h3>
            <p>[Write 2–3 sentences here summarizing the week's main message, a special moment from worship, or a community highlight...]</p>
            <p><br></p>
            <h3><strong>Catch Up on the Word</strong></h3>
            <p>Did you miss this week's message or just want to hear it again?</p>
            <ul>
               <li> <a href="${window.location.origin}/sermons" rel="noopener noreferrer" target="_blank">Listen to the latest Sermon here</a></li>
            </ul>
            <p><br></p>
            <h3><strong>Family Moments</strong></h3>
            <p>We've uploaded new photos from our latest gatherings.</p>
            <ul>
                <li><a href="${window.location.origin}/gallery" rel="noopener noreferrer" target="_blank">View the Event Gallery here</a></li>
            </ul>
            <p><br></p>
            <h3><strong>Stay Connected Mid-Week</strong></h3>
            <p>Follow us for daily encouragement and updates:</p>
            <ul>
                <li><a href="https://instagram.com/yourhandle" rel="noopener noreferrer" target="_blank">Instagram</a></li>
                <li><a href="https://twitter.com/yourhandle" rel="noopener noreferrer" target="_blank">X (Twitter)</a></li>
            </ul>
        `;

        // Update both the content and suggest a title
        setFormData(prev => ({
            ...prev,
            content: templateHTML,
            title: prev.title || "Weekly Family Update",
            author_name: prev.author_name || "Admin Team"
        }));

        toast.success("Weekly template loaded!");
    };

    // Media Handlers
    const triggerMediaAction = (action: 'delete' | 'change') => {
        setMediaAction({action});
        setShowDeleteModal(true);
    };

    const handleConfirmMediaAction = () => {
        if (!mediaAction) return;
        setFormData({...formData, cover_image_url: ""});
        setImageUploaded(false);
        toast.success("Cover image removed");
        setShowDeleteModal(false);
        setMediaAction(null);
    };

    // Submit Handler
    const handleSubmit = async (targetAction: 'draft' | 'publish') => {
        if (!formData.title || !formData.content) {
            return toast.error("Title and Content are required.");
        }

        if (targetAction === 'publish' && publishStatus === "schedule" && !scheduleDate) {
            return toast.error("Please select a date and time to schedule the newsletter.");
        }

        setLoading(true);

        // Calculate database values
        const is_published = targetAction === 'publish';
        let published_at = null;

        if (targetAction === 'publish') {
            if (publishStatus === "publish_now") {
                published_at = new Date().toISOString();
            } else if (publishStatus === "schedule") {
                published_at = new Date(scheduleDate).toISOString();
            }
        }

        const submission = {
            ...formData,
            is_published,
            published_at,
            is_archived: false,
            push_notification_sent: (targetAction === 'publish' && publishStatus === "publish_now"),
            is_celebration: formData.is_celebration,
        };

        // 1. Save to Database
        const {error} = await supabase.from("newsletters").insert([submission]);

        if (error) {
            if (error.code === '23505') {
                toast.error("A newsletter with this URL slug already exists. Please change the title.");
            } else {
                toast.error(`Database Error: ${error.message}`);
            }
            setLoading(false);
        } else {

            // 2. TRIGGER NOTIFICATION BLAST (Only for Immediate Publishing)
            if (targetAction === 'publish' && publishStatus === "publish_now") {
                try {
                    const pushRes = await fetch("/api/push/send", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            title: `New Update: ${formData.title}`,
                            body: formData.excerpt || "Tap to read the latest from Milk & Honey.",
                            url: `${window.location.origin}/newsletters/${formData.slug}`
                        })
                    });

                    const pushData = await pushRes.json();

                    if (pushData.success && pushData.count > 0) {
                        toast.success(`Live! Push notification sent to ${pushData.count} subscribers `);
                    } else {
                        toast.success("Newsletter Published! (No subscribers to notify yet)");
                    }
                } catch (err) {
                    console.error("Push blast failed:", err);
                    toast.success("Newsletter Published! (But push notification failed to send)");
                }
            } else {
                toast.success(targetAction === 'publish' ? "Newsletter Scheduled Successfully!" : 'Saved to Drafts');
            }

            // 3. Cleanup and Redirect
            localStorage.removeItem("newsletter_draft"); // Clear cache on success

            const targetPath = targetAction === 'publish' ? "/admin/newsletters" : "/admin/newsletters?tab=draft";
            router.push(targetPath);
            router.refresh();
        }
    };

    if (!initialFetchDone) {
        return (
            <div className="min-h-screen bg-brand-surface p-6 md:p-12">
                <AdminSkeletonLoader variant="newsletter-form"/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-surface p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/admin/newsletters" className="text-sm font-bold text-brand-secondary mb-6 block">
                        ← Back to Newsletter Dashboard
                    </Link>
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold">Draft Auto-Saved</span>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-accent">
                    <h1 className="text-3xl font-serif font-bold text-brand-primary mb-8">
                        Draft Newsletter
                    </h1>

                    <form className="space-y-10">

                        {/* Step 1: General Info */}
                        <div className="space-y-6">
                            <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 1:
                                General Information</label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Newsletter
                                        Title</label>
                                    <input
                                        required
                                        name="title"
                                        placeholder="e.g. May 2026 Update"
                                        className="w-full p-3 border rounded-lg text-brand-primary font-bold"
                                        value={formData.title}
                                        onChange={handleTitleChange}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Author
                                        Name</label>
                                    <input
                                        required
                                        name="author_name"
                                        placeholder="Admin Team"
                                        className="w-full p-3 border rounded-lg text-brand-primary"
                                        value={formData.author_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div
                                    className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl border border-pink-100">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_celebration}
                                        onChange={(e) => setFormData({...formData, is_celebration: e.target.checked})}
                                        className="w-5 h-5 accent-pink-500"
                                    />
                                    <div>
                                        <div className="font-bold text-pink-900 text-sm">Celebratory News</div>
                                        <div className="text-[10px] text-pink-700">Birthday, Wedding, Birth
                                            announcement. Changes the post style!
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">URL
                                    Slug</label>
                                <div className="flex items-center">
                                    <span
                                        className="bg-gray-100 text-gray-500 p-3 rounded-l-lg border border-r-0 text-sm font-medium">website.com/newsletters/</span>
                                    <input
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-white border rounded-r-lg text-sm text-gray-700 font-medium outline-none focus:border-brand-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Short
                                    Excerpt (For Preview Cards)</label>
                                <textarea
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="A quick 1-2 sentence summary..."
                                    className="w-full p-3 bg-white border rounded-lg text-gray-700 resize-none outline-none focus:border-brand-primary"
                                />
                            </div>
                        </div>

                        {/* Step 2: Cover Image */}
                        <div className="pt-10 border-t border-gray-100 space-y-6">
                            <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 2:
                                Cover Image</label>

                            <div className="bg-brand-surface p-6 rounded-2xl border border-brand-accent max-w-md">
                                {imageUploaded && formData.cover_image_url ? (
                                    <div
                                        className="bg-white border border-brand-accent p-3 rounded-2xl shadow-sm flex flex-col gap-3 animate-in fade-in">
                                        <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative">
                                            <img src={formData.cover_image_url} alt="Cover Preview"
                                                 className="w-full h-full object-cover"/>
                                        </div>
                                        <div className='flex justify-between items-center px-1'>
                                            <span className="text-[9px] font-bold text-green-600 uppercase">Image Uploaded</span>
                                            <div className="flex gap-3">
                                                <button type="button" onClick={() => triggerMediaAction('change')}
                                                        className="text-[10px] underline font-bold text-blue-600">Change
                                                </button>
                                                <button type="button" onClick={() => triggerMediaAction('delete')}
                                                        className="text-[10px] underline font-bold text-red-500">Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <UploadButton
                                        endpoint="imageUploader"
                                        appearance={{
                                            button: "w-full bg-brand-primary text-white text-[10px] p-4 rounded-xl after:bg-brand-secondary",
                                            allowedContent: "text-brand-secondary text-[10px] font-bold uppercase",
                                        }}
                                        content={{
                                            button({ready}) {
                                                if (ready) return "Select Cover Image";
                                                return "Loading...";
                                            },
                                        }}
                                        onClientUploadComplete={(res) => {
                                            setFormData({...formData, cover_image_url: res[0].url});
                                            setImageUploaded(true);
                                            toast.success("Cover image uploaded successfully");
                                        }}
                                        onUploadError={(error) => {
                                            toast.error(`Upload Failed: ${error.message}`);
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Step 3: Content */}
                        <div className="pt-10 border-t border-gray-100 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-purple-400">Step 3:
                                    Newsletter Content</label>

                                <button
                                    type="button"
                                    onClick={loadWeeklyTemplate}
                                    className="text-[10px] bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest hover:bg-purple-100 transition-colors flex items-center gap-1 w-fit"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                    Load Weekly Template
                                </button>
                            </div>

                            <div
                                className="bg-white rounded-lg border border-gray-300 w-full flex flex-col overflow-hidden shadow-sm">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={(content) => setFormData({...formData, content})}
                                    modules={quillModules}
                                    className="flex flex-col text-black h-96 sm:h-[500px] [&_.ql-container]:flex-1 [&_.ql-container]:overflow-y-auto"
                                />
                            </div>
                        </div>

                        {/* Step 4: Publishing Strategy */}
                        <div className="pt-10 border-t border-gray-100 space-y-6">
                            <label className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Step 4:
                                Publishing Strategy</label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label
                                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${publishStatus === "publish_now" ? "border-green-500 bg-green-50/50" : "border-gray-100"}`}>
                                    <input
                                        type="radio"
                                        name="publishStatus"
                                        checked={publishStatus === "publish_now"}
                                        onChange={() => setPublishStatus("publish_now")}
                                        className="mt-1 accent-green-600"
                                    />
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">Publish Immediately</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">Make live and notify users
                                            instantly.
                                        </div>
                                    </div>
                                </label>

                                <label
                                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${publishStatus === "schedule" ? "border-blue-500 bg-blue-50/50" : "border-gray-100"}`}>
                                    <input
                                        type="radio"
                                        name="publishStatus"
                                        checked={publishStatus === "schedule"}
                                        onChange={() => setPublishStatus("schedule")}
                                        className="mt-1 accent-blue-600"
                                    />
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">Schedule for Later</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">Automate publish date and
                                            notifications.
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {publishStatus === "schedule" && (
                                <div
                                    className="mt-4 p-4 bg-slate-50 border border-gray-100 rounded-xl animate-in fade-in slide-in-from-top-2 max-w-sm">
                                    <label
                                        className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Select
                                        Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={scheduleDate}
                                        onChange={(e) => setScheduleDate(e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-brand-primary"
                                    />
                                    <p className="text-[10px] text-blue-600 mt-2 font-bold">
                                        💡 Pro Tip: Schedule for 1:29, 2:29, etc. (at least 1 minute before the top or
                                        half-hour)
                                        to ensure notifications go out immediately!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Step 5: Save/Publish Buttons */}
                        <div className="pt-10 border-t border-gray-100">
                            <div className="flex flex-col md:flex-row gap-4 pt-1">
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => handleSubmit('draft')}
                                    className="flex-1 bg-white border-2 border-brand-primary text-brand-primary py-5 rounded-2xl font-bold hover:bg-brand-primary/5 transition-all"
                                >
                                    {loading ? "Saving..." : "Save as Draft"}
                                </button>

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => handleSubmit('publish')}
                                    className="flex-[2] bg-brand-primary text-white py-5 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all"
                                >
                                    {loading ? "Processing..." : publishStatus === "schedule" ? "Schedule Newsletter" : "Publish Newsletter Live"}
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                title={mediaAction?.action === 'delete' ? "Remove Cover Image?" : "Replace Cover Image?"}
                message={
                    mediaAction?.action === 'delete'
                        ? "Are you sure you want to remove this image?"
                        : "This will remove the current image so you can upload a new one. Do you want to proceed?"
                }
                variant={mediaAction?.action === 'delete' ? "danger" : "primary"}
                confirmText={mediaAction?.action === 'delete' ? "Yes, Remove" : "Yes, Replace"}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmMediaAction}
            />
        </div>
    );
}