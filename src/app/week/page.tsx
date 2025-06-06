'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useTaskContext, useMilestoneContext } from '@/context';
import { isInWeek, getCurrentDate, getCurrentWeekNumber } from '@/utils/dateUtils';
import TaskForm from '@/components/tasks/TaskForm';
import { getMilestonesForWeek, getAllWeekNumbers } from '@/utils/dataLoader';
import { generateOverdueRolloverTasks } from '@/utils/taskUtils';
import { StrictDroppable, DropResult } from '@/components/dnd/DragDropWrapper';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { addDays, format, parseISO } from 'date-fns';
import { Task } from '@/types';
import '@/styles/dnd.css';
import DragHandleIcon from '@/components/dnd/DragHandleIcon';
import DragDropProvider, { DndContext } from '@/components/dnd/DragDropProvider';
import { getPhaseForWeek } from '@/utils/phaseUtils';
import SimpleDraggableTaskItem from '@/components/tasks/SimpleDraggableTaskItem';
import SimpleDroppableContainer from '@/components/tasks/SimpleDroppableContainer';
import MobileWeekView from '@/components/mobile/MobileWeekView';
import { cleanupAllDragStates } from '@/utils/dragCleanup';

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
  const { state: { tasks, loading: tasksLoading }, moveTask, moveTaskVisually, toggleTaskCompletion } = useTaskContext();
  const { state: { milestones, loading: milestonesLoading } } = useMilestoneContext();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'milestones' | 'weeks'>('weeks');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);


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

  // Filter tasks for the selected week including rollover tasks
  const weekTasks = useMemo(() => {
    // Get current week number for rollover calculation
    const currentWeekNumber = getCurrentWeekNumber();

    // Generate rollover tasks for overdue items
    const rolloverTasks = generateOverdueRolloverTasks(tasks, currentWeekNumber, 10);

    // Filter original tasks for this week
    let originalWeekTasks: Task[] = [];

    // First try to filter by weekNumber if available
    const tasksWithWeekNumber = tasks.filter(task => 'weekNumber' in task);
    if (tasksWithWeekNumber.length > 0) {
      // Filter tasks by week number
      originalWeekTasks = tasksWithWeekNumber.filter(task => task.weekNumber === weekNumber);
    } else {
      // Fallback to date-based filtering if no week numbers are available
      originalWeekTasks = tasks.filter(task => {
        // Check if the task's start date is in this week
        if (task.startDate) {
          return isInWeek(task.startDate, weekNumber);
        }
        // Otherwise check the due date
        return isInWeek(task.dueDate, weekNumber);
      });
    }

    // Filter rollover tasks for this specific week
    const weekRolloverTasks = rolloverTasks.filter(rolloverTask => {
      const rolloverWeekNumber = rolloverTask.visualWeekNumber || rolloverTask.weekNumber;
      return rolloverWeekNumber === weekNumber;
    });

    // Combine original tasks with rollover tasks
    const allWeekTasks = [...originalWeekTasks, ...weekRolloverTasks];

    console.log(`Week ${weekNumber} tasks:`, {
      originalTasks: originalWeekTasks.length,
      rolloverTasks: weekRolloverTasks.length,
      total: allWeekTasks.length,
      rolloverTaskIds: weekRolloverTasks.map(t => t.id),
      rolloverTaskTitles: weekRolloverTasks.map(t => t.title)
    });

    return allWeekTasks;
  }, [tasks, weekNumber]);



  // Get the days of the week for the selected week
  const weekDays = useMemo(() => {
    const { startOfWeek } = weekInfo;
    const days = [];

    for (let i = 0; i < 7; i++) {
      const day = addDays(startOfWeek, i);
      days.push(day);
    }

    return days;
  }, [weekInfo]);

  // Group tasks by day of the week
  const tasksByDay = useMemo(() => {
    const grouped: Record<string, typeof tasks> = {};

    // Initialize all days of the week
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = [];
    });

    // Group tasks by day
    weekTasks.forEach(task => {
      // Determine which date to use for grouping
      let displayDate;

      // For rollover tasks, use visual start date if available
      if (task.visualStartDate) {
        displayDate = new Date(task.visualStartDate);
      } else if (task.startDate) {
        // Use startDate if available
        displayDate = new Date(task.startDate);
      } else if (task.category && (task.weekNumber || task.visualWeekNumber)) {
        // If no startDate but has category and weekNumber, distribute based on category
        // Calculate the Monday of the task's week using our reference date
        const referenceDate = new Date(2025, 4, 12); // May 12, 2025 (Monday) - Week 1

        // Calculate the Monday of the task's week (use visual week for rollover tasks)
        const taskWeekNumber = task.visualWeekNumber || task.weekNumber || weekNumber;
        const weekStartDate = new Date(referenceDate);
        weekStartDate.setDate(referenceDate.getDate() + (taskWeekNumber - 1) * 7);

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

      // Format the date as YYYY-MM-DD for grouping
      const dayKey = format(displayDate, 'yyyy-MM-dd');

      // Add the task to the appropriate day
      if (grouped[dayKey]) {
        grouped[dayKey].push(task);
      } else {
        // If the day is not in the current week, add it to the closest day
        const dayOfWeek = displayDate.getDay();
        const adjustedDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0=Monday
        const closestDay = weekDays[adjustedDayIndex];
        const closestDayKey = format(closestDay, 'yyyy-MM-dd');

        if (!grouped[closestDayKey]) {
          grouped[closestDayKey] = [];
        }

        grouped[closestDayKey].push(task);
      }
    });

    return grouped;
  }, [weekTasks, weekDays]);

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

  // Function to handle task movement between days
  const handleTaskMoved = useCallback((taskId: string, destinationContainerId: string) => {
    console.log(`Task ${taskId} moved to ${destinationContainerId}`);

    // Get the task that was moved
    const task = weekTasks.find(t => t.id === taskId);
    if (!task) {
      console.error('Task not found:', taskId);
      return;
    }

    try {
      // Extract date string from the destination container ID
      // Format: day-YYYY-MM-DD
      const destDateStr = destinationContainerId.split('day-')[1];

      if (!destDateStr) {
        console.error('Invalid destination container ID:', destinationContainerId);
        return;
      }

      console.log('Destination date string:', destDateStr);

      // Parse the destination date
      const destDate = parseISO(destDateStr);

      if (isNaN(destDate.getTime())) {
        console.error('Invalid date parsed:', destDateStr);
        return;
      }

      console.log('Parsed destination date:', destDate);

      // Calculate new dates
      const newStartDate = format(destDate, 'yyyy-MM-dd');
      console.log('New start date:', newStartDate);

      // If the task has a due date that's the same as the start date,
      // update the due date as well
      let newDueDate = task.dueDate;
      if (typeof task.startDate === 'string' && typeof task.dueDate === 'string') {
        const startDate = new Date(task.startDate);
        const dueDate = new Date(task.dueDate);

        // Calculate the difference in days between start and due date
        const diffDays = Math.round((dueDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        // Apply the same difference to the new due date
        const newDueDateObj = new Date(destDate);
        newDueDateObj.setDate(newDueDateObj.getDate() + diffDays);
        newDueDate = format(newDueDateObj, 'yyyy-MM-dd');
      } else {
        newDueDate = newStartDate;
      }

      console.log('New visual start date:', newStartDate);

      // Use visual movement to preserve original due dates
      moveTaskVisually(
        taskId,
        weekNumber,
        newStartDate
      );
    } catch (error) {
      console.error('Error in handleTaskMoved:', error);
    }
  }, [weekTasks, moveTaskVisually, weekNumber]);

  // Handle task editing
  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  }, []);

  // Handle closing the task form
  const handleCloseForm = useCallback(() => {
    setEditingTask(null);
    setIsFormOpen(false);
  }, []);

  // Effect to add event listener for drop events
  useEffect(() => {
    const handleSimpleDrop = (e: any) => {
      const { taskId, containerId } = e.detail;
      console.log('Simple drop event detected:', e.detail);
      handleTaskMoved(taskId, containerId);

      // Force cleanup after drop
      setTimeout(() => {
        console.log('🧹 Week page: Triggering cleanup after drop');
        cleanupAllDragStates();
      }, 150);
    };

    document.addEventListener('simple-drop', handleSimpleDrop);

    return () => {
      document.removeEventListener('simple-drop', handleSimpleDrop);
    };
  }, [handleTaskMoved]);

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
        <div className="flex items-center justify-between">
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
      <div className="mb-4">
        <p className="text-space-cadet/70">{dateRange}</p>
      </div>



      {/* Add Task button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-purple"
          style={{ backgroundColor: '#7E52A0' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#29274C' }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#7E52A0' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Main content with sidebar */}
      <div className="flex flex-col md:flex-row week-main-container">
        {/* Left sidebar with toggle buttons */}
        <div className="w-full md:w-48 flex-shrink-0 md:mr-6 week-sidebar">
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
              {/* Mobile View */}
              <MobileWeekView
                weekDays={weekDays}
                tasksByDay={tasksByDay}
                onEditTask={handleEdit}
              />

              {/* Desktop Table View */}
              <div className="drag-drop-container hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="w-32 py-3 px-4 text-left bg-space-cadet text-white rounded-tl-lg">Day</th>
                        <th className="py-3 px-4 text-left bg-space-cadet text-white rounded-tr-lg">Tasks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weekDays.map((day, index) => {
                        const dayKey = format(day, 'yyyy-MM-dd');
                        const dayTasks = tasksByDay[dayKey] || [];
                        const dayName = format(day, 'EEEE');
                        const dayDate = format(day, 'MMM d');
                        const isLastDay = index === weekDays.length - 1;

                        return (
                          <tr key={dayKey} className={`border-b ${isLastDay ? 'border-b-0' : 'border-space-cadet/20'}`}>
                            <td className="py-3 px-4 bg-space-cadet text-white">
                              <div className="font-medium">{dayName}</div>
                              <div className="text-sm text-white/80">{dayDate}</div>
                            </td>
                            <td className="py-3 px-4">
                              <SimpleDroppableContainer
                                id={`day-${dayKey}`}
                                className="flex flex-wrap gap-3 rounded-md droppable-container"
                                style={{
                                  minWidth: '500px'
                                }}
                              >
                                {dayTasks.length === 0 ? (
                                  <p className="text-space-cadet/50 py-2 text-sm flex items-center">
                                    <span className="mr-2">No tasks for this day</span>
                                    <span className="text-xs text-space-cadet/70" title="Drop tasks here">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                      </svg>
                                    </span>
                                  </p>
                                ) : (
                                  dayTasks.map((task, index) => (
                                    <SimpleDraggableTaskItem
                                      key={task.id}
                                      task={task}
                                      index={index}
                                      onEdit={handleEdit}
                                      onToggleCompletion={toggleTaskCompletion}
                                    />
                                  ))
                                )}
                              </SimpleDroppableContainer>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {Object.values(tasksByDay).every(tasks => tasks.length === 0) && (
                <div className="rounded-lg shadow-sm border border-space-cadet/30 p-6 text-center" style={{ backgroundColor: '#C2AFF0' }}>
                  <p className="text-space-cadet/70">No tasks scheduled for Week {weekNumber}</p>
                </div>
              )}

              {/* Task Edit Form */}
              {isFormOpen && (
                <TaskForm
                  task={editingTask}
                  onClose={handleCloseForm}
                  defaultWeekNumber={weekNumber}
                  defaultDate={weekDays[0] ? format(weekDays[0], 'yyyy-MM-dd') : undefined}
                  defaultPhase={getPhaseForWeek(weekNumber)}
                />
              )}
            </div>
          )}
        </div>
      </div >
    </div >
  );
}
