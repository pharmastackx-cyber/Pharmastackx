'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/context/SessionProvider';
import { 
    Box, Typography, Container, Alert, CircularProgress, Button, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Select, MenuItem, FormControl, InputLabel, TextField, Modal, IconButton,
    Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Link, Collapse
} from '@mui/material';
import Navbar from '@/app/components/Navbar';
import { 
    Close as CloseIcon, 
    NavigateBefore, 
    NavigateNext, 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    CheckCircle, 
    Cancel, 
    WhatsApp as WhatsAppIcon, 
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '80vh',
  overflowY: 'auto',
};

function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}


const UserRow = ({ user, index, page, limit, onEdit, onDelete }: { user: any, index: number, page: number, limit: number, onEdit: (doc: any) => void, onDelete: (doc: any) => void }) => {
    const [open, setOpen] = useState(false);
    const phoneNumber = user.role === 'pharmacist' ? user.mobile : user.phoneNumber;

    const formatWhatsAppNumber = (phone: string) => {
        if (!phone) return '';
        // Remove all non-numeric characters
        const cleaned = String(phone).replace(/[^0-9]/g, '');
        // If the number starts with 0, replace it with the country code 234
        if (cleaned.startsWith('0')) {
            return `234${cleaned.substring(1)}`;
        }
        // Otherwise, return the cleaned number as is
        return cleaned;
    };

    const message = `Good afternoon, Pharm ${user.username} from ${user.stateOfPractice || 'your state'},

Thank you for signing up on PharmaStackX.

To ensure you receive important updates and medicine requests without interruption, please save this number on your phone and reply DONE once completed.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formatWhatsAppNumber(phoneNumber)}?text=${encodedMessage}`;

    // Fields that are either sensitive or already displayed in the main row
    const mainFields = ['_id', 'username', 'email', 'phoneNumber', 'mobile', 'role', 'isPWA', 'fcmTokens', '__v', 'salt', 'hash', 'verificationToken', 'verificationTokenExpires'];
    const extraDetails = Object.entries(user).filter(([key]) => !mainFields.includes(key));

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                 <TableCell>{((page - 1) * limit) + index + 1}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                    {phoneNumber ? (
                        <Link 
                        href={whatsappUrl}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline'} }}
                        >
                            <WhatsAppIcon sx={{ color: '#25D366', mr: 1 }} />
                            {phoneNumber}
                        </Link>
                    ) : '-'}
                </TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell align="center">
                    {user.isPWA ? <CheckCircle color="success" /> : <Cancel color="error" />}
                </TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.fcmTokens && user.fcmTokens.length > 0 ? user.fcmTokens.join(', ') : '-'}
                </TableCell>
                <TableCell>
                    <IconButton onClick={() => onEdit(user)} size="small"><EditIcon /></IconButton>
                    <IconButton onClick={() => onDelete(user)} size="small"><DeleteIcon /></IconButton>
                     <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Additional Details
                            </Typography>
                            {extraDetails.length > 0 ? (
                                <Grid container spacing={2}>
                                    {extraDetails.map(([key, value]) => (
                                        <Grid item xs={12} sm={6} md={4} key={key}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#555' }}>{key}:</Typography>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-all', background: 'white', p: 1, borderRadius: 1 }}>
                                                {typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value)}
                                            </Typography>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography>No additional details available for this user.</Typography>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};


// Specific component for rendering the Users table
const UsersTable = ({ data, page, limit, onEdit, onDelete }: { data: any[], page: number, limit: number, onEdit: (doc: any) => void, onDelete: (doc: any) => void }) => {
    return (
        <TableContainer>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>S/N</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>Username</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>Phone</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>PWA Installed</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>FCM Tokens</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                     {data.map((user, index) => (
                        <UserRow key={user._id} user={user} index={index} page={page} limit={limit} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// Generic component for rendering other collections
const GenericTable = ({ data, page, limit, onEdit, onDelete, onOpenModal }: { data: any[], page: number, limit: number, onEdit: (doc: any) => void, onDelete: (doc: any) => void, onOpenModal: (data: any) => void }) => {
    if (data.length === 0) {
        return (
            <Typography sx={{ textAlign: 'center', py: 4}}>
                No results found for your query.
            </Typography>
        );
    }
    return (
        <TableContainer>
            <Table stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>S/N</TableCell>
                        {Object.keys(data[0]).map(key => (
                            <TableCell key={key} sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>{key}</TableCell>
                        ))}
                        <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((item, index) => (
                        <TableRow key={item._id || index} hover>
                            <TableCell>{((page - 1) * limit) + index + 1}</TableCell>
                            {Object.entries(item).map(([key, value]: [string, any]) => (
                                <TableCell key={key} sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {typeof value === 'object' && value !== null ? <Button size="small" onClick={() => onOpenModal(value)}>View JSON</Button> : String(value)}
                                </TableCell>
                            ))}
                            <TableCell>
                                <IconButton onClick={() => onEdit(item)}><EditIcon /></IconButton>
                                <IconButton onClick={() => onDelete(item)}><DeleteIcon /></IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};


const GodModePage = () => {
    const { user, isLoading: sessionLoading } = useSession();

    const [collections, setCollections] = useState<string[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string>('');
    const [collectionData, setCollectionData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<string>('');
    const [editingDoc, setEditingDoc] = useState<any | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<any | null>(null);
    
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(100);
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await fetch('/api/admin/god-mode');
                if (res.ok) {
                    const data = await res.json();
                    setCollections(data);
                } else {
                    setError('Failed to fetch collections.');
                }
            } catch (err) {
                setError('An error occurred while fetching collections.');
            }
            setLoading(false);
        };
        if (user?.role === 'admin') {
            fetchCollections();
        }
    }, [user]);

    const fetchCollectionData = async (collection: string, newPage: number = 1, sort: 'desc' | 'asc' = 'desc', search: string = '') => {
        if (!collection) return;
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch(`/api/admin/god-mode?collection=${collection}&page=${newPage}&sort=${sort}&search=${search}`);
            if (res.ok) {
                const { data, total, limit } = await res.json();
                setCollectionData(data);
                setTotal(total);
                setLimit(limit);
                setPage(newPage);
            } else {
                setError(`Failed to fetch data for ${collection}.`);
            }
        } catch (err) {
            setError(`An error occurred while fetching data for ${collection}.`);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedCollection) {
            fetchCollectionData(selectedCollection, 1, sortOrder, debouncedSearchTerm);
        }
    }, [debouncedSearchTerm]);

    const handleOpenModal = (data: any) => {
        setModalData(JSON.stringify(data, null, 2));
        setModalOpen(true);
    };
    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingDoc(null);
    }

    const handleCollectionChange = (collection: string) => {
        setSelectedCollection(collection);
        setSearchTerm(''); 
        fetchCollectionData(collection, 1, sortOrder, '');
    }
    
    const handleSortChange = (newSortOrder: 'desc' | 'asc') => {
        setSortOrder(newSortOrder);
        if(selectedCollection) {
            fetchCollectionData(selectedCollection, 1, newSortOrder, debouncedSearchTerm);
        }
    }

    const handleEdit = (doc: any) => {
        setEditingDoc(doc);
        setModalData(JSON.stringify(doc, null, 2));
        setModalOpen(true);
    };

    const handleDelete = (doc: any) => {
        setDocToDelete(doc);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!docToDelete || !selectedCollection) return;
        try {
            const res = await fetch(`/api/admin/god-mode/${selectedCollection}/${docToDelete._id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setSuccess('Document deleted successfully.');
                fetchCollectionData(selectedCollection, page, sortOrder, debouncedSearchTerm);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to delete document.');
            }
        } catch (err) {
            setError('An error occurred while deleting the document.');
        }
        setDeleteDialogOpen(false);
        setDocToDelete(null);
    };

    const handleSave = async () => {
        if (!editingDoc || !selectedCollection) return;
        try {
            const updatedData = JSON.parse(modalData);
            const res = await fetch(`/api/admin/god-mode/${selectedCollection}/${editingDoc._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });
            if (res.ok) {
                setSuccess('Document updated successfully.');
                fetchCollectionData(selectedCollection, page, sortOrder, debouncedSearchTerm);
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to update document.');
            }
        } catch (err) {
            setError('Invalid JSON format or error updating the document.');
        }
        handleCloseModal();
    };

    if (sessionLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    if (user?.role !== 'admin') {
        return (
            <>
                <Navbar />
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Alert severity="error" sx={{ mt: 4 }}><Typography variant="h6">Permission Denied</Typography>You do not have the necessary permissions to access this page.</Alert>
                </Container>
            </>
        );
    }
    
    const totalPages = Math.ceil(total / limit);

    const renderTable = () => {
        if (loading) return <Box sx={{textAlign: 'center'}}><CircularProgress /></Box>;
        if (!selectedCollection) return null;

        if (selectedCollection === 'users') {
            return <UsersTable data={collectionData} page={page} limit={limit} onEdit={handleEdit} onDelete={handleDelete} />;
        }
        return <GenericTable data={collectionData} page={page} limit={limit} onEdit={handleEdit} onDelete={handleDelete} onOpenModal={handleOpenModal} />;
    }

    return (
        <>
            <Navbar />
            <Box sx={{ bgcolor: 'grey.50', minHeight: 'calc(100vh - 64px)' }}>
                <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 4, color: '#004D40' }}>God Mode</Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Paper sx={{ p: 2, mb: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                         <FormControl sx={{ minWidth: 240, flexGrow: 1}}>
                            <InputLabel id="collection-select-label">Collection</InputLabel>
                            <Select
                                labelId="collection-select-label"
                                value={selectedCollection}
                                label="Collection"
                                onChange={(e) => handleCollectionChange(e.target.value as string)}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {collections.map(collection => (
                                    <MenuItem key={collection} value={collection}>{collection}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField 
                            label="Search Collection"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ flexGrow: 2, minWidth: 300 }}
                            disabled={!selectedCollection}
                        />
                        <FormControl sx={{ minWidth: 150 }} disabled={!selectedCollection}>
                            <InputLabel id="sort-order-label">Sort By</InputLabel>
                            <Select
                                labelId="sort-order-label"
                                value={sortOrder}
                                label="Sort By"
                                onChange={(e) => handleSortChange(e.target.value as 'desc' | 'asc')}
                            >
                                <MenuItem value="desc">Latest</MenuItem>
                                <MenuItem value="asc">Oldest</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>

                    <Paper>
                        {renderTable()}
                        {total > limit && !loading && (
                            <Grid container justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
                                <Grid item>
                                    <Typography variant="body2">
                                        Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total}
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <IconButton onClick={() => fetchCollectionData(selectedCollection, page - 1, sortOrder, debouncedSearchTerm)} disabled={page <= 1}>
                                        <NavigateBefore />
                                    </IconButton>
                                    <Typography display="inline" sx={{ mx: 2 }}>
                                        Page {page} of {totalPages}
                                    </Typography>
                                    <IconButton onClick={() => fetchCollectionData(selectedCollection, page + 1, sortOrder, debouncedSearchTerm)} disabled={page >= totalPages}>
                                        <NavigateNext />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        )}
                    </Paper>
                </Container>
            </Box>

            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Box sx={modalStyle}>
                     <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography variant="h6">{editingDoc ? 'Edit Document' : 'JSON Data'}</Typography>
                        <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
                    </Box>
                    <TextField
                        multiline
                        fullWidth
                        rows={15}
                        variant="outlined"
                        value={modalData}
                        onChange={(e) => setModalData(e.target.value)}
                        disabled={!editingDoc}
                        sx={{ textarea: { background: editingDoc ? 'white' : '#f5f5f5' } }}
                    />
                    {editingDoc && <Button onClick={handleSave} sx={{mt: 2}} variant="contained">Save</Button>}
                </Box>
            </Modal>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to delete this document from the '{selectedCollection}' collection? This action cannot be undone.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default GodModePage;
