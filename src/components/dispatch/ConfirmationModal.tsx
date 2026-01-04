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
    CircularProgress,
    TextField
} from '@mui/material';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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
  onConfirm: (phoneNumber: string) => void;
  requests: DrugRequest[];
  isSubmitting: boolean;
}

export default function ConfirmationModal({ open, onClose, onConfirm, requests, isSubmitting }: ConfirmationModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState(false);

  const [os, setOs] = useState<'iOS' | 'Android' | 'Other'>('Other');
  const [isStandalone, setIsStandalone] = useState(false);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsStandalone(true);
      }

      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      if (/android/i.test(userAgent)) {
        setOs('Android');
      } else if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
        setOs('iOS');
      }
    }
  }, [open]);

  const handleConfirm = () => {
    if (phoneNumber.trim() === '') {
      setPhoneError(true);
    } else {
      setPhoneError(false);
      onConfirm(phoneNumber);
    }
  };

  const handleInstallGuideOpen = () => {
    setInstallGuideOpen(true);
  };

  const handleInstallGuideClose = () => {
    setInstallGuideOpen(false);
  };

  return (
    <>
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
          
          <TextField
            autoFocus
            margin="dense"
            id="phone"
            label="Phone Number for Notifications"
            type="tel"
            fullWidth
            variant="outlined"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              if(phoneError) setPhoneError(false);
            }}
            required
            error={phoneError}
            helperText={phoneError ? "A phone number is required to receive quote notifications." : "You'll get an SMS with a link to your quotes."}
            sx={{mt: 2}}
          />

          {!isStandalone && (os === 'iOS' || os === 'Android') && (
            <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'grey.100', borderRadius: '8px', textAlign: 'center' }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                To receive instant push notifications:
              </Typography>
              <Button onClick={handleInstallGuideOpen} variant="outlined" size="small">
                Add App to Home Screen
              </Button>
            </Box>
          )}

        </DialogContent>
        <DialogActions sx={{ p: '16px 24px', borderTop: '1px solid #ddd' }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>Go Back</Button>
          <Button onClick={handleConfirm} variant="contained" autoFocus sx={{ bgcolor: '#006D5B', '&:hover': { bgcolor: '#004D3F' }, minWidth: 130 }} disabled={isSubmitting || !phoneNumber}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Begin Search'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={installGuideOpen} onClose={handleInstallGuideClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Install App Guide</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {os === 'Android' ? (
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
              Tap the <strong>three dots</strong> in the corner, then select '<strong>Install app</strong>' or '<strong>Add to Home Screen</strong>'.
            </Typography>
          ) : ( // iOS
            <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
              Tap the <strong>Share</strong> icon at the bottom, then scroll down and tap '<strong>Add to Home Screen</strong>'.
            </Typography>
          )}
          <Image
            src={os === 'Android' ? "/install-guide-android.png" : "/install-guide.png"}
            alt="How to add to home screen guide"
            width={os === 'Android' ? 180 : 200}
            height={300}
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
          />
        </DialogContent>
        <DialogActions sx={{justifyContent: 'center', pb: 2}}>
            <Button onClick={handleInstallGuideClose} variant="contained">Got It</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
