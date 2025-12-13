
import React from 'react';
import { Box, Typography } from '@mui/material';

const ConsultContent = () => {
  return (
    <Box sx={{ p: 3, textAlign: 'center', color: 'white' }}>
      <Typography variant="h5">Consult a Pharmacist</Typography>
      <Typography sx={{ mt: 2 }}>
        This feature is coming soon. You'll be able to chat with a registered pharmacist here.
      </Typography>
    </Box>
  );
};

export default ConsultContent;
