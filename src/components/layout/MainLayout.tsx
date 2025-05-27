'use client';

import React, { ReactNode, useEffect } from 'react';
import Image from 'next/image';
import Header from './Header';
import { setupGlobalDragCleanup } from '@/utils/dragCleanup';
import '@/styles/dnd.css';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // Setup global drag cleanup listeners
  useEffect(() => {
    setupGlobalDragCleanup();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E6BCCD' }}>
      <div style={{ backgroundColor: '#012A36' }}>
        <Header />
      </div>
      <main className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Image
              src="/Shreeyafavicon.svg"
              alt="Shreeya Logo"
              width={150}
              height={150}
              priority
              className="mb-2 sm:mb-4 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40"
              style={{ objectFit: 'contain', maxWidth: '100%' }}
            />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
