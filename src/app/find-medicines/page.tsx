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
import Navbar from '../../components/Navbar';

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

export default function FindMedicines() {
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
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Navbar />

      {/* Page Header */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 2, mb: 0 }}>
        <Container maxWidth="lg">
          <Paper 
            elevation={3} 
            sx={{ 
              width: '100%',
              px: 3, 
              py: 2, 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #006D5B 0%, #004D40 50%, #00332B 100%)',
              border: 'none',
              mb: 0,
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 109, 91, 0.3)'
            }}
          >
            <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 600 }}>
              Find Your Medicines
            </Typography>
          </Paper>
        </Container>
      </Box>

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

      {/* Sleek Footer */}
      <Box sx={{ 
        bgcolor: '#e0e0e0', 
        py: 2, 
        mt: 'auto',
        borderTop: '1px solid #d0d0d0'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Typography 
                variant="body2" 
                component="a"
                href="/privacy-policy"
                sx={{ 
                  color: '#006D5B', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Privacy Policy
              </Typography>
              <Typography 
                variant="body2" 
                component="a"
                href="https://wa.me/2349050066638?text=Hi%2C%20I%20need%20help%20with%20finding%20medicines%20on%20Pharmastackx"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: '#006D5B', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Need Help?
              </Typography>
              <Typography 
                variant="body2" 
                component="a"
                href="https://wa.me/2349050066638?text=Hello%2C%20I%20would%20like%20to%20get%20in%20touch%20regarding%20Pharmastackx"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: '#006D5B', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Contact
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}