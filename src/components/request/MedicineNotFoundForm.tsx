
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';

// --- NEW: Define props interface ---
interface MedicineNotFoundFormProps {
  initialSearchQuery: string;
  userName?: string; // Optional prop for user's name
  userContact?: string; // Optional prop for user's contact
}

// --- UPDATE: Component now accepts props ---
const MedicineNotFoundForm: React.FC<MedicineNotFoundFormProps> = ({ initialSearchQuery, userName, userContact }) => {
  const [medicineName, setMedicineName] = useState(initialSearchQuery || '');
  const [name, setName] = useState(userName || '');
  const [contact, setContact] = useState(userContact || '');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // --- EFFECT: Sync props with state ---
  useEffect(() => {
    setMedicineName(initialSearchQuery || '');
    setName(userName || '');
    setContact(userContact || '');
  }, [initialSearchQuery, userName, userContact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName || !name || !contact) {
        setErrorMessage('Please fill in all required fields.');
        setSubmitStatus('error');
        return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSubmitStatus(null);

    try {
        const response = await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ medicineName, userName: name, contact, notes }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'An unknown error occurred');
        }

        setSubmitStatus('success');
        // Clear form after success
        setNotes('');

    } catch (error: any) {
        setSubmitStatus('error');
        setErrorMessage(error.message || 'Failed to submit request. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: { xs: 2, sm: 3 }, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
            Can't Find Your Medicine?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We couldn't find a match for "<Typography component="span" sx={{ fontWeight: 'bold' }}>{initialSearchQuery}</Typography>". Let us find it for you! Fill out the form below, and we'll notify you.
        </Typography>

        {submitStatus === 'success' ? (
             <Alert severity="success" sx={{ textAlign: 'left' }}>
                Thank you! Your request has been submitted. Our team will get back to you shortly via WhatsApp or phone call.
            </Alert>
        ) : (
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    required
                    label="Medicine You're Looking For"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    required
                    label="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    required
                    label="Your Phone Number (for WhatsApp)"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Additional Notes (e.g., dosage, brand)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    sx={{ mb: 3 }}
                />
                
                {submitStatus === 'error' && (
                    <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                        {errorMessage}
                    </Alert>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    fullWidth
                    sx={{ py: 1.5, borderRadius: '8px' }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
                </Button>
            </form>
        )}
    </Box>
  );
};

export default MedicineNotFoundForm;
