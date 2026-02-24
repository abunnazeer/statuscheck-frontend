// src/components/layout/Layout.tsx

'use client';

import { ReactNode } from 'react';
import styles from './Layout.module.css';
import Navbar from './Navbar';
import Footer from './Footer';
import ToastContainer from '@/components/ui/Toast';

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  containerized?: boolean;
}

export default function Layout({
  children,
  showNavbar = true,
  showFooter = true,
  containerized = true,
}: LayoutProps) {
  return (
    <div className={styles.layout}>
      {showNavbar && <Navbar />}
      
      <main className={styles.main}>
        {containerized ? (
          <div className={styles.container}>{children}</div>
        ) : (
          children
        )}
      </main>

      {showFooter && <Footer />}
      
      <ToastContainer />
    </div>
  );
}