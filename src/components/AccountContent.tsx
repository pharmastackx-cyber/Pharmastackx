
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface AccountContentProps {
    setView: (view: string) => void;
}

const AccountContent: React.FC<AccountContentProps> = ({ setView }) => {
  return (
    <Box sx={{ p: 3, textAlign: 'center', color: 'white' }}>
      <Typography variant="h5">Your Account</Typography>
      <Typography sx={{ mt: 2, mb: 3 }}>
        This feature is coming soon. You'll be able to manage your account details here.
      </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 2, sm: 4 }, mt: 3 }}>
            <Button 
                onClick={() => setView('about')} 
                sx={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                textTransform: 'none',
                '&:hover': { textDecoration: 'underline' },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                p: 0, 
                minWidth: 'auto'
                }}
            >
                About Us
            </Button>
            <Button 
                onClick={() => setView('contact')} 
                sx={{ 
                color: 'rgba(255, 255, 255,.9)', 
                textTransform: 'none',
                '&:hover': { textDecoration: 'underline' },
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                p: 0, 
                minWidth: 'auto'
                }}
            >
                Contact Us
            </Button>
        </Box>
    </Box>
  );
};

export default AccountContent;
