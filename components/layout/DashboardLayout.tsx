'use client';

import { useUserProfile } from '@/hooks/useUserProfile';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, role, loading } = useUserProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} profile={profile} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}