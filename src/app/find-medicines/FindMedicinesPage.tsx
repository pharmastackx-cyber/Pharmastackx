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
} from '@mui/material';
import {
  Search,
  LocationOn,
  Add,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';

export default function FindMedicinesPage() {
  const searchParams = useSearchParams();
  const [allMedicines, setAllMedicines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { addToCart } = useCart();

  const drugClasses = ['all', 'Analgesic', 'Antibiotic', 'Antimalarial', 'Antifungal', 'Vitamin', 'NSAID', 'Antidiabetic'];

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch products');
        }
        const data = await response.json();
        if (data.success) {
          setAllMedicines(data.data);
        } else {
          throw new Error(data.error || 'An unknown error occurred');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  const filteredMedicines = allMedicines
    .filter(medicine => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = query === '' || 
        (medicine.name && medicine.name.toLowerCase().includes(query)) ||
        (medicine.activeIngredients && medicine.activeIngredients.toLowerCase().includes(query)) ||
        (medicine.drugClass && medicine.drugClass.toLowerCase().includes(query)) ||
        (medicine.pharmacy && medicine.pharmacy.toLowerCase().includes(query));
      
      const matchesClass = filterBy === 'all' || 
        (medicine.drugClass && medicine.drugClass.toLowerCase().includes(filterBy.toLowerCase()));
      
      return matchesSearch && matchesClass;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating; 
        default:
          return 0;
      }
    });

  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error" variant="h5">An Error Occurred</Typography>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 0.5, mb: 1, flex: 1 }}>
        <Box sx={{ mb: 1 }}>
          <TextField
            fullWidth
            placeholder="Search by medicine name, active ingredients, drug class, or pharmacy..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#006D5B' }} />
                </InputAdornment>
              ),
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

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} displayEmpty sx={{ borderRadius: '20px' }}>
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filteredMedicines.length} results
          </Typography>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ mb: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {paginatedMedicines.map((medicine) => (
            <Card key={medicine.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '20px', border: '2px solid #e0e0e0', bgcolor: 'white' }}>
              <Box sx={{ height: { xs: '100px', md: '120px' }, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f7f4', p: 1 }}>
                <CardMedia component="img" image={medicine.image} alt={medicine.name} sx={{ objectFit: 'contain', width: '100%', height: '100%', maxWidth: '80%' }}/>
              </Box>
              <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.2, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {medicine.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#006D5B', mb: 0.5, wordBreak: 'break-word' }}>
                    {medicine.activeIngredients}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 1 }}>
                    Class: {medicine.drugClass}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#006D5B', mb: 1 }}>
                    {medicine.formattedPrice}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    {/* --- DEFINITIVE FIX --- */}
                    <Typography 
                      variant="caption" 
                      sx={{
                        color: '#006D5B', 
                        fontWeight: 500, 
                        whiteSpace: 'nowrap',    // Prevent wrapping
                        overflow: 'hidden',       // Hide overflow
                        textOverflow: 'ellipsis',  // Add ellipsis
                        display: 'block',
                      }}
                    >
                      {medicine.pharmacy}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOn sx={{ fontSize: 14, color: '#9e9e9e' }} />
                      <Typography variant="caption" color="text.secondary">Right here</Typography>
                    </Box>
                    <IconButton
                      onClick={() => addToCart({ ...medicine, price: medicine.price })}
                      sx={{ bgcolor: '#E91E63', color: 'white', width: 32, height: 32, '&:hover': { bgcolor: '#C2185B' } }}
                    >
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
    </>
  );
}
