'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push('/');
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!token) return null;

  return (
    <div className="h-screen flex p-4 md:p-6 gap-6">
      <Sidebar />
      <main className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
