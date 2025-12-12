'use client';

import React from 'react';
import { Modal, Box, IconButton, Backdrop, Fade } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuthModal } from '@/contexts/AuthModalContext';
import ModalAuthContent from './ModalAuthContent'; // Import the new content component

export default function AuthModal() {
    const { isOpen, closeModal } = useAuthModal();

    return (
        <Modal
            open={isOpen}
            onClose={closeModal}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                    sx: { backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }
                },
            }}
            aria-labelledby="auth-modal-title"
            aria-describedby="auth-modal-description"
        >
            <Fade in={isOpen}>
                <Box sx={{ 
                    position: 'relative',
                    height: '100vh', 
                    width: '100vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Ensure clicks outside the content area don't close the modal if needed,
                    // though the backdrop click is handled by Modal's onClose.
                    p: 2, // Add some padding
                }}>
                    {/* The close button remains outside the content, at the top right of the screen */}
                    <IconButton 
                        onClick={closeModal} 
                        sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1, color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                    
                    {/* Render the new, self-contained auth content */}
                    <ModalAuthContent />

                </Box>
            </Fade>
        </Modal>
    );
}
