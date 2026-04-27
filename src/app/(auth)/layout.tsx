import React from "react";
import Link from "next/link";

export default function AuthLayout({
                                       children
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
        </>
    );
}