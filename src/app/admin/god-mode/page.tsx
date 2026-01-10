'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/context/SessionProvider';
import { 
    Box, Typography, Container, Alert, CircularProgress, Button, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Select, MenuItem, FormControl, InputLabel, TextField, Modal, IconButton,
    Grid
} from '@mui/material';
import Navbar from '@/app/components/Navbar';
import { Close as CloseIcon, NavigateBefore, NavigateNext } from '@mui/icons-material';

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

const GodModePage = () => {
    const { user, isLoading: sessionLoading } = useSession();

    const [collections, setCollections] = useState<string[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string>('');
    const [collectionData, setCollectionData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<string>('');
    
    // Pagination and Sort state
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

    const fetchCollectionData = async (collection: string, newPage: number = 1, sort: 'desc' | 'asc' = 'desc') => {
        if (!collection) return;
        setSelectedCollection(collection);
        setLoading(true);
        setError(null);
        setPage(newPage);
        setSortOrder(sort);
        
        try {
            const res = await fetch(`/api/admin/god-mode?collection=${collection}&page=${newPage}&sort=${sort}`);
            if (res.ok) {
                const { data, total, limit } = await res.json();
                setCollectionData(data);
                setFilteredData(data);
                setTotal(total);
                setLimit(limit);
            } else {
                setError(`Failed to fetch data for ${collection}.`);
            }
        } catch (err) {
            setError(`An error occurred while fetching data for ${collection}.`);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            const filtered = collectionData.filter(item => {
                return Object.values(item).some(value => 
                    String(value).toLowerCase().includes(lowercasedSearchTerm)
                );
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(collectionData);
        }
    }, [searchTerm, collectionData]);

    const handleOpenModal = (data: any) => {
        setModalData(JSON.stringify(data, null, 2));
        setModalOpen(true);
    };

    const handleCloseModal = () => setModalOpen(false);

    const handleCollectionChange = (collection: string) => {
        setSearchTerm('');
        fetchCollectionData(collection, 1, sortOrder);
    }

    if (sessionLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (user?.role !== 'admin') {
        return (
            <>
                <Navbar />
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Alert severity="error" sx={{ mt: 4 }}>
                        <Typography variant="h6">Permission Denied</Typography>
                        You do not have the necessary permissions to access this page.
                    </Alert>
                </Container>
            </>
        );
    }
    
    const totalPages = Math.ceil(total / limit);

    return (
        <>
            <Navbar />
            <Box sx={{ bgcolor: 'grey.50', minHeight: 'calc(100vh - 64px)' }}>
                <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 4, color: '#004D40' }}>
                        God Mode
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

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
                            label="Search Current Page"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ flexGrow: 2, minWidth: 300 }}
                            disabled={!selectedCollection}
                            helperText={searchTerm ? "Search is active on the current page only." : ""}
                        />
                        <FormControl sx={{ minWidth: 150 }} disabled={!selectedCollection}>
                            <InputLabel id="sort-order-label">Sort By</InputLabel>
                            <Select
                                labelId="sort-order-label"
                                value={sortOrder}
                                label="Sort By"
                                onChange={(e) => {
                                    const newSortOrder = e.target.value as 'desc' | 'asc';
                                    fetchCollectionData(selectedCollection, 1, newSortOrder);
                                }}
                            >
                                <MenuItem value="desc">Latest</MenuItem>
                                <MenuItem value="asc">Oldest</MenuItem>
                            </Select>
                        </FormControl>
                    </Paper>

                    {loading && <Box sx={{textAlign: 'center'}}><CircularProgress /></Box>}

                    {selectedCollection && !loading && (
                        <Paper>
                            <TableContainer>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>S/N</TableCell>
                                            {filteredData.length > 0 && Object.keys(filteredData[0]).map(key => (
                                                <TableCell key={key} sx={{ fontWeight: 'bold', bgcolor: 'grey.200' }}>{key}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredData.length > 0 ? (
                                            filteredData.map((item, index) => (
                                                <TableRow key={index} hover>
                                                   <TableCell>{((page - 1) * limit) + index + 1}</TableCell>
                                                    {Object.values(item).map((value: any, i) => (
                                                        <TableCell key={i} sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {typeof value === 'object' && value !== null ? (
                                                                <Button size="small" onClick={() => handleOpenModal(value)}>View JSON</Button>
                                                            ) : (
                                                                String(value)
                                                            )}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={collectionData.length > 0 ? Object.keys(collectionData[0]).length + 1 : 1} sx={{ textAlign: 'center', py: 4}}>
                                                    <Typography>No results found</Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {total > 0 && !searchTerm && (
                                <Grid container justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
                                    <Grid item>
                                        <Typography variant="body2">
                                            Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <IconButton onClick={() => fetchCollectionData(selectedCollection, page - 1, sortOrder)} disabled={page <= 1}>
                                            <NavigateBefore />
                                        </IconButton>
                                        <Typography display="inline" sx={{ mx: 2 }}>
                                            Page {page} of {totalPages}
                                        </Typography>
                                        <IconButton onClick={() => fetchCollectionData(selectedCollection, page + 1, sortOrder)} disabled={page >= totalPages}>
                                            <NavigateNext />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            )}
                        </Paper>
                    )}
                </Container>
            </Box>
            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                aria-labelledby="json-modal-title"
            >
                <Box sx={modalStyle}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                        <Typography id="json-modal-title" variant="h6" component="h2">
                            JSON Data
                        </Typography>
                        <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
                    </Box>
                    <Paper variant="outlined" sx={{ p: 2, background: '#f5f5f5', maxHeight: '60vh', overflowY: 'auto'}}>
                        <pre><code>{modalData}</code></pre>
                    </Paper>
                </Box>
            </Modal>
        </>
    );
};

export default GodModePage;