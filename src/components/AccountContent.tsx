
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "@/context/SessionProvider";
import { Box, Typography, Avatar, Button, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, CircularProgress, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel } from "@mui/material";
import { Person, VpnKey, Logout, Info, ContactMail, Business, LocationOn, MarkEmailRead, Pending, VerifiedUser, ArrowBack, Phone, LocalHospital, Assignment, Edit, CheckCircleOutline, ErrorOutline } from "@mui/icons-material";
import FileUpload from './FileUpload';
import SubscriptionContent from './SubscriptionContent';

// Define a more detailed user interface
interface DetailedUser {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    role: 'admin' | 'customer' | 'pharmacy' | 'clinic' | 'vendor' | 'agent' | 'pharmacist' | 'user';
    businessName?: string;
    businessAddress?: string;
    slug?: string;
    state?: string;
    city?: string;
    emailVerified: boolean;
    professionalVerificationStatus: 'not_started' | 'pending_review' | 'approved' | 'rejected';
    subscriptionStatus: 'subscribed' | 'unsubscribed';
    mobile?: string;
    stateOfPractice?: string;
    licenseNumber?: string;
    pharmacy?: { _id: string; businessName: string };
    canManageStore?: boolean;
}

// Specific interface for connected pharmacists
interface Pharmacist {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    canManageStore: boolean;
}

interface AccountContentProps {
    setView: (view: string) => void;
}

interface EditDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (fieldName: string, value: any) => void;
    fieldName: string;
    value: any;
}

interface SwitchPharmacyDialogProps {
    open: boolean;
    onClose: () => void;
    onSwitch: (pharmacyId: string) => void;
}

interface EditableListItemProps {
    fieldName: string;
    label: string;
    value?: string | null;
    icon: React.ReactElement;
}

const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara"
];

const EditDialog = ({ open, onClose, onSave, fieldName, value }: EditDialogProps) => {
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleSave = () => {
        onSave(fieldName, currentValue);
    };
    
    const formattedFieldName = fieldName.replace(/([A-Z])/g, ' $1').trim();

    const renderInput = () => {
        if (fieldName === 'stateOfPractice' || fieldName === 'state') {
            return (
                <FormControl fullWidth margin="dense">
                    <InputLabel>{formattedFieldName}</InputLabel>
                    <Select
                        autoFocus
                        value={currentValue || ''}
                        label={formattedFieldName}
                        onChange={(e) => setCurrentValue(e.target.value)}
                    >
                        {nigerianStates.map(state => (
                            <MenuItem key={state} value={state}>{state}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }

        return (
            <TextField
                autoFocus
                margin="dense"
                label={formattedFieldName}
                type="text"
                fullWidth
                value={currentValue || ''}
                onChange={(e) => setCurrentValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            />
        );
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit {formattedFieldName}</DialogTitle>
            <DialogContent>
                {renderInput()}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};

const SwitchPharmacyDialog = ({ open, onClose, onSwitch }: SwitchPharmacyDialogProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [pharmacies, setPharmacies] = useState<DetailedUser[]>([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState<DetailedUser | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const search = async () => {
            if (!searchQuery.trim()) {
                setPharmacies([]);
                return;
            }
            setIsSearching(true);
            setError(null);
            try {
                const response = await fetch(`/api/pharmacies?search=${searchQuery}`);
                if (!response.ok) {
                    throw new Error('Failed to search for pharmacies.');
                }
                const data = await response.json();
                const pharmaciesData = Array.isArray(data) ? data : data.pharmacies || [];
                setPharmacies(pharmaciesData);
            } catch (err: any) {
                setError(err.message);
                setPharmacies([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timerId = setTimeout(() => {
            search();
        }, 500);

        return () => clearTimeout(timerId);
    }, [searchQuery]);

    const handleSwitch = () => {
        if (selectedPharmacy) {
            onSwitch(selectedPharmacy._id);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Switch Pharmacy</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Search for a pharmacy by name or address"
                    type="text"
                    fullWidth
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && <CircularProgress size={24} sx={{ display: 'block', margin: 'auto', mt: 2 }} />}
                {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                <List sx={{ mt: 2 }}>
                    {pharmacies.map((pharmacy) => (
                        <ListItem
                            button
                            key={pharmacy._id}
                            selected={selectedPharmacy?._id === pharmacy._id}
                            onClick={() => setSelectedPharmacy(pharmacy)}
                        >
                            <ListItemText primary={pharmacy.businessName} secondary={pharmacy.businessAddress} />
                        </ListItem>
                    ))}
                    {pharmacies.length === 0 && searchQuery.length > 0 && !isSearching && (
                        <Typography sx={{ textAlign: 'center', mt: 2 }}>No pharmacies found.</Typography>
                    )}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSwitch} disabled={!selectedPharmacy}>Confirm Switch</Button>
            </DialogActions>
        </Dialog>
    );
};


const AccountContent = ({ setView }: AccountContentProps) => {
    const { user: sessionUser, isLoading: isSessionLoading, refreshSession } = useSession();
    const [detailedUser, setDetailedUser] = useState<DetailedUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resendStatus, setResendStatus] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [showSubscription, setShowSubscription] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [fieldValue, setFieldValue] = useState<any>(null);
    const [isSwitchingPharmacy, setIsSwitchingPharmacy] = useState(false);
    const [pharmacists, setPharmacists] = useState<Pharmacist[]>([]);
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [isUpdatingAccess, setIsUpdatingAccess] = useState(false);
    const [accessUpdateResult, setAccessUpdateResult] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            if (sessionUser) {
                try {
                    setIsLoading(true);
                    const response = await fetch('/api/account', { credentials: 'include' });
                    if (!response.ok) throw new Error('Failed to fetch account details.');
                    const data = await response.json();
                    setDetailedUser(data);

                    if (data.role === 'pharmacy') {
                        const pharmacistsResponse = await fetch('/api/account/pharmacists', { credentials: 'include' });
                        if (pharmacistsResponse.ok) {
                            const pharmacistsData = await pharmacistsResponse.json();
                            setPharmacists(pharmacistsData.pharmacists);
                        } else {
                            const errorData = await pharmacistsResponse.json();
                            console.error('Failed to fetch pharmacists:', errorData.message);
                        }
                    }
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (!isSessionLoading) {
            if (sessionUser) fetchUserData();
            else router.push('/auth');
        }
    }, [sessionUser, isSessionLoading, router]);

    const handleAccessChange = async (pharmacistId: string, canManageStore: boolean) => {
        setIsAccessModalOpen(true);
        setIsUpdatingAccess(true);
        setAccessUpdateResult(null);

        // Optimistically update the UI
        setPharmacists(prev => prev.map(p => p._id === pharmacistId ? { ...p, canManageStore } : p));

        try {
            console.log(`Attempting to update access for pharmacist ${pharmacistId} to ${canManageStore}`);
            const response = await fetch('/api/account/pharmacists/manage-access', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ pharmacistId, canManageStore }),
            });

            const responseBody = await response.json();

            if (!response.ok) {
                console.error("API Error:", responseBody);
                throw new Error(responseBody.message || 'An unknown error occurred on the server.');
            }

            console.log("Access update successful, API returned:", responseBody);
            setAccessUpdateResult({ status: 'success', message: 'Access updated successfully!' });
            setPharmacists(responseBody.pharmacists); // Sync with the server's response

        } catch (err: any) {
            console.error("Failed to update access:", err);
            setAccessUpdateResult({ status: 'error', message: `Update failed: ${err.message}` });
            // Revert the optimistic update on failure
            setPharmacists(prev => prev.map(p => p._id === pharmacistId ? { ...p, canManageStore: !canManageStore } : p));
        } finally {
            setIsUpdatingAccess(false);
        }
    };
    
    const handleCloseAccessModal = () => {
        setIsAccessModalOpen(false);
        // Delay resetting the result to avoid flash of content
        setTimeout(() => {
            setAccessUpdateResult(null);
        }, 300);
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/auth';
        } catch (error) {
            console.error('An error occurred during logout:', error);
        }
    };

    const handleEdit = (fieldName: string, value: any) => {
        setEditingField(fieldName);
        setFieldValue(value);
    };

    const handleCloseDialog = () => {
        setEditingField(null);
        setFieldValue(null);
    };

    const handleSave = async (fieldName: string, newValue: any) => {
        try {
            const response = await fetch('/api/account', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [fieldName]: newValue }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to update ${fieldName}.`);
            }
            setDetailedUser(await response.json());
            handleCloseDialog();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleSwitchPharmacy = async (pharmacyId: string) => {
        try {
            const response = await fetch('/api/account/switch-pharmacy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pharmacyId }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to switch pharmacy.');
            }
            const updatedPharmacist = await response.json();
            setDetailedUser(updatedPharmacist);
            setIsSwitchingPharmacy(false);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleResendVerification = async () => {
        setResendStatus('sending');
        try {
            const response = await fetch('/api/auth/resend-verification', { method: 'POST' });
            if (!response.ok) throw new Error('Failed to send verification email.');
            setResendStatus('sent');
        } catch (err) {
            setResendStatus('error');
        }
    };

    const handleFileSelect = (file: File) => setSelectedFile(file);

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploadStatus('uploading');
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            const response = await fetch('/api/account/upload-verification', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('File upload failed.');
            setDetailedUser(prev => prev ? { ...prev, professionalVerificationStatus: 'pending_review' } : null);
            setUploadStatus('success');
        } catch (err) {
            setUploadStatus('error');
        }
    };

    const handleSubscriptionSuccess = () => {
        refreshSession();
        setShowSubscription(false);
    };

    if (isSessionLoading || isLoading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;

    if (error || !detailedUser) {
        return (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography color="grey.800">Error: {error || 'Could not load user data.'}</Typography>
                <Button variant="contained" onClick={() => window.location.href = '/auth'} sx={{ mt: 2 }}>Login</Button>
            </Box>
        );
    }
    
    const EditableListItem = ({ fieldName, label, value, icon }: EditableListItemProps) => (
        <ListItem secondaryAction={<IconButton edge="end" aria-label="edit" onClick={() => handleEdit(fieldName, value)}><Edit /></IconButton>}>
            <ListItemIcon sx={{ color: 'grey.800' }}>{icon}</ListItemIcon>
            <ListItemText primary={label} secondary={value || 'N/A'} secondaryTypographyProps={{ color: 'grey.600' }} />
        </ListItem>
    );

    const renderRoleSpecificDetails = () => {
        if (!detailedUser) return null;
        if (detailedUser.role === 'pharmacist') {
            return (
                <>
                    <EditableListItem fieldName="mobile" label="Mobile" value={detailedUser.mobile} icon={<Phone />} />
                    <EditableListItem fieldName="stateOfPractice" label="State of Practice" value={detailedUser.stateOfPractice} icon={<LocationOn />} />
                    <EditableListItem fieldName="licenseNumber" label="License Number" value={detailedUser.licenseNumber} icon={<Assignment />} />
                    <ListItem
                        secondaryAction={
                            <Button variant="outlined" size="small" onClick={() => setIsSwitchingPharmacy(true)}>
                                Switch
                            </Button>
                        }
                    >
                        <ListItemIcon sx={{ color: 'grey.800' }}><LocalHospital /></ListItemIcon>
                        <ListItemText 
                            primary="Pharmacy" 
                            secondary={detailedUser.pharmacy?.businessName || 'N/A'} 
                            secondaryTypographyProps={{ color: 'grey.600' }} 
                        />
                    </ListItem>
                </>
            );
        } else if (detailedUser.role === 'pharmacy') {
            return (
                <>
                    <EditableListItem fieldName="businessName" label="Business Name" value={detailedUser.businessName} icon={<Business />} />
                    <EditableListItem fieldName="businessAddress" label="Business Address" value={detailedUser.businessAddress} icon={<LocationOn />} />
                    <EditableListItem fieldName="city" label="City" value={detailedUser.city} icon={<LocationOn />} />
                    <EditableListItem fieldName="state" label="State" value={detailedUser.state} icon={<LocationOn />} />
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, pl: 2 }}>Connected Pharmacists</Typography>
                    <List dense>
                        {pharmacists.length > 0 ? (
                            pharmacists.map(pharmacist => (
                                <ListItem key={pharmacist._id} secondaryAction={
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={pharmacist.canManageStore}
                                                onChange={(e) => handleAccessChange(pharmacist._id, e.target.checked)}
                                                edge="end"
                                                disabled={isUpdatingAccess}
                                            />
                                        }
                                        label="Store Access"
                                        labelPlacement="start"
                                    />
                                }>
                                    <ListItemIcon>
                                        <Avatar src={pharmacist.profilePicture} sx={{ width: 32, height: 32 }}>
                                            {pharmacist.username?.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </ListItemIcon>
                                    <ListItemText primary={pharmacist.username} secondary={pharmacist.email} />
                                </ListItem>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText secondary="No pharmacists are connected to this pharmacy." />
                            </ListItem>
                        )}
                    </List>
                </>
            );
        }
        return null;
    };

    const renderProfessionalVerification = (user: DetailedUser | null) => {
        if (!user || (user.role !== 'pharmacy' && user.role !== 'pharmacist')) return null;
        let statusChip;
        switch (user.professionalVerificationStatus) {
            case 'approved': statusChip = <Chip icon={<VerifiedUser />} label="Approved" color="success" size="small" />; break;
            case 'pending_review': statusChip = <Chip icon={<Pending />} label="Pending Review" color="warning" size="small" />; break;
            case 'rejected': statusChip = <Chip label="Rejected" color="error" size="small" />; break;
            default: statusChip = <Chip label="Not Started" color="default" size="small" />;
        }
        return <ListItem><ListItemText primary="Professional Verification" />{statusChip}</ListItem>;
    };

    return (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, bgcolor: 'white', color: 'black', borderRadius: '16px', width: '100%', maxWidth: '600px', margin: 'auto' }}>
            {showSubscription ? (
                <Box>
                    <Button startIcon={<ArrowBack />} onClick={() => setShowSubscription(false)} sx={{ mb: 2 }}>Back to Account</Button>
                    <SubscriptionContent onSubscriptionSuccess={handleSubscriptionSuccess} />
                </Box>
            ) : (
                <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, position: 'relative' }}>
                        <Avatar src={detailedUser.profilePicture} sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main', color: 'white', fontSize: '2.5rem' }}>
                            {detailedUser.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <IconButton size="small" onClick={() => handleEdit('profilePicture', detailedUser.profilePicture)} sx={{ position: 'absolute', top: 55, left: '55%', backgroundColor: 'rgba(255,255,255,0.7)' }}><Edit fontSize="small" /></IconButton>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                           <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{detailedUser.username}</Typography>
                           <IconButton size="small" onClick={() => handleEdit('username', detailedUser.username)}><Edit fontSize="small" /></IconButton>
                        </Box>
                        <Typography variant="body1" sx={{ color: 'grey.600' }}>{detailedUser.email}</Typography>
                    </Box>

                    <List dense>
                        {renderRoleSpecificDetails()}
                        <ListItem>
                            <ListItemText primary="Email Verification" />
                            <Chip icon={detailedUser.emailVerified ? <MarkEmailRead /> : undefined} label={detailedUser.emailVerified ? "Verified" : "Unverified"} color={detailedUser.emailVerified ? "success" : "warning"} size="small" />
                            {!detailedUser.emailVerified && <Button size="small" onClick={handleResendVerification} disabled={resendStatus === 'sending' || resendStatus === 'sent'} sx={{ ml: 1 }}>{resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Sent!' : 'Resend'}</Button>}
                        </ListItem>
                        {renderProfessionalVerification(detailedUser)}
                        <ListItem button onClick={() => setShowSubscription(true)}>
                            <ListItemText primary="Subscription Status" />
                            <Chip label={detailedUser.subscriptionStatus === 'subscribed' ? "Subscribed" : "Unsubscribed"} color={detailedUser.subscriptionStatus === 'subscribed' ? "success" : "default"} size="small" />
                        </ListItem>
                    </List>

                    {(detailedUser.role === 'pharmacy' || detailedUser.role === 'pharmacist') && detailedUser.professionalVerificationStatus !== 'approved' && (
                        <Box sx={{ my: 2 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>Submit Verification Documents</Typography>
                            <FileUpload onFileSelect={handleFileSelect} />
                            <Button variant="contained" onClick={handleUpload} disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'success'} sx={{ mt: 1 }}>
                                {uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'success' ? 'Uploaded!' : 'Upload'}
                            </Button>
                        </Box>
                    )}

                    <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.12)' }} />
                    
                    <List dense>
                        <ListItem button onClick={() => { /* TODO: Implement change password */ }}>
                            <ListItemIcon sx={{ color: 'grey.800', minWidth: '40px' }}><VpnKey /></ListItemIcon>
                            <ListItemText primary="Change Password" />
                        </ListItem>
                    </List>
                    
                    <Divider sx={{ my: 2, borderColor: 'rgba(0,0,0,0.12)' }} />

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}><Button fullWidth variant="outlined" startIcon={<Info />} onClick={() => setView('about')} sx={{ color: 'grey.800', borderColor: 'rgba(0,0,0,0.23)' }}>About Us</Button></Grid>
                        <Grid item xs={6}><Button fullWidth variant="outlined" startIcon={<ContactMail />} onClick={() => setView('contact')} sx={{ color: 'grey.800', borderColor: 'rgba(0,0,0,0.23)' }}>Contact</Button></Grid>
                    </Grid>

                    <Button variant="contained" color="error" startIcon={<Logout />} onClick={handleLogout} fullWidth>Logout</Button>
                </>
            )}
            
            {editingField && <EditDialog open={!!editingField} onClose={handleCloseDialog} onSave={handleSave} fieldName={editingField} value={fieldValue} />}
            
            <SwitchPharmacyDialog 
                open={isSwitchingPharmacy} 
                onClose={() => setIsSwitchingPharmacy(false)} 
                onSwitch={handleSwitchPharmacy} 
            />

            <Dialog open={isAccessModalOpen} onClose={handleCloseAccessModal} fullWidth maxWidth="xs">
                <DialogTitle sx={{ textAlign: 'center', pb: 0 }}>
                    {isUpdatingAccess ? 'Updating Access' : accessUpdateResult?.status === 'success' ? 'Update Successful' : 'Update Failed'}
                </DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
                    {isUpdatingAccess ? (
                        <CircularProgress sx={{ mb: 2 }} />
                    ) : accessUpdateResult?.status === 'success' ? (
                        <CheckCircleOutline color="success" sx={{ fontSize: 60, mb: 2 }} />
                    ) : (
                        <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
                    )}
                    <Typography variant="body1" sx={{ textAlign: 'center' }}>
                        {isUpdatingAccess ? 'Please wait...' : accessUpdateResult?.message}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                    {!isUpdatingAccess && <Button onClick={handleCloseAccessModal}>Close</Button>}
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default AccountContent;
