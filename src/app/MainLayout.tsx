"use client";

import { usePathname } from 'next/navigation';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import { ReactNode } from 'react';

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showNavbar = pathname !== '/find-medicines';

  return (
    <>
      {showNavbar && <Navbar />}
      <AuthModal />
      {children}
    </>
  );
}
