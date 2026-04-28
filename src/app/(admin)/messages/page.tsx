"use client";
import React, { useState, useEffect } from "react";
import {
    Search, Filter, Mail, MailOpen,
    CheckCircle2, Clock, Reply, Trash2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Types for TypeScript
interface Message {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'resolved';
    created_at: string;
}

// Dummy data to visualize the UI before connecting Supabase
const dummyMessages: Message[] = [
    {
        id: "1", name: "David Olatunji", email: "david.o@example.com", phone: "+234 800 111 2222",
        subject: "prayer", message: "Please keep my family in your prayers as we travel this weekend.",
        status: "unread", created_at: "2026-04-28T10:00:00Z"
    },
    {
        id: "2", name: "Sarah Peters", email: "sarah.p@example.com", phone: "",
        subject: "technical", message: "I tried to download the latest sermon audio but the link seems to be broken.",
        status: "read", created_at: "2026-04-27T15:30:00Z"
    }
];

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>(dummyMessages);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread' | 'resolved'>('all');

    // Fetch messages from Supabase (Uncomment when ready)
    /*
    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setMessages(data);
    };
    */

    const updateStatus = async (id: string, newStatus: 'unread' | 'read' | 'resolved') => {
        // Update Local State for instant UI feedback
        setMessages(messages.map(msg => msg.id === id ? { ...msg, status: newStatus } : msg));
        if (selectedMessage?.id === id) {
            setSelectedMessage({ ...selectedMessage, status: newStatus });
        }

        // Update Supabase
        // await supabase.from('contact_messages').update({ status: newStatus }).eq('id', id);
    };

    const filteredMessages = messages.filter(msg => {
        if (filter === 'unread') return msg.status === 'unread';
        if (filter === 'resolved') return msg.status === 'resolved';
        return true;
    });

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-slate-50 overflow-hidden">

            {/* LEFT PANE: Message List */}
            <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
                {/* Header & Filters */}
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-serif font-black text-brand-primary mb-4">Inbox</h2>
                    <div className="flex gap-2">
                        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</button>
                        <button onClick={() => setFilter('unread')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === 'unread' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Unread</button>
                        <button onClick={() => setFilter('resolved')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Resolved</button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredMessages.map((msg) => (
                        <div
                            key={msg.id}
                            onClick={() => {
                                setSelectedMessage(msg);
                                if (msg.status === 'unread') updateStatus(msg.id, 'read');
                            }}
                            className={`p-6 border-b border-gray-50 cursor-pointer transition-colors ${selectedMessage?.id === msg.id ? 'bg-amber-50/50 border-l-4 border-l-amber-400' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-bold ${msg.status === 'unread' ? 'text-brand-primary' : 'text-gray-700'}`}>{msg.name}</h4>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {new Date(msg.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{msg.subject}</span>
                                {msg.status === 'unread' && <span className="w-2 h-2 bg-brand-primary rounded-full"></span>}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{msg.message}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT PANE: Reading View */}
            <div className="w-2/3 bg-slate-50/50 flex flex-col">
                {selectedMessage ? (
                    <>
                        {/* Reading View Header / Toolbar */}
                        <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-xl text-brand-primary uppercase">
                                    {selectedMessage.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-brand-primary">{selectedMessage.name}</h3>
                                    <p className="text-sm text-gray-500">{selectedMessage.email} {selectedMessage.phone && `• ${selectedMessage.phone}`}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <a href={`mailto:${selectedMessage.email}?subject=Re: Milk & Honey Inquiry`} className="p-2 text-slate-400 hover:text-brand-primary hover:bg-slate-100 rounded-lg transition-colors tooltip" title="Reply via Email">
                                    <Reply size={20} />
                                </a>
                                {selectedMessage.status !== 'resolved' ? (
                                    <button onClick={() => updateStatus(selectedMessage.id, 'resolved')} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-bold text-sm transition-colors">
                                        <CheckCircle2 size={16} /> Mark Resolved
                                    </button>
                                ) : (
                                    <button onClick={() => updateStatus(selectedMessage.id, 'read')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg font-bold text-sm transition-colors">
                                        <Clock size={16} /> Reopen
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Message Body */}
                        <div className="p-10 flex-1 overflow-y-auto">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                                <span className="inline-block px-4 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-widest rounded-full mb-6">
                                    Category: {selectedMessage.subject}
                                </span>
                                <p className="text-gray-700 leading-loose whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MailOpen size={64} className="mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-gray-500 mb-2">No Message Selected</h3>
                        <p className="text-sm">Select a message from the inbox to read it here.</p>
                    </div>
                )}
            </div>

        </div>
    );
}