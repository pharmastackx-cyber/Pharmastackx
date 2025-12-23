'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoginForm from '../auth/LoginForm';
import SignupForm from '../auth/SignupForm';
import ForgotPasswordForm from '../auth/ForgotPasswordForm';
import { Box, Typography, Paper, Link as MuiLink, Tabs, Tab, CircularProgress, Button, Alert } from '@mui/material';

function AuthViewSwitcher() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialView = searchParams?.get('view') === 'signup' ? 'signup' : 'login';
    const [view, setView] = useState(initialView);
    const [showForgotPasswordSuccess, setShowForgotPasswordSuccess] = useState(false);

    const redirectUrl = searchParams?.get('redirect') || null;

    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setView(newValue);
    };

    const handleForgotPasswordSuccess = () => {
        setShowForgotPasswordSuccess(true);
        setTimeout(() => {
            setShowForgotPasswordSuccess(false);
            router.push('/auth');
        }, 3000); // Redirect after 3 seconds
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
                maxHeight: '90vh', 
                overflowY: 'auto',   
            }}
        >
            {showForgotPasswordSuccess ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Password reset link sent successfully! You will be redirected shortly.
                    </Alert>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {view !== 'forgotPassword' && (
                        <Tabs
                            value={view}
                            onChange={(e, val) => handleTabChange(e, val)}
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
                            }}
                        >
                            <Tab label="Login" value="login" />
                            <Tab label="Sign Up" value="signup" />
                        </Tabs>
                    )}

                    {view === 'login' && (
                        <Box>
                            <Typography variant="h5" component="h1" sx={{ textAlign: 'center', fontWeight: 700, mb: 2 }}>
                                Welcome Back
                            </Typography>
                            <LoginForm redirectUrl={redirectUrl} />
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Button onClick={() => setView('forgotPassword')} sx={{ textTransform: 'none', color: 'teal' }}>
                                    Forgot Password?
                                </Button>
                            </Box>
                        </Box>
                    )}
                    {view === 'signup' && (
                        <Box>
                            <Typography variant="h5" component="h1" sx={{ textAlign: 'center', fontWeight: 700, mb: 2 }}>
                                Create an Account
                            </Typography>
                            <SignupForm redirectUrl={redirectUrl} />
                        </Box>
                    )}
                    {view === 'forgotPassword' && (
                        <Box>
                            <ForgotPasswordForm onSuccess={handleForgotPasswordSuccess} />
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Button onClick={() => setView('login')} sx={{ textTransform: 'none', color: 'teal' }}>
                                    Back to Login
                                </Button>
                            </Box>
                        </Box>
                    )}
                </>
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
