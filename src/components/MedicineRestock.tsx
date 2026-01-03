'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  IconButton,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  IconButton as MuiIconButton,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

interface RestockItem {
  brandName: string;
  activeIngredients: string;
  form: string;
  strength: string;
  quantity: string;
  image?: File | null;
  imagePreview?: string | null;
}

const drugForms = [
  'Tablet', 'Capsule', 'Syrup', 'Suspension', 'Injection', 'Drops', 
  'Cream', 'Ointment', 'Gel', 'Lotion', 'Suppository', 'Pessary', 
  'Inhaler', 'Nebulizer Solution', 'Powder', 'Granules'
];

interface MedicineRestockProps {
  onBack: () => void;
  userId: string;
}

const MedicineRestock: React.FC<MedicineRestockProps> = ({ onBack, userId }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [items, setItems] = useState<RestockItem[]>([{ brandName: '', activeIngredients: '', form: '', strength: '', quantity: '', image: null, imagePreview: null }]);
  const [notes, setNotes] = useState('');
  const [listUploadFile, setListUploadFile] = useState<File | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    let isValid = false;
    if (tabIndex === 0) {
      isValid = items.some(item => 
        item.brandName || item.activeIngredients || item.form || item.strength || item.quantity || item.image
      );
    } else if (tabIndex === 1) {
      isValid = !!listUploadFile;
    }
    setIsFormValid(isValid);
  }, [items, listUploadFile, tabIndex]);

  const handleItemChange = (index: number, field: keyof RestockItem, value: string) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { brandName: '', activeIngredients: '', form: '', strength: '', quantity: '', image: null, imagePreview: null }]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleListFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setListUploadFile(event.target.files[0]);
    }
  };

  const handleItemImageChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const imagePreview = reader.result as string;
        setItems(currentItems => currentItems.map((item, i) => {
          if (i === index) {
            return { ...item, image: file, imagePreview };
          }
          return item;
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeItemImage = (index: number) => {
    setItems(currentItems => currentItems.map((item, i) => {
      if (i === index) {
        return { ...item, image: null, imagePreview: null };
      }
      return item;
    }));
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setSubmissionStatus('submitting');
    setError(null);

    const formData = new FormData();
    formData.append('userId', userId);

    if (tabIndex === 0) {
      formData.append('submissionType', 'list');
      const textItems = items.map(({ image, imagePreview, ...rest }) => rest);
      formData.append('listContent', JSON.stringify(textItems));

      items.forEach((item, index) => {
        if (item.image) {
          formData.append(`itemImage_${index}`, item.image, item.image.name);
        }
      });
    } else {
      formData.append('submissionType', 'file');
      if (listUploadFile) {
        formData.append('listFile', listUploadFile);
      }
    }

    formData.append('notes', notes);

    try {
      const response = await fetch('/api/submit-restock', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmissionStatus('submitted');
      } else {
        throw new Error(result.message || 'An unknown error occurred.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit the request. Please try again.');
      setSubmissionStatus('error');
    }
  };
  
  if (submissionStatus === 'submitted') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Request Submitted</Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for your submission. Your request is being reviewed, and you will be contacted shortly.
          </Typography>
          <Button variant="contained" sx={{ mt: 4 }} onClick={() => {
            setSubmissionStatus('idle');
            setItems([{ brandName: '', activeIngredients: '', form: '', strength: '', quantity: '', image: null, imagePreview: null }]);
            setListUploadFile(null);
            setNotes('');
            onBack();
          }}>
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: '16px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <MuiIconButton onClick={onBack} sx={{ mr: 1 }}><ArrowBackIcon /></MuiIconButton>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Medicine Restock
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, pl: '48px' }}>
        Easily restock your inventory by building a list or uploading a file. We'll get back to you with a quote and delivery details.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} aria-label="restock method">
          <Tab label="Build a List" />
          <Tab label="Upload File" />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <Box>
          {items.map((item, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: 'center' }}>
              <Grid item xs={12} sm={6} md={2.5}><TextField fullWidth label="Brand Name" value={item.brandName} onChange={e => handleItemChange(index, 'brandName', e.target.value)} /></Grid>
              <Grid item xs={12} sm={6} md={2.5}><TextField fullWidth label="Active Ingredients" value={item.activeIngredients} onChange={e => handleItemChange(index, 'activeIngredients', e.target.value)} /></Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Form</InputLabel>
                  <Select label="Form" value={item.form} onChange={e => handleItemChange(index, 'form', e.target.value)}>
                    {drugForms.map(form => <MenuItem key={form} value={form}>{form}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={1}><TextField fullWidth label="Strength" value={item.strength} onChange={e => handleItemChange(index, 'strength', e.target.value)} /></Grid>
              <Grid item xs={6} sm={3} md={1}><TextField fullWidth label="Quantity" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} /></Grid>
              <Grid item xs={10} sm={10} md={2} sx={{ textAlign: 'center' }}>
                {item.imagePreview ? (
                  <Box sx={{ position: 'relative', display: 'inline-block' }}>
                    <img src={item.imagePreview} alt="Preview" style={{ height: '40px', borderRadius: '4px' }} />
                    <IconButton size="small" onClick={() => removeItemImage(index)} sx={{ position: 'absolute', top: -10, right: -10, p: 0.2, backgroundColor: 'rgba(255,255,255,0.8)', '&:hover': {backgroundColor: 'white'} }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Button variant="outlined" component="label" size="small" startIcon={<PhotoCamera />}>
                    Image
                    <input type="file" accept="image/*" hidden onChange={(e) => handleItemImageChange(index, e)} />
                  </Button>
                )}
              </Grid>
              <Grid item xs={2} sm={2} md={1} sx={{ textAlign: 'right' }}>
                {items.length > 1 && <IconButton onClick={() => removeItem(index)} color="error"><DeleteIcon /></IconButton>}
              </Grid>
            </Grid>
          ))}
          <Button startIcon={<AddCircleOutlineIcon />} onClick={addItem} sx={{ mt: 1 }}>
            Add Another Item
          </Button>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box sx={{ textAlign: 'center', p: 4, border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <FileUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
          <Typography sx={{ mt: 2, mb: 1 }}>
            Click the button to select a restock file from your device.
          </Typography>
          <Button variant="contained" component="label">
            Select File
            <input type="file" hidden onChange={handleListFileChange} />
          </Button>
          {listUploadFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected: <strong>{listUploadFile.name}</strong>
            </Typography>
          )}
        </Box>
      )}
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 1.5 }}>Additional Notes (Optional)</Typography>
        <TextField 
            fullWidth 
            multiline 
            rows={3} 
            label="Add any notes here..."
            variant="outlined" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
        />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          size="large"
          onClick={handleSubmit} 
          disabled={!isFormValid || !userId || submissionStatus === 'submitting'}
        >
          {submissionStatus === 'submitting' ? <CircularProgress size={24} /> : 'Submit Restock Request'}
        </Button>
      </Box>
    </Paper>
  );
};

export default MedicineRestock;
