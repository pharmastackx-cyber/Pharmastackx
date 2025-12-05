
'use client';

import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';

interface MedicineNotFoundFormProps {
  initialSearchQuery: string;
}

const MedicineNotFoundForm: React.FC<MedicineNotFoundFormProps> = ({ initialSearchQuery }) => {
  const [medicineName, setMedicineName] = useState(initialSearchQuery);
  const [userName, setUserName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicineName, userName, contact, notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit request');
      }

      setSubmitStatus('success');
      // Optionally clear the form
      setUserName('');
      setContact('');
      setNotes('');

    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <Alert severity="success" sx={{ mt: 4 }}>
        <Typography variant="h6">Thank You!</Typography>
        <Typography>Your request has been submitted successfully. Our team will review it and get in touch with you shortly.</Typography>
      </Alert>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        mt: 4,
        p: 3,
        border: '1px solid', 
        borderColor: 'divider',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h6">Can't Find Your Medicine?</Typography>
      <Typography variant="body1" color="text.secondary">
        Let us know what you're looking for, and we'll do our best to find it for you.
      </Typography>
      
      <TextField
        label="Medicine Name"
        variant="outlined"
        value={medicineName}
        onChange={(e) => setMedicineName(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Your Name"
        variant="outlined"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Contact (Phone or Email)"
        variant="outlined"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Additional Notes (e.g., dosage, quantity)"
        variant="outlined"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        multiline
        rows={3}
        fullWidth
      />

      {submitStatus === 'error' && (
        <Alert severity="error">{errorMessage}</Alert>
      )}

      <Button 
        type="submit" 
        variant="contained" 
        color="primary" 
        disabled={isLoading}
        sx={{ mt: 1, alignSelf: 'flex-end' }}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Submit Request'}
      </Button>
    </Box>
  );
};

export default MedicineNotFoundForm;
