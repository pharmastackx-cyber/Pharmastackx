'use client';
import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import axios from 'axios';
import Navbar from '@/components/Navbar';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSuccess('If an account with that email exists, a password reset link has been sent.');
    } catch (err: any) {
      // We show a generic success message even on failure to prevent email enumeration
      setSuccess('If an account with that email exists, a password reset link has been sent.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          mx: 'auto',
          mt: { xs: '50vh', sm: 8, md: 10 },
          transform: { xs: 'translateY(-50%)', sm: 'none', md: 'none' },
          p: { xs: 2, sm: 3, md: 4 },
          background: '#f5f6fa',
          borderRadius: { xs: 4, sm: 5, md: 6 },
          boxShadow: '0 8px 32px 4px rgba(30, 41, 59, 0.25), 0 1.5px 8px 0 rgba(233,30,99,0.10)',
          border: '2.5px solid #e0e0e0',
        }}
      >
        <Typography variant="h5" component="h1" sx={{ textAlign: 'center', mb: 3, fontWeight: 700 }}>
          Forgot Your Password?
        </Typography>
        <Typography sx={{ textAlign: 'center', mb: 3, color: 'text.secondary' }}>
          No worries! Enter your email below and we will send you a link to reset it.
        </Typography>
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>} 
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2, py: 1.5 }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </Box>
    </>
  );
}
