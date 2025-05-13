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
      0: 'Foundation & CSAT Mastery',
      1: 'Core Syllabus Coverage (Integrated GS & Optional Part 1)',
      2: 'Mains Syllabus Completion & Consolidation',
      3: 'Prelims Intensive (Revision & Mocks)',
      4: 'Mains Exclusive (Answer Writing & Test Series)'
    };
    return phaseNames[phase] || `Phase ${phase}`;
  };

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
        <h1 className="text-3xl font-bold text-gunmetal">Phase View</h1>
      </div>

      {/* Phase Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-space-cadet mb-4">Phases</h2>
        <div className="flex flex-wrap gap-4">
          {phases.map(phase => (
            <button
              key={phase}
              onClick={() => setSelectedPhase(phase)}
              className={`px-6 py-4 rounded-lg text-center min-w-[280px] transition-colors shadow-sm text-white`}
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
              <div className="font-medium">Phase {phase}:</div>
              <div className="font-semibold text-sm">{getPhaseName(phase)}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedPhase !== null && (
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
            {/* Milestones Section */}
            {activeView === 'milestones' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-space-cadet mb-4">Milestones</h2>
                <div className="space-y-4">
                  {phaseMilestones.length > 0 ? (
                    <div className="rounded-lg shadow-sm border border-space-cadet/30 p-6" style={{ backgroundColor: '#C2AFF0' }}>
                      {phaseMilestones.map(milestone => (
                        <div key={milestone.id} className="mb-6 last:mb-0">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#29274C' }}></div>
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-space-cadet">
                                {milestone.title}
                              </h3>
                              {milestone.description && (
                                <p className="text-gray-700 mt-1">{milestone.description}</p>
                              )}

                              {tasksByWeek[milestone.weekNumber || 0]?.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-royal-purple mb-2">Tasks:</p>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {tasksByWeek[milestone.weekNumber || 0]?.map(task => (
                                      <li key={task.id} className="text-sm text-gray-700">
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
