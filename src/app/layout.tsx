import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from '../theme/theme';
import { CartProvider } from '../contexts/CartContext';
import { PromoProvider } from '../contexts/PromoContext';
import { OrderProvider } from '../contexts/OrderContext';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pharmastackx - Health Marketplace",
  description: "Modern health-tech marketplace for medications and pharmaceuticals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <OrderProvider>
          <PromoProvider>
            <CartProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
              </ThemeProvider>
            </CartProvider>
          </PromoProvider>
        </OrderProvider>
      </body>
    </html>
  );
}
