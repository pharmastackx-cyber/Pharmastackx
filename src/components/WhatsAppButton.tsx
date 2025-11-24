import React from 'react';
import { Box, Typography } from '@mui/material';

const WhatsAppButton = () => {
  return (
    <Box
      component="a"
      href="https://wa.me/2349050006638?text=Hey%20pharmastackx"
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        position: 'fixed',
        bottom: 49,
        right: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#25D366',
        borderRadius: '30px', // Rounded rectangle
        px: 2, // Padding for text
        height: 56,
        color: 'white',
        textDecoration: 'none',
        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        '@keyframes pulse': {
          '0%': {
            transform: 'scale(1)',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
          },
          '50%': {
            transform: 'scale(1.05)', // More subtle pulse
            boxShadow: '0 6px 20px rgba(37, 211, 102, 0.6)',
          },
          '100%': {
            transform: 'scale(1)',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
          },
        },
        animation: 'pulse 2s infinite ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: '0 6px 20px rgba(37, 211, 102, 0.6)',
          animation: 'none',
        },
        '&:active': {
          transform: 'scale(0.98)',
        }
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginRight: 8 }} // Space between icon and text
      >
        <path
          d="M17.472 14.382C17.175 14.233 15.714 13.515 15.441 13.415C15.168 13.316 14.97 13.365 14.773 13.662C14.576 13.959 14.006 14.677 13.832 14.875C13.659 15.072 13.485 15.097 13.188 14.948C12.891 14.799 11.636 14.387 10.496 13.376C9.579 12.564 9.02 11.752 8.846 11.455C8.673 11.158 8.822 11.009 8.956 10.875C9.076 10.755 9.24 10.541 9.389 10.368C9.537 10.194 9.587 10.07 9.686 9.873C9.785 9.676 9.735 9.499 9.661 9.35C9.587 9.202 9.017 7.778 8.77 7.182C8.528 6.586 8.285 6.635 8.109 6.627C7.936 6.62 7.738 6.612 7.539 6.612C7.341 6.612 7.02 6.686 6.747 6.983C6.475 7.28 5.768 7.958 5.768 9.42C5.768 10.881 6.772 12.293 6.92 12.49C7.068 12.687 8.914 15.707 11.895 16.995C12.604 17.301 13.157 17.485 13.589 17.62C14.021 17.755 14.661 17.728 15.171 17.65C15.741 17.564 16.929 16.892 17.176 16.183C17.424 15.474 17.424 14.887 17.349 14.76C17.275 14.632 17.077 14.558 16.78 14.409"
          fill="white"
        />
        <path
          d="M12.05 0C5.495 0 0.16 5.335 0.157 11.892C0.157 13.988 0.704 16.034 1.745 17.839L0.09 23.861L6.263 22.24C7.99 23.231 9.986 23.784 12.05 23.784H12.053C18.608 23.784 23.943 18.449 23.946 11.892C23.946 5.335 18.608 0 12.05 0Z"
          fill="white"
        />
      </svg>
      <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
        Live Support
      </Typography>
    </Box>
  );
};

export default WhatsAppButton;
