'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, Typography, Button, Chip, Box, Grid } from '@mui/material';
import { useState } from 'react';

const getStatusChipColor = (status: string) => {
    switch (status) {
        case 'pending': return { bgcolor: 'rgba(255, 193, 7, 0.2)', color: '#ffc107' }; // Amber
        case 'quoted': return { bgcolor: 'rgba(33, 150, 243, 0.2)', color: '#2196f3' }; // Blue
        case 'confirmed': return { bgcolor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }; // Green
        case 'declined': return { bgcolor: 'rgba(244, 67, 54, 0.2)', color: '#f44336' }; // Red
        default: return { bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' };
    }
};

const RequestHistory = ({ history, onRefill }: { history: any[], onRefill: (items: any[]) => void }) => {
    const router = useRouter();
    const [visibleCount, setVisibleCount] = useState(1);
    const [increment, setIncrement] = useState(3);

    const handleShowMore = () => {
        setVisibleCount(prev => prev + increment);
        setIncrement(prev => prev + 2);
    };

    const handleShowLess = () => {
        setVisibleCount(1);
        setIncrement(3);
    };

    if (history.length === 0) return null;

    const visibleHistory = history.slice(0, visibleCount);

    return (
        <Box sx={{ mt: 5 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'white' }}>Recent Requests</Typography>
            <Grid container spacing={2}>
                {visibleHistory.map((request) => (
                    <Grid item xs={12} key={request._id}>
                        <Card sx={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderRadius: '16px' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>{new Date(request.createdAt).toLocaleString()}</Typography>
                                        <Chip label={request.status} size="small" sx={{ mt: 1, ...getStatusChipColor(request.status) }} />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {['confirmed', 'declined', 'cancelled'].includes(request.status) && (
                                            <Button 
                                                size="small" 
                                                variant="outlined"
                                                onClick={() => onRefill(request.items)}
                                                sx={{ 
                                                    color: '#96ffde', 
                                                    borderColor: 'rgba(150, 255, 222, 0.5)', 
                                                    '&:hover': { 
                                                        backgroundColor: 'rgba(150, 255, 222, 0.1)', 
                                                        borderColor: '#96ffde' 
                                                    }
                                                }}
                                            >
                                                Refill
                                            </Button>
                                        )}
                                        <Button 
                                            size="small" 
                                            variant="outlined"
                                            onClick={() => router.push(`/my-requests/${request._id}`)}
                                            sx={{ 
                                                color: 'white', 
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                                '&:hover': { 
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    borderColor: 'white'
                                                }
                                            }}
                                        >
                                            View
                                        </Button>
                                    </Box>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    {request.items.map((item: any, index: number) => (
                                        <Typography key={index} variant="body1" sx={{ display: 'block' }}>
                                            - {item.name} {item.strength && `(${item.strength})`}, Qty: {item.quantity}
                                        </Typography>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {(history.length > 1) && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
                    {visibleCount > 1 && (
                        <Button
                            onClick={handleShowLess}
                            sx={{
                                color: '#96ffde',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: 'rgba(150, 255, 222, 0.1)',
                                }
                            }}
                        >
                            Show Less
                        </Button>
                    )}
                    {visibleCount < history.length && (
                        <Button
                            onClick={handleShowMore}
                            sx={{
                                color: '#96ffde',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: 'rgba(150, 255, 222, 0.1)',
                                }
                            }}
                        >
                            Show More
                        </Button>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default RequestHistory;
