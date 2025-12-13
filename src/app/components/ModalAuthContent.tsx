'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '../auth/LoginForm';
import SignupForm from '../auth/SignupForm';
import { Box, Typography, Paper, Link as MuiLink, Tabs, Tab, CircularProgress } from '@mui/material';

function AuthViewSwitcher() {
    const searchParams = useSearchParams();
    const initialView = searchParams.get('view') === 'signup' ? 1 : 0;
    const [tabIndex, setTabIndex] = useState(initialView);

    const redirectUrl = searchParams.get('redirect');

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    return (
        <Paper 
            elevation={8}
            sx={{
                p: { xs: 2, sm: 4 }, 
                width: '100%',
                maxWidth: '420px', 
                borderRadius: '16px',
                bgcolor: 'background.paper',
                // Add scrolling for long content
                maxHeight: '90vh', // Set a max height
                overflowY: 'auto',   // Enable vertical scrolling when needed
            }}
        >
            <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ 
                    mb: 3, 
                    position: 'sticky', 
                    top: 0, 
                    background: 'white', 
                    zIndex: 1,
                    '& .MuiTabs-indicator': {
                        backgroundColor: 'teal',
                    },
                    '& .MuiTab-root.Mui-selected': {
                        color: 'teal',
                    },
                }} // Make tabs sticky
            >
                <Tab label="Login" />
                <Tab label="Sign Up" />
            </Tabs>

            {tabIndex === 0 && (
                <Box>
                    <Typography variant="h5" component="h1" sx={{ textAlign: 'center', fontWeight: 700, mb: 2 }}>
                        Welcome Back
                    </Typography>
                    <LoginForm redirectUrl={redirectUrl} />
                </Box>
            )}
            {tabIndex === 1 && (
                <Box>
                    <Typography variant="h5" component="h1" sx={{ textAlign: 'center', fontWeight: 700, mb: 2 }}>
                        Create an Account
                    </Typography>
                    <SignupForm redirectUrl={redirectUrl} />
                </Box>
            )}
        </Paper>
    );
}

export default function ModalAuthContent() {
    return (
        <Suspense fallback={<CircularProgress />}>
            <AuthViewSwitcher />
        </Suspense>
    );
}
