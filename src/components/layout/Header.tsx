'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Calendar View</h1>
            </div>
            <nav className="ml-6 flex flex-wrap gap-4 sm:gap-8">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/')
                  ? 'border-indigo-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Phases
              </Link>
              <Link
                href="/week"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/week')
                  ? 'border-indigo-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Week
              </Link>
              <Link
                href="/calendar"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/calendar')
                  ? 'border-indigo-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
              >
                Calendar
              </Link>
              <Link
                href="/milestones"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive('/milestones')
                  ? 'border-indigo-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
