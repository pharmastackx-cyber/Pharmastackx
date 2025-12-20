
'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  Button,
  Paper,
  Chip,
  Divider,
  Avatar
} from '@mui/material';
import { useRouter } from 'next/navigation';

// --- FIX: Add the optional 'image' property to the item interface ---
interface ItemDetail {
    name: string;
    quantity: number;
    image?: string | null; // <<< Item-specific image
}

interface RequestItem {
  _id: string;
  createdAt: string;
  status: string;
  requestType: 'drug-list' | 'image-upload';
  items: ItemDetail[] | string[];
}

const OrderRequestsContent: React.FC = () => {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/requests');
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress/></Box>}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
        {!loading && !error && requests.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="body1">There are no pending requests.</Typography></Box>
        )}

        {!loading && requests.length > 0 && (
            <List sx={{p: 0}}>
              {requests.map((request) => (
                <Paper key={request._id} component="li" sx={{ p: 2, mb: 2, borderRadius: '12px', listStyle: 'none', background: 'rgba(0, 0, 0, 0.04)'}} elevation={0}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                     <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>{`Request from ${new Date(request.createdAt).toLocaleString()}`}</Typography>
                     <Chip label={request.status} color={request.status === 'pending' ? 'warning' : 'success'} />
                  </Box>
                  
                  <Divider sx={{my: 1.5}} />

                  {/* --- RENDER LOGIC BASED ON requestType --- */}
                  {request.requestType === 'image-upload' ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, my: 1 }}>
                        <Avatar src={Array.isArray(request.items) ? (request.items[0] as string) : ''} variant="rounded" sx={{ width: 48, height: 48, mr: 2, border: '1px solid', borderColor: 'divider' }}/>
                        <Typography variant="body1" sx={{fontWeight: 500}}>Uploaded Prescription</Typography>
                    </Box>
                  ) : (
                    // --- FIX: For drug lists, map items and show image for each ---
                    <Box sx={{ my: 1, pl: 1 }}>
                        {(request.items as ItemDetail[]).map((item, itemIndex) => (
                            <Box key={itemIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                {item.image && (
                                    <Avatar src={item.image} variant="rounded" sx={{ width: 40, height: 40, mr: 1.5, border: '1px solid', borderColor: 'divider' }}/>
                                )}
                                <Typography>
                                    {item.name} (Qty: {item.quantity})
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                  )}
                  
                  <Box sx={{mt: 2}}>
                    <Button variant="outlined" size="small" onClick={() => router.push(`/requests/${request._id}`)}>Manage Request</Button>
                  </Box>
                </Paper>
              ))}
            </List>
        )}
        </Paper>
  );
};

export default OrderRequestsContent;
