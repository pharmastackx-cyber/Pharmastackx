'use client'

import {
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  IconButton,
  Modal,
  Snackbar,
  Alert,
  Chip,      
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Search,
  LocationOn,
  Add,
  Close,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';

import { useCart } from '../../contexts/CartContext';

// --- CONFIGURATION --- //
const AVERAGE_TRAVEL_SPEED_KMH = 15; // km/h (Lowered for more realistic city travel time)

// --- Haversine Distance Calculation --- //
const haversineDistance = (coords1: { lat: number; lon: number }, coords2: { lat: number; lon: number }) => {
  if (!coords1 || !coords2) return null;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lon - coords1.lon);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d; // returns distance in km
};

// START: Add this shuffle function
// --- Fisher-Yates Shuffle Algorithm --- //
const shuffle = (array: any[]) => {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
};


const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: 600 },
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: '16px',
  maxHeight: '90vh',
  overflowY: 'auto',
};

export default function FindMedicinesPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
 
  const slug = searchParams?.slug as string || '';

  const [allMedicines, setAllMedicines] = useState<any[]>([]);
  const [processedMedicines, setProcessedMedicines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialSearch = searchParams?.search as string || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const [sortBy, setSortBy] = useState('recommended');

  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; 
  const { addToCart } = useCart();

  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false); 

  const drugClasses = ['all', 'Analgesic', 'Antibiotic', 'Antimalarial', 'Antifungal', 'Vitamin', 'NSAID', 'Antidiabetic'];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationError(null);
        },
        (error) => {
          setLocationError("Location access denied. Distances cannot be calculated.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setIsLoading(true);
        const apiUrl = slug ? `/api/products?slug=${slug}` : '/api/products';
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        if (data.success) {
          setAllMedicines(data.data);
        } else {
          throw new Error(data.error || 'An unknown error occurred');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedicines();
  }, [slug]);

  useEffect(() => {
    if (allMedicines.length === 0 && isLoading) return;

    let medicinesToProcess = allMedicines.map(m => ({ ...m, distance: null, travelTime: null }));

    if (userLocation) {
      medicinesToProcess = medicinesToProcess.map(medicine => {
        if (medicine.pharmacyCoordinates && typeof medicine.pharmacyCoordinates.lat === 'number' && typeof medicine.pharmacyCoordinates.lon === 'number') {
          const distance = haversineDistance(userLocation, medicine.pharmacyCoordinates);
          const travelTime = distance ? (distance / AVERAGE_TRAVEL_SPEED_KMH) * 60 : null; // in minutes
          return { ...medicine, distance, travelTime };
        }
        return medicine;
      });
    }
    setProcessedMedicines(medicinesToProcess);

  }, [userLocation, allMedicines, isLoading]);

  const handleOpenModal = (medicine: any) => setSelectedMedicine(medicine);
  const handleCloseModal = () => setSelectedMedicine(null);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleAddToCart = (medicine: any) => {
    addToCart(medicine);
    setSnackbarOpen(true);
  };

  const baseFilteredMedicines = processedMedicines
  .filter(medicine => {
    const query = searchQuery.toLowerCase();
   
    

  // 1. General search query logic (for search bar)
  const matchesSearch = query === '' ||
  (medicine.name && medicine.name.toLowerCase().includes(query)) ||
  (medicine.activeIngredients && medicine.activeIngredients.toLowerCase().includes(query)) ||
  (medicine.drugClass && medicine.drugClass.toLowerCase().includes(query)) ||
  // Only search by pharmacy name if NOT on a subdomain/slug page
  (!slug && medicine.pharmacy && medicine.pharmacy.toLowerCase().includes(query));
// 2. Drug class filtering (for dropdown)
const matchesClass = filterBy === 'all' ||
  (medicine.drugClass && medicine.drugClass.toLowerCase().includes(filterBy.toLowerCase()));
return matchesSearch && matchesClass;
});

  const getSortedMedicines = (medicines: any[]) => {
    switch (sortBy) {
      case 'name':
        return [...medicines].sort((a, b) => a.name.localeCompare(b.name));
      case 'price':
        return [...medicines].sort((a, b) => a.price - b.price);
      case 'distance':
        return [...medicines].sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
      case 'recommended':
        const isImageValid = (image: string | null | undefined) =>
          typeof image === 'string' && (image.startsWith('http') || image.startsWith('/'));

        const complete = medicines.filter(m => isImageValid(m.image) && m.info);
        const incomplete = medicines.filter(m => !isImageValid(m.image) || !m.info);
        
        
        return [...shuffle(complete), ...shuffle(incomplete)];
      default:
        return medicines;
    }
  };


  const filteredMedicines = getSortedMedicines(baseFilteredMedicines);


  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  
  if (isLoading) {
    return <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Container>;
  }

  if (error) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error" variant="h5">An Error Occurred</Typography>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 0.5, mb: 1 }}>
        <Box sx={{ mb: 1 }}>
          <TextField
            fullWidth
            placeholder={slug ? "Search medicines at this pharmacy..." : "Search by medicine, ingredient, or class..."}
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ color: '#006D5B' }} /></InputAdornment>,
              sx: { borderRadius: '25px', bgcolor: 'white' }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={filterBy} onChange={(e) => setFilterBy(e.target.value)} displayEmpty sx={{ borderRadius: '20px' }}>
              <MenuItem value="all">All Classes</MenuItem>
              {drugClasses.slice(1).map((drugClass) => (
                <MenuItem key={drugClass} value={drugClass}>{drugClass}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} displayEmpty sx={{ borderRadius: '20px' }}>
              <MenuItem value="recommended">Recommended</MenuItem>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="distance">Distance</MenuItem>
            </Select>
          </FormControl>



          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredMedicines.length} results
          </Typography>
        </Box>
         {locationError && (
          <Typography variant="caption" color="error" sx={{ display: 'block', textAlign: 'center', my: 1 }}>
            {locationError}
          </Typography>
        )}
      </Container>

      <Container maxWidth="lg" sx={{ mb: 2, flex: 1, overflowY: 'auto' }}>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {paginatedMedicines.map((medicine) => (
            <Card key={medicine.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '20px', border: '2px solid #e0e0e0', bgcolor: 'white', cursor: 'pointer', transition: 'box-shadow 0.3s', '&:hover': { boxShadow: 6 } }} onClick={() => handleOpenModal(medicine)}>
              <Box sx={{ position: 'relative', height: { xs: '100px', md: '120px' }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f7f4', p: 1 }}>
              {medicine.POM && (
                  <Chip
                      label="POM"
                      color="error"
                      size="small"
                      sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1,
                          fontWeight: 'bold',
                      }}
                  />
                )}
                <CardMedia component="img" image={medicine.image} alt={medicine.name} sx={{ objectFit: 'contain', width: '100%', height: '100%', maxWidth: '80%' }}/>
              </Box>

              <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.2, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{medicine.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#006D5B', mb: 1 }}>{medicine.formattedPrice}</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography title={medicine.pharmacy} variant="caption" sx={{ color: '#006D5B', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{medicine.pharmacy}</Typography>
                      {medicine.travelTime !== null && medicine.distance !== null ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: '2px' }}>
                          <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">{medicine.travelTime.toFixed(0)} mins ({medicine.distance.toFixed(1)} km)</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ height: '18px' }} />
                      )}
                    </Box>
                     <IconButton onClick={(e) => { e.stopPropagation(); handleAddToCart({ ...medicine, price: medicine.price }); }} sx={{ bgcolor: '#E91E63', color: 'white', width: 32, height: 32, flexShrink: 0, ml: 1, '&:hover': { bgcolor: '#C2185B' } }}>
                      <Add sx={{ fontSize: '16px' }} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination count={totalPages} page={currentPage} onChange={(_, page) => setCurrentPage(page)} color="primary" size="large" sx={{ '& .MuiPaginationItem-root.Mui-selected': { bgcolor: '#006D5B' } }}/>
          </Box>
        )}
      </Container>

      <Modal open={!!selectedMedicine} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {selectedMedicine && (
            <Grid container spacing={3}>
              <IconButton aria-label="close" onClick={handleCloseModal} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}><Close /></IconButton>
              <Grid sx={{ width: { xs: '100%', md: '41.66%' } }}>
                <Box sx={{ width: '100%', height: {xs: 200, md: '100%'}, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f7f4', borderRadius: '12px' }}>
                   <CardMedia component="img" image={selectedMedicine.image} alt={selectedMedicine.name} sx={{ objectFit: 'contain', width: '100%', height: '100%', maxHeight: {xs: 180, md: 250} }}/>
                </Box>
              </Grid>
              <Grid sx={{ width: { xs: '100%', md: '58.33%' } }}>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: '#006D5B', mb: 2 }}>{selectedMedicine.name}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, my: 2 }}>{selectedMedicine.formattedPrice}</Typography>
                <Box sx={{ my: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Active Ingredients:</Typography>
                    <Typography variant="body1" sx={{ fontStyle: 'italic', color: '#006D5B' }}>{selectedMedicine.activeIngredients}</Typography>
                </Box>
                 <Box sx={{ my: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Pharmacy:</Typography>
                    <Typography variant="body1">{selectedMedicine.pharmacy}</Typography>
                      {selectedMedicine.travelTime !== null && selectedMedicine.distance !== null && (
                        <Typography variant="body2" color="text.secondary">{selectedMedicine.travelTime.toFixed(0)} mins ({selectedMedicine.distance.toFixed(1)} km)</Typography>
                      )}
                </Box>
                 <Box sx={{ my: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Drug Class:</Typography>
                    <Typography variant="body1">{selectedMedicine.drugClass}</Typography>
                </Box>

                {selectedMedicine.info && (
                    <Box sx={{ my: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Additional Information:</Typography>
                        <Typography variant="body1">{selectedMedicine.info}</Typography>
                    </Box>
                )}

                      <IconButton onClick={(e) => { e.stopPropagation(); handleAddToCart({ ...selectedMedicine, price: selectedMedicine.price }); handleCloseModal(); }} sx={{ bgcolor: '#E91E63', color: 'white', borderRadius: '25px', px: 4, py: 1, mt: 2, '&:hover': { bgcolor: '#C2185B' } }}>
                      <Add sx={{ mr: 1 }}/>
                      <Typography>Add to Cart</Typography>
                    </IconButton>
              </Grid>
            </Grid>
          )}
        </Box>
      </Modal>
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Item added to cart!
        </Alert>
      </Snackbar>
    </>
  );
}
