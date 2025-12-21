'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthModal } from '@/contexts/AuthModalContext';

// A lean component that triggers the modal and redirects.
function AuthTrigger() {
    const { openModal } = useAuthModal();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Open the modal.
        openModal();

        // Construct the redirect URL. Default to homepage if no redirect is specified.
        const redirectUrl = searchParams?.get('redirect') || '/';
        
        // Replace the current history entry with the target URL.
        // This creates the illusion that the modal is appearing over the previous page.
        router.replace(redirectUrl);

    }, [openModal, router, searchParams]);

    // This component renders nothing, as its only job is to trigger side effects.
    return null;
}

// We must wrap with Suspense because AuthTrigger uses useSearchParams.
// This page itself is invisible to the user.
export default function AuthPage() {
    return (
        <React.Suspense fallback={null}>
            <AuthTrigger />
        </React.Suspense>
    );
}
