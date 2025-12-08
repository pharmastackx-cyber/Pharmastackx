
import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Collapse,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import { History as HistoryIcon, ExpandMore as ExpandMoreIcon, Replay as RefillIcon, Visibility as ViewIcon } from '@mui/icons-material';
import Link from 'next/link';

// A simplified version of the DrugRequest type for props
interface RefillItem {
    name: string;
    form: string;
    strength: string;
    quantity: number;
    notes: string | null;
    image: string | null;
}

// The structure of a single historical request fetched from the API
interface RequestHistoryItem {
    _id: string;
    createdAt: string;
    items: RefillItem[];
    status: string;
}

interface RequestHistoryProps {
  history: RequestHistoryItem[];
  onRefill: (items: (RefillItem & { id: number; isEditing: boolean; showOtherInfo: boolean; formSuggestions: string[]; strengthSuggestions: string[] })[]) => void;
}

// --- Function to determine the status chip's appearance ---
const getStatusChip = (status: string) => {
    switch (status) {
        case 'pending': return <Chip label="Searching..." color="warning" variant="outlined" size="small" />;
        case 'quoted': return <Chip label="Items Found" color="primary" variant="filled" size="small" />;
        case 'awaiting-confirmation': return <Chip label="Accepted" color="success" variant="outlined" size="small" />;
        case 'confirmed': return <Chip label="Confirmed" color="success" variant="filled" size="small" />;
        case 'rejected': return <Chip label="Rejected" color="error" variant="outlined" size="small" />;
        default: return <Chip label={status.replace(/-/g, ' ')} size="small" />;
    }
};

const RequestHistory: React.FC<RequestHistoryProps> = ({ history, onRefill }) => {
  const [expanded, setExpanded] = useState(false);

  if (!history || history.length === 0) {
    return null;
  }

  const displayedHistory = expanded ? history : history.slice(0, 2);

  const handleRefillClick = (items: RefillItem[]) => {
      const refillItems = items.map(item => ({
          ...item,
          id: Date.now() + Math.random(),
          isEditing: false,
          showOtherInfo: Boolean(item.notes || item.image),
          formSuggestions: [], 
          strengthSuggestions: [],
      }));
      onRefill(refillItems);
  }

  return (
    <Box sx={{ mt: 5, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <HistoryIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Recent Requests
          </Typography>
      </Box>
      <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'grey.200', borderRadius: '12px' }}>
          <List dense>
              {displayedHistory.map((request) => (
              <ListItem
                  key={request._id}
                  divider
                  sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      py: 1.5,
                      // --- Make 'quoted' items stand out ---
                      ...(request.status === 'quoted' && {
                          bgcolor: 'primary.lighter',
                          borderRadius: '8px',
                      })
                  }}
              >
                  <ListItemText
                      primary={
                          <Typography variant="body1" component="span" sx={{ fontWeight: 500 }}>
                              {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </Typography>
                      }
                      secondary={
                          <Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {request.items.slice(0, 3).map((item, index) => (
                                  <Chip key={index} label={item.name} size="small" variant="outlined" />
                              ))}
                              {request.items.length > 3 && <Chip label={`+${request.items.length - 3}`} size="small" />}
                          </Box>
                      }
                  />
                  <Box sx={{ mt: { xs: 1, sm: 0 }, ml: { sm: 'auto' }, display: 'flex', gap: 2, alignItems: 'center' }}>
                      {/* --- Display the status chip --- */}
                      {getStatusChip(request.status)}

                      <Tooltip title={request.status === 'quoted' ? "Review Quote" : "View Details"}>
                          {/* --- FIX: Link to the patient-facing review page --- */}
                          <Link href={`/my-requests/${request._id}`} passHref>
                              <Button component="a" variant="text" size="small" startIcon={<ViewIcon />}>
                                  {request.status === 'quoted' ? "Review" : "View"}
                              </Button>
                          </Link>
                      </Tooltip>
                       <Tooltip title="Refill this list">
                          <Button variant="text" size="small" startIcon={<RefillIcon />} onClick={() => handleRefillClick(request.items)}>
                              Refill
                          </Button>
                      </Tooltip>
                  </Box>
              </ListItem>
              ))}
          </List>
          {history.length > 2 && (
            <Box sx={{mt: 1, textAlign: 'center'}}>
                <Button
                size="small"
                onClick={() => setExpanded(!expanded)}
                endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />}
                >
                {expanded ? 'Show Less' : `Show ${history.length - 2} More`}
                </Button>
            </Box>
          )}
      </Box>
    </Box>
  );
};

export default RequestHistory;
