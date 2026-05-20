"use client"
import {usePathname} from "next/navigation";
import PublicNotFound from '@/app/(public)/not-found';
import AdminNotFound from "@/app/(admin)/admin/not-found";

export default function GlobalNotFound() {

    const pathname = usePathname();

    if (pathname.startsWith('/admin')) {
        return <AdminNotFound/>;
    }
    return <PublicNotFound/>;
}