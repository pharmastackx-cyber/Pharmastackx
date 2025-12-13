
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
  Autocomplete,
  CircularProgress,
  Chip,
  Collapse,
  Avatar,
  Grid,
  InputAdornment,
  Alert,
  Modal,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    Edit as EditIcon,
    Description as DescriptionIcon,
    Image as ImageIcon,
} from '@mui/icons-material';
import { debounce } from 'lodash';
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
  formSuggestions: string[];
  strengthSuggestions: string[];
  showAllForms: boolean;
  showOtherInfo: boolean;
  isEditing: boolean;
}

interface Suggestion {
  label: string;
}

const LOCAL_STORAGE_KEY = 'requestedDrugs';
type UploadMode = 'prescription' | 'image';

const allFormTypes = [
    'Tablet', 'Capsule', 'Lozenge', 'Sachet', 'Powder', 'Granules',
    'Syrup', 'Suspension', 'Emulsion', 'Elixir', 'Solution', 'Oral Drops',
    'Cream', 'Ointment', 'Gel', 'Lotion', 'Paste', 'Transdermal Patch',
    'Inhaler', 'Nebulizer Solution',
    'Injection (IM/IV/SC)', 'Infusion',
    'Suppository', 'Pessary', 'Eye Drops', 'Ear Drops', 'Nasal Spray',
];

const quantityOptions = Array.from({ length: 30 }, (_, i) => i + 1);

const getAIFormSuggestions = (drugName: string): string[] => {
    const lowerCaseDrug = drugName.toLowerCase();
    if (lowerCaseDrug.includes('syrup') || lowerCaseDrug.includes('suspension')) return ['Syrup', 'Suspension', 'Oral Drops'];
    if (lowerCaseDrug.includes('cream') || lowerCaseDrug.includes('gel')) return ['Cream', 'Ointment', 'Gel'];
    return ['Tablet', 'Capsule'].filter(form => allFormTypes.includes(form));
};

const getAIStrengthSuggestions = (drugName: string): string[] => {
    const lowerCaseDrug = drugName.toLowerCase();
    if (lowerCaseDrug.includes('ibuprofen')) return ['200mg', '400mg', '600mg'];
    if (lowerCaseDrug.includes('paracetamol')) return ['500mg', '650mg', '1g'];
    return [];
};

const DispatchForm: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: isSessionLoading } = useSession();

  const [requestedDrugs, setRequestedDrugs] = useState<DrugRequest[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isQuoteReady, setIsQuoteReady] = useState(false);
  const [prescriptionCount, setPrescriptionCount] = useState(1);
  const [imageCount, setImageCount] = useState(1);
  const [requestHistory, setRequestHistory] = useState<any[]>([]);

  const uploadModeRef = useRef<UploadMode | null>(null);
  const photoLibraryInputRef = useRef<HTMLInputElement>(null);

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
    if (!activeRequestId || isQuoteReady) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`/api/requests/${activeRequestId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'quoted') {
            setIsQuoteReady(true);
            clearInterval(intervalId);
          }
        } else {
            if(response.status === 404) {
                clearInterval(intervalId);
            }
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
      if (savedDrugs) {
        setRequestedDrugs(JSON.parse(savedDrugs));
      }
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
    if (requestedDrugs.length > 0 && !confirm('This action will replace your current list. Are you sure you want to continue?')) {
        return;
    }
    setRequestedDrugs(itemsToRefill);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchSuggestions = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    // Mocking API call
    setTimeout(() => {
        const mockSuggestions = [
            { label: `${input} 100mg` },
            { label: `${input} 200mg` },
        ];
        setSuggestions(mockSuggestions);
        setLoading(false);
    }, 500);
  };

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 800), []);

  const handleInputChange = (_: any, newInputValue: string) => {
    setInputValue(newInputValue);
    debouncedFetchSuggestions(newInputValue);
  };

  const handleAddDrug = (name: string, image: string | null = null, mode: UploadMode | null = null) => {
    let finalName = name.trim();
    if ((!finalName && !image) || (finalName && requestedDrugs.some(drug => drug.name.toLowerCase() === finalName.toLowerCase()))) return;

    if (image && !finalName) {
        finalName = mode === 'prescription' ? `Prescription ${prescriptionCount}` : `Image ${imageCount}`;
        if (mode === 'prescription') setPrescriptionCount(prev => prev + 1);
        else setImageCount(prev => prev + 1);
    }

    const newDrug: DrugRequest = {
      id: Date.now(),
      name: finalName,
      form: getAIFormSuggestions(finalName)[0] || '',
      strength: getAIStrengthSuggestions(finalName)[0] || '',
      quantity: 1,
      notes: '',
      image,
      formSuggestions: getAIFormSuggestions(finalName),
      strengthSuggestions: getAIStrengthSuggestions(finalName),
      showAllForms: false,
      showOtherInfo: false,
      isEditing: !image,
    };

    setRequestedDrugs(drugs => [newDrug, ...drugs.map(d => ({...d, isEditing: false}))]);
    setInputValue("");
    setSuggestions([]);
  };

  const handleImageUpload = (file: File) => {
      if (!file) return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
          handleAddDrug('', reader.result as string, uploadModeRef.current);
      };
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

  const toggleShowAllForms = (id: number) => {
    setRequestedDrugs(drugs => drugs.map(drug => (drug.id === id ? { ...drug, showAllForms: !drug.showAllForms } : drug)));
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
      setIsQuoteReady(false); // Reset for the new request
      setActiveRequestId(newRequest._id);
      setIsRadarModalOpen(true);
      fetchHistory(); // Refetch history to include the new request

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
        <input type="file" accept="image/*" ref={photoLibraryInputRef} onChange={(e) => { e.target.files && handleImageUpload(e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />

        {isQuoteReady && !isRadarModalOpen && activeRequestId && (
            <Alert
                severity="success"
                action={
                    <Button color="inherit" size="small" onClick={handleReviewQuote}>
                        REVIEW QUOTE
                    </Button>
                }
                sx={{ mb: 2, bgcolor: 'success.main', color: 'white' }}
            >
                A quote for your request is ready
            </Alert>
        )}

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12}>
            {globalError && <Alert severity="error" sx={{ mb: 2, bgcolor: 'error.main', color: 'white' }}>{globalError}</Alert>}

            <Box sx={{ display: 'flex', gap: 1, mb: 4, alignItems: 'stretch' }}>
                <Autocomplete
                    freeSolo
                    sx={{ 
                        flexGrow: 1,
                        "& .MuiOutlinedInput-root": {
                            background: "rgba(255, 255, 255, 0.05)",
                            borderRadius: '50px',
                            "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                            "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                        },
                        "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                        "& .MuiInputBase-input": { color: "white" }
                    }}
                    options={suggestions}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                    onInputChange={handleInputChange}
                    onChange={(_, newValue) => {
                        const drugName = typeof newValue === 'string' ? newValue : (newValue as Suggestion)?.label;
                        if (drugName) handleAddDrug(drugName, null, null);
                    }}
                    inputValue={inputValue}
                    loading={loading}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search by Medicine Name..."
                        variant="outlined"
                        InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <InputAdornment position="end">
                            {loading ? <CircularProgress color="inherit" size={20} /> : (
                                <Button onClick={() => handleAddDrug(inputValue, null, null)} disabled={!inputValue.trim() || loading} sx={{ color: 'white', mr: -1 }}>Add</Button>
                            )}
                            </InputAdornment>
                        ),
                        }}
                    />
                    )}
                />
                <Box onClick={() => triggerImageUpload('prescription')} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '90px', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>
                    <DescriptionIcon />
                    <Typography variant="caption" sx={{ lineHeight: 1.2, mt: 0.5 }}>Prescription</Typography>
                </Box>
                <Box onClick={() => triggerImageUpload('image')} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '90px', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}>
                    <ImageIcon />
                    <Typography variant="caption" sx={{ lineHeight: 1.2, mt: 0.5 }}>Image</Typography>
                </Box>
            </Box>

            
            {requestedDrugs.map((drug) => (
              <Card key={drug.id} sx={{ mb: 2, borderRadius: '16px', boxShadow: 3, overflow: 'visible', background: 'rgba(255, 255, 255, 0.05)', color: 'white' }}>
                <Collapse in={drug.isEditing} timeout="auto" unmountOnExit>
                  <CardContent>
                    <TextField
                        label="Medicine Name"
                        fullWidth
                        value={drug.name}
                        onChange={(e) => handleUpdateDrug(drug.id, 'name', e.target.value)}
                        sx={{ 
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                                "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                            },
                            "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                            "& .MuiInputBase-input": { color: "white" }
                         }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
                       <FormControl fullWidth sx={{ "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" }, "& .MuiOutlinedInput-root": { color: 'white', "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" } } }}>
                        <InputLabel>Form</InputLabel>
                        <Select value={drug.form} label="Form" onChange={(e) => handleUpdateDrug(drug.id, 'form', e.target.value)} sx={{ color: 'white' }}>
                          {drug.formSuggestions.map((form) => (
                            <MenuItem key={form} value={form}>
                              <Chip label="Suggested" size="small" color="primary" variant="outlined" sx={{ mr: 1, borderColor: '#96ffde', color: '#96ffde' }} />
                              {form}
                            </MenuItem>
                          ))}
                          {(drug.showAllForms || drug.formSuggestions.length === 0) && allFormTypes.filter(f => !drug.formSuggestions.includes(f)).map((form) => (
                            <MenuItem key={form} value={form}>{form}</MenuItem>
                          ))}
                           {!drug.showAllForms && drug.formSuggestions.length > 0 && (
                            <Button onClick={() => toggleShowAllForms(drug.id)} size="small" sx={{ mt: 1, alignSelf: 'flex-start', color: '#96ffde' }}>
                              Show All Forms
                            </Button>
                          )}
                        </Select>
                      </FormControl>

                      <Autocomplete
                        freeSolo
                        options={drug.strengthSuggestions}
                        value={drug.strength}
                        onInputChange={(_, newValue) => handleUpdateDrug(drug.id, 'strength', newValue)}
                        sx={{ 
                            width: { xs: '100%', sm: '220px' },
                            "& .MuiOutlinedInput-root": {
                                background: "rgba(255, 255, 255, 0.05)",
                                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" },
                            },
                            "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" },
                            "& .MuiInputBase-input": { color: "white" }
                        }}
                        renderInput={(params) => <TextField {...params} label="Strength (e.g., 200mg)" />}
                      />

                      <FormControl sx={{ width: { xs: '100%', sm: '120px' }, "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" }, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "rgba(255, 255, 255, 0.3)" } } }}>
                        <InputLabel>Qty</InputLabel>
                        <Select value={drug.quantity} label="Qty" onChange={(e) => handleUpdateDrug(drug.id, 'quantity', e.target.value)} sx={{ color: 'white' }}>
                          {quantityOptions.map((qty) => (
                            <MenuItem key={qty} value={qty}>{qty}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Button size="small" startIcon={drug.showOtherInfo ? <RemoveIcon /> : <AddIcon />} onClick={() => toggleShowOtherInfo(drug.id)} sx={{ color: '#96ffde' }}>
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
                      <Button variant="contained" onClick={() => handleSetEditing(drug.id, false)} sx={{ bgcolor: 'secondary.main', color: 'white', '&:hover': { bgcolor: 'secondary.dark' } }}>Done</Button>
                    </Box>
                  </CardContent>
                </Collapse>

                <Collapse in={!drug.isEditing} timeout="auto" unmountOnExit>
                   <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap'}}>
                            {drug.image && <Avatar src={drug.image} sx={{ width: 40, height: 40, mr: 1 }} />}
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>{drug.name}</Typography>
                            {drug.strength && <Chip label={drug.strength} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}/>}
                            {drug.form && <Chip label={drug.form} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}/>}
                            {drug.quantity > 1 && <Chip label={`Qty: ${drug.quantity}`} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}/>}
                            {drug.notes && <Chip label="Has Notes" size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}/>}
                        </Box>
                        <Box>
                            <IconButton onClick={() => handleSetEditing(drug.id, true)} sx={{ color: 'white' }}><EditIcon /></IconButton>
                            <IconButton onClick={() => handleRemoveDrug(drug.id)} sx={{ color: 'white' }}><DeleteIcon /></IconButton>
                        </Box>
                    </Box>
                  </CardContent>
                </Collapse>
              </Card>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleFindMedicinesClick}
                disabled={requestedDrugs.length === 0 || requestedDrugs.some(d => d.isEditing) || isSubmitting}
                sx={{
                    bgcolor: '#FF00FF', // Magenta color
                    color: 'white',
                    fontWeight: 'bold',
                    padding: '6px 20px',
                    fontSize: '0.875rem',
                    textTransform: 'none',
                    borderRadius: '20px',
                    boxShadow: 'none',
                    '&:hover': {
                        bgcolor: '#CC00CC' // Darker magenta on hover
                    },
                }}
              >
                {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Find Medicines'}
              </Button>
              
              {/* This button will only appear when the request list is empty */}
              {requestedDrugs.length === 0 && (
                  <Button
                      variant="outlined"
                      onClick={() => router.push('/find-medicines')} // Correct link to the Find Medicines page
                      sx={{
                          borderRadius: '20px',
                          borderColor: 'rgba(150, 255, 222, 0.5)',
                          color: 'white',
                          fontWeight: 'bold',
                          padding: '6px 20px',
                          fontSize: '0.875rem',
                          textTransform: 'none',
                          transition: 'transform 0.2s, background-color 0.3s',
                          '&:hover': {
                              transform: 'scale(1.05)',
                              backgroundColor: 'rgba(150, 255, 222, 0.1)',
                              borderColor: '#96ffde',
                          }
                      }}
                  >
                    View Full Catalog
                  </Button>
              )}
            </Box>






            
            {user && <RequestHistory history={requestHistory} onRefill={handleRefillRequest} />}

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
            aria-labelledby="login-prompt-title"
            aria-describedby="login-prompt-description"
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
                <Typography id="login-prompt-title" variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                    Login Recommended
                </Typography>
                <Typography id="login-prompt-description" sx={{ mt: 2 }}>
                    To continue with your request, please log in or create an account. Your current list will be saved.
                </Typography>
                <Link href="/auth?redirect=/dispatch" passHref>
                    <Button 
                        variant="contained" 
                        sx={{ mt: 3, bgcolor: '#006D5B', '&:hover': { bgcolor: '#004D3F' } }}
                    >
                        Login / Sign Up
                    </Button>
                </Link>
            </Box>
        </Modal>
    </>
  );
} 

export default DispatchForm;
