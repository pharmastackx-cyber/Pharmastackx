'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { Box, CircularProgress } from '@mui/material';

// A lean component that triggers the modal and redirects.
function AuthTrigger() {
    const { openModal } = useAuthModal();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Open the modal.
        openModal();

        // Construct the redirect URL. Default to homepage if no redirect is specified.
        const redirectUrl = searchParams.get('redirect') || '/';
        
        // Replace the current history entry with the target URL.
        // This ensures the user doesn't get stuck in a back-button loop.
        router.replace(redirectUrl);

    }, [openModal, router, searchParams]);

    
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
}

// We must wrap with Suspense because AuthTrigger uses useSearchParams.
export default function AuthPage() {
    return (
        <React.Suspense fallback={<CircularProgress />}>
            <AuthTrigger />
        </React.Suspense>
    );
}
