'use client'

import { Typography, Container, Box, Paper, Icon } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InstagramIcon from '@mui/icons-material/Instagram';

export default function ContactContent() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, mb: 2, color: '#96ffde' }}>
          Get in Touch
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', maxWidth: '800px', mx: 'auto' }}>
          We'd love to hear from you. Here's how you can reach us.
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: '16px', bgcolor: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Icon component={EmailIcon} sx={{ color: '#96ffde', mr: 2, fontSize: '2rem' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
              Email Us
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <a href="mailto:pharmastackx@gmail.com" style={{ color: '#96ffde' }}>pharmastackx@gmail.com</a>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Icon component={PhoneIcon} sx={{ color: '#96ffde', mr: 2, fontSize: '2rem' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
              Call Us
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              +234 905 000 6638
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Icon component={InstagramIcon} sx={{ color: '#96ffde', mr: 2, fontSize: '2rem' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
              Follow Us
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <a href="https://www.instagram.com/pharmastackx" target="_blank" rel="noopener noreferrer" style={{ color: '#96ffde' }}>@pharmastackx</a>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
