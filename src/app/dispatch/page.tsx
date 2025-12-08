
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

import { useRouter } from 'next/navigation';
// Corrected import path for useSession
import { useSession } from '@/context/SessionProvider';
import {
  Container,
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
  Alert, // Keep Alert
  
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
import Navbar from '@/components/Navbar'; // <<< FIX: Imported Navbar
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

interface Item {
  name: string;
  form: string;
  strength: string;
  quantity: number;
  notes: string;
  image: File | null;
}

const allFormTypes = [
  'Tablet', 'Capsule', 'Lozenge', 'Sachet', 'Powder', 'Granules',
  'Syrup', 'Suspension', 'Emulsion', 'Elixir', 'Solution', 'Oral Drops',
  'Cream', 'Ointment', 'Gel', 'Lotion', 'Paste', 'Transdermal Patch',
  'Inhaler', 'Nebulizer Solution',
  'Injection (IM/IV/SC)', 'Infusion',
  'Suppository', 'Pessary', 'Eye Drops', 'Ear Drops', 'Nasal Spray',
];

const quantityOptions = Array.from({ length: 30 }, (_, i) => i + 1);

// --- NOTE: These two AI functions are for the UI and can be expanded later ---
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


// --- This replaces your old 'Item' interface ---
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


const DispatchPage: React.FC = () => {
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
    const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
    const [activeRequestId, setActiveRequestId] = useState<string | null>(null); 
    const [prescriptionCount, setPrescriptionCount] = useState(1);
    const [imageCount, setImageCount] = useState(1);
  
    const [requestHistory, setRequestHistory] = useState<any[]>([]);

    const fetchHistory = useCallback(async () => {
      try {
          const response = await fetch('/api/requests');
          if (response.ok) {
              const data = await response.json();
              data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setRequestHistory(data);
          }
      } catch (error) {
          console.error('Failed to fetch request history:', error);
      }
  }, []);

    useEffect(() => {
      fetchHistory();
  }, [fetchHistory]);

    const uploadModeRef = useRef<UploadMode | null>(null);
    const photoLibraryInputRef = useRef<HTMLInputElement>(null);
  

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
      if (requestedDrugs.length > 0) {
          if (!confirm('This action will replace your current list. Are you sure you want to continue?')) {
              return;
          }
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
      setSuggestions([]);
      setLoading(false);
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
          if (mode === 'prescription') {
              finalName = `Prescription ${prescriptionCount}`;
              setPrescriptionCount(prev => prev + 1);
          } else {
              finalName = `Image ${imageCount}`;
              setImageCount(prev => prev + 1);
          }
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
    }
  
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
        items: requestedDrugs.map(drug => ({ name: drug.name, form: drug.form, strength: drug.strength, quantity: drug.quantity, notes: drug.notes, image: drug.image }))
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
  

  if (isSessionLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navbar /> 
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <input type="file" accept="image/*" ref={photoLibraryInputRef} onChange={(e) => { e.target.files && handleImageUpload(e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#006D5B' }}>
              Dispatch Request
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
              Build your dispatch list. Your progress is saved automatically.
            </Typography>
            
            {globalError && <Alert severity="error" sx={{ mb: 2 }}>{globalError}</Alert>}

            <Box sx={{ display: 'flex', gap: 1, mb: 4, alignItems: 'stretch' }}>
              <Autocomplete
                freeSolo
                sx={{ flexGrow: 1 }}
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
                            <Button onClick={() => handleAddDrug(inputValue, null, null)} disabled={!inputValue.trim() || loading} sx={{ mr: -1 }}>Add</Button>
                          )}
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
              <Box onClick={() => triggerImageUpload('prescription')} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '90px', border: '1px solid rgba(0, 0, 0, 0.23)', borderRadius: '4px', cursor: 'pointer', textAlign: 'center', color: 'text.secondary', '&:hover': { backgroundColor: 'action.hover' } }}>
                <DescriptionIcon />
                <Typography variant="caption" sx={{ lineHeight: 1.2, mt: 0.5 }}>Prescription</Typography>
              </Box>
              <Box onClick={() => triggerImageUpload('image')} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '90px', border: '1px solid rgba(0, 0, 0, 0.23)', borderRadius: '4px', cursor: 'pointer', textAlign: 'center', color: 'text.secondary', '&:hover': { backgroundColor: 'action.hover' } }}>
                <ImageIcon />
                <Typography variant="caption" sx={{ lineHeight: 1.2, mt: 0.5 }}>Image</Typography>
              </Box>
            </Box>

            
            {requestedDrugs.map((drug) => (
              <Card key={drug.id} sx={{ mb: 2, borderRadius: '16px', boxShadow: 3, overflow: 'visible' }}>
                <Collapse in={drug.isEditing} timeout="auto" unmountOnExit>
                  <CardContent>
                    <TextField
                        label="Medicine Name"
                        fullWidth
                        value={drug.name}
                        onChange={(e) => handleUpdateDrug(drug.id, 'name', e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2 }}>
                       <FormControl fullWidth>
                        <InputLabel>Form</InputLabel>
                        <Select value={drug.form} label="Form" onChange={(e) => handleUpdateDrug(drug.id, 'form', e.target.value)}>
                          {drug.formSuggestions.map((form) => (
                            <MenuItem key={form} value={form}>
                              <Chip label="Suggested" size="small" color="primary" variant="outlined" sx={{ mr: 1 }} />
                              {form}
                            </MenuItem>
                          ))}
                          {(drug.showAllForms || drug.formSuggestions.length === 0) && allFormTypes.filter(f => !drug.formSuggestions.includes(f)).map((form) => (
                            <MenuItem key={form} value={form}>{form}</MenuItem>
                          ))}
                           {!drug.showAllForms && drug.formSuggestions.length > 0 && (
                            <Button onClick={() => toggleShowAllForms(drug.id)} size="small" sx={{ mt: 1, alignSelf: 'flex-start' }}>
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
                        sx={{ width: { xs: '100%', sm: '220px' } }}
                        renderInput={(params) => <TextField {...params} label="Strength (e.g., 200mg)" />}
                      />

                      <FormControl sx={{ width: { xs: '100%', sm: '120px' } }}>
                        <InputLabel>Qty</InputLabel>
                        <Select value={drug.quantity} label="Qty" onChange={(e) => handleUpdateDrug(drug.id, 'quantity', e.target.value)}>
                          {quantityOptions.map((qty) => (
                            <MenuItem key={qty} value={qty}>{qty}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Button size="small" startIcon={drug.showOtherInfo ? <RemoveIcon /> : <AddIcon />} onClick={() => toggleShowOtherInfo(drug.id)}>
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

                <Collapse in={!drug.isEditing} timeout="auto" unmountOnExit>
                   <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap'}}>
                            {drug.image && <Avatar src={drug.image} sx={{ width: 40, height: 40, mr: 1 }} />}
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
              </Card>
            ))}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsModalOpen(true)}
                disabled={requestedDrugs.length === 0 || requestedDrugs.some(d => d.isEditing) || isSubmitting}
                sx={{ bgcolor: '#006D5B', '&:hover': { bgcolor: '#004D3F' }, borderRadius: '25px', padding: '10px 30px', fontSize: '1rem' }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Find Medicines'}
              </Button>
            </Box>
            
            <RequestHistory history={requestHistory} onRefill={handleRefillRequest} />

          </Grid>
        </Grid>

        {/* The Modals */}
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
          requests={requestedDrugs}
          requestId={activeRequestId} 
        />

      </Container>
    </>
  );
} 

export default DispatchPage;
