'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Grid,
  Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Navbar from '@/components/Navbar'; // Assuming you have a Navbar component

// Interfaces
interface QuotedItem {
  name: string;
  price: number;
  pharmacyQuantity: number;
  isAvailable: boolean;
  image?: string | null;
  form?: string;
  strength?: string;
  quantity?: number; // Original requested quantity
}

interface QuoteRequest {
  _id: string;
  createdAt: string;
  status: string;
  items: QuotedItem[];
  notes?: string; // Pharmacist's notes
}

const ReviewQuotePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [request, setRequest] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<'accept' | 'reject' | null>(null);

  useEffect(() => {
    if (id) {
      const fetchRequest = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/requests/${id}`);
          if (!response.ok) throw new Error('Failed to fetch your quote. Please try again later.');
          const data: QuoteRequest = await response.json();
          setRequest(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchRequest();
    }
  }, [id]);

  const handleDecision = async (decision: 'awaiting-confirmation' | 'rejected') => {
    setIsSubmitting(decision === 'awaiting-confirmation' ? 'accept' : 'reject');
    setError(null);
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: decision }),
      });
      if (!response.ok) throw new Error(`Failed to ${decision === 'rejected' ? 'reject' : 'accept'} the quote.`);
      // Refresh the page to show the final status
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(null);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'quoted': return <Chip label="Quote Ready for Review" color="primary" />; 
      case 'awaiting-confirmation': return <Chip label="You Accepted This Quote" color="success" variant="filled" />;
      case 'confirmed': return <Chip label="Order Confirmed by Pharmacy" color="success" variant="filled" />;
      case 'rejected': return <Chip label="You Rejected This Quote" color="error" variant="filled" />;
      default: return <Chip label={status.replace('-', ' ')} />;
    }
  };

  const availableItems = request?.items.filter(item => item.isAvailable) || [];
  const totalPrice = availableItems.reduce((acc, item) => acc + (item.price * item.pharmacyQuantity), 0);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {!request ? (
          <Alert severity="warning">Could not load your request details.</Alert>
        ) : (
          <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: '16px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => router.back()} aria-label="go back">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" component="h1" sx={{ ml: 1, flexGrow: 1 }}>Review Your Quote</Typography>
                {getStatusChip(request.status)}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Pharmacist's Notes */}
            {request.notes && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.lighter', borderRadius: '12px' }}>
                <Typography variant="h6" gutterBottom>Notes from the Pharmacist</Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{request.notes}</Typography>
              </Box>
            )}

            {/* Items List */}
            <Typography variant="h6" gutterBottom>Quoted Items</Typography>
            <Grid container spacing={2}>
              {availableItems.length > 0 ? availableItems.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {item.image && <Avatar src={item.image} variant="rounded" sx={{ mr: 2 }} />} 
                        <Box>
                          <Typography variant="body1" sx={{fontWeight: 'bold'}}>{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{`Available: ${item.pharmacyQuantity} unit(s)`}</Typography>
                        </Box>
                      </Box>
                      <Typography variant="h6">₦{item.price.toLocaleString()}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )) : (
                <Grid item xs={12}><Alert severity="info" sx={{width: '100%'}}> Medicine search ongoing, you will be notified when found.</Alert></Grid>
              )}
            </Grid>
            
            {/* Total and Action Buttons */}
            {availableItems.length > 0 && (
              <Box>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h5" component="p">Total:&nbsp;</Typography>
                      <Typography variant="h5" component="p" sx={{fontWeight: 'bold'}}>₦{totalPrice.toLocaleString()}</Typography>
                  </Box>

                  {/* Show buttons only if a decision hasn't been made */}
                  {request.status === 'quoted' && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                          <Button 
                              variant="outlined"
                              color="error"
                              onClick={() => handleDecision('rejected')} 
                              disabled={!!isSubmitting}
                          >
                              {isSubmitting === 'reject' ? <CircularProgress size={24} /> : 'Reject Quote'}
                          </Button>
                          <Button 
                              variant="contained" 
                              color="success" 
                              onClick={() => handleDecision('awaiting-confirmation')} 
                              disabled={!!isSubmitting}
                              sx={{color: 'white'}}
                          >
                              {isSubmitting === 'accept' ? <CircularProgress size={24} /> : 'Accept & Proceed'}
                          </Button>
                      </Box>
                  )}
              </Box>
            )}
            
          </Paper>
        )}
      </Container>
    </>
  );
};

export default ReviewQuotePage;
