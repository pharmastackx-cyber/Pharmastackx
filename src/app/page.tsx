'use client'

import {
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  Avatar,
  Stack,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  CardMedia,
} from '@mui/material';
import {
  LocalPharmacy,
  LocationOn,
  Upload,
  Search,
  FilterList,
  Add,
  ArrowBackIos,
  ArrowForwardIos,
} from '@mui/icons-material';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';

// Sample drug data for carousel
const sampleDrugs = [
  {
    id: 1,
    image: "https://i.ibb.co/dJp6VnT2/08-Paracetamol-96-World-Cup-Pack-View-01-removebg-preview.png",
    name: "Paracetamol 500mg",
    activeIngredients: "Acetaminophen",
    drugClass: "Analgesic/Antipyretic",
    price: "₦1,200",
    pharmacy: "MedPlus Pharmacy"
  },
  {
    id: 2,
    image: "https://i.ibb.co/QGZ0BCp/amatem-f1-removebg-preview.png", 
    name: "Amatem Forte",
    activeIngredients: "Artemether + Lumefantrine",
    drugClass: "Antimalarial",
    price: "₦3,500",
    pharmacy: "HealthCare Plus"
  },
  {
    id: 3,
    image: "https://i.ibb.co/qLV1MdZh/MYCOTEN-PLUS-768x485-removebg-preview.png",
    name: "Mycoten Plus",
    activeIngredients: "Clotrimazole + Betamethasone",
    drugClass: "Antifungal/Steroid",
    price: "₦2,800",
    pharmacy: "Wellness Pharmacy"
  },
  {
    id: 4,
    image: "https://i.ibb.co/KjYqNRS7/pregnacare-4b303546-25f3-4174-92a5-c459017d193c-400x-removebg-preview.png",
    name: "Pregnacare Original",
    activeIngredients: "Folic Acid + Vitamins",
    drugClass: "Prenatal Supplement",
    price: "₦4,200",
    pharmacy: "FamilyCare Pharmacy"
  },
  {
    id: 5,
    image: "https://i.ibb.co/Xr6Vr2dF/visita-removebg-preview.png",
    name: "Visita Eye Drops",
    activeIngredients: "Tetrahydrozoline HCl",
    drugClass: "Ophthalmic Decongestant",
    price: "₦1,800",
    pharmacy: "OptimalHealth Pharmacy"
  },
  {
    id: 6,
    name: "Amoxicillin 500mg",
    image: "https://via.placeholder.com/200x150/006D5B/white?text=Amoxicillin",
    activeIngredients: "Amoxicillin Trihydrate",
    drugClass: "Antibiotic",
    price: "₦2,100",
    pharmacy: "CityMed Pharmacy"
  }
];

// Drug images array
const drugImages = [
  {
    src: "https://i.ibb.co/dJp6VnT2/08-Paracetamol-96-World-Cup-Pack-View-01-removebg-preview.png",
    name: "Paracetamol"
  },
  {
    src: "https://i.ibb.co/QGZ0BCp/amatem-f1-removebg-preview.png",
    name: "Amatem"
  },
  {
    src: "https://i.ibb.co/qLV1MdZh/MYCOTEN-PLUS-768x485-removebg-preview.png",
    name: "Mycoten Plus"
  },
  {
    src: "https://i.ibb.co/KjYqNRS7/pregnacare-4b303546-25f3-4174-92a5-c459017d193c-400x-removebg-preview.png",
    name: "Pregnacare"
  },
  {
    src: "https://i.ibb.co/Xr6Vr2dF/visita-removebg-preview.png",
    name: "Visita"
  }
];

// Drug Rotator Component
function DrugRotator() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % drugImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {drugImages.map((drug, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            animation: index === currentIndex ? 'blink 3s ease-in-out infinite' : 'none',
            '@keyframes blink': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.8 },
            }
          }}
        >
          <Box
            component="img"
            src={drug.src}
            alt={drug.name}
            sx={{
              maxWidth: { xs: '120px', sm: '180px', md: '280px' },
              maxHeight: { xs: '120px', sm: '180px', md: '280px' },
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }}
          />
        </Box>
      ))}
    </Box>
  );
}

// Drug Carousel Component
function DrugCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const handleScroll = (direction: 'left' | 'right') => {
    const scrollAmount = 200;
    setScrollPosition(prev => {
      if (direction === 'left') {
        return Math.max(prev - scrollAmount, -1000);
      } else {
        return Math.min(prev + scrollAmount, 0);
      }
    });
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Left Arrow */}
      <IconButton
        onClick={() => handleScroll('left')}
        sx={{
          position: 'absolute',
          left: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          '&:hover': { bgcolor: '#f5f5f5' }
        }}
      >
        <ArrowBackIos />
      </IconButton>

      {/* Right Arrow */}
      <IconButton
        onClick={() => handleScroll('right')}
        sx={{
          position: 'absolute',
          right: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          '&:hover': { bgcolor: '#f5f5f5' }
        }}
      >
        <ArrowForwardIos />
      </IconButton>

      <Box sx={{ overflow: 'hidden', width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            animation: isPaused ? 'none' : 'scroll 60s linear infinite',
            gap: 2,
            transform: `translateX(${scrollPosition}px)`,
            transition: 'transform 0.3s ease',
            '@keyframes scroll': {
              '0%': { transform: 'translateX(0%)' },
              '100%': { transform: 'translateX(-100%)' }
            }
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
        {/* Duplicate array for seamless loop */}
        {[...sampleDrugs, ...sampleDrugs].map((drug, index) => (
          <Card
            key={`${drug.id}-${index}`}
            sx={{
              minWidth: 180,
              maxWidth: 180,
              flexShrink: 0,
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                height: 50,
                width: '100%',
                bgcolor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                p: 0.5
              }}
            >
              <Box
                component="img"
                src={drug.image}
                alt={drug.name}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <CardContent sx={{ p: 1, pb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.2 }}>
                {drug.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.1, fontSize: '0.6rem' }}>
                {drug.activeIngredients.split(' ')[0]}...
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.1, fontSize: '0.6rem' }}>
                {drug.drugClass.split(' ')[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.3, fontSize: '0.6rem' }}>
                {drug.pharmacy.split(' ')[0]}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ color: '#006D5B', fontWeight: 700, fontSize: '0.8rem' }}>
                  {drug.price}
                </Typography>
                <IconButton
                  sx={{
                    bgcolor: '#E91E63',
                    color: 'white',
                    width: 24,
                    height: 24,
                    '&:hover': {
                      bgcolor: '#C2185B'
                    }
                  }}
                >
                  <Add sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
    </Box>
  );
}

export default function Home() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [classesScrollPosition, setClassesScrollPosition] = useState(0);
  const [pharmacyScrollPosition, setPharmacyScrollPosition] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const drugClasses = [
    { name: 'Analgesics', icon: '💊', count: '45+ drugs' },
    { name: 'Antibiotics', icon: '🦠', count: '38+ drugs' },
    { name: 'Antimalarials', icon: '🩺', count: '22+ drugs' },
    { name: 'Antifungals', icon: '🔬', count: '18+ drugs' },
    { name: 'Vitamins', icon: '🌟', count: '35+ drugs' },
    { name: 'Cardiovascular', icon: '❤️', count: '41+ drugs' },
    { name: 'Respiratory', icon: '🫁', count: '29+ drugs' },
    { name: 'Gastrointestinal', icon: '🍃', count: '32+ drugs' }
  ];

  const scrollClasses = (direction: 'left' | 'right') => {
    const itemsPerView = window.innerWidth < 600 ? 2 : 4;
    const maxScroll = Math.max(0, drugClasses.length - itemsPerView);
    
    if (direction === 'left') {
      setClassesScrollPosition(Math.max(0, classesScrollPosition - itemsPerView));
    } else {
      setClassesScrollPosition(Math.min(maxScroll, classesScrollPosition + itemsPerView));
    }
  };

  const partnerPharmacies = [
    { 
      name: 'MedPlus Pharmacy', 
      location: 'Victoria Island, Lagos',
      distance: '2.3 km',
      rating: 4.8,
      products: '450+ products',
      image: 'https://via.placeholder.com/300x150/006D5B/white?text=MedPlus'
    },
    { 
      name: 'HealthCare Plus', 
      location: 'Ikeja GRA, Lagos',
      distance: '3.7 km',
      rating: 4.6,
      products: '380+ products',
      image: 'https://via.placeholder.com/300x150/006D5B/white?text=HealthCare+'
    },
    { 
      name: 'Wellness Pharmacy', 
      location: 'Lekki Phase 1, Lagos',
      distance: '5.2 km',
      rating: 4.9,
      products: '520+ products',
      image: 'https://via.placeholder.com/300x150/006D5B/white?text=Wellness'
    },
    { 
      name: 'FamilyCare Pharmacy', 
      location: 'Surulere, Lagos',
      distance: '4.1 km',
      rating: 4.5,
      products: '310+ products',
      image: 'https://via.placeholder.com/300x150/006D5B/white?text=FamilyCare'
    },
    { 
      name: 'OptimalHealth Pharmacy', 
      location: 'Yaba, Lagos',
      distance: '6.8 km',
      rating: 4.7,
      products: '420+ products',
      image: 'https://via.placeholder.com/300x150/006D5B/white?text=OptimalHealth'
    },
    { 
      name: 'CityMed Pharmacy', 
      location: 'Ajah, Lagos',
      distance: '8.5 km',
      rating: 4.4,
      products: '290+ products',
      image: 'https://via.placeholder.com/300x150/006D5B/white?text=CityMed'
    }
  ];

  const scrollPharmacies = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      if (pharmacyScrollPosition === 0) {
        // Loop to the last item
        setPharmacyScrollPosition(partnerPharmacies.length - 1);
      } else {
        setPharmacyScrollPosition(pharmacyScrollPosition - 1);
      }
    } else {
      if (pharmacyScrollPosition >= partnerPharmacies.length - 1) {
        // Loop back to the first item
        setPharmacyScrollPosition(0);
      } else {
        setPharmacyScrollPosition(pharmacyScrollPosition + 1);
      }
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to find medicines page with search query as URL parameter
      router.push(`/find-medicines?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    // Request location permission and get coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLocationError('Location access denied or unavailable');
          console.error('Location error:', error);
        }
      );
    } else {
      setLocationError('Geolocation not supported by browser');
    }
  }, []);



  return (
    <Box>
      <Navbar />

      {/* Hero Section with Rotating Drugs */}
      <Box 
        sx={{ 
          width: '100%', 
          minHeight: { xs: 'auto', md: '50vh' }, 
          bgcolor: 'white',
          pt: { xs: 1, md: 2 },
          pb: { xs: 0, md: 6 },
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 1, md: 3 } }}>
          <Paper
            elevation={8}
            sx={{
              bgcolor: '#006D5B',
              borderRadius: '24px',
              p: { xs: 2, md: 5 },
              mx: 'auto'
            }}
          >
            <Box 
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: { xs: 1, md: 4 },
                alignItems: 'center'
              }}
            >
          {/* Left Side - Rotating Drug Images (75%) */}
          <Box 
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: { xs: '120px', md: '400px' },
              overflow: 'hidden'
            }}
          >
            <DrugRotator />
          </Box>

          {/* Right Side - Mission Statement (25%) */}
          <Box 
            sx={{
              textAlign: { xs: 'left', md: 'left' },
              px: { xs: 0.5, md: 2 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 600,
                lineHeight: 1.3,
                color: 'white',
                fontSize: { xs: '0.75rem', sm: '2rem', md: '2.8rem' },
                textAlign: 'right'
              }}
            >
              ensuring that no patient is left untreated because a drug is unavailable, unfindable, or inaccessible.
            </Typography>
          </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Search Bar */}
      <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 3 }, mb: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: '16px',
            bgcolor: '#f8f9fa'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Search for medicines by proximity, pharmacy, class, or name..."
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#006D5B' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  bgcolor: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#006D5B',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#006D5B',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#006D5B',
                  }
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                bgcolor: '#006D5B',
                '&:hover': { bgcolor: '#004D40' },
                px: 4,
                borderRadius: '12px'
              }}
            >
              Search
            </Button>
          </Box>
          
          {/* Search Filter Chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip 
              icon={<LocationOn />} 
              label="Near Me" 
              clickable 
              variant="outlined"
              sx={{ 
                borderColor: '#006D5B',
                color: '#006D5B',
                '&:hover': { bgcolor: '#E91E63', color: 'white' }
              }}
            />
            <Chip 
              icon={<LocalPharmacy />} 
              label="By Pharmacy" 
              clickable 
              variant="outlined"
              sx={{ 
                borderColor: '#006D5B',
                color: '#006D5B',
                '&:hover': { bgcolor: '#E91E63', color: 'white' }
              }}
            />
            <Chip 
              icon={<FilterList />} 
              label="Drug Class" 
              clickable 
              variant="outlined"
              sx={{ 
                borderColor: '#006D5B',
                color: '#006D5B',
                '&:hover': { bgcolor: '#E91E63', color: 'white' }
              }}
            />
            <Chip 
              label="Generic" 
              clickable 
              variant="outlined"
              sx={{ 
                borderColor: '#006D5B',
                color: '#006D5B',
                '&:hover': { bgcolor: '#E91E63', color: 'white' }
              }}
            />
            <Chip 
              label="Brand Name" 
              clickable 
              variant="outlined"
              sx={{ 
                borderColor: '#006D5B',
                color: '#006D5B',
                '&:hover': { bgcolor: '#E91E63', color: 'white' }
              }}
            />
          </Stack>
          
          {/* Location Display */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
            {location ? (
              <Typography variant="body2" sx={{ color: 'black', fontSize: '0.9rem' }}>
                📍 Current Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </Typography>
            ) : locationError ? (
              <Typography variant="body2" sx={{ color: '#d32f2f', fontSize: '0.9rem' }}>
                ❌ {locationError}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem' }}>
                📍 Getting your location...
              </Typography>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Drug Carousel */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#006D5B' }}>
          Featured Medications
        </Typography>
        <DrugCarousel />
      </Container>

      {/* Drug Classes Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#006D5B' }}>
          Browse by Drug Classes
        </Typography>
        
        {/* Mobile Carousel */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={() => scrollClasses('left')}
            disabled={classesScrollPosition === 0}
            sx={{ 
              bgcolor: '#006D5B', 
              color: 'white', 
              '&:hover': { bgcolor: '#004D40' },
              '&:disabled': { bgcolor: '#e0e0e0', color: '#999' },
              minWidth: 40,
              height: 40
            }}
          >
            <ArrowBackIos />
          </IconButton>
          
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Box 
              sx={{ 
                display: 'flex',
                gap: 2,
                transform: `translateX(-${classesScrollPosition * 50}%)`,
                transition: 'transform 0.3s ease'
              }}
            >
              {drugClasses.map((drugClass, index) => (
                <Card
                  key={index}
                  sx={{
                    minWidth: 'calc(50% - 8px)',
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderColor: '#006D5B',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {drugClass.icon}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>
                    {drugClass.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {drugClass.count}
                  </Typography>
                </Card>
              ))}
            </Box>
          </Box>
          
          <IconButton 
            onClick={() => scrollClasses('right')}
            disabled={classesScrollPosition >= drugClasses.length - 2}
            sx={{ 
              bgcolor: '#006D5B', 
              color: 'white', 
              '&:hover': { bgcolor: '#004D40' },
              '&:disabled': { bgcolor: '#e0e0e0', color: '#999' },
              minWidth: 40,
              height: 40
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </Box>

        {/* Desktop Grid */}
        <Box sx={{ 
          display: { xs: 'none', md: 'grid' }, 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: 2 
        }}>
          {drugClasses.map((drugClass, index) => (
            <Card
              key={index}
              sx={{
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  borderColor: '#006D5B',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease'
                }
              }}
            >
              <Typography variant="h4" sx={{ mb: 1 }}>
                {drugClass.icon}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.9rem', mb: 0.5 }}>
                {drugClass.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {drugClass.count}
              </Typography>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Partner Pharmacies Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#006D5B' }}>
          Partner Pharmacies
        </Typography>
        
        {/* Pharmacy Search Bar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search pharmacies near you..."
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn sx={{ color: '#006D5B' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '12px',
                bgcolor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#006D5B',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#006D5B',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#006D5B',
                }
              }
            }}
          />
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#006D5B',
              '&:hover': { bgcolor: '#004D40' },
              px: 3,
              borderRadius: '12px'
            }}
          >
            Search
          </Button>
        </Box>
        
        {/* Mobile Carousel */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={() => scrollPharmacies('left')}
            sx={{ 
              bgcolor: '#006D5B', 
              color: 'white', 
              '&:hover': { bgcolor: '#004D40' },
              minWidth: 40,
              height: 40
            }}
          >
            <ArrowBackIos />
          </IconButton>
          
          <Box sx={{ flex: 1, overflow: 'hidden', mx: 1 }}>
            <Box 
              sx={{ 
                display: 'flex',
                transform: `translateX(-${(pharmacyScrollPosition * 100) / partnerPharmacies.length}%)`,
                transition: 'transform 0.4s ease',
                width: `${partnerPharmacies.length * 100}%`
              }}
            >
              {partnerPharmacies.map((pharmacy, index) => (
                <Box
                  key={index}
                  sx={{
                    width: `${100 / partnerPharmacies.length}%`,
                    px: 1,
                    flexShrink: 0
                  }}
                >
                  <Card
                    sx={{
                      width: '100%',
                      cursor: 'pointer',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        transform: 'translateY(-4px)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                  <CardMedia
                    component="img"
                    height="120"
                    image={pharmacy.image}
                    alt={pharmacy.name}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}>
                      {pharmacy.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <LocationOn sx={{ fontSize: 16, mr: 0.5, color: '#006D5B' }} />
                      {pharmacy.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      📍 {pharmacy.distance} away
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ⭐ {pharmacy.rating} • {pharmacy.products}
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      sx={{
                        borderColor: '#006D5B',
                        color: '#006D5B',
                        '&:hover': {
                          bgcolor: '#006D5B',
                          color: 'white'
                        }
                      }}
                    >
                      Visit Store
                    </Button>
                  </CardContent>
                </Card>
                </Box>
              ))}
            </Box>
          </Box>
          
          <IconButton 
            onClick={() => scrollPharmacies('right')}
            sx={{ 
              bgcolor: '#006D5B', 
              color: 'white', 
              '&:hover': { bgcolor: '#004D40' },
              minWidth: 40,
              height: 40
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </Box>

        {/* Desktop Grid */}
        <Box sx={{ 
          display: { xs: 'none', md: 'grid' }, 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 3 
        }}>
          {partnerPharmacies.map((pharmacy, index) => (
            <Card
              key={index}
              sx={{
                cursor: 'pointer',
                borderRadius: '16px',
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease'
                }
              }}
            >
              <CardMedia
                component="img"
                height="120"
                image={pharmacy.image}
                alt={pharmacy.name}
              />
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}>
                  {pharmacy.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                  <LocationOn sx={{ fontSize: 16, mr: 0.5, color: '#006D5B' }} />
                  {pharmacy.location}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  📍 {pharmacy.distance} away
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  ⭐ {pharmacy.rating} • {pharmacy.products}
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    borderColor: '#006D5B',
                    color: '#006D5B',
                    '&:hover': {
                      bgcolor: '#006D5B',
                      color: 'white'
                    }
                  }}
                >
                  Visit Store
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Newsletter/Blog Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#006D5B' }}>
          Health Insights & Updates
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4, alignItems: 'start' }}>
          {/* Featured Articles */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Latest Articles
            </Typography>
            <Stack spacing={2}>
              {[
                {
                  title: "Understanding Generic vs Brand Name Medications",
                  excerpt: "Learn the differences between generic and brand medications and how they can save you money while maintaining quality...",
                  date: "November 1, 2025",
                  readTime: "5 min read"
                },
                {
                  title: "Essential Vitamins for Optimal Health",
                  excerpt: "Discover which vitamins are crucial for your daily wellness routine and how to choose the right supplements...",
                  date: "October 28, 2025", 
                  readTime: "7 min read"
                }
              ].map((article, index) => (
                <Card key={index} sx={{ p: 2, cursor: 'pointer', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transform: 'translateY(-2px)', transition: 'all 0.2s ease' } }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1rem' }}>
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.4 }}>
                    {article.excerpt}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {article.date}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#006D5B', fontWeight: 500 }}>
                      {article.readTime}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Stack>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#006D5B',
                  '&:hover': { bgcolor: '#004D40' },
                  px: 4,
                  py: 1.2,
                  borderRadius: '12px'
                }}
              >
                Read More Articles
              </Button>
            </Box>
          </Box>

          {/* Newsletter Signup */}
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              borderRadius: '16px',
              bgcolor: '#f8f9fa',
              textAlign: 'center',
              height: 'fit-content'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#006D5B' }}>
              Stay Updated
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.4 }}>
              Get the latest health tips, medication updates, and pharmacy news delivered to your inbox.
            </Typography>
            
            <TextField
              fullWidth
              placeholder="Enter your email address"
              variant="outlined"
              size="small"
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: 'white'
                }
              }}
            />
            
            <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: '#006D5B',
                '&:hover': { bgcolor: '#004D40' },
                borderRadius: '8px',
                py: 1.2,
                mb: 2
              }}
            >
              Subscribe to Newsletter
            </Button>
            
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              📧 Weekly updates • 🔒 No spam • ✅ Unsubscribe anytime
            </Typography>
          </Paper>
        </Box>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
        <Box sx={{ mt: 8, textAlign: 'center', p: 6, bgcolor: 'grey.50', borderRadius: 3 }}>
          <Typography variant="h4" gutterBottom color="primary">
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4, maxWidth: '500px', mx: 'auto' }}>
            Join thousands of customers who trust Pharmastackx for their medication needs
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              size="large"
              sx={{
                bgcolor: '#006D5B',
                '&:hover': { bgcolor: '#004D40' }
              }}
            >
              Sign Up as Customer
            </Button>
            <Button variant="outlined" size="large">
              Register Your Pharmacy
            </Button>
          </Stack>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#006D5B', color: 'white', py: 4, mt: 8 }}>
        <Container>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>About Us & Contact</Typography>
              <Stack spacing={1} alignItems="center">
                <Typography 
                  variant="body2" 
                  component={Link}
                  href="/about"
                  sx={{ 
                    cursor: 'pointer', 
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': { textDecoration: 'underline' } 
                  }}
                >
                  About Pharmastackx
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  href="mailto:pharmastackx@gmail.com"
                  sx={{ 
                    color: 'white', 
                    justifyContent: 'center', 
                    p: 0,
                    textTransform: 'none',
                    '&:hover': { color: 'primary.light' }
                  }}
                >
                  📧 pharmastackx@gmail.com
                </Button>
                <Button
                  variant="text"
                  size="small"
                  href="tel:+2349050006638"
                  sx={{ 
                    color: 'white', 
                    justifyContent: 'center', 
                    p: 0,
                    textTransform: 'none',
                    '&:hover': { color: 'primary.light' }
                  }}
                >
                  📱 +234 905 000 6638
                </Button>
                <Button
                  variant="text"
                  size="small"
                  href="https://instagram.com/pharmastackx"
                  target="_blank"
                  sx={{ 
                    color: 'white', 
                    justifyContent: 'center', 
                    p: 0,
                    textTransform: 'none',
                    '&:hover': { color: 'primary.light' }
                  }}
                >
                  📷 @pharmastackx
                </Button>
              </Stack>
            </Box>
          </Box>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', mt: 4, pt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              © 2025 Pharmastackx. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Floating WhatsApp Button */}
      <Box
        component="a"
        href="https://wa.me/2349050006638?text=Hey%20pharmastackx"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          position: 'fixed',
          bottom: 49,
          right: 24,
          width: 60,
          height: 60,
          bgcolor: '#25D366',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 6px 20px rgba(37, 211, 102, 0.6)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          }
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.472 3.516"
            fill="white"
          />
        </svg>
      </Box>
    </Box>
  );
}
