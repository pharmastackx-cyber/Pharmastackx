
"use client";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';

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
import ConsultContent from "@/components/ConsultContent";
import AccountContent from "@/components/AccountContent";
import { Home as HomeIcon, Chat as ChatIcon, Person as PersonIcon, LocalPharmacy as PharmacyIcon } from '@mui/icons-material';
import { wrap } from "lodash";

const MapBackground = dynamic(() => import('@/components/MapBackground'), {
  ssr: false,
  loading: () => <Box sx={{ height: '100%', width: '100%', bgcolor: '#002d24' }}/>
});

const MotionPaper = motion(Paper);

const animatedWords = ["pharmacies", "pharmacists", "medicines"];

export default function HomePage() {
  const { user, isLoading } = useSession();
  const router = useRouter(); // Initialize router
  const [inputValue, setInputValue] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [view, setView] = useState('home');

  const bottomPadding = view === 'home' ? { xs: '140px', sm: '150px' } : { xs: '70px', sm: '80px' };

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
      window.scrollTo(0, document.body.scrollHeight);
    }, []);
    useEffect(() => {
    

    const timer = setTimeout(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % animatedWords.length);
    }, 2500);
    return () => clearTimeout(timer);
  }, [wordIndex]);

  const handleSearchInitiation = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    // As soon as the user types, set the input value and switch the view
    if (value) {
      setInputValue(value);
      setView('orderMedicines');
    }
  };

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
      sx={{ width: '100%', ml: 'auto', textAlign: 'center', p: 2,  }}






    >
      <motion.div variants={itemVariants}>
        
      <Typography variant="h5" sx={{ 
        color: "rgba(248, 247, 247, 0.9)", 
        fontWeight: 1000, 
        fontSize: { xs: '1.3rem', sm: '2.9rem' }, 
        flexWrap: 'wrap',
         
       }}
      >
         <>Ensuring that no patient is left untreated because a drug is unavailable, unfindable or inaccessible.</>

      </Typography>


        

        
      </motion.div>

      <Box 
      sx={{ 
        position: 'absolute', 
        bottom: { xs: 24, sm: 24 }, // Position it at the bottom
        left: '50%', // Center horizontally
        transform: 'translateX(-50%)', // Ensure perfect centering
        minHeight: { xs: '40px', sm: '60px' }, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center'
    }}>

            <Typography variant="h5" 
            sx={{ color: "rgba(8, 2, 2, 0.9)", 
              fontWeight: 1000, 
                display: 'flex', 
                flexWrap: 'wrap', 
                alignItems: 'left',
                justifyContent: 'center', 
                columnGap: '0.5rem', 
                maxWidth: '100%',
                fontSize: { xs: '0.9rem', sm: '1.5rem' } 
            }}
            
              
              >
                <span>PharmaStackX connects you to</span>
                <AnimatePresence mode="wait">
                    <motion.span
                        key={wordIndex}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        style={{ color: "rgba(2, 58, 58, 0.9)", display: 'inline-block' }}
                    >
                        {animatedWords[wordIndex]}
                    </motion.span>
                </AnimatePresence>
            </Typography>
        </Box>
      
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
                        
                    </motion.div>
                  </Grid>
                  <Grid item xs="auto">
                    <motion.div layoutId="find-pharmacy-header">
                      
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
      sx={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, display: 'flex', flexDirection: 'column', pt: { xs: 8, sm: 10 }, pb: bottomPadding, color: 'white' }}
    >
        <motion.div 
          layoutId={layoutId}
          transition={{ duration: 0.8, ease: "easeInOut" }}
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
                <IconButton onClick={() => { setView('home'); setInputValue(''); }} sx={{ color: 'white' }}>
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
        return renderPageView('Order Medicines', 'order-medicines-header', <DispatchForm initialSearchValue={inputValue} />);
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
      case 'consult':
        return renderPageView('Consult', 'consult-header', <ConsultContent />);
      case 'account':
        return renderPageView('Account', 'account-header', <AccountContent setView={setView} />);
      default:
        return renderWelcomeView();
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      pb: bottomPadding,
      
    }}>
    

      {/* Background Map and Overlay */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60vh', zIndex: 0 }}>
          <MapBackground />
        </Box>
        


      <Box sx={{
          position: 'relative',
          flexGrow: 1,
          display: "flex",
          flexDirection: 'column',
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3 },
          overflow: 'hidden'
        }}>

                               {/* Wavy Animated Gradient Background */}
            <style>
              {`
                @keyframes wavyGradient {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}
            </style>
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1, // Sits on top of the map, but behind the white slant
                background: 'linear-gradient(120deg, #e43a5a,rgb(134, 3, 112),rgb(16, 172, 157), rgb(61, 149, 249),rgb(170, 73, 244))',
                backgroundSize: '300% 300%',
                animation: 'wavyGradient 8s ease infinite',
                opacity: 0.7, // Adjust opacity to control map visibility
              }}
            />




                  {/* New Slanted White Background */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%', // Adjust the height to control how much of the page is white
            bgcolor: 'white',
            zIndex: 1, // This places it above the map but below your content
            clipPath: `polygon(
               0% 10%, 2.5% 10.7%, 5% 11.5%, 7.5% 12.2%, 10% 13%, 12.5% 13.7%, 15% 14.4%, 17.5% 14.8%, 
                    20% 15%, 22.5% 14.9%, 25% 14.5%, 27.5% 14.1%, 30% 13%, 32.5% 12.3%, 35% 11.5%, 37.5% 10.7%, 
                    40% 10%, 42.5% 9.3%, 45% 8.5%, 47.5% 8.2%, 50% 8%, 52.5% 7.8%, 55% 7.5%, 57.5% 7.2%, 
                    60% 7%, 62.5% 7.2%, 65% 7.5%, 67.5% 7.8%, 70% 8%, 72.5% 8.7%, 75% 9.5%, 77.5% 10.3%, 
                    80% 11%, 82.5% 11.8%, 85% 12.5%, 87.5% 13.3%, 90% 14%, 92.5% 14.5%, 95% 14.8%, 97.5% 14.9%, 
                    100% 15%, 
                    100% 100%, 0 100%
            )`,
            
            
            
            
          }}
        />


        

        {/* Header */}
        <Box
          component={Paper}
          elevation={0}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            p: 2,
            zIndex: 1301,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: ' rgba(3, 28, 24, 0)', 
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgb(2, 38, 34)'
          }}
        >
          {/* Logo */}
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            PharmaStack<span style={{ color: '#00E6A4' }}>X</span>
          </Typography>

          {/* User/Login Section */}
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : user ? (
            <>
              <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: 'rgba(59, 4, 66, 0.88)', color: 'white', fontWeight: 'bold' }}>
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
              variant="outlined"
              component={Link}
              href="/auth"
              sx={{
                borderRadius: '20px',
                borderColor: 'rgba(255, 255, 255, 0.8)',
                color: 'white',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Sign In
            </Button>
          )}
        </Box>

        

        
        {/* Main Content Area */}
        <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', flex: 1 }}>
            <LayoutGroup>
              <AnimatePresence mode="wait">
                {renderActiveView()}
              </AnimatePresence>
            </LayoutGroup>
        </Box>
      </Box>

      {/* Persistent Bottom Bar (Search + Nav) */}
      <Box
        sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            px: 2,
            pb: 2
        }}
      >
        <AnimatePresence>
        {view === 'home' && (
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                style={{ width: '100%', maxWidth: '800px' }}
            >
                <MotionPaper
                    elevation={3}
                    sx={{
                        p: '8px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.98)',
                    }}
                >
                    <SearchIcon sx={{ color: 'grey.500', mr: 1.5 }} />
                    <TextField
                        fullWidth
                        placeholder="Find medicines, pharmacies, pharmacists ..."
                        variant="standard"
                        value={inputValue}
                        onChange={handleSearchInitiation}
                        InputProps={{ disableUnderline: true, sx: { fontSize: { xs: '1rem', sm: '1.1rem' } } }}
                    />
                </MotionPaper>
            </motion.div>
        )}
        </AnimatePresence>
        
        <Paper
            elevation={3}
            sx={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                p: 1,
                width: '100%',
                maxWidth: '800px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.98)',
                borderTop: '1px solid rgba(0,0,0,0.1)',
            }}
        >
            <Button onClick={() => setView('home')} sx={{ flexDirection: 'column', color: view === 'home' ? '#1B5E20 ' : 'grey.700', textTransform: 'none', fontSize: '0.75rem', minWidth: '60px' }}>
                <HomeIcon />
                Home
            </Button>
            <Button onClick={() => setView('findPharmacy')} sx={{ flexDirection: 'column', color: view === 'findPharmacy' ? '#1B5E20 ' : 'grey.700', textTransform: 'none', fontSize: '0.75rem', minWidth: '60px' }}>
                <PharmacyIcon />
                Pharmacies
            </Button>
            <Button onClick={() => setView('consult')} sx={{ flexDirection: 'column', color: view === 'consult' ? '#1B5E20 ' : 'grey.700', textTransform: 'none', fontSize: '0.75rem', minWidth: '60px' }}>
                <ChatIcon />
                Consult
            </Button>
            <Button onClick={() => setView('account')} sx={{ flexDirection: 'column', color: view === 'account' ? '#1B5E20 ' : 'grey.700', textTransform: 'none', fontSize: '0.75rem', minWidth: '60px' }}>
                <PersonIcon />
                Account
            </Button>
        </Paper>

      </Box>
    </Box>
  );
}
