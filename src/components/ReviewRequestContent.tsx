'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  Grid,
  Card, 
  CardContent,
  List, 
  ListItem, 
  ListItemText,
  Skeleton
} from '@mui/material';
import { useCart } from '@/contexts/CartContext';

// --- INTERFACES ---

interface Pharmacy {
  _id: string;
  name: string;
  address?: string;
  distance?: string; 
}

interface QuoteItem {
  name: string;
  price?: number;
  pharmacyQuantity?: number;
  isAvailable?: boolean;
}

interface Quote {
  _id: string;
  pharmacy: Pharmacy;
  items: QuoteItem[];
  notes?: string;
  status: 'offered' | 'accepted' | 'rejected';
  quotedAt: string;
}

interface OriginalItem {
  name: string;
  form?: string;
  strength?: string;
  quantity: number;
  image?: string | null;
}

interface Request {
  _id: string;
  createdAt: string;
  status: 'pending' | 'quoted' | 'awaiting-confirmation' | 'confirmed' | 'dispatched' | 'rejected' | 'cancelled';
  items: OriginalItem[];
  quotes: Quote[];
}


const getStatusChip = (status: Request['status']) => {
    switch (status) {
      case 'pending': return <Chip label="Waiting for Quotes" color="default" />;
      case 'quoted': return <Chip label="Quotes Received" color="primary" />; 
      case 'awaiting-confirmation': return <Chip label="Quote Accepted" color="success" variant="filled" />;
      case 'confirmed': return <Chip label="Order Confirmed" color="success" variant="filled" />;
      case 'rejected':
      case 'cancelled': return <Chip label="Request Cancelled" color="error" variant="filled" />;
      default: return <Chip label={status.replace('-', ' ')} />;
    }
};

// --- QUOTE CARD COMPONENT --- 

const QuoteCard: React.FC<{ quote: Quote; onRequestDecision: (quoteId: string, items: any[]) => void; isActionDisabled: boolean; isFetchingDistance: boolean; }> = 
({ quote, onRequestDecision, isActionDisabled, isFetchingDistance }) => {

    const validItems = useMemo(() => 
        quote.items.filter(item => 
            item.isAvailable &&
            typeof item.price === 'number' &&
            typeof item.pharmacyQuantity === 'number' &&
            item.pharmacyQuantity > 0
        ), [quote.items]);

    const totalPrice = useMemo(() => 
        validItems.reduce((acc, item) => acc + (item.price! * item.pharmacyQuantity!), 0), 
        [validItems]
    );

    return (
        <Card variant="outlined" sx={{ mb: 2, borderRadius: '16px', border: quote.status === 'accepted' ? '2px solid' : '', borderColor: 'success.main' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h6">{quote.pharmacy.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant="body2" color="text.secondary" component="span">{quote.pharmacy.address}</Typography>
                          {isFetchingDistance && <Skeleton width={80} sx={{ ml: 1, display: 'inline-block' }} />}
                          {quote.pharmacy.distance && (
                            <Typography variant="body2" color="text.secondary" component="span" sx={{ fontWeight: 'bold', ml: 1 }}>
                              • {quote.pharmacy.distance}
                            </Typography>
                          )}
                        </Box>
                    </Box>
                    {quote.status === 'accepted' && <Chip label="Accepted" color="success" />}
                </Box>

                {quote.notes && <Alert severity="info" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{quote.notes}</Alert>}
                
                <Divider sx={{ my: 2 }} />

                <List dense>
                    {validItems.map((item, index) => (
                        <ListItem key={index} disableGutters secondaryAction={<Typography variant="body1" fontWeight="bold">₦{item.price?.toLocaleString()}</Typography>}>
                           <ListItemText primary={item.name} secondary={`Quantity: ${item.pharmacyQuantity}`} />
                        </ListItem>
                    ))}
                </List>

                 {validItems.length === 0 && (
                     <Typography color="text.secondary" sx={{mt: 1}}>The pharmacy did not have any of the requested items in stock or the quote was incomplete.</Typography>
                 )}

            </CardContent>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="p">Total: <span style={{fontWeight: 'bold'}}>₦{totalPrice.toLocaleString()}</span></Typography>
                {!isActionDisabled && (
                    <Button variant="contained" color="success" onClick={() => onRequestDecision(quote._id, validItems)} disabled={validItems.length === 0} sx={{color: 'white'}}>Accept Quote</Button>
                )}
            </Box>
        </Card>
    )
}

// --- MAIN COMPONENT --- 

const ReviewRequestContent: React.FC<{ requestId: string; setView: (view: string) => void; }> = ({ requestId, setView }) => {
  const router = useRouter();
  const { addToCart, updateQuantity } = useCart();

  const [request, setRequest] = useState<Request | null>(null);
  const [distances, setDistances] = useState<{ [pharmacyId: string]: string }>({});
  const [isFetchingDistances, setIsFetchingDistances] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (requestId) {
      const fetchRequest = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/requests/${requestId}`);
          if (!response.ok) throw new Error('Failed to fetch your request details.');
          setRequest(await response.json());
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      fetchRequest();
    }
  }, [requestId]);

  useEffect(() => {
    if (request && request.status === 'quoted' && request.quotes.length > 0) {
      setIsFetchingDistances(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`/api/distance?requestId=${requestId}&lat=${latitude}&lon=${longitude}`);
            if (response.ok) {
              setDistances(await response.json());
            }
          } catch (err) {
            console.error("Failed to fetch distances:", err);
          } finally {
            setIsFetchingDistances(false);
          }
        },
        (geoError) => {
          console.error("Geolocation error:", geoError.message);
          setError("Couldn't get your location. Please enable location services to see pharmacy distances.");
          setIsFetchingDistances(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, [request, requestId]);

  const handleAcceptQuote = async (quoteId: string, itemsToAdd: any[]) => {
      setIsSubmitting(true);
      setError(null);
      try {
          const response = await fetch(`/api/requests/${requestId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'accept-quote', quoteId }),
          });
          if (!response.ok) throw new Error((await response.json()).message || 'Failed to accept the quote.');

          itemsToAdd.forEach((item, index) => {
              const numericId = Date.now() + index;
              addToCart({
                  id: numericId,
                  name: item.name,
                  price: item.price,
                  image: request?.items.find(i => i.name === item.name)?.image || '',
                  activeIngredients: request?.items.find(i => i.name === item.name)?.strength || '',
                  pharmacy: enrichedQuotes.find(q => q._id === quoteId)?.pharmacy.name || 'Pharmacy',
                  drugClass: 'From Quote',
              });
              updateQuantity(numericId, item.pharmacyQuantity);
          });
          
          // Navigate to cart view within the homepage
          setView('cart');

      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          setIsSubmitting(false);
      }
  };
  
  const handleCancelRequest = async () => {
      if (!window.confirm('Are you sure you want to cancel this entire request?')) return;
      setIsSubmitting(true);
      setError(null);
      try {
          await fetch(`/api/requests/${requestId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel-request' }) });
          const fetchResponse = await fetch(`/api/requests/${requestId}`);
          setRequest(await fetchResponse.json());
      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
          setIsSubmitting(false);
      }
  };
  
  const isActionDisabled = useMemo(() => isSubmitting || request?.status !== 'quoted', [isSubmitting, request?.status]);
  const acceptedQuote = useMemo(() => request?.quotes.find(q => q.status === 'accepted'), [request]);

  const enrichedQuotes = useMemo(() => {
    if (!request?.quotes) return [];
    return request.quotes.map(quote => ({
      ...quote,
      pharmacy: {
        ...quote.pharmacy,
        distance: distances[quote.pharmacy._id] || ''
      }
    }));
  }, [request?.quotes, distances]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, color: 'text.primary' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!request ? <Alert severity="warning">Could not load your request details.</Alert> : (
        <Grid container spacing={{ xs: 2, md: 4 }}>
            <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: '16px', position: 'sticky', top: '80px' }}>
                    <Typography variant="h6" gutterBottom>Your Original Request</Typography>
                    <List dense>{request.items.map((item, i) => <ListItem key={i} disableGutters><ListItemText primary={item.name} secondary={`Qty: ${item.quantity}`} /></ListItem>)}</List>
                </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
                <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: '16px', background: 'rgba(255, 255, 255, 0.9)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>Review Quotes</Typography>
                        {getStatusChip(request.status)}
                    </Box>
                    <Divider sx={{ mb: 3 }} />

                    {acceptedQuote && (
                        <Box>
                            <Typography variant="h6" color="success.main" sx={{mb: 2}}>You have accepted this quote:</Typography>
                            <QuoteCard quote={enrichedQuotes.find(q=>q._id === acceptedQuote._id)!} onRequestDecision={() => {}} isActionDisabled={true} isFetchingDistance={false} />
                        </Box>
                    )}

                    {request.status === 'pending' && <Alert severity="info">Waiting for pharmacies to respond to your request...</Alert>}
                    
                    {request.status === 'quoted' && enrichedQuotes.length > 0 && (
                        <Box>
                            {enrichedQuotes.map(quote => (
                                <QuoteCard 
                                    key={quote._id} 
                                    quote={quote} 
                                    onRequestDecision={handleAcceptQuote} 
                                    isActionDisabled={isActionDisabled}
                                    isFetchingDistance={isFetchingDistances}
                                />
                            ))}
                        </Box>
                    )}
                    
                    {request.status === 'quoted' && enrichedQuotes.length === 0 && (
                         <Alert severity="warning">No quotes have been submitted for this request yet.</Alert>
                    )}


                    {request.status === 'quoted' && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                            <Button variant="outlined" color="error" onClick={handleCancelRequest} disabled={isSubmitting}>Cancel Entire Request</Button>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ReviewRequestContent;
