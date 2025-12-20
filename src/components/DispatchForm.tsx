
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useSession } from '@/context/SessionProvider';
import {
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Collapse,
  Avatar,
  Grid,
  InputAdornment,
  Alert,
  Modal,
  Paper,
  FormLabel,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    Edit as EditIcon,
    Description as DescriptionIcon,
    Image as ImageIcon,
} from '@mui/icons-material';
import OtherInfoInput from '@/components/dispatch/OtherInfoInput';
import ConfirmationModal from '@/components/dispatch/ConfirmationModal';
import SearchRadarModal from '@/components/dispatch/SearchRadarModal';
import { styled } from '@mui/material/styles';
import RequestHistory from '@/components/dispatch/RequestHistory';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface DrugRequest {
  id: number;
  name: string;
  form: string;
  strength: string;
  quantity: number;
  notes: string;
  image: string | null;
  showOtherInfo: boolean;
  isEditing: boolean;
}

const LOCAL_STORAGE_KEY = 'requestedDrugs';
type UploadMode = 'prescription' | 'image';

const allFormTypes = [
    'Sachet', 'Syrup', 'Pack', 'Cream', 'Inhaler', 'Injection (IM/IV/SC)', 'Eye Drops', 'Ear Drops', 'Suppository', 'Pessary',
    'Tablet', 'Capsule', 'Lozenge', 'Powder', 'Granules', 'Suspension', 'Emulsion', 'Elixir', 'Solution', 'Oral Drops', 'Ointment', 'Gel', 'Lotion', 'Paste', 'Transdermal Patch', 'Nebulizer Solution', 'Infusion', 'Nasal Spray'
];

const quantityOptions = Array.from({ length: 30 }, (_, i) => i + 1);

const DispatchForm: React.FC<{ initialSearchValue?: string }> = ({ initialSearchValue }) => {

  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useSession();

  const [requestedDrugs, setRequestedDrugs] = useState<DrugRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(initialSearchValue || ""); 
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isQuoteReady, setIsQuoteReady] = useState(false);
  const [requestHistory, setRequestHistory] = useState<any[]>([]);

  const uploadModeRef = useRef<UploadMode | null>(null);
  const photoLibraryInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = useCallback(async () => {
      if (!user) return;
      try {
          const response = await fetch('/api/requests?source=dispatch');
          if (response.ok) {
              const data = await response.json();
              data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setRequestHistory(data);
          }
      } catch (error) {
          console.error('Failed to fetch request history:', error);
      }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (!activeRequestId || isQuoteReady) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`/api/requests/${activeRequestId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'quoted') {
            setIsQuoteReady(true);
            clearInterval(intervalId);
          }
        } else if(response.status === 404) {
            clearInterval(intervalId);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [activeRequestId, isQuoteReady]);

  useEffect(() => {
    try {
      const savedDrugs = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedDrugs) setRequestedDrugs(JSON.parse(savedDrugs));
    } catch (error) {
      console.error("Failed to load drugs from local storage", error);
    }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requestedDrugs));
    }
  }, [requestedDrugs, isInitialLoad]);

  const handleRefillRequest = (itemsToRefill: any[]) => {
    if (requestedDrugs.length > 0 && !confirm('This action will replace your current list. Are you sure?')) return;
    setRequestedDrugs(itemsToRefill);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const timer = setTimeout(() => searchInputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleAddDrug = (name: string, image: string | null = null, mode: UploadMode | null = null) => {
    const trimmedName = name.trim();
    console.log('handleAddDrug called with:', { name, image, mode });

    setRequestedDrugs(currentDrugs => {
        console.log('Current drugs state:', currentDrugs);
        if (trimmedName && currentDrugs.some(drug => drug.name.toLowerCase() === trimmedName.toLowerCase())) {
            console.log('Attempted to add duplicate drug name:', trimmedName);
            return currentDrugs; 
        }

        let finalName = trimmedName;
        let newId = Date.now();

        if (image && !finalName) {
            const prefix = mode === 'prescription' ? 'Prescription' : 'Image';
            let count = 1;
            
            let nextName = `${prefix} ${count}`;
            let nextId = newId + count;

            while (currentDrugs.some(drug => drug.name === nextName || drug.id === nextId)) {
                count++;
                nextName = `${prefix} ${count}`;
                nextId = newId + count;
            }
            finalName = nextName;
            newId = nextId; 
            console.log('Generated unique name for image/prescription:', { finalName, newId });
        } else {
            while (currentDrugs.some(drug => drug.id === newId)) {
                newId++;
            }
             console.log('Generated unique ID for text input:', newId);
        }

        if (!finalName && !image) {
             console.log('No name or image provided, aborting add.');
            return currentDrugs; 
        }
        
        const newDrug: DrugRequest = {
            id: newId,
            name: finalName,
            form: 'Tablet',
            strength: '',
            quantity: 1,
            notes: '',
            image,
            showOtherInfo: false,
            isEditing: !image,
        };
        console.log('Creating new drug:', newDrug);

        const updatedDrugs = currentDrugs.map(d => ({ ...d, isEditing: false }));

        return [newDrug, ...updatedDrugs];
    });

    setInputValue("");
  };

  const handleImageUpload = (file: File) => {
      if (!file) return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => handleAddDrug('', reader.result as string, uploadModeRef.current);
  };

  const triggerImageUpload = (mode: UploadMode) => {
      uploadModeRef.current = mode;
      photoLibraryInputRef.current?.click();
  };

  const handleUpdateDrug = (id: number, field: keyof DrugRequest, value: any) => {
    setRequestedDrugs(drugs => drugs.map(drug => (drug.id === id ? { ...drug, [field]: value } : drug)));
  };

  const handleSetEditing = (id: number, editing: boolean) => {
    setRequestedDrugs(drugs => drugs.map(drug => (drug.id === id ? { ...drug, isEditing: editing } : { ...drug, isEditing: false })));
  };

  const handleRemoveDrug = (id: number) => {
    setRequestedDrugs(drugs => drugs.filter(drug => drug.id !== id));
  };

  const toggleShowOtherInfo = (id: number) => {
    setRequestedDrugs(drugs => drugs.map(drug => (drug.id === id ? { ...drug, showOtherInfo: !drug.showOtherInfo } : drug)));
  };

  const handleFindMedicinesClick = () => {
      if (!user) {
          setIsLoginModalOpen(true);
      } else {
          setIsModalOpen(true);
      }
  };

  const handleConfirmDispatch = async () => {
    setIsModalOpen(false);
    setGlobalError(null);
    if (requestedDrugs.length === 0) {
        setGlobalError("Cannot submit an empty list.");
        return;
    }
    setIsSubmitting(true);

    const payload = {
      requestType: 'drug-list',
      items: requestedDrugs.map(({ name, form, strength, quantity, notes, image }) => ({ name, form, strength, quantity, notes, image }))
    };

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      const newRequest = await response.json();
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setIsQuoteReady(false);
      setActiveRequestId(newRequest._id);
      setIsRadarModalOpen(true);
      fetchHistory();

    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseRadarModal = () => {
    setIsRadarModalOpen(false);
    setRequestedDrugs([]);
    setActiveRequestId(null);
  };

  const handleReviewQuote = () => {
      if (activeRequestId) {
          router.push(`/my-requests/${activeRequestId}`);
          handleCloseRadarModal();
          setIsQuoteReady(false);
      }
  };

  if (isSessionLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'white' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F7F7F7', color: 'black', minHeight: '100vh', py: 4 }}>
        <input type="file" accept="image/*" ref={photoLibraryInputRef} onChange={(e) => { e.target.files && handleImageUpload(e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />

        {isQuoteReady && !isRadarModalOpen && activeRequestId && (
            <Alert
                severity="success"
                action={
                    <Button color="inherit" size="small" onClick={handleReviewQuote}>REVIEW QUOTE</Button>
                }
                sx={{ mb: 2, borderRadius: '8px', maxWidth: { xs: '90%', sm: '80%', md: '600px' }, mx: 'auto' }}
            >
                A quote for your request is ready
            </Alert>
        )}

        <Grid container justifyContent="center">
            <Grid item xs={11} sm={10} md={8} lg={6}>
                <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    {globalError && <Alert severity="error" sx={{ mb: 2 }}>{globalError}</Alert>}

                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            inputRef={searchInputRef}
                            placeholder="Type medicine name to add..."
                            variant="outlined"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && inputValue.trim()) {
                                    handleAddDrug(inputValue, null, null);
                                }
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button onClick={() => handleAddDrug(inputValue, null, null)} disabled={!inputValue.trim()} sx={{ color: 'primary.main', mr: -1 }}>Add</Button>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '12px', background: '#f5f5f5' }
                            }}
                        />
                        <FormControl component="fieldset" variant="outlined" sx={{ mt: 2, width: '100%', justifyContent: 'center' }}>
                            <FormLabel component="legend" sx={{ px: 1, mx: 'auto', fontSize: '0.9rem', justifyContent: 'center' }}>Search by prescription or image</FormLabel>
                            <Box sx={{ display: 'flex', gap: 2, p: 2, pt: 1, justifyContent: 'center' }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => triggerImageUpload('prescription')}
                                    startIcon={<DescriptionIcon />}
                                    sx={{ borderRadius: '20px', textTransform: 'none', flex: 1 }}
                                >
                                    Prescription
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => triggerImageUpload('image')}
                                    startIcon={<ImageIcon />}
                                    sx={{ borderRadius: '20px', textTransform: 'none', flex: 1 }}
                                >
                                    Image
                                </Button>
                            </Box>
                        </FormControl>
                    </Box>

                    {requestedDrugs.map((drug) => (
                    <Card key={drug.id} sx={{ mb: 2, borderRadius: '20px', boxShadow: 'none', overflow: 'visible', background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.12)' }}>
                        <Collapse in={!drug.isEditing} timeout="auto" unmountOnExit>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap'}}>
                                    {drug.image && <Avatar src={drug.image} sx={{ width: 40, height: 40 }} />}
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{drug.name}</Typography>
                                    {drug.strength && <Chip label={drug.strength} size="small" />}
                                    {drug.form && <Chip label={drug.form} size="small" />}
                                    {drug.quantity > 1 && <Chip label={`Qty: ${drug.quantity}`} size="small" />}
                                    {drug.notes && <Chip label="Has Notes" size="small" />}
                                </Box>
                                <Box>
                                    <IconButton onClick={() => handleSetEditing(drug.id, true)}><EditIcon /></IconButton>
                                    <IconButton onClick={() => handleRemoveDrug(drug.id)}><DeleteIcon /></IconButton>
                                </Box>
                            </Box>
                          </CardContent>
                        </Collapse>
                        <Collapse in={drug.isEditing} timeout="auto" unmountOnExit>
                          <CardContent>
                            <TextField fullWidth label="Medicine Name" value={drug.name} onChange={(e) => handleUpdateDrug(drug.id, 'name', e.target.value)} sx={{mb: 2}}/>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                      <InputLabel>Form</InputLabel>
                                      <Select value={drug.form} label="Form" onChange={(e) => handleUpdateDrug(drug.id, 'form', e.target.value)}>
                                        {allFormTypes.map((form) => (
                                            <MenuItem key={form} value={form}>{form}</MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Strength (e.g., 200mg, 500ml etc.)"
                                        value={drug.strength}
                                        onChange={(e) => handleUpdateDrug(drug.id, 'strength', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                  <FormControl fullWidth>
                                    <InputLabel>Qty</InputLabel>
                                    <Select value={drug.quantity} label="Qty" onChange={(e) => handleUpdateDrug(drug.id, 'quantity', Number(e.target.value))}>
                                      {quantityOptions.map((qty) => (
                                        <MenuItem key={qty} value={qty}>{qty}</MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 2 }}>
                              <Button size="small" startIcon={drug.showOtherInfo ? <RemoveIcon /> : <AddIcon />} onClick={() => toggleShowOtherInfo(drug.id)} sx={{ color: 'primary.main' }}>
                                {drug.showOtherInfo ? 'Hide Details' : 'Add More Details'}
                              </Button>
                              <Collapse in={drug.showOtherInfo}>
                                <OtherInfoInput
                                  notes={drug.notes}
                                  image={drug.image}
                                  onNotesChange={(value) => handleUpdateDrug(drug.id, 'notes', value)}
                                  onImageChange={(value) => handleUpdateDrug(drug.id, 'image', value)}
                                />
                              </Collapse>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                              <Button variant="contained" onClick={() => handleSetEditing(drug.id, false)}>Done</Button>
                            </Box>
                          </CardContent>
                        </Collapse>
                    </Card>
                    ))}

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleFindMedicinesClick}
                            disabled={requestedDrugs.length === 0 || requestedDrugs.some(d => d.isEditing) || isSubmitting}
                            sx={{py: 0.8, borderRadius: '12px'}}
                        >
                            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                        </Button>
                        {requestedDrugs.length === 0 && (
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() => router.push('/find-medicines')}
                                sx={{py: 0.8, borderRadius: '12px'}}
                            >
                                View Full Catalog
                            </Button>
                        )}
                    </Box>
                    <Box sx={{mt: 4}}>
                      <RequestHistory history={requestHistory} onRefill={handleRefillRequest} />
                    </Box>
                </Paper>
            </Grid>
        </Grid>

        <ConfirmationModal 
            open={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onConfirm={handleConfirmDispatch} 
            requests={requestedDrugs} 
            isSubmitting={isSubmitting}
        />
        <SearchRadarModal 
          open={isRadarModalOpen} 
          onClose={handleCloseRadarModal} 
          requests={requestedDrugs.map(({ id, name, form, strength, quantity, image }) => ({ id, name, form, strength, quantity, image, notes: '' }))}
          requestId={activeRequestId}
          isQuoteReady={isQuoteReady}
          onReview={handleReviewQuote}
        />

        <Modal
            open={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                borderRadius: '16px',
                boxShadow: 24,
                p: 4,
                textAlign: 'center'
            }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Login to Continue
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    Please log in or create an account to submit your request. Your list will be saved for when you return.
                </Typography>
                <Link href="/auth?redirect=/dispatch" passHref>
                    <Button variant="contained" sx={{ mt: 3 }}>Login / Sign Up</Button>
                </Link>
            </Box>
        </Modal>
    </Box>
  );
} 

export default DispatchForm;
