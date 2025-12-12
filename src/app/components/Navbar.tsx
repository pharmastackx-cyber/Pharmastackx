"use client";
import { Box, Typography } from "@mui/material";
import Link from "next/link";

export default function Navbar() {
  return (
    <Box sx={{ position: 'fixed', top: 24, left: 24, zIndex: 1301, display: 'flex', alignItems: 'center', height: '40px' }}>
      <Link href="https://psx.ng" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginRight: '24px' }}>
        <Typography variant="h6" component="div" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 'normal', fontSize: '1.1rem' }}>
            PharmaStackX
        </Typography>
      </Link>
    </Box>
  );
}
