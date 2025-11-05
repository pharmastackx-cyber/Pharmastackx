'use client'

import {
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import {
  Search,
  LocationOn,
  ShoppingCart,
  GridView,
  ViewList,
  Add,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';

const allMedicines = [
  {
    id: 1,
    image: "https://i.ibb.co/dJp6VnT2/08-Paracetamol-96-World-Cup-Pack-View-01-removebg-preview.png",
    name: "Paracetamol 500mg",
    activeIngredients: "Acetaminophen",
    drugClass: "Analgesic/Antipyretic",
    price: "₦1,200",
    pharmacy: "MedPlus Pharmacy",
    inStock: true,
    rating: 4.5
  },
  {
    id: 2,
    image: "https://i.ibb.co/QGZ0BCp/amatem-f1-removebg-preview.png", 
    name: "Amatem Forte",
    activeIngredients: "Artemether/Lumefantrine",
    drugClass: "Antimalarial",
    price: "₦2,800",
    pharmacy: "HealthCare Plus",
    inStock: true,
    rating: 4.8
  },
  {
    id: 3,
    image: "https://i.ibb.co/dJp6VnT2/08-Paracetamol-96-World-Cup-Pack-View-01-removebg-preview.png",
    name: "Ibuprofen 400mg",
    activeIngredients: "Ibuprofen",
    drugClass: "NSAID",
    price: "₦1,800",
    pharmacy: "Wellness Pharmacy",
    inStock: true,
    rating: 4.3
  },
  {
    id: 4,
    image: "https://i.ibb.co/QGZ0BCp/amatem-f1-removebg-preview.png",
    name: "Amoxicillin 500mg",
    activeIngredients: "Amoxicillin",
    drugClass: "Antibiotic",
    price: "₦3,500",
    pharmacy: "FamilyCare Pharmacy",
    inStock: true,
    rating: 4.6
  },
  {
    id: 5,
    image: "https://i.ibb.co/dJp6VnT2/08-Paracetamol-96-World-Cup-Pack-View-01-removebg-preview.png",
    name: "Metformin 500mg",
    activeIngredients: "Metformin HCl",
    drugClass: "Antidiabetic",
    price: "₦2,200",
    pharmacy: "OptimalHealth Pharmacy",
    inStock: true,
    rating: 4.4
  },
  {
    id: 6,
    image: "https://i.ibb.co/QGZ0BCp/amatem-f1-removebg-preview.png",
    name: "Vitamin C 1000mg",
    activeIngredients: "Ascorbic Acid",
    drugClass: "Vitamin",
    price: "₦1,500",
    pharmacy: "CityMed Pharmacy",
    inStock: true,
    rating: 4.7
  },
  {
    id: 7,
    image: "https://i.ibb.co/dJp6VnT2/08-Paracetamol-96-World-Cup-Pack-View-01-removebg-preview.png",
    name: "Lisinopril 10mg",
    activeIngredients: "Lisinopril",
    drugClass: "ACE Inhibitor",
    price: "₦2,900",
    pharmacy: "MedPlus Pharmacy",
    inStock: true,
    rating: 4.5
  },
  {
    id: 8,
    image: "https://i.ibb.co/QGZ0BCp/amatem-f1-removebg-preview.png",
    name: "Omeprazole 20mg",
    activeIngredients: "Omeprazole",
    drugClass: "Proton Pump Inhibitor",
    price: "₦2,100",
    pharmacy: "HealthCare Plus",
    inStock: true,
    rating: 4.6
  },
  {
    id: 9,
    image: "https://i.ibb.co/dJp6VnT2/08-Paracetamol-96-World-Cup-Pack-View-01-removebg-preview.png",
    name: "Cetirizine 10mg",
    activeIngredients: "Cetirizine HCl",
    drugClass: "Antihistamine",
    price: "₦1,400",
    pharmacy: "Wellness Pharmacy",
    inStock: true,
    rating: 4.3
  },
  {
    id: 10,
    image: "https://i.ibb.co/QGZ0BCp/amatem-f1-removebg-preview.png",
    name: "Atorvastatin 20mg",
    activeIngredients: "Atorvastatin",
    drugClass: "Statin",
    price: "₦3,200",
    pharmacy: "FamilyCare Pharmacy",
    inStock: true,
    rating: 4.8
  },
  {
    id: 11,
    image: "https://i.ibb.co/dJp6VnT2/08-Paracetamol-96-World-Cup-Pack-View-01-removebg-preview.png",
    name: "Losartan 50mg",
    activeIngredients: "Losartan Potassium",
    drugClass: "ARB",
    price: "₦2,600",
    pharmacy: "OptimalHealth Pharmacy",
    inStock: true,
    rating: 4.4
  },
  {
    id: 12,
    image: "https://i.ibb.co/QGZ0BCp/amatem-f1-removebg-preview.png",
    name: "Multivitamin Complex",
    activeIngredients: "Mixed Vitamins & Minerals",
    drugClass: "Supplement",
    price: "₦1,800",
    pharmacy: "CityMed Pharmacy",
    inStock: true,
    rating: 4.5
  },
  {
    id: 13,
    image: "https://i.ibb.co/dJp6VnT2/08-Paracetamol-96-World-Cup-Pack-View-01-removebg-preview.png",
    name: "Fluconazole 150mg",
    activeIngredients: "Fluconazole",
    drugClass: "Antifungal",
    price: "₦2,400",
    pharmacy: "MedPlus Pharmacy",
    inStock: true,
    rating: 4.6
  },
  {
    id: 14,
    image: "https://i.ibb.co/QGZ0BCp/amatem-f1-removebg-preview.png",
    name: "Salbutamol Inhaler",
    activeIngredients: "Salbutamol",
    drugClass: "Bronchodilator",
    price: "₦3,800",
    pharmacy: "HealthCare Plus",
    inStock: true,
    rating: 4.7
  },
  {
    id: 15,
    image: "https://i.ibb.co/dJp6VnT2/08-Paracetamol-96-World-Cup-Pack-View-01-removebg-preview.png",
    name: "Ciprofloxacin 500mg",
    activeIngredients: "Ciprofloxacin",
    drugClass: "Antibiotic",
    price: "₦2,700",
    pharmacy: "Wellness Pharmacy",
    inStock: true,
    rating: 4.4
  },
  {
    id: 16,
    image: "https://i.ibb.co/QGZ0BCp/amatem-f1-removebg-preview.png",
    name: "Diclofenac 50mg",
    activeIngredients: "Diclofenac Sodium",
    drugClass: "NSAID",
    price: "₦1,600",
    pharmacy: "FamilyCare Pharmacy",
    inStock: true,
    rating: 4.2
  }
];

export default function FindMedicinesPage() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { addToCart } = useCart();

  const drugClasses = ['all', 'Analgesic', 'Antibiotic', 'Antimalarial', 'Antifungal', 'Vitamin', 'NSAID', 'Antidiabetic'];

  // Initialize search query from URL parameters
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
        medicine.name.toLowerCase().includes(query) ||
        medicine.activeIngredients.toLowerCase().includes(query) ||
        medicine.drugClass.toLowerCase().includes(query) ||
        medicine.pharmacy.toLowerCase().includes(query);
      
      const matchesClass = filterBy === 'all' || 
        medicine.drugClass.toLowerCase().includes(filterBy.toLowerCase());
      
      return matchesSearch && matchesClass;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return parseFloat(a.price.replace('₦', '').replace(',', '')) - parseFloat(b.price.replace('₦', '').replace(',', ''));
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

  return (
    <>
      {/* Search and Filters */}
      <Container maxWidth="lg" sx={{ mt: 0.5, mb: 1, flex: 1 }}>
        {/* Search Bar */}
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
              sx: {
                borderRadius: '25px',
                bgcolor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0',
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
        </Box>

        {/* Compact Filters */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: 1
        }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              displayEmpty
              sx={{ borderRadius: '20px' }}
            >
              <MenuItem value="all">All Classes</MenuItem>
              {drugClasses.slice(1).map((drugClass) => (
                <MenuItem key={drugClass} value={drugClass}>
                  {drugClass}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              displayEmpty
              sx={{ borderRadius: '20px' }}
            >
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

      {/* Medicine Grid */}
      <Container maxWidth="lg" sx={{ mb: 2 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 2
        }}>
          {paginatedMedicines.map((medicine) => (
            <Box key={medicine.id}>
              <Card
                sx={{
                  height: { xs: '256px', sm: '272px', md: '288px' },
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  borderRadius: '20px',
                  border: '2px solid #e0e0e0',
                  bgcolor: 'white',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: '#006D5B',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >


                {/* Image Section */}
                <Box sx={{ 
                  height: { xs: '80px', sm: '90px', md: '100px' }, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: '#f0f7f4',
                  p: { xs: 0.5, sm: 1 },
                  flexShrink: 0
                }}>
                  <CardMedia
                    component="img"
                    image={medicine.image}
                    alt={medicine.name}
                    sx={{ 
                      objectFit: 'contain',
                      width: '100%',
                      height: '100%',
                      maxWidth: '80%',
                      maxHeight: { xs: '50px', sm: '60px', md: '70px' }
                    }}
                  />
                </Box>

                {/* Content Section */}
                <CardContent sx={{ 
                  flexGrow: 1, 
                  p: { xs: 1, sm: 1.5, md: 2 }, 
                  pt: { xs: 0.5, sm: 1 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 0.5, 
                        fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' }, 
                        lineHeight: 1.2,
                        color: '#333',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {medicine.name}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontStyle: 'italic',
                        color: '#006D5B',
                        mb: 0.5,
                        fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {medicine.activeIngredients}
                    </Typography>

                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        mb: 0.5,
                        color: 'text.secondary',
                        fontSize: { xs: '0.7rem', sm: '0.72rem', md: '0.75rem' }
                      }}
                    >
                      Class: {medicine.drugClass}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#006D5B', 
                        mb: { xs: 0.5, md: 1 },
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                      }}
                    >
                      {medicine.price}
                    </Typography>

                    {/* Pharmacy Info */}
                    <Box sx={{ mb: 0.5 }}>
                      <Typography variant="caption" sx={{ 
                        color: '#006D5B', 
                        fontWeight: 500,
                        fontSize: { xs: '0.7rem', md: '0.75rem' }
                      }}>
                        {medicine.pharmacy}
                      </Typography>
                    </Box>

                    {/* Location and Add to Cart */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: { xs: 12, md: 14 }, color: '#9e9e9e' }} />
                        <Typography variant="caption" sx={{ 
                          color: 'text.secondary',
                          fontSize: { xs: '0.7rem', md: '0.75rem' }
                        }}>
                          Right here
                        </Typography>
                      </Box>
                      
                      {/* Add to Cart Button - Bottom Right */}
                      <IconButton
                        onClick={() => addToCart({
                          id: medicine.id,
                          name: medicine.name,
                          image: medicine.image,
                          activeIngredients: medicine.activeIngredients,
                          drugClass: medicine.drugClass,
                          price: parseInt(medicine.price.replace('₦', '').replace(',', '')),
                          pharmacy: medicine.pharmacy
                        })}
                        sx={{
                          bgcolor: '#E91E63',
                          color: 'white',
                          width: { xs: 28, md: 32 },
                          height: { xs: 28, md: 32 },
                          '&:hover': { bgcolor: '#C2185B' },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Add sx={{ fontSize: { xs: '14px', md: '16px' } }} />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  '&.Mui-selected': {
                    bgcolor: '#006D5B',
                  }
                }
              }}
            />
          </Box>
        )}
      </Container>
    </>
  );
}
