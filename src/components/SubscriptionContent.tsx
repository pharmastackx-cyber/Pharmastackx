
"use client";
import { useState } from 'react';
import { Box, Typography, Button, Paper, TextField, CircularProgress, List, ListItem, ListItemText } from "@mui/material";
import { useSession } from "@/context/SessionProvider";

interface SubscriptionContentProps {
    onSubscriptionSuccess: () => void;
}

const SubscriptionContent = ({ onSubscriptionSuccess }: SubscriptionContentProps) => {
    const { user } = useSession();
    const [promoCode, setPromoCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleSubscription = async () => {
        setIsLoading(true);
        setStatus('Processing...');

        if (promoCode.toUpperCase() === 'ALLFREE') {
            try {
                const response = await fetch('/api/subscription/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ promoCode: 'ALLFREE' }),
                });

                if (response.ok) {
                    setStatus('Subscription successful!');
                    onSubscriptionSuccess(); // Call the success handler
                } else {
                    const data = await response.json();
                    setStatus(data.error || 'Failed to update subscription.');
                }
            } catch (error) {
                setStatus('An error occurred.');
            } finally {
                setIsLoading(false);
            }
        } else {
            // TODO: Integrate Paystack
            setStatus('Redirecting to Paystack...');
            // This is where you would redirect to Paystack
            // For now, we'll just simulate a delay
            setTimeout(() => {
                setIsLoading(false);
            }, 2000);
        }
    };

    return (
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, bgcolor: 'white', color: 'black' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Subscription</Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Unlock premium features with our monthly subscription.
            </Typography>
            <Box sx={{ mb: 3, pl: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                <Typography variant="h6" sx={{mb: 1}}>Premium Features:</Typography>
                <List sx={{p: 0, listStyle: 'disc', pl: 2}}>
                    <ListItem sx={{display: 'list-item', p: 0}}><ListItemText primary="Access to the specific pharmacy name, address, and pharmacist." /></ListItem>
                    <ListItem sx={{display: 'list-item', p: 0}}><ListItemText primary="Select pickup location (free delivery fee)." /></ListItem>
                    <ListItem sx={{display: 'list-item', p: 0}}><ListItemText primary="No service fee on all orders for a month (up to 4 orders)." /></ListItem>
                    <ListItem sx={{display: 'list-item', p: 0}}><ListItemText primary="Consult with a pharmacist for free." /></ListItem>
                </List>
            </Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Cost: $2 or ₦3,200 per month</Typography>
            <TextField
                label="Promo Code"
                variant="outlined"
                fullWidth
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                sx={{ mb: 2 }}
                helperText=""
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleSubscription}
                disabled={isLoading}
                fullWidth
                sx={{ py: 1.5 }}
            >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Subscribe'}
            </Button>
            {status && <Typography sx={{ mt: 2, textAlign: 'center', color: status.includes('successful') ? 'green' : 'red' }}>{status}</Typography>}
        </Paper>
    );
};

export default SubscriptionContent;
