'use client';

import { ReactNode } from 'react';
import styles from './DashboardLayout.module.css';
import Navbar from './Navbar';
import Footer from './Footer';
import ToastContainer from '@/components/ui/Toast';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className={styles.layout}>
      <Navbar />
      
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <div className={styles.container}>{children}</div>
        </main>
      </div>

      <Footer />
      
      <ToastContainer />
    </div>
  );
}
