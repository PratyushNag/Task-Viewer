'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useTaskContext, useMilestoneContext } from '@/context';
import { isInWeek, getCurrentDate } from '@/utils/dateUtils';
import TaskList from '@/components/tasks/TaskList';
import { getMilestonesForWeek, getAllWeekNumbers } from '@/utils/dataLoader';

// Helper function to calculate week info (moved outside component to avoid Hook issues)
// Using May 12, 2025 (Monday) as the reference point for Week 1
const calculateWeekInfo = (weekNum?: number) => {
  const now = new Date();

  // Reference date: May 12, 2025 (Monday) - Week 1
  const referenceDate = new Date(2025, 4, 12); // Month is 0-indexed, so 4 = May

  // If a specific week is selected, calculate dates for that week
  // Otherwise calculate the current week based on today's date
  let targetDate: Date;
  let calculatedWeekNumber: number;

  if (weekNum !== undefined && weekNum > 0) {
    // Calculate the Monday of the specified week
    targetDate = new Date(referenceDate);
    targetDate.setDate(referenceDate.getDate() + (weekNum - 1) * 7);
    calculatedWeekNumber = weekNum;
  } else {
    // Calculate the current week number based on today's date
    const daysSinceReference = Math.floor((now.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
    calculatedWeekNumber = Math.floor(daysSinceReference / 7) + 1;

    if (calculatedWeekNumber < 1) {
      // If today is before the reference date, use Week 1
      calculatedWeekNumber = 1;
    }

    // Calculate the Monday of the current week
    targetDate = new Date(referenceDate);
    targetDate.setDate(referenceDate.getDate() + (calculatedWeekNumber - 1) * 7);
  }

  // Calculate start of week (Monday)
  const startOfWeek = new Date(targetDate);

  // Calculate end of week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const dateRange = `${startOfWeek.toLocaleDateString('en-US', formatOptions)} - ${endOfWeek.toLocaleDateString('en-US', formatOptions)}`;

  return { dateRange, weekNumber: calculatedWeekNumber, startOfWeek, endOfWeek, year: startOfWeek.getFullYear() };
};

export default function WeekPage() {
  // Context and state
  const { state: { tasks, loading: tasksLoading } } = useTaskContext();
  const { state: { milestones, loading: milestonesLoading } } = useMilestoneContext();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'milestones' | 'weeks'>('weeks');
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  // Memoize the getWeekInfo function
  const getWeekInfo = useCallback((weekNum?: number) => {
    return calculateWeekInfo(weekNum);
  }, []);

  // Get current week info
  const weekInfo = useMemo(() => {
    return getWeekInfo(selectedWeek || undefined);
  }, [getWeekInfo, selectedWeek]);

  const { weekNumber, dateRange } = weekInfo;

  // Get all available week numbers from the data
  const availableWeeks = useMemo(() => {
    return getAllWeekNumbers(tasks, milestones);
  }, [tasks, milestones]);

  // Generate options for week selector dropdown based on available weeks
  const weekOptions = useMemo(() => {
    return availableWeeks.map(week => {
      const weekInfo = getWeekInfo(week);
      return {
        value: week,
        label: `Week ${week} (${weekInfo.dateRange})`
      };
    });
  }, [getWeekInfo, availableWeeks]);

  // Filter tasks for the selected week
  const weekTasks = useMemo(() => {
    // First try to filter by weekNumber if available
    const tasksWithWeekNumber = tasks.filter(task => 'weekNumber' in task);
    if (tasksWithWeekNumber.length > 0) {
      // Filter tasks by week number
      return tasksWithWeekNumber.filter(task => task.weekNumber === weekNumber);
    }

    // Fallback to date-based filtering if no week numbers are available
    return tasks.filter(task => {
      // Check if the task's start date is in this week
      if (task.startDate) {
        return isInWeek(task.startDate, weekNumber);
      }
      // Otherwise check the due date
      return isInWeek(task.dueDate, weekNumber);
    });
  }, [tasks, weekNumber]);

  // Toggle expanded state for a day
  const toggleDay = (day: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  // Group tasks by day of the week
  const tasksByDay = useMemo(() => {
    // Start with Monday as the first day of the week for ordering purposes
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped: Record<string, typeof tasks> = {};

    // Group tasks by day
    weekTasks.forEach(task => {
      // Determine which date to use for grouping
      let displayDate;

      if (task.startDate) {
        // Use startDate if available
        displayDate = new Date(task.startDate);
      } else if (task.category && task.weekNumber) {
        // If no startDate but has category and weekNumber, distribute based on category
        // Calculate the Monday of the task's week using our reference date
        const referenceDate = new Date(2025, 4, 12); // May 12, 2025 (Monday) - Week 1

        // Calculate the Monday of the task's week
        const weekStartDate = new Date(referenceDate);
        weekStartDate.setDate(referenceDate.getDate() + (task.weekNumber - 1) * 7);

        // Add day offset based on category
        let dayOffset = 0;
        switch (task.category) {
          case 'GS Subject 1':
            dayOffset = 0; // Monday (already the start day)
            break;
          case 'GS Subject 2 / Optional':
            dayOffset = 1; // Tuesday
            break;
          case 'CSAT':
            dayOffset = 2; // Wednesday
            break;
          case 'Current Affairs':
            dayOffset = 4; // Friday
            break;
          case 'Weekly Test':
            dayOffset = 6; // Sunday
            break;
          default:
            dayOffset = 3; // Thursday for any other category
        }

        displayDate = new Date(weekStartDate);
        displayDate.setDate(weekStartDate.getDate() + dayOffset);
      } else {
        // Fall back to dueDate if neither startDate nor category is available
        displayDate = new Date(task.dueDate);
      }

      // Get the day name and add the task to that day's group
      // Convert from JS day (0=Sunday) to our day array (0=Monday)
      const jsDay = displayDate.getDay(); // 0=Sunday, 1=Monday, etc.
      const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Monday, 1=Tuesday, etc.
      const dayName = dayOrder[dayIndex];

      // Initialize the day array if it doesn't exist yet
      if (!grouped[dayName]) {
        grouped[dayName] = [];
      }

      // Add the task to the appropriate day
      grouped[dayName].push(task);
    });

    // Sort the days according to dayOrder and return
    return Object.fromEntries(
      Object.entries(grouped).sort(([a], [b]) => {
        return dayOrder.indexOf(a) - dayOrder.indexOf(b);
      })
    );
  }, [weekTasks]);

  // Navigation handlers
  const goToPreviousWeek = useCallback(() => {
    const currentIndex = availableWeeks.indexOf(weekNumber);
    if (currentIndex > 0) {
      setSelectedWeek(availableWeeks[currentIndex - 1]);
    }
  }, [weekNumber, availableWeeks]);

  const goToNextWeek = useCallback(() => {
    const currentIndex = availableWeeks.indexOf(weekNumber);
    if (currentIndex < availableWeeks.length - 1) {
      setSelectedWeek(availableWeeks[currentIndex + 1]);
    }
  }, [weekNumber, availableWeeks]);

  const goToCurrentWeek = useCallback(() => {
    setSelectedWeek(null);
  }, []);

  // Get milestones for the selected week
  const weekMilestones = useMemo(() => {
    return getMilestonesForWeek(weekNumber, milestones);
  }, [weekNumber, milestones]);

  // Auto-expand the first day when week changes
  useEffect(() => {
    // Reset expanded days when week changes
    setExpandedDays({});

    // If there are tasks for this week, expand the first day
    if (Object.keys(tasksByDay).length > 0) {
      const firstDay = Object.keys(tasksByDay)[0];
      setExpandedDays({ [firstDay]: true });
    }
  }, [weekNumber, tasksByDay]);

  // Loading state
  if (tasksLoading || milestonesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-purple"></div>
      </div>
    );
  }

  // Render the weekly view
  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gunmetal">Week View</h1>
      </div>

      {/* Jump to section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-space-cadet mb-4">Jump to</h2>
        <div className="flex items-center">
          <select
            value={selectedWeek || weekNumber}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            className="px-3 py-2 border border-space-cadet/30 rounded-md text-sm min-w-[200px] text-space-cadet"
          >
            {weekOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setSelectedWeek(parseInt(String(selectedWeek || weekNumber)))}
            className="ml-2 px-4 py-2 text-white rounded-md"
            style={{ backgroundColor: '#7E52A0' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#29274C' }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#7E52A0' }}
          >
            Go
          </button>
        </div>
      </div>

      {/* Week selection row */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-space-cadet mb-4">Weeks</h2>
        <div className="relative">
          {/* Only show navigation buttons if there are multiple weeks */}
          {availableWeeks.length > 1 && (
            <button
              onClick={goToPreviousWeek}
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-8 h-8 flex items-center justify-center rounded-full shadow-md z-10"
              style={{ backgroundColor: '#C2AFF0' }}
              aria-label="Previous weeks"
              disabled={availableWeeks.indexOf(weekNumber) === 0}
            >
              <span className={`${availableWeeks.indexOf(weekNumber) === 0 ? 'text-space-cadet/30' : 'text-space-cadet'}`}>&lt;</span>
            </button>
          )}

          <div className="flex overflow-x-auto py-2 px-8 scrollbar-hide">
            <div className="flex space-x-2 min-w-full">
              {availableWeeks.length > 0 ? (
                availableWeeks.map((week, index) => {
                  // Check if there's a gap between this week and the next one
                  const nextWeek = availableWeeks[index + 1];
                  const hasGap = nextWeek && nextWeek - week > 1;

                  return (
                    <React.Fragment key={week}>
                      <button
                        onClick={() => setSelectedWeek(week)}
                        className={`px-4 py-3 rounded-lg text-center min-w-[80px] flex-shrink-0 transition-colors text-white`}
                        style={{
                          backgroundColor: (selectedWeek || weekNumber) === week ? '#7E52A0' : '#29274C'
                        }}
                        onMouseOver={(e) => {
                          if ((selectedWeek || weekNumber) !== week) {
                            e.currentTarget.style.backgroundColor = '#7E52A0';
                          }
                        }}
                        onMouseOut={(e) => {
                          if ((selectedWeek || weekNumber) !== week) {
                            e.currentTarget.style.backgroundColor = '#29274C';
                          }
                        }}
                      >
                        <div className="font-medium">Week</div>
                        <div className="font-semibold">{week}</div>
                      </button>

                      {/* Add a gap indicator if there's a gap */}
                      {hasGap && (
                        <div className="flex items-center px-2">
                          <div className="flex flex-col items-center justify-center bg-gray-200 rounded-lg px-3 py-2">
                            {/* Show different text based on gap size */}
                            {nextWeek - week === 2 ? (
                              <div className="text-gray-500 text-xs">Week {week + 1}</div>
                            ) : (
                              <>
                                <div className="text-gray-500 text-xs">Gap</div>
                                <div className="text-gray-500 text-xs">{week + 1} - {nextWeek - 1}</div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <div className="text-center py-6 w-full">
                  <p className="text-gray-500">No weeks available in the data</p>
                </div>
              )}
            </div>
          </div>

          {/* Only show navigation buttons if there are multiple weeks */}
          {availableWeeks.length > 1 && (
            <button
              onClick={goToNextWeek}
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-8 h-8 flex items-center justify-center rounded-full shadow-md z-10"
              style={{ backgroundColor: '#C2AFF0' }}
              aria-label="Next weeks"
              disabled={availableWeeks.indexOf(weekNumber) === availableWeeks.length - 1}
            >
              <span className={`${availableWeeks.indexOf(weekNumber) === availableWeeks.length - 1 ? 'text-space-cadet/30' : 'text-space-cadet'}`}>&gt;</span>
            </button>
          )}
        </div>
      </div>

      {/* Date range display */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-space-cadet/70">{dateRange}</p>

        <button
          onClick={goToCurrentWeek}
          className="px-4 py-2 text-white rounded-md flex items-center"
          style={{ backgroundColor: '#D295BF' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#7E52A0' }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#D295BF' }}
        >
          <span className="mr-2">Today</span>
          <span className="text-xs text-white px-2 py-1 rounded-full" style={{ backgroundColor: '#29274C' }}>
            {getCurrentDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </button>
      </div>

      {/* Main content with sidebar */}
      <div className="flex">
        {/* Left sidebar with toggle buttons */}
        <div className="w-48 flex-shrink-0 mr-6">
          <div className="space-y-3">
            <button
              onClick={() => setActiveView('milestones')}
              className={`block text-left py-2 px-4 font-medium rounded-md w-full text-white`}
              style={{
                backgroundColor: activeView === 'milestones' ? '#D295BF' : '#29274C'
              }}
              onMouseOver={(e) => {
                if (activeView !== 'milestones') {
                  e.currentTarget.style.backgroundColor = '#7E52A0';
                }
              }}
              onMouseOut={(e) => {
                if (activeView !== 'milestones') {
                  e.currentTarget.style.backgroundColor = '#29274C';
                }
              }}
            >
              Milestones
            </button>
            <button
              onClick={() => setActiveView('weeks')}
              className={`block text-left py-2 px-4 font-medium rounded-md w-full text-white`}
              style={{
                backgroundColor: activeView === 'weeks' ? '#D295BF' : '#29274C'
              }}
              onMouseOver={(e) => {
                if (activeView !== 'weeks') {
                  e.currentTarget.style.backgroundColor = '#7E52A0';
                }
              }}
              onMouseOut={(e) => {
                if (activeView !== 'weeks') {
                  e.currentTarget.style.backgroundColor = '#29274C';
                }
              }}
            >
              Weeks
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-grow">
          {/* Milestones View */}
          {activeView === 'milestones' && (
            <div>
              {weekMilestones.length > 0 ? (
                weekMilestones.map(milestone => (
                  <div key={milestone.id} className="rounded-lg shadow-sm border border-space-cadet/30 p-6 mb-4" style={{ backgroundColor: '#C2AFF0' }}>
                    <h3 className="text-lg font-medium text-space-cadet mb-2">
                      Milestone {milestone.weekNumber}: {milestone.title.split(':')[1]?.trim() || milestone.title}
                    </h3>
                    {milestone.description && (
                      <p className="text-space-cadet/80 mb-4">{milestone.description}</p>
                    )}

                    <div className="mt-3">
                      <p className="text-sm font-medium text-space-cadet mb-2">Tasks:</p>
                      <ul className="pl-5 space-y-1">
                        {weekTasks.filter(task => task.weekNumber === milestone.weekNumber).map(task => (
                          <li key={task.id} className="text-sm text-space-cadet/80 flex items-start">
                            <div className="w-2 h-2 rounded-full mt-1.5 -ml-3 mr-2" style={{ backgroundColor: '#29274C' }}></div>
                            Task {task.title.split(':')[0].trim()}: {task.title.split(':')[1]?.trim() || task.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 rounded-lg shadow-sm border border-space-cadet/30" style={{ backgroundColor: '#C2AFF0' }}>
                  <p className="text-space-cadet/70">No milestones for Week {weekNumber}</p>
                </div>
              )}
            </div>
          )}

          {/* Weekly Tasks View */}
          {activeView === 'weeks' && (
            <div className="space-y-4">
              {Object.keys(tasksByDay).length > 0 ? (
                Object.entries(tasksByDay).map(([day, dayTasks]) => (
                  <div key={day} className="rounded-lg shadow-md overflow-hidden border border-space-cadet/30" style={{ backgroundColor: '#C2AFF0' }}>
                    {/* Day Header - Clickable to expand/collapse */}
                    <div
                      className="p-4 cursor-pointer flex justify-between items-center"
                      onClick={() => toggleDay(day)}
                      style={{ backgroundColor: '#C2AFF0' }}
                    >
                      <h3 className="text-lg font-medium text-space-cadet">
                        {day}
                      </h3>
                      <div className="flex items-center">
                        <span className="text-sm text-space-cadet/70 mr-2">{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</span>
                        <svg
                          className={`w-5 h-5 text-space-cadet/70 transform transition-transform ${expandedDays[day] ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Day Content - Shown when expanded */}
                    {expandedDays[day] && (
                      <div className="p-4 border-t border-space-cadet/30" style={{ backgroundColor: '#C2AFF0' }}>
                        <TaskList
                          tasks={dayTasks}
                          title=""
                          emptyMessage={`No tasks for ${day}`}
                          itemsPerPage={10}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-lg shadow-sm border border-space-cadet/30 p-6 text-center" style={{ backgroundColor: '#C2AFF0' }}>
                  <p className="text-space-cadet/70">No tasks scheduled for Week {weekNumber}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
