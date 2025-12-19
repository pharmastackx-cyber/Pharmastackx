
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/context/SessionProvider";
import { CartProvider } from "@/contexts/CartContext";
import { PromoProvider } from "@/contexts/PromoContext";
import { OrderProvider } from "@/contexts/OrderContext";
import Script from "next/script";
import { Suspense } from "react";
import { AuthModalProvider } from "@/contexts/AuthModalContext"; // Import the provider
import MainLayout from "./MainLayout";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Pharmastackx",
  description: "Find Medicines Near You",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pharmastackx",
  },
};

export const viewport: Viewport = {
  themeColor: "#006D5B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-TBR3LZNH70"
        />
        <Script
          id="google-analytics"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TBR3LZNH70');
            `,
          }}
        />
      </head>
      <body className={poppins.className}>
        <Suspense fallback={null}>
          <SessionProvider>
            {/* Wrap with AuthModalProvider */}
            <AuthModalProvider>
              <PromoProvider>
                <OrderProvider>
                  <CartProvider>
                    <MainLayout>{children}</MainLayout>
                  </CartProvider>
                </OrderProvider>
              </PromoProvider>
            </AuthModalProvider>
          </SessionProvider>
        </Suspense>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('PWA service worker registered.');
                  }).catch(function(err) {
                    console.error('PWA service worker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
