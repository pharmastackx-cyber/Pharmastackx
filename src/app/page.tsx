
"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'; // Import useRouter
import { Box, Typography, Paper, TextField, IconButton, Avatar, Menu, MenuItem, Button, Grid, CircularProgress, Container } from "@mui/material";
import { motion, AnimatePresence, Variants, LayoutGroup } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import Person from '@mui/icons-material/Person';
import Link from 'next/link';
import { useSession } from "@/context/SessionProvider";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DispatchForm from "@/components/DispatchForm";
import AboutContent from "@/components/AboutContent";
import ContactContent from "@/components/ContactContent";
import FindPharmacyContent from "@/components/FindPharmacyContent";
import OrderRequestsContent from "@/components/OrderRequestsContent"; // Import the new component

const MotionPaper = motion(Paper);

const animatedWords = ["pharmacies", "pharmacists", "medicines"];

export default function HomePage() {
  const { user, isLoading } = useSession();
  const router = useRouter(); // Initialize router
  const [inputValue, setInputValue] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [view, setView] = useState('home');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (response.ok) {
            window.location.href = '/auth';
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('An error occurred during logout:', error);
    }
  };

  const userInitial = user?.email?.charAt(0)?.toUpperCase() || '';

  useEffect(() => {
    const timer = setTimeout(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % animatedWords.length);
    }, 2500);
    return () => clearTimeout(timer);
  }, [wordIndex]);

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    exit: { y: 20, opacity: 0 }
  };

  const renderWelcomeView = () => (
    <Box
      key="welcome"
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      sx={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}
    >
      <motion.div variants={itemVariants}>
        <Typography variant="h4" sx={{ color: "white", fontWeight: 500, mb: 1, fontSize: { xs: '1.75rem', sm: '2.5rem' } }}>
        {user ? `Welcome, ${user.role === 'pharmacy' || user.role === 'clinic' ? user.businessName : user.username}!` : "Welcome!"}
        </Typography>

        <Box sx={{ minHeight: { xs: '60px', sm: '80px' }, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: 500, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.5rem', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
                <span>PharmaStackX connects you to</span>
                <AnimatePresence mode="wait">
                    <motion.span
                        key={wordIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{ color: '#96ffde', display: 'inline-block' }}
                    >
                        {animatedWords[wordIndex]}
                    </motion.span>
                </AnimatePresence>
            </Typography>
        </Box>

        <Typography sx={{ color: "white", fontSize: { xs: '1rem', sm: '1.2rem' }, mt: 2, mb: 4 }}>
          What would you like to do today?
        </Typography>
      </motion.div>

      <motion.div variants={itemVariants}>
        <MotionPaper
          elevation={3}
          sx={{
            p: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '50px',
            background: 'rgba(255, 255, 255, 0.95)',
            mb: { xs: 4, sm: 6 },
          }}
          animate={{
            boxShadow: [
              '0 0 8px rgba(150, 255, 222, 0.4)',
              '0 0 24px rgba(150, 255, 222, 0.8)',
              '0 0 8px rgba(150, 255, 222, 0.4)',
            ],
          }}
          transition={{
            duration: 3,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        >
          <SearchIcon sx={{ color: 'grey.500', mr: 1.5 }} />
          <TextField
            fullWidth
            placeholder="Search for medicines, pharmacies..."
            variant="standard"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            InputProps={{ disableUnderline: true, sx: { fontSize: { xs: '1rem', sm: '1.1rem' } } }}
          />
        </MotionPaper>
      </motion.div>
      
      {!isLoading && (
        user && ['pharmacy', 'pharmacist'].includes(user.role) ? (
          <div>
              <Grid container spacing={1} sx={{ justifyContent: 'center', flexWrap: 'nowrap' }}>
                  <Grid item xs="auto">
                    <motion.div layoutId="store-management-header">
                      <Button variant="contained" size="small" onClick={() => router.push('/store-management')} sx={{ borderRadius: '20px', fontSize: '0.75rem', px: 2, whiteSpace: 'nowrap', transition: 'transform 0.2s', fontWeight: 500, bgcolor: 'secondary.main', color: 'white', '&:hover': { transform: 'scale(1.05)', bgcolor: 'secondary.dark' } }}>
                          Store Management
                      </Button>
                    </motion.div>
                  </Grid>
                  <Grid item xs="auto">
                    <motion.div layoutId="order-requests-header">
                      <Button variant="outlined" size="small" onClick={() => setView('orderRequests')} sx={{ borderRadius: '20px', fontSize: '0.75rem', px: 2, whiteSpace: 'nowrap', borderColor: 'rgba(150, 255, 222, 0.5)', color: 'white', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)', borderColor: '#96ffde', backgroundColor: 'rgba(150, 255, 222, 0.1)' } }}>
                          Order Requests
                      </Button>
                    </motion.div>
                  </Grid>
              </Grid>
          </div>
        ) : (
          <div>
              <Grid container spacing={1} sx={{ justifyContent: 'center', flexWrap: 'nowrap' }}>
                  <Grid item xs="auto">
                    <motion.div layoutId="order-medicines-header">
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => setView('orderMedicines')}
                            sx={{ borderRadius: '20px', fontSize: '0.75rem', px: 2, whiteSpace: 'nowrap', transition: 'transform 0.2s', fontWeight: 500, bgcolor: 'secondary.main', color: 'white', '&:hover': { transform: 'scale(1.05)', bgcolor: 'secondary.dark' } }}
                        >
                            Order Medicines
                        </Button>
                    </motion.div>
                  </Grid>
                  <Grid item xs="auto">
                    <motion.div layoutId="find-pharmacy-header">
                      <Button variant="outlined" size="small" onClick={() => setView('findPharmacy')} sx={{ borderRadius: '20px', fontSize: '0.75rem', px: 2, whiteSpace: 'nowrap', borderColor: 'rgba(150, 255, 222, 0.5)', color: 'white', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)', borderColor: '#96ffde', backgroundColor: 'rgba(150, 255, 222, 0.1)' } }}>
                          Find a Pharmacy
                      </Button>
                    </motion.div>
                  </Grid>
              </Grid>
          </div>
        )
      )}
    </Box>
  );

  const renderPageView = (title: string, layoutId: string, children?: React.ReactNode) => (
    <Box
      key={layoutId}
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      sx={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, display: 'flex', flexDirection: 'column', pt: { xs: 8, sm: 12 }, color: 'white' }}
    >
        <motion.div 
          layoutId={layoutId}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
            <Paper
                elevation={0}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: 'transparent',
                    color: 'white',
                    borderRadius: 0,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                }}
            >
                <IconButton onClick={() => setView('home')} sx={{ color: 'white' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 2, fontWeight: 500 }}>
                    {title}
                </Typography>
            </Paper>
        </motion.div>
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
            {children}
        </Box>
    </Box>
  );

  const renderActiveView = () => {
    switch (view) {
      case 'orderMedicines':
        return renderPageView('Order Medicines', 'order-medicines-header', <DispatchForm />);
      case 'storeManagement':
        return renderPageView('Store Management', 'store-management-header');
      case 'orderRequests':
        return renderPageView('Order Requests', 'order-requests-header', <OrderRequestsContent />);
      case 'findPharmacy':
        return renderPageView('Find a Pharmacy', 'find-pharmacy-header', <FindPharmacyContent />);
      case 'about':
        return renderPageView('About Us', 'about-us-header', <AboutContent />);
      case 'contact':
        return renderPageView('Contact Us', 'contact-us-header', <ContactContent />);
      default:
        return renderWelcomeView();
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      bgcolor: '#121212',
    }}>
      <Box sx={{
          position: 'relative',
          flexGrow: 1,
          background: "linear-gradient(135deg, #004c3f 0%, #002d24 100%)",
          display: "flex",
          flexDirection: 'column',
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3 },
          overflow: 'hidden'
        }}>

<Box sx={{ position: 'fixed', top: 24, right: 24, zIndex: 1301 }}>

            {isLoading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : user ? (
                <>
                    <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', color: 'white', fontWeight: 'bold' }}>
                        {userInitial}
                      </Avatar>
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleMenuClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      sx={{ mt: 1 }}
                    >
                      <MenuItem disabled>{user.email}</MenuItem>
                      <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </Menu>
                </>
            ) : (
              <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Person />}
                  component={Link}
                  href="/auth"
              >
                  Sign In
              </Button>
             ) }
        </Box>
        
        <LayoutGroup>
          <AnimatePresence mode="wait">
            {renderActiveView()}
          </AnimatePresence>
        </LayoutGroup>

      </Box>

      <Box 
        component="footer" 
        sx={{ 
          textAlign: 'center',
          py: 3,
          px: 2,
          bgcolor: '#002d24',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic', fontSize: { xs: '0.75rem', sm: '0.875rem' }, mb: 2 }}>
            Ensuring that no patient is left untreated because a drug is unavailable, unfindable, or inaccessible.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 2, sm: 4 } }}>
            <motion.div layoutId="about-us-header">
              <Button 
                onClick={() => setView('about')} 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  textDecoration: 'none', 
                  '&:hover': { textDecoration: 'underline' },
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  p: 0, 
                  minWidth: 'auto'
                }}
              >
                About
              </Button>
            </motion.div>
            <motion.div layoutId="contact-us-header">
              <Button 
                onClick={() => setView('contact')} 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  textDecoration: 'none', 
                  '&:hover': { textDecoration: 'underline' },
                  fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  p: 0, 
                  minWidth: 'auto'
                }}
              >
                Contact Us
              </Button>
            </motion.div>
          </Box>
        </Container>
      </Box>
    </Box>

  );
}
