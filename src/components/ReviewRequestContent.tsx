'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Skeleton,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Collapse
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
  productId: string;
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

// --- HELPERS ---

type SortByType = 'efficiency' | 'price' | 'distance' | 'date';

const sortDescriptions: Record<SortByType, string> = {
    efficiency: 'Quotes are sorted by our Best Match algorithm (closest and cheapest).',
    price: 'Quotes are sorted by price from lowest to highest.',
    distance: 'Quotes are sorted by distance from nearest to furthest.',
    date: 'Quotes are sorted by date from newest to oldest.'
};

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
    
    const isDistanceError = quote.pharmacy.distance && 
        ["Pharmacist location not recorded.", "Distance calculation failed.", "User location not taken."].includes(quote.pharmacy.distance);

    return (
        <Card variant="outlined" sx={{ mb: 2, borderRadius: '16px', border: quote.status === 'accepted' ? '2px solid' : '', borderColor: 'success.main' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h6">{quote.pharmacy.name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography variant="body2" color="text.secondary" component="span">{quote.pharmacy.address}</Typography>
                          {isFetchingDistance && <Skeleton width={80} sx={{ ml: 1, display: 'inline-block' }} />}
                          {!isFetchingDistance && quote.pharmacy.distance && (
                             <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', ml: 1, color: isDistanceError ? 'error.main' : 'text.secondary' }}>
                                • {quote.pharmacy.distance}
                            </Typography>
                          )}
                           {!isFetchingDistance && !quote.pharmacy.distance && !isDistanceError && (
                                <Typography variant="body2" color="text.secondary" component="span" sx={{ fontWeight: 'bold', ml: 1 }}>
                                    • Distance not available
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
  const { addToCart, updateQuantity } = useCart();

  const [request, setRequest] = useState<Request | null>(null);
  const [distances, setDistances] = useState<{ [pharmacyId: string]: string }>({});
  const [isFetchingDistances, setIsFetchingDistances] = useState(true); // Start true
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [distanceError, setDistanceError] = useState<string | null>(null); // To hold the single, overarching distance error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<SortByType>('efficiency');
  const [isOriginalItemsExpanded, setOriginalItemsExpanded] = useState(false);

  const fetchDistances = useCallback(async (latitude: number, longitude: number) => {
    setIsFetchingDistances(true);
    setDistanceError(null);
    try {
        const response = await fetch(`/api/distance?requestId=${requestId}&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        if (response.ok) {
            setDistances(data);
        } else {
            throw new Error(data.message || 'Failed to fetch pharmacy distances.');
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Could not load pharmacy distances.';
        setDistanceError(errorMessage);
    } finally {
        setIsFetchingDistances(false);
    }
  }, [requestId]);

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
        setDistanceError("Geolocation is not supported by this browser.");
        setIsFetchingDistances(false);
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => {
            fetchDistances(position.coords.latitude, position.coords.longitude);
        },
        (geoError) => {
            // As per instructions, set the specific error message.
            setDistanceError("User location not taken.");
            setIsFetchingDistances(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [fetchDistances]);


  useEffect(() => {
    const fetchRequestAndDistances = async () => {
      try {
        const response = await fetch(`/api/requests/${requestId}`);
        if (!response.ok) throw new Error('Failed to fetch your request details.');
        const data = await response.json();
        setRequest(data);

        if (data.status === 'quoted' && data.quotes.length > 0) {
            requestUserLocation();
        } else {
            setIsFetchingDistances(false);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsFetchingDistances(false);
      } finally {
        setLoading(false);
      }
    };
    
    if (requestId) {
      fetchRequestAndDistances(); // Initial fetch
      const interval = setInterval(fetchRequestAndDistances, 5000); // Poll every 5 seconds

      return () => clearInterval(interval); // Cleanup on component unmount
    }
  }, [requestId, requestUserLocation]);



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

          itemsToAdd.forEach(item => {
              addToCart({
                  id: item.productId,
                  name: item.name,
                  price: item.price,
                  image: request?.items.find(i => i.name === item.name)?.image || '',
                  activeIngredients: request?.items.find(i => i.name === item.name)?.strength || '',
                  pharmacy: sortedQuotes.find(q => q._id === quoteId)?.pharmacy.name || 'Pharmacy',
                  drugClass: 'From Quote',
              });
              updateQuantity(item.productId, item.pharmacyQuantity);
          });
          
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
  const acceptedQuote = useMemo(() => request?.quotes.find(q => q.status === 'accepted'), [request?.quotes]);

  const enrichedQuotes = useMemo(() => {
    if (!request?.quotes) return [];
    return request.quotes.map(quote => ({
      ...quote,
      pharmacy: {
        ...quote.pharmacy,
        // The distance is now either the calculated value or a specific error message
        distance: distances[quote.pharmacy._id] || (distanceError ? (quote.pharmacy.distance || distanceError) : undefined)
      }
    }));
  }, [request?.quotes, distances, distanceError]);

  const sortedQuotes = useMemo(() => {
    const parseDistance = (distanceStr: string | undefined): number => {
        if (!distanceStr || ["Pharmacist location not recorded.", "Distance calculation failed.", "User location not taken."].includes(distanceStr)) {
            return Infinity;
        }
        const match = distanceStr.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : Infinity;
    };

    const calculateTotalPrice = (items: QuoteItem[]): number => {
        return items
            .filter(item => item.isAvailable && typeof item.price === 'number' && typeof item.pharmacyQuantity === 'number' && item.pharmacyQuantity > 0)
            .reduce((acc, item) => acc + (item.price! * item.pharmacyQuantity!), 0);
    };

    return [...enrichedQuotes].sort((a, b) => {
        switch (sortBy) {
            case 'price':
                return calculateTotalPrice(a.items) - calculateTotalPrice(b.items);
            case 'distance':
                return parseDistance(a.pharmacy.distance) - parseDistance(b.pharmacy.distance);
            case 'date':
                return new Date(b.quotedAt).getTime() - new Date(a.quotedAt).getTime();
            case 'efficiency':
            default:
                const distanceA = parseDistance(a.pharmacy.distance);
                const distanceB = parseDistance(b.pharmacy.distance);
                if (distanceA !== distanceB) {
                    return distanceA - distanceB;
                }
                return calculateTotalPrice(a.items) - calculateTotalPrice(b.items);
        }
    });
  }, [enrichedQuotes, sortBy]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, color: 'text.primary' }}>
        
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!request ? <Alert severity="warning">Could not load your request details.</Alert> : (
        <Grid container spacing={{ xs: 2, md: 4 }}>
            <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 2, borderRadius: '16px', position: 'sticky', top: '80px' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>Your Original Request</Typography>
                    <List dense>
                        {request.items.slice(0, 1).map((item, i) => (
                            <ListItem key={i} disableGutters>
                                <ListItemText primary={item.name} secondary={`Qty: ${item.quantity}`} />
                            </ListItem>
                        ))}
                        <Collapse in={isOriginalItemsExpanded}>
                            {request.items.slice(1).map((item, i) => (
                                <ListItem key={i + 1} disableGutters>
                                    <ListItemText primary={item.name} secondary={`Qty: ${item.quantity}`} />
                                </ListItem>
                            ))}
                        </Collapse>
                    </List>
                    {request.items.length > 1 && (
                        <Button
                            size="small"
                            onClick={() => setOriginalItemsExpanded(!isOriginalItemsExpanded)}
                            sx={{ mt: 1 }}
                        >
                            {isOriginalItemsExpanded ? 'Show Less' : `Show ${request.items.length - 1} More...`}
                        </Button>
                    )}
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
                            <QuoteCard quote={sortedQuotes.find(q=>q._id === acceptedQuote._id)!} onRequestDecision={() => {}} isActionDisabled={true} isFetchingDistance={false} />
                        </Box>
                    )}

                    {request.status === 'pending' && <Alert severity="info">Waiting for pharmacies to respond to your request...</Alert>}
                    
                    {request.status === 'quoted' && sortedQuotes.length > 0 && (
                        <Box>
                             {isFetchingDistances && (
                                <Box sx={{textAlign: 'center', my: 2}}>
                                    <CircularProgress />
                                    <Typography>Calculating distances...</Typography>
                                </Box>
                            )}
                            {/* Display a single, high-level error if one exists */}
                            {distanceError && !isFetchingDistances && <Alert severity="error" sx={{mb:2}}>{distanceError}</Alert>}

                            {!isFetchingDistances && (
                                <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                                    <FormControl size="small" sx={{ minWidth: 180 }}>
                                        <Select
                                            value={sortBy}
                                            onChange={(e: SelectChangeEvent) => setSortBy(e.target.value as SortByType)}
                                        >
                                            <MenuItem value="efficiency">Sort by: Best Match</MenuItem>
                                            <MenuItem value="price">Sort by: Price (Low to High)</MenuItem>
                                            <MenuItem value="distance">Sort by: Distance (Nearest)</MenuItem>
                                            <MenuItem value="date">Sort by: Date (Newest)</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Alert severity="info" icon={false} sx={{ flexGrow: 1, p: '0 12px' }}>{sortDescriptions[sortBy]}</Alert>
                                </Box>
                                {sortedQuotes.map(quote => (
                                    <QuoteCard 
                                        key={quote._id} 
                                        quote={quote} 
                                        onRequestDecision={handleAcceptQuote} 
                                        isActionDisabled={isActionDisabled}
                                        isFetchingDistance={isFetchingDistances}
                                    />
                                ))}
                                </>)}

                            {sortedQuotes.length > 0 && sortedQuotes.length < 5 && !acceptedQuote && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    <strong>Pro-Tip:</strong> If you wait a bit longer, you might receive offers of lower amounts from even shorter distance pharmacies.
                                </Alert>
                            )}
                        </Box>
                    )}
                    
                    {request.status === 'quoted' && sortedQuotes.length === 0 && !isFetchingDistances && (
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
