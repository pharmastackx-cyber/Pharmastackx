
import type { Metadata } from "next";
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
      </body>
    </html>
  );
}
