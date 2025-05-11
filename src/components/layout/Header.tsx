'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-gunmetal shadow-sm" style={{ backgroundColor: '#012A36' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <Image
                  src="/Shreeyafavicon.svg"
                  alt="Shreeya Logo"
                  width={100}
                  height={100}
                  className="mr-3"
                  priority
                  style={{ objectFit: 'contain', maxHeight: '100%' }}
                />
                <h1 className="text-xl font-bold text-white">Calendar View</h1>
              </div>
            </div>
            <nav className="ml-6 flex flex-wrap gap-4 sm:gap-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/')
                  ? 'border-lilac text-white'
                  : 'border-transparent text-white hover:border-white hover:text-white'
                  }`}
              >
                Phases
              </Link>
              <Link
                href="/week"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/week')
                  ? 'border-lilac text-white'
                  : 'border-transparent text-white hover:border-white hover:text-white'
                  }`}
              >
                Week
              </Link>
              <Link
                href="/calendar"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/calendar')
                  ? 'border-lilac text-white'
                  : 'border-transparent text-white hover:border-white hover:text-white'
                  }`}
              >
                Calendar
              </Link>
              <Link
                href="/milestones"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/milestones')
                  ? 'border-lilac text-white'
                  : 'border-transparent text-white hover:border-white hover:text-white'
                  }`}
              >
                Milestones
              </Link>

            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
