'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import { User } from '@/types';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.common.white,
  backgroundColor: '#006D5B',
  padding: '12px 16px',
  textAlign: 'left',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '& > td, & > th': {
    padding: '12px 16px',
    textAlign: 'left',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const roleMapping: { [key: string]: string } = {
  customer: 'customer',
  pharmacy: 'pharmacy',
  clinic: 'clinic',
  vendor: 'vendor',
  agent: 'agent',
};

const allRoles = ['customer', 'pharmacy', 'clinic', 'vendor', 'agent'];

export default function UserManagementPage() {
  const [usersByRole, setUsersByRole] = useState<Record<string, User[]>>({
    customer: [],
    pharmacy: [],
    clinic: [],
    vendor: [],
    agent: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: User[] = await response.json();
      
      const groupedUsers: Record<string, User[]> = {
        customer: [],
        pharmacy: [],
        clinic: [],
        vendor: [],
        agent: [],
      };

      data.forEach((user) => {
        const role = user.role?.toLowerCase();
        const mappedRole = Object.keys(roleMapping).find(key => role === key);
        if (mappedRole) {
          groupedUsers[mappedRole].push(user);
        }
      });

      setUsersByRole(groupedUsers);
    } catch (error) {
      console.error("Failed to fetch and process users:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, event: SelectChangeEvent<string>) => {
    const newRole = event.target.value;
    try {
      const response = await fetch(`/api/admin/users/${userId}`,
        {
          method: 'PATCH', // Use PATCH instead of PUT
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole }),
        });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Re-fetch users to update the UI
      fetchUsers();

    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };
  
  const filteredUsersByRole = useMemo(() => {
    if (!searchQuery) {
      return usersByRole;
    }
    return Object.keys(usersByRole).reduce((acc, roleKey) => {
      const users = usersByRole[roleKey];
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      acc[roleKey] = filtered;
      return acc;
    }, {} as Record<string, User[]>);
  }, [searchQuery, usersByRole]);

  const roleColumns = {
    customer: 'Customers',
    pharmacy: 'Pharmacies',
    clinic: 'Clinics',
    vendor: 'Vendors',
    agent: 'Delivery Agents',
  };
  
  const roleKeys = Object.keys(roleColumns) as (keyof typeof roleColumns)[];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        User Management
      </Typography>

      <Box sx={{ mb: 4, maxWidth: '600px' }}>
        <TextField
          fullWidth
          placeholder="Search by username or email..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#006D5B' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '12px',
              bgcolor: 'white',
            }
          }}
        />
      </Box>
      
      {roleKeys.map((roleKey) => {
        const users = filteredUsersByRole[roleKey] || [];
        const roleTitle = roleColumns[roleKey];
        
        return (
          <Accordion key={roleKey} sx={{ mb: 2, '&.Mui-expanded': { mb: 2 }, boxShadow: '0 8px 24px rgba(0,0,0,0.05)', borderRadius: '16px', '&:before': { display: 'none' } }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${roleKey}-content`}
              id={`${roleKey}-header`}
              sx={{ borderRadius: '16px' }}
            >
              <Typography variant="h5" sx={{ fontWeight: 500 }}>
                {roleTitle} ({users.length} Total)
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <TableContainer component={Paper} sx={{ borderRadius: '0 0 16px 16px', boxShadow: 'none' }}>
                <Table aria-label={`${roleKey} users table`}>
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>S/N</StyledTableCell>
                      <StyledTableCell>Email</StyledTableCell>
                      <StyledTableCell>Username</StyledTableCell>
                      <StyledTableCell>Change Role</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {isLoading ? (
                      <StyledTableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>Loading...</TableCell>
                      </StyledTableRow>
                    ) : users.length === 0 ? (
                      <StyledTableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          No {searchQuery ? 'matching' : ''} {roleKey} users found.
                        </TableCell>
                      </StyledTableRow>
                    ) : (
                      users.map((user, index) => (
                        <StyledTableRow key={user.id || index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.name || 'N/A'}</TableCell>
                          <TableCell>
                            <FormControl fullWidth size="small">
                              <Select
                                value={user.role || ''}
                                onChange={(e) => handleRoleChange(user.id, e)}
                                displayEmpty
                              >
                                {allRoles.map(role => (
                                  <MenuItem key={role} value={role}>{role}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </TableCell>
                        </StyledTableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        );
      })}

    </Box>
  );
}