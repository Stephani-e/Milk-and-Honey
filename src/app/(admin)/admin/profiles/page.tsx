"use client";

import React from "react";
import { useAuth } from "@/components/Admin/Admin Guard";
import ProfilesManagement from "@/app/(admin)/admin/profiles/ProfileManagement";

export default function SuperAdminPage() {
    // 1. We call our global hook.
    const { role } = useAuth();

    // 2. Extra safety fallback (though AdminGuard handles the visual rejection state)
    if (role !== 'super-admin') return null;

    // 3. Render the management dashboard!
    return <ProfilesManagement />;
}