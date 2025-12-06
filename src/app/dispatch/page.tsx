'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon, Edit as EditIcon } from '@mui/icons-material';
import { debounce } from 'lodash';
import Navbar from '../../components/Navbar';
import OtherInfoInput from '../../components/dispatch/OtherInfoInput';
import ConfirmationModal from '../../components/dispatch/ConfirmationModal';

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
    if (lowerCaseDrug.includes('paracetamol') || lowerCaseDrug.includes('ibuprofen')) return ['Tablet', 'Capsule', 'Syrup'];
    if (lowerCaseDrug.includes('amoxicillin')) return ['Capsule', 'Suspension', 'Tablet'];
    return ['Tablet', 'Capsule', 'Injection (IM/IV/SC)'].filter(form => allFormTypes.includes(form));
};

const getAIStrengthSuggestions = (drugName: string): string[] => {
    const lowerCaseDrug = drugName.toLowerCase();
    if (lowerCaseDrug.includes('ibuprofen')) return ['200mg', '400mg', '600mg', '800mg', '100mg/5ml'];
    if (lowerCaseDrug.includes('paracetamol') || lowerCaseDrug.includes('acetaminophen')) return ['325mg', '500mg', '650mg', '120mg/5ml', '250mg/5ml'];
    if (lowerCaseDrug.includes('amoxicillin')) return ['250mg', '500mg', '875mg', '125mg/5ml', '250mg/5ml'];
    if (lowerCaseDrug.includes('lisinopril')) return ['5mg', '10mg', '20mg'];
    if (lowerCaseDrug.includes('metformin')) return ['500mg', '850mg', '1000mg'];
    return [];
};

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

export default function DispatchPage() {
  const [requestedDrugs, setRequestedDrugs] = useState<DrugRequest[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLDivElement>(null);

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
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(requestedDrugs));
        } catch (error) {
            console.error("Failed to save drugs to local storage", error);
        }
    }
  }, [requestedDrugs, isInitialLoad]);

  const fetchSuggestions = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: input }),
      });
      if (response.ok) setSuggestions(await response.json());
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);

  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue);
    debouncedFetchSuggestions(newInputValue);
  };

  const handleAddDrug = (name: string) => {
    if (!name || requestedDrugs.some(drug => drug.name.toLowerCase() === name.toLowerCase())) return;
    const formSuggestions = getAIFormSuggestions(name);
    const strengthSuggestions = getAIStrengthSuggestions(name);
    const newDrug: DrugRequest = {
      id: Date.now(),
      name,
      form: formSuggestions[0] || '',
      strength: strengthSuggestions[0] || '',
      quantity: 1,
      notes: '',
      image: null,
      formSuggestions,
      strengthSuggestions,
      showAllForms: false,
      showOtherInfo: false,
      isEditing: true, 
    };
    setRequestedDrugs(drugs => [newDrug, ...drugs.map(d => ({...d, isEditing: false}))]);
    setInputValue("");
    setSuggestions([]);
  };

  const handleUpdateDrug = (id: number, field: keyof DrugRequest, value: any) => {
    setRequestedDrugs(drugs => drugs.map(drug => (drug.id === id ? { ...drug, [field]: value } : drug)));
  };

  const handleSetEditing = (id: number, editing: boolean) => {
    setRequestedDrugs(drugs => drugs.map(drug => (drug.id === id ? { ...drug, isEditing: editing } : drug)));
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

  const handleAddAnother = () => {
    if (searchInputRef.current) {
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = searchInputRef.current.querySelector('input');
      if (input) {
        input.focus();
      }
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmDispatch = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setRequestedDrugs([]);
    setIsModalOpen(false);
    alert("Search initiated! Your list has been cleared.");
  };

  return (
    <>
      <Navbar />
       <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={8}>
              <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 700, color: '#006D5B' }}>
                Dispatch Request
              </Typography>
              <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                Build your dispatch list by adding one or more medicines. Your progress is saved automatically.
              </Typography>

              <Box sx={{ mb: 4 }} ref={searchInputRef}>
                <Autocomplete
                  freeSolo
                  options={suggestions}
                  getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                  onInputChange={handleInputChange}
                  onChange={(_, newValue) => {
                    const drugName = typeof newValue === 'string' ? newValue : (newValue as Suggestion)?.label;
                    if (drugName) handleAddDrug(drugName);
                  }}
                  inputValue={inputValue}
                  loading={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search to add a medicine..."
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>{loading ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>
                        ),
                      }}
                    />
                  )}
                />
              </Box>

              {requestedDrugs.map((drug) => (
                <Card key={drug.id} sx={{ mb: 2, borderRadius: '16px', boxShadow: 3, overflow: 'visible' }}>
                  <Collapse in={drug.isEditing} timeout="auto" unmountOnExit>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>{drug.name}</Typography>
                          <IconButton onClick={() => handleRemoveDrug(drug.id)} aria-label="delete"><DeleteIcon /></IconButton>
                        </Box>
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
                              {(drug.showAllForms && drug.formSuggestions.length > 0) && <hr />}
                              {drug.showAllForms && allFormTypes.filter(f => !drug.formSuggestions.includes(f)).map((form) => (
                                <MenuItem key={form} value={form}>{form}</MenuItem>
                              ))}
                            </Select>
                            {!drug.showAllForms && (
                              <Button onClick={() => toggleShowAllForms(drug.id)} size="small" sx={{ mt: 1, alignSelf: 'flex-start' }}>
                                More Forms
                              </Button>
                            )}
                          </FormControl>

                          <Autocomplete
                            freeSolo
                            options={drug.strengthSuggestions}
                            value={drug.strength}
                            onInputChange={(_, newValue) => handleUpdateDrug(drug.id, 'strength', newValue)}
                            sx={{ width: { xs: '100%', sm: '220px' } }}
                            renderInput={(params) => (
                              <TextField {...params} label="Strength (e.g., 200mg)" />
                            )}
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
                          <Button
                            size="small"
                            startIcon={drug.showOtherInfo ? <RemoveIcon /> : <AddIcon />}
                            onClick={() => toggleShowOtherInfo(drug.id)}
                          >
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
                                  <Chip label={drug.strength || 'No Strength'} size="small" />
                                  <Chip label={drug.form || 'No Form'} size="small" />
                                  <Chip label={`Qty: ${drug.quantity}`} size="small" />
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

              {requestedDrugs.length > 0 && !requestedDrugs.some(d => d.isEditing) && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                      <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddAnother}>
                          Add Another Medicine
                      </Button>
                  </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenModal}
                  disabled={requestedDrugs.length === 0 || requestedDrugs.some(d => d.isEditing)}
                  sx={{ bgcolor: '#006D5B', '&:hover': { bgcolor: '#004D3F' }, borderRadius: '25px', padding: '10px 30px', fontSize: '1rem' }}
                >
                  Find Medicines
                </Button>
              </Box>
          </Grid>
        </Grid>

        <ConfirmationModal 
            open={isModalOpen} 
            onClose={handleCloseModal} 
            onConfirm={handleConfirmDispatch} 
            requests={requestedDrugs} 
        />
      </Container>
    </>
  );
}
