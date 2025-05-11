'use client';

import React, { ReactNode } from 'react';
import Image from 'next/image';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E6BCCD' }}>
      <div style={{ backgroundColor: '#012A36' }}>
        <Header />
      </div>
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/Shreeyafavicon.svg"
              alt="Shreeya Logo"
              width={200}
              height={200}
              priority
              className="mb-4"
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
