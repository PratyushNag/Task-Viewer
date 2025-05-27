'use client';

import React, { useMemo, useState } from 'react';
import { useTaskContext, useMilestoneContext } from '@/context';
import {
  getAllPhases,
  getTasksForPhase,
  getMilestonesForPhase
} from '@/utils/dataLoader';
import TaskList from '@/components/tasks/TaskList';
import SimpleDraggableTaskList from '@/components/tasks/SimpleDraggableTaskList';
import { getPhaseName } from '@/utils/phaseUtils';
import { generateOverdueRolloverTasks } from '@/utils/taskUtils';
import { getCurrentWeekNumber } from '@/utils/dateUtils';

export default function Home() {
  const { state: { tasks, loading: tasksLoading } } = useTaskContext();
  const { state: { milestones, loading: milestonesLoading } } = useMilestoneContext();
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [activeView, setActiveView] = useState<'milestones' | 'weeks'>('milestones');

  // Get all phases from tasks and milestones
  const phases = useMemo(() => {
    return getAllPhases(tasks, milestones);
  }, [tasks, milestones]);

  // Set the first phase as selected when data is loaded
  React.useEffect(() => {
    if (phases.length > 0 && selectedPhase === null) {
      setSelectedPhase(phases[0]);
    }
  }, [phases, selectedPhase]);

  // Toggle expanded state for a week
  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [weekNumber]: !prev[weekNumber]
    }));
  };

  // Note: getPhaseName is now imported from utils/phaseUtils

  // Render loading state
  if (tasksLoading || milestonesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-purple"></div>
      </div>
    );
  }

  // Get tasks and milestones for the selected phase
  const phaseTasks = selectedPhase !== null ? getTasksForPhase(selectedPhase, tasks) : [];
  const phaseMilestones = selectedPhase !== null ? getMilestonesForPhase(selectedPhase, milestones) : [];

  // Generate rollover tasks for overdue items
  const currentWeekNumber = getCurrentWeekNumber();
  const rolloverTasks = generateOverdueRolloverTasks(tasks, currentWeekNumber, 10);

  // Combine original tasks with rollover tasks
  const allTasks = [...phaseTasks, ...rolloverTasks.filter(rolloverTask => {
    // Only include rollover tasks that belong to the current phase
    const rolloverWeekNumber = rolloverTask.visualWeekNumber || rolloverTask.weekNumber;
    if (!rolloverWeekNumber) return false;

    // Check if the rollover task's visual week belongs to the selected phase
    const phaseWeeks = selectedPhase !== null ? getTasksForPhase(selectedPhase, tasks).map(t => t.weekNumber).filter(Boolean) : [];
    const minWeek = Math.min(...phaseWeeks);
    const maxWeek = Math.max(...phaseWeeks);

    return rolloverWeekNumber >= minWeek && rolloverWeekNumber <= maxWeek;
  })];

  // Group tasks by week (using visual week number for rollover tasks)
  const tasksByWeek: Record<number, typeof tasks> = {};
  allTasks.forEach(task => {
    const weekNumber = task.visualWeekNumber || task.weekNumber;
    if (weekNumber) {
      if (!tasksByWeek[weekNumber]) {
        tasksByWeek[weekNumber] = [];
      }
      tasksByWeek[weekNumber].push(task);
    }
  });

  // Get all weeks in this phase
  const phaseWeeks = Object.keys(tasksByWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gunmetal">Phase View</h1>
      </div>

      {/* Phase Selection */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-space-cadet mb-4">Phases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {phases.map(phase => (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-center transition-colors shadow-sm text-white min-h-[44px]`}
              style={{
                backgroundColor: selectedPhase === phase ? '#7E52A0' : '#29274C'
              }}
              onMouseOver={(e) => {
                if (selectedPhase !== phase) {
                  e.currentTarget.style.backgroundColor = '#7E52A0';
                }
              }}
              onMouseOut={(e) => {
                if (selectedPhase !== phase) {
                  e.currentTarget.style.backgroundColor = '#29274C';
                }
              }}
            >
              <div className="font-medium text-sm sm:text-base">Phase {phase}:</div>
              <div className="font-semibold text-xs sm:text-sm">{getPhaseName(phase)}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedPhase !== null && (
        <div className="flex flex-col md:flex-row">
          {/* Left sidebar with toggle buttons */}
          <div className="w-full md:w-48 flex-shrink-0 md:mr-6 mb-4 md:mb-0">
            <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-3 overflow-x-auto md:overflow-x-visible">
              <button
                onClick={() => setActiveView('milestones')}
                className={`flex-shrink-0 md:block text-center md:text-left py-2 px-4 font-medium rounded-md w-full md:w-full text-white min-h-[44px] min-w-[120px] md:min-w-0`}
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
                className={`flex-shrink-0 md:block text-center md:text-left py-2 px-4 font-medium rounded-md w-full md:w-full text-white min-h-[44px] min-w-[120px] md:min-w-0`}
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
            {/* Milestones Section */}
            {activeView === 'milestones' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-space-cadet mb-4">Milestones</h2>
                <div className="space-y-4">
                  {phaseMilestones.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {phaseMilestones.map(milestone => (
                        <div
                          key={milestone.id}
                          className="rounded-lg shadow-sm border border-space-cadet/30 p-6"
                          style={{ backgroundColor: '#C2AFF0' }}
                        >
                          <h3 className="text-lg font-medium text-space-cadet mb-2">
                            {milestone.title}
                          </h3>
                          {milestone.description && (
                            <p className="text-space-cadet/80 mb-4">{milestone.description}</p>
                          )}

                          {tasksByWeek[milestone.weekNumber || 0]?.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-royal-purple mb-2">Tasks:</p>
                              <ul className="pl-5 space-y-1">
                                {tasksByWeek[milestone.weekNumber || 0]?.map(task => (
                                  <li key={task.id} className="text-sm text-space-cadet/80 flex items-start">
                                    <div className="w-2 h-2 rounded-full mt-1.5 -ml-3 mr-2" style={{ backgroundColor: '#29274C' }}></div>
                                    {task.title}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-4 text-xs text-space-cadet/70">
                            Week {milestone.weekNumber}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white/90 rounded-lg shadow-sm border border-lilac/30">
                      <p className="text-space-cadet">No milestones for this phase</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Weeks Section */}
            {activeView === 'weeks' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-space-cadet mb-4">Weeks</h2>
                <SimpleDraggableTaskList
                  phaseWeeks={phaseWeeks}
                  tasksByWeek={tasksByWeek}
                  expandedWeeks={expandedWeeks}
                  toggleWeek={toggleWeek}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
