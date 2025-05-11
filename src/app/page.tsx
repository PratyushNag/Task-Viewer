'use client';

import React, { useMemo, useState } from 'react';
import { useTaskContext, useMilestoneContext } from '@/context';
import {
  getAllPhases,
  getTasksForPhase,
  getMilestonesForPhase
} from '@/utils/dataLoader';
import TaskList from '@/components/tasks/TaskList';

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

  // Get phase name based on phase number
  const getPhaseName = (phase: number): string => {
    const phaseNames: Record<number, string> = {
      0: 'Foundation',
      1: 'Development',
      2: 'Testing',
      3: 'Prelims',
      4: 'Mains'
    };
    return phaseNames[phase] || `Phase ${phase}`;
  };

  // Render loading state
  if (tasksLoading || milestonesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Get tasks and milestones for the selected phase
  const phaseTasks = selectedPhase !== null ? getTasksForPhase(selectedPhase, tasks) : [];
  const phaseMilestones = selectedPhase !== null ? getMilestonesForPhase(selectedPhase, milestones) : [];

  // Group tasks by week
  const tasksByWeek: Record<number, typeof tasks> = {};
  phaseTasks.forEach(task => {
    if (task.weekNumber) {
      if (!tasksByWeek[task.weekNumber]) {
        tasksByWeek[task.weekNumber] = [];
      }
      tasksByWeek[task.weekNumber].push(task);
    }
  });

  // Get all weeks in this phase
  const phaseWeeks = Object.keys(tasksByWeek).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Phase View</h1>
      </div>

      {/* Phase Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Phases</h2>
        <div className="flex flex-wrap gap-4">
          {phases.map(phase => (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`px-6 py-4 rounded-lg text-center min-w-[180px] transition-colors ${selectedPhase === phase
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <div className="font-medium">Phase {phase}:</div>
              <div className="font-semibold">{getPhaseName(phase)}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedPhase !== null && (
        <div className="flex">
          {/* Left sidebar with toggle buttons */}
          <div className="w-48 flex-shrink-0 mr-6">
            <div className="border-l-4 border-gray-300 pl-4 space-y-6">
              <button
                onClick={() => setActiveView('milestones')}
                className={`block text-left py-2 font-medium ${activeView === 'milestones'
                    ? 'text-gray-900 border-l-4 border-indigo-600 -ml-4 pl-3'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Milestones
              </button>
              <button
                onClick={() => setActiveView('weeks')}
                className={`block text-left py-2 font-medium ${activeView === 'weeks'
                    ? 'text-gray-900 border-l-4 border-indigo-600 -ml-4 pl-3'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
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
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Milestones</h2>
                <div className="space-y-4">
                  {phaseMilestones.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      {phaseMilestones.map(milestone => (
                        <div key={milestone.id} className="mb-6 last:mb-0">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-800">
                                {milestone.title}
                              </h3>
                              {milestone.description && (
                                <p className="text-gray-600 mt-1">{milestone.description}</p>
                              )}

                              {tasksByWeek[milestone.weekNumber || 0]?.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-700 mb-2">Tasks:</p>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {tasksByWeek[milestone.weekNumber || 0]?.map(task => (
                                      <li key={task.id} className="text-sm text-gray-600">
                                        {task.title}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white rounded-lg shadow-sm border border-gray-200">
                      <p className="text-gray-500">No milestones for this phase</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Weeks Section */}
            {activeView === 'weeks' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Weeks</h2>
                <div className="space-y-4">
                  {phaseWeeks.map(weekNumber => (
                    <div key={weekNumber} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                      {/* Week Header - Clickable to expand/collapse */}
                      <div
                        className="p-4 bg-white cursor-pointer flex justify-between items-center"
                        onClick={() => toggleWeek(weekNumber)}
                      >
                        <h3 className="text-lg font-medium text-gray-800">
                          Week {weekNumber}: {tasksByWeek[weekNumber][0]?.primaryFocus || 'Tasks'}
                        </h3>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedWeeks[weekNumber] ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      {/* Week Content - Shown when expanded */}
                      {expandedWeeks[weekNumber] && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="mb-2">
                            <h4 className="font-medium text-gray-700">Tasks:</h4>
                          </div>
                          <TaskList
                            tasks={tasksByWeek[weekNumber]}
                            title=""
                            emptyMessage="No tasks for this week"
                            itemsPerPage={10}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
