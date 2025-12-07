'use client';

import React from 'react';
import { Modal, Box, Typography, keyframes, Grid, Chip, Avatar } from '@mui/material';

// Define the shape of the drug request for the props
interface DrugRequest {
  id: number;
  name: string;
  form: string;
  strength: string;
  quantity: number;
  image: string | null;
}

// Keyframes for the animations
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(0.5); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
`;

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: 800,
  bgcolor: '#001a14',
  border: '2px solid #004d40',
  boxShadow: '0 0 30px rgba(0, 255, 200, 0.5)',
  p: 2,
  borderRadius: '16px',
  color: '#e0f2f1',
  outline: 'none',
};

const radarContainerStyle = {
  height: 250,
  width: 250,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `
    radial-gradient(circle, rgba(0, 51, 43, 0.8) 1px, transparent 1px),
    linear-gradient(to right, #00332b 1px, transparent 1px),
    linear-gradient(to bottom, #00332b 1px, transparent 1px)
  `,
  backgroundSize: '20px 20px, 20px 20px, 20px 20px',
  borderRadius: '50%',
  border: '2px solid #006d5b',
  mb: 2,
  mx: 'auto',
  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.7)',
};

const scannerBeamStyle = {
    width: '50%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: '50%',
    transformOrigin: 'left center',
    background: 'linear-gradient(90deg, transparent, rgba(0, 255, 200, 0.3), transparent)',
    animation: `${rotate} 4s linear infinite`,
};

const detectionDotStyle = (top: string, left: string, delay: string) => ({
    width: 10,
    height: 10,
    backgroundColor: '#66ff99',
    borderRadius: '50%',
    position: 'absolute',
    top,
    left,
    boxShadow: '0 0 10px #66ff99',
    animation: `${pulse} 2s infinite`,
    animationDelay: delay,
});

interface SearchRadarModalProps {
  open: boolean;
  onClose: () => void;
  requests: DrugRequest[];
}

const SearchRadarModal: React.FC<SearchRadarModalProps> = ({ open, onClose, requests }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="searching-modal-title"
    >
      <Box sx={modalStyle}>
        <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
                 <Typography id="searching-modal-title" variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1, color: '#4CAF50', textAlign: 'center' }}>
                    Searching for Pharmacies...
                </Typography>
                <Box sx={radarContainerStyle}>
                    <Box sx={scannerBeamStyle} />
                    <Box sx={detectionDotStyle('20%', '30%', '0s')} />
                    <Box sx={detectionDotStyle('50%', '70%', '0.5s')} />
                    <Box sx={detectionDotStyle('75%', '40%', '1s')} />
                    <Box sx={detectionDotStyle('30%', '80%', '1.5s')} />
                    <Box sx={detectionDotStyle('60%', '15%', '2s')} />
                </Box>
                <Typography variant="body2" sx={{ color: '#b2dfdb', textAlign: 'center' }}>
                    Please wait while we connect with nearby pharmacies.
                </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
                 <Typography variant="h6" sx={{ color: '#80cbc4', borderBottom: '1px solid #004d40', pb: 1, mb: 2, fontWeight: 600 }}>
                    Dispatch Request
                </Typography>
                <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                    {requests.map((drug) => {
                        const isImageBased = drug.name.startsWith('Prescription') || drug.name.startsWith('Image');
                        return (
                            <Box key={drug.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1.5, bgcolor: 'rgba(0, 61, 51, 0.5)', borderRadius: '8px' }}>
                                {drug.image && <Avatar src={drug.image} sx={{ width: 40, height: 40, mr: 2 }} />}
                                <Box>
                                    <Typography sx={{ fontWeight: 600, color: 'white' }}>{drug.name}</Typography>
                                    {!isImageBased && (
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                            <Chip label={`Qty: ${drug.quantity}`} size="small" variant="outlined" sx={{ color: '#b2dfdb', borderColor: '#004d40' }} />
                                            {drug.strength && <Chip label={drug.strength} size="small" variant="outlined" sx={{ color: '#b2dfdb', borderColor: '#004d40' }} />}
                                            {drug.form && <Chip label={drug.form} size="small" variant="outlined" sx={{ color: '#b2dfdb', borderColor: '#004d40' }} />}
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )
                    })}
                </Box>
            </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default SearchRadarModal;
