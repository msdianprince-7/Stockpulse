'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { GlobalAlertListener } from '@/components';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navbar />
        {children}
        <GlobalAlertListener />
      </AuthProvider>
    </ThemeProvider>
  );
}
