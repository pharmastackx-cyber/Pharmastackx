
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "@/context/SessionProvider";
import { Box, Typography, Avatar, Button, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import { Person, VpnKey, Logout, Info, ContactMail, Business, LocationOn, MarkEmailRead, Pending, VerifiedUser } from "@mui/icons-material";
import FileUpload from './FileUpload';

interface AccountContentProps {
    setView: (view: string) => void;
}

// Define a more detailed user interface
interface DetailedUser {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    role: 'user' | 'pharmacist' | 'pharmacy';
    businessName?: string;
    businessAddress?: string;
    slug?: string;
    state?: string;
    city?: string;
    emailVerified: boolean;
    professionalVerificationStatus: 'not_started' | 'pending_review' | 'approved' | 'rejected';
}

const AccountContent = ({ setView }: AccountContentProps) => {
    const { user: sessionUser, isLoading: isSessionLoading } = useSession();
    const [detailedUser, setDetailedUser] = useState<DetailedUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editData, setEditData] = useState<Partial<DetailedUser>>({});
    const [resendStatus, setResendStatus] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            if (sessionUser) {
                try {
                    setIsLoading(true);
                    const response = await fetch('/api/account');
                    if (!response.ok) {
                        throw new Error('Failed to fetch account details.');
                    }
                    const data = await response.json();
                    setDetailedUser(data);
                    setEditData(data);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (!isSessionLoading) {
            if (sessionUser) {
                fetchUserData();
            } else {
                router.push('/auth');
            }
        }
    }, [sessionUser, isSessionLoading, router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/auth';
        } catch (error) {
            console.error('An error occurred during logout:', error);
        }
    };

    const handleEdit = () => {
        setIsEditMode(true);
    };

    const handleClose = () => {
        setIsEditMode(false);
    };

    const handleSave = async () => {
        try {
            const response = await fetch('/api/account', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editData),
            });

            if (!response.ok) {
                throw new Error('Failed to update account details.');
            }

            const updatedUser = await response.json();
            setDetailedUser(updatedUser);
            setIsEditMode(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleResendVerification = async () => {
        setResendStatus('sending');
        try {
            const response = await fetch('/api/auth/resend-verification', { method: 'POST' });
            if (!response.ok) {
                throw new Error('Failed to send verification email.');
            }
            setResendStatus('sent');
        } catch (err) {
            setResendStatus('error');
        }
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploadStatus('uploading');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/account/upload-verification', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('File upload failed.');
            }

            const data = await response.json();
            setDetailedUser(prev => prev ? { ...prev, professionalVerificationStatus: 'pending_review' } : null);
            setUploadStatus('success');
        } catch (err) {
            setUploadStatus('error');
        }
    };

    if (isSessionLoading || isLoading) {
        return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
    }

    if (error || !detailedUser) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography sx={{color: 'grey.800'}}>Error: {error || 'Could not load user data.'}</Typography>
                <Button variant="contained" onClick={() => window.location.href = '/auth'} sx={{ mt: 2 }}>
                    Login
                </Button>
            </Box>
        );
    }

    const renderRoleSpecificDetails = () => {
        return (
            <Box sx={{ width: '100%', mt: 2 }}>
                {(detailedUser.role === 'pharmacy') && detailedUser.businessName && (
                    <ListItem>
                        <ListItemIcon sx={{ color: 'grey.800' }}><Business /></ListItemIcon>
                        <ListItemText primary="Business Name" secondary={detailedUser.businessName} secondaryTypographyProps={{ color: 'grey.600' }} />
                    </ListItem>
                )}
                {(detailedUser.role === 'pharmacy' || detailedUser.role === 'pharmacist') && (detailedUser.city || detailedUser.state) && (
                     <ListItem>
                        <ListItemIcon sx={{ color: 'grey.800' }}><LocationOn /></ListItemIcon>
                        <ListItemText primary="Location" secondary={`${detailedUser.city || ''}, ${detailedUser.state || ''}`} secondaryTypographyProps={{ color: 'grey.600' }} />
                    </ListItem>
                )}
            </Box>
        );
    };

    const renderProfessionalVerification = () => {
        if (detailedUser.role !== 'pharmacy' && detailedUser.role !== 'pharmacist') {
            return null;
        }

        let statusChip;
        switch (detailedUser.professionalVerificationStatus) {
            case 'approved':
                statusChip = <Chip icon={<VerifiedUser />} label="Approved" color="success" size="small" />;
                break;
            case 'pending_review':
                statusChip = <Chip icon={<Pending />} label="Pending Review" color="warning" size="small" />;
                break;
            case 'rejected':
                statusChip = <Chip label="Rejected" color="error" size="small" />;
                break;
            default:
                statusChip = <Chip label="Not Started" color="default" size="small" />;
        }

        return (
            <ListItem>
                <ListItemText primary="Professional Verification" />
                {statusChip}
            </ListItem>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, bgcolor: 'white', color: 'black', borderRadius: '16px', width: '100%', maxWidth: '600px', margin: 'auto' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar src={detailedUser.profilePicture} sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main', color: 'white', fontSize: '2.5rem' }}>
                    {detailedUser.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{detailedUser.username}</Typography>
                <Typography variant="body1" sx={{ color: 'grey.600' }}>{detailedUser.email}</Typography>
            </Box>

            <List dense>
                {renderRoleSpecificDetails()}
                <ListItem>
                    <ListItemText primary="Email Verification" />
                    <Chip 
                        icon={detailedUser.emailVerified ? <MarkEmailRead /> : undefined}
                        label={detailedUser.emailVerified ? "Verified" : "Unverified"} 
                        color={detailedUser.emailVerified ? "success" : "warning"} 
                        size="small" 
                    />
                    {!detailedUser.emailVerified && (
                        <Button size="small" onClick={handleResendVerification} disabled={resendStatus === 'sending' || resendStatus === 'sent'} sx={{ ml: 1 }}>
                            {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Sent!' : 'Resend'}
                        </Button>
                    )}
                </ListItem>
                {renderProfessionalVerification()}
                <ListItem>
                    <ListItemText primary="Subscription Status" />
                    <Chip label="Unsubscribed" color="default" size="small" />
                </ListItem>
            </List>

            {(detailedUser.role === 'pharmacy' || detailedUser.role === 'pharmacist') && detailedUser.professionalVerificationStatus !== 'approved' && (
                 <Box sx={{ my: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Submit Verification Documents</Typography>
                    <FileUpload onFileSelect={handleFileSelect} />
                    <Button 
                        variant="contained" 
                        onClick={handleUpload} 
                        disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
                        sx={{ mt: 1 }}
                    >
                        {uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'success' ? 'Uploaded!' : 'Upload'}
                    </Button>
                 </Box>
            )}

            <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.12)' }} />

            <List dense>
                 <ListItem button onClick={handleEdit}>
                    <ListItemIcon sx={{ color: 'grey.800', minWidth: '40px' }}><Person /></ListItemIcon>
                    <ListItemText primary="Edit Profile" />
                </ListItem>
                <ListItem button onClick={() => { /* TODO: Implement change password */ }}>
                    <ListItemIcon sx={{ color: 'grey.800', minWidth: '40px' }}><VpnKey /></ListItemIcon>
                    <ListItemText primary="Change Password" />
                </ListItem>
            </List>
            
            <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.12)' }} />

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                    <Button fullWidth variant="outlined" startIcon={<Info />} onClick={() => setView('about')} sx={{ color: 'grey.800', borderColor: 'rgba(0,0,0,0.23)' }}>About Us</Button>
                </Grid>
                <Grid item xs={6}>
                    <Button fullWidth variant="outlined" startIcon={<ContactMail />} onClick={() => setView('contact')} sx={{ color: 'grey.800', borderColor: 'rgba(0,0,0,0.23)' }}>Contact</Button>
                </Grid>
            </Grid>

            <Button
                variant="contained"
                color="error"
                startIcon={<Logout />}
                onClick={handleLogout}
                fullWidth
            >
                Logout
            </Button>
            <Dialog open={isEditMode} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Username"
                        type="text"
                        fullWidth
                        name="username"
                        value={editData.username || ''}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="dense"
                        label="Profile Picture URL"
                        type="text"
                        fullWidth
                        name="profilePicture"
                        value={editData.profilePicture || ''}
                        onChange={handleChange}
                    />
                    {detailedUser.role === 'pharmacy' && (
                        <>
                            <TextField
                                margin="dense"
                                label="Business Name"
                                type="text"
                                fullWidth
                                name="businessName"
                                value={editData.businessName || ''}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="dense"
                                label="Business Address"
                                type="text"
                                fullWidth
                                name="businessAddress"
                                value={editData.businessAddress || ''}
                                onChange={handleChange}
                            />
                        </>
                    )}
                    {(detailedUser.role === 'pharmacy' || detailedUser.role === 'pharmacist') && (
                        <>
                            <TextField
                                margin="dense"
                                label="City"
                                type="text"
                                fullWidth
                                name="city"
                                value={editData.city || ''}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="dense"
                                label="State"
                                type="text"
                                fullWidth
                                name="state"
                                value={editData.state || ''}
                                onChange={handleChange}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default AccountContent;
