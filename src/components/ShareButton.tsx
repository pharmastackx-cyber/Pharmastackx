import { Button } from '@mui/material';
import { Share } from '@mui/icons-material';

const ShareButton = ({ sx }: { sx?: any }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Pharmastack',
        text: 'Check out Pharmastack! Your one-stop for all pharmaceutical needs.',
        url: window.location.href,
      })
        .then(() => console.log('Successfully shared'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
      alert('To add to home screen, please use the "Share" or "Options" menu in your browser and look for "Add to Home Screen".');
    }
  };

  return (
    <Button onClick={handleShare} variant="contained" sx={{ ...sx }}>
      <Share sx={{ mr: 1 }} />
      Add to Home Screen
    </Button>
  );
};

export default ShareButton;
