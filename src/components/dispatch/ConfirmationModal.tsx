'use client';

import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    List, 
    ListItem, 
    ListItemAvatar, 
    ListItemText, 
    Avatar,
    Typography,
    Box,
    Chip,
    CircularProgress
} from '@mui/material';

interface DrugRequest {
  id: number;
  name: string;
  form: string;
  strength: string;
  quantity: number;
  notes: string;
  image: string | null;
}

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requests: DrugRequest[];
  isSubmitting: boolean;
}

export default function ConfirmationModal({ open, onClose, onConfirm, requests, isSubmitting }: ConfirmationModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, borderBottom: '1px solid #ddd' }}>Confirm Your Request</DialogTitle>
      <DialogContent sx={{py: 2}}>
        <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
            Please review the items below. Once confirmed, we will begin searching for the best options for you.
        </Typography>
        <List>
          {requests.map((drug) => {
            const isImageBased = drug.name.startsWith('Prescription') || drug.name.startsWith('Image');
            return (
              <ListItem key={drug.id} divider>
                <ListItemAvatar>
                  <Avatar src={drug.image || undefined} sx={{ bgcolor: !drug.image ? '#006D5B' : 'transparent' }}>
                      {!drug.image && drug.name.charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography variant="body1" sx={{fontWeight: '500'}}>{drug.name}</Typography>}
                  secondary={
                      !isImageBased ? (
                          <Box component="span" sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5, pt: 0.5}}>
                              <Chip component="span" label={drug.strength || 'No Strength'} size="small" />
                              <Chip component="span" label={drug.form || 'No Form'} size="small" />
                              <Chip component="span" label={`Qty: ${drug.quantity}`} size="small" />
                              {drug.notes && <Chip component="span" label="Has Notes" size="small" variant="outlined" />}
                          </Box>
                      ) : (drug.notes ? <Chip component="span" label="Has Notes" size="small" variant="outlined" sx={{mt: 0.5}}/> : null)
                  }
                />
              </ListItem>
            )
          })}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', borderTop: '1px solid #ddd' }}>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>Go Back</Button>
        <Button onClick={onConfirm} variant="contained" autoFocus sx={{ bgcolor: '#006D5B', '&:hover': { bgcolor: '#004D3F' }, minWidth: 130 }} disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Begin Search'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
