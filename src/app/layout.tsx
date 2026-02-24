import type { Metadata } from 'next';
import '@/styles/globals.css';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'StatusCheck - NIN/BVN Verification Platform',
  description: 'Secure and reliable NIN/BVN verification platform for Nigeria. Fast, accurate, and compliant with NIMC standards.',
  keywords: ['NIN verification', 'BVN verification', 'NIMC', 'Nigeria', 'identity verification'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
