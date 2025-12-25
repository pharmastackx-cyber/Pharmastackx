import { motion } from 'framer-motion';
import { Box, Typography, Button, Paper } from '@mui/material';
import { SystemUpdateAlt as AddToHomeScreenIcon } from '@mui/icons-material';
import ShareButton from './ShareButton'; // We'll update this component next

const AddToHomeScreenPrompt = ({ onDismiss }: { onDismiss: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <Paper
          elevation={10}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: '16px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            bgcolor: 'background.paper',
          }}
        >
          <AddToHomeScreenIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Add to Home Screen to Continue
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            For the best experience, please add this app to your home screen. This enables full functionality and quick access.
          </Typography>
          <ShareButton sx={{ width: '100%', py: 1.5, fontSize: '1rem' }} />
          <Button onClick={onDismiss} sx={{ mt: 2, color: 'text.secondary' }}>
            Dismiss
          </Button>
        </Paper>
      </motion.div>
    </motion.div>
  );
};

export default AddToHomeScreenPrompt;
