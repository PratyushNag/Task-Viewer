'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-gunmetal shadow-sm" style={{ backgroundColor: '#012A36' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Image
              src="/Shreeyafavicon.svg"
              alt="Shreeya Logo"
              width={60}
              height={60}
              className="mr-2 sm:mr-3 w-10 h-10 sm:w-15 sm:h-15"
              priority
              style={{ objectFit: 'contain' }}
            />
            <h1 className="text-lg sm:text-xl font-bold text-white">Task Viewer</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
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
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')
                  ? 'bg-lilac text-white'
                  : 'text-white hover:bg-gray-700 hover:text-white'
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Phases
              </Link>
              <Link
                href="/week"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/week')
                  ? 'bg-lilac text-white'
                  : 'text-white hover:bg-gray-700 hover:text-white'
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Week
              </Link>
              <Link
                href="/calendar"
                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/calendar')
                  ? 'bg-lilac text-white'
                  : 'text-white hover:bg-gray-700 hover:text-white'
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Calendar
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
