
'use client';

import { 
    Box, 
    Typography, 
    Container, 
    Paper,
    Link,
    Grid
} from '@mui/material';
import DemoSignupForm from './DemoSignupForm'; // Import the new form
import Image from 'next/image';

const ProductDemoPage = () => {

    return (
        <>
            <Container maxWidth="lg">
                <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 4, borderRadius: '16px', bgcolor: '#f8f9fa' }}>
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6} sx={{ order: { xs: 2, md: 1 } }}>
                            <Box sx={{ position: 'relative', width: '100%', height: { xs: 300, md: '100%' }, minHeight: 400, borderRadius: '12px', overflow: 'hidden' }}>
                                <Image 
                                    src="/placeholder.png"
                                    alt="Pharmastackx Product Demo"
                                    layout="fill"
                                    objectFit="cover"
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ order: { xs: 1, md: 2 } }}>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 2, color: '#006D5B' }}>
                                Pharmastackx Product Demo Registration
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6, color: '#444' }}>
                                PharmaStackX is building the essential digital infrastructure required for modern healthcare in Africa. 
                                Our core mission is to end the devastating public health problem caused by inventory invisibility. 
                                Join us to see how we are transforming community pharmacies.
                            </Typography>
                            <DemoSignupForm />
                            <Typography variant="body2" sx={{ mt: 4, color: '#666', textAlign: 'center' }}>
                                By registering, you agree to our <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
                                We are committed to protecting your privacy and handling your personal information in a lawful, transparent, and secure manner.
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </>
    );
};

export default ProductDemoPage;
