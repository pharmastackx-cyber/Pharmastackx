
"use client";
import { useState, useEffect } from 'react';
import { useSession } from "@/context/SessionProvider";
import { Box, Typography, Avatar, Button, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress, Chip, Grid } from "@mui/material";
import { Person, VpnKey, Logout, Info, ContactMail, Business, LocationOn } from "@mui/icons-material";

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
    // Pharmacy/Pharmacist specific fields
    businessName?: string;
    businessAddress?: string;
    slug?: string;
    state?: string;
    city?: string;
}

const AccountContent = ({ setView }: AccountContentProps) => {
    const { user: sessionUser, isLoading: isSessionLoading } = useSession();
    const [detailedUser, setDetailedUser] = useState<DetailedUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (!isSessionLoading) {
            fetchUserData();
        }
    }, [sessionUser, isSessionLoading]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/auth';
        } catch (error) {
            console.error('An error occurred during logout:', error);
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
        if (detailedUser.role === 'pharmacy' || detailedUser.role === 'pharmacist') {
            return (
                <Box sx={{ width: '100%', mt: 2 }}>
                    {detailedUser.businessName && (
                        <ListItem>
                            <ListItemIcon sx={{ color: 'grey.800' }}><Business /></ListItemIcon>
                            <ListItemText primary="Business Name" secondary={detailedUser.businessName} secondaryTypographyProps={{ color: 'grey.600' }} />
                        </ListItem>
                    )}
                    {detailedUser.businessAddress && (
                         <ListItem>
                            <ListItemIcon sx={{ color: 'grey.800' }}><LocationOn /></ListItemIcon>
                            <ListItemText primary="Location" secondary={`${detailedUser.city}, ${detailedUser.state}`} secondaryTypographyProps={{ color: 'grey.600' }} />
                        </ListItem>
                    )}
                </Box>
            );
        }
        return null;
    };

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
                    <ListItemText primary="Verification Status" />
                    <Chip label="Unverified" color="warning" size="small" />
                </ListItem>
                <ListItem>
                    <ListItemText primary="Subscription Status" />
                    <Chip label="Unsubscribed" color="default" size="small" />
                </ListItem>
            </List>

            <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.12)' }} />

            <List dense>
                 <ListItem button onClick={() => { /* TODO: Implement profile edit */ }}>
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
        </Paper>
    );
};

export default AccountContent;
