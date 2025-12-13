
"use client";
import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, Grid, TextField } from '@mui/material';
import { debounce } from 'lodash';

const FindPharmacyContent = () => {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPharmacies = async (currentPage: number, search: string, append = true) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pharmacies?page=${currentPage}&search=${search}`);
      if (!response.ok) throw new Error('Failed to fetch pharmacies.');
      const { pharmacies: newPharmacies } = await response.json();

      if (newPharmacies.length === 0) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      
      if (append) {
        setPharmacies(prev => [...prev, ...newPharmacies]);
      } else {
        setPharmacies(newPharmacies);
      }
      setPage(currentPage + 1);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setPage(0);
      fetchPharmacies(0, query, false);
    }, 500), // 500ms delay
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    // Cleanup on unmount
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleShowMore = () => {
    fetchPharmacies(page, searchQuery, true);
  };

  const handleShowLess = () => {
    setPage(0);
    fetchPharmacies(0, '', false); // Reset to initial state
    setSearchQuery(''); // Also clear the search input
  };

  return (
    <Box sx={{ color: 'white', p: { xs: 1, sm: 2 } }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <TextField 
          variant="outlined"
          placeholder="Search by Pharmacy Name..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            width: { xs: '100%', sm: '80%', md: '60%' },
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(150, 255, 222, 0.5)',
              },
              '&:hover fieldset': {
                borderColor: '#96ffde',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#96ffde',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
            }
          }}
        />
      </Box>

      {error && <Typography color="error" sx={{ textAlign: 'center', mb: 2 }}>{error}</Typography>}

      {isLoading && pharmacies.length === 0 ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress sx={{ color: '#96ffde' }} /></Box>
      ) : pharmacies.length > 0 ? (
        <Grid container spacing={2} justifyContent="center">
          {pharmacies.map(pharmacy => (
            <Grid item key={pharmacy._id} xs={6} sm={6} md={4}> 
              <Paper
                component="a"
                href={`https://${pharmacy.slug}.psx.ng`}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  p: { xs: 1, sm: 2 },
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  width: '100%',
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'background 0.3s',
                  '&:hover': { background: 'rgba(255, 255, 255, 0.15)' }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>{pharmacy.businessName}</Typography>
                <Typography variant="body2" sx={{ color: '#96ffde', mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{pharmacy.slug}.psx.ng</Typography>
                {pharmacy.businessAddress && (
                  <Typography variant="body2" sx={{ mb: 1, mt: 'auto', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{pharmacy.businessAddress}</Typography> 
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography sx={{ textAlign: 'center', mt: 4 }}>No pharmacies found.</Typography>
      )}

      {/* Loading spinner for "Show More" specifically */}
      {isLoading && pharmacies.length > 0 && 
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress sx={{ color: '#96ffde' }} /></Box>}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
        {pharmacies.length > 5 && !isLoading && (
          <Button variant="outlined" onClick={handleShowLess} sx={{ color: '#96ffde', borderColor: 'rgba(150, 255, 222, 0.5)', '&:hover': { backgroundColor: 'rgba(150, 255, 222, 0.1)', borderColor: '#96ffde' } }}>
            Show Less
          </Button>
        )}
        {hasMore && !isLoading && (
          <Button variant="contained" onClick={handleShowMore} sx={{ bgcolor: '#006D5B', '&:hover': { bgcolor: '#004D3F' } }}>
            Show More
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FindPharmacyContent;
