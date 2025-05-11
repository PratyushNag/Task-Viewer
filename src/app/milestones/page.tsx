'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useMilestoneContext } from '@/context';
import { getCurrentDate } from '@/utils/dateUtils';
import MilestoneList from '@/components/milestones/MilestoneList';

// Helper function to calculate month info
const calculateMonthInfo = (monthOffset = 0) => {
  // Start with the current date
  const baseDate = getCurrentDate();

  // Create a new date with the specified month offset
  const targetDate = new Date(baseDate);
  targetDate.setMonth(baseDate.getMonth() + monthOffset);

  // Set to first day of month
  const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);

  // Set to last day of month
  const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

  // Format month name and year
  const monthName = targetDate.toLocaleString('default', { month: 'long' });
  const year = targetDate.getFullYear();

  return {
    firstDay,
    lastDay,
    monthName,
    year,
    monthOffset
  };
};

export default function MilestonesPage() {
  const { state: { milestones, loading } } = useMilestoneContext();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [monthOffset, setMonthOffset] = useState(0);

  // Get current month info
  const monthInfo = useMemo(() => {
    return calculateMonthInfo(monthOffset);
  }, [monthOffset]);

  // Navigation handlers
  const goToPreviousMonth = useCallback(() => {
    setMonthOffset(prev => prev - 1);
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonthOffset(prev => prev + 1);
  }, []);

  const goToCurrentMonth = useCallback(() => {
    setMonthOffset(0);
  }, []);

  const filteredMilestones = useMemo(() => {
    // Use the getCurrentDate function from dateUtils to get the current date
    // This ensures consistency with the rest of the application
    const now = getCurrentDate();

    // First filter by month if a specific month is selected
    let monthFiltered = milestones;
    if (monthOffset !== 0) {
      monthFiltered = milestones.filter(milestone => {
        const dueDate = new Date(milestone.dueDate);
        return dueDate >= monthInfo.firstDay && dueDate <= monthInfo.lastDay;
      });
    }

    // Then apply the user-selected filter
    switch (filter) {
      case 'upcoming':
        return monthFiltered.filter(milestone => {
          const dueDate = new Date(milestone.dueDate);
          return dueDate >= now;
        });
      case 'past':
        return monthFiltered.filter(milestone => {
          const dueDate = new Date(milestone.dueDate);
          return dueDate < now;
        });
      default:
        return monthFiltered;
    }
  }, [milestones, filter, monthOffset, monthInfo]);

  // Sort milestones by due date (chronologically)
  const sortedMilestones = useMemo(() => {
    return [...filteredMilestones].sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [filteredMilestones]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Milestones</h1>
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="px-3 py-1 bg-space-cadet hover:bg-royal-purple text-white rounded-md"
              aria-label="Previous month"
            >
              &lt;
            </button>
            <button
              onClick={goToCurrentMonth}
              className="px-3 py-1 bg-lilac hover:bg-royal-purple text-white rounded-md"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="px-3 py-1 bg-space-cadet hover:bg-royal-purple text-white rounded-md"
              aria-label="Next month"
            >
              &gt;
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-600 mt-2">
            {monthInfo.monthName} {monthInfo.year} - Track your important deadlines and achievements
          </p>
          <select
            value={monthOffset}
            onChange={(e) => setMonthOffset(parseInt(e.target.value))}
            className="px-2 py-1 border rounded-md text-sm min-w-[150px]"
          >
            {Array.from({ length: 24 }, (_, i) => i - 12).map(offset => {
              const info = calculateMonthInfo(offset);
              return (
                <option key={offset} value={offset}>
                  {info.monthName} {info.year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all'
              ? 'bg-lilac text-white'
              : 'text-gray-700 hover:bg-space-cadet hover:text-white'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'upcoming'
              ? 'bg-lilac text-white'
              : 'text-gray-700 hover:bg-space-cadet hover:text-white'
              }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'past'
              ? 'bg-lilac text-white'
              : 'text-gray-700 hover:bg-space-cadet hover:text-white'
              }`}
          >
            Past
          </button>
        </div>
      </div>

      <MilestoneList
        milestones={sortedMilestones}
        title={`Milestones - ${monthOffset === 0 ? 'All' : monthInfo.monthName}`}
        emptyMessage={`No ${filter} milestones ${monthOffset !== 0 ? `for ${monthInfo.monthName}` : ''}`}
        itemsPerPage={12}
      />
    </div>
  );
}
