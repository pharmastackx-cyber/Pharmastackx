'use client'

import {
  Typography,
  Container,
  Box,
  Paper,
} from '@mui/material';

export default function AboutContent() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 500, mb: 2, color: '#96ffde' }}>
          About PharmaStackX
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', maxWidth: '800px', mx: 'auto' }}>
          Our Mission: Closing Africa's Access Gap
        </Typography>
      </Box>

      {/* Mission Statement */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4, borderRadius: '16px', bgcolor: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: 'white' }}>
          Our Mission
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.8)' }}>
          PharmaStackX is building the essential digital infrastructure required for modern healthcare in Africa. 
          Our core mission is to end the devastating public health problem caused by inventory invisibility. 
          When a patient needs life-saving medication, they should never be turned away. We achieve this by 
          transforming every local community pharmacy into a node of a real-time fulfillment network.
        </Typography>
      </Paper>

      {/* The Problem We Solve */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4, borderRadius: '16px', bgcolor: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#ff8a80' }}>
          The Problem We Solve
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.8)' }}>
          The challenge is not a lack of medicine; it is a lack of information. Patients, doctors, and hospitals 
          suffer devastating delays when they cannot confirm stock levels, who has the medication? How far is it 
          from me? This stock-out gap is a logistical crisis that leads to wasted time, lost revenue for pharmacists, 
          and poor patient outcomes.
        </Typography>
      </Paper>

      {/* Our Solution */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4, borderRadius: '16px', bgcolor: 'rgba(150, 255, 222, 0.1)', backdropFilter: 'blur(10px)', color: 'white' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
          Our Solution: The Intelligent Fulfillment Stack
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, mb: 3, color: 'rgba(255, 255, 255, 0.8)' }}>
        PharmaStackX is not just a delivery app; we are an Intelligent Fulfillment Network built around the Pharmacist-as-a-Service model.
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.8)' }}>
        We transform every community pharmacy into an urgent fulfillment node, accessible through a simple, conversational platform.
        </Typography>
      </Paper>

      {/* Our Vision */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4, borderRadius: '16px', bgcolor: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#96ffde' }}>
          Our Vision
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.8)' }}>
          We are committed to building the most reliable and data-rich platform for medicine fulfillment, 
          turning every pharmacy in Africa into a digitally empowered, reliable access point. We are building 
          the future of African health, one fulfilled prescription at a time.
        </Typography>
      </Paper>

      {/* Call to Action */}
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center', borderRadius: '16px', bgcolor: 'rgba(150, 255, 222, 0.2)', backdropFilter: 'blur(10px)', color: 'white' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Join Us in Transforming Healthcare Access
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.8)' }}>
          Together, we can ensure that no patient in Africa is left without access to the medications they need.
        </Typography>
      </Paper>
    </Container>
  );
}
