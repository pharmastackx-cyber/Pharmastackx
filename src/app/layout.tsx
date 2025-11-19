
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/context/SessionProvider";
import { CartProvider } from "@/contexts/CartContext";
import { PromoProvider } from "@/contexts/PromoContext";
import { OrderProvider } from "@/contexts/OrderContext";
import Script from "next/script";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <SessionProvider>
          <PromoProvider>
            <OrderProvider>
              <CartProvider>
                <Suspense fallback={null}>
                </Suspense>
                {children}
              </CartProvider>
            </OrderProvider>
          </PromoProvider>
        </SessionProvider>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log("PWA Debugger: Script has been loaded.");
              if ('serviceWorker' in navigator) {
                console.log("PWA Debugger: 'serviceWorker' is in navigator.");
                window.addEventListener('load', function() {
                  console.log("PWA Debugger: Window load event fired.");
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('PWA service worker registration successful with scope: ', registration.scope);
                  }).catch(function(err) {
                    console.error('PWA service worker registration failed: ', err);
                  });
                });
              } else {
                console.log("PWA Debugger: 'serviceWorker' NOT in navigator.");
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
