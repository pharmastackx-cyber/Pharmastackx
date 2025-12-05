
'use client';

import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

interface UserDetailsModalProps {
  open: boolean;
  onSubmit: (details: { name: string; contact: string }) => void;
  onSkip: () => void;
}

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 450 },
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
};

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ open, onSubmit, onSkip }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !contact.trim()) {
      setError('Please fill in both your name and a contact number or email.');
      return;
    }
    onSubmit({ name, contact });
  };

  return (
    <Modal open={open} aria-labelledby="user-details-modal-title">
      <Box sx={modalStyle}>
        <IconButton 
            aria-label="skip"
            onClick={onSkip} 
            sx={{ position: 'absolute', right: 12, top: 12, color: 'grey.500' }}
        >
          <Close />
        </IconButton>
        <Typography id="user-details-modal-title" variant="h6" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
          Help Us Serve You Better
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Before you search, please provide your details. This allows us to notify you if your medicine is out of stock and help you find it.
        </Typography>
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
          label="Phone Number or Email"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          sx={{ mb: 3 }}
        />
        {error && <Typography color="error" variant="caption" sx={{ mb: 2, display: 'block' }}>{error}</Typography>}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onSkip} sx={{ color: 'text.secondary' }}>
            Skip for Now
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit & Search
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UserDetailsModal;
