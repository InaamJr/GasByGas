'use client';

import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <TopBar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} />

        {/* Main Content */}
        <main className={`
          flex-1 p-8 transition-all duration-300 mt-[72px]
          ${isSidebarOpen ? 'ml-64' : 'ml-0'}
        `}>
          {children}
        </main>
      </div>
    </div>
  );
}