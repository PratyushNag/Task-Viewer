'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { StrictDroppable, DropResult } from '@/components/dnd/DragDropWrapper';
import { useTaskContext } from '@/context';
import { getWeekStartDate } from '@/utils/dateUtils';
import { addDays, format } from 'date-fns';
import TaskForm from './TaskForm';
import DragDropProvider from '@/components/dnd/DragDropProvider';
import DraggableTaskItemWithHandle from './DraggableTaskItemWithHandle';

interface DroppableWeekListProps {
  phaseWeeks: number[];
  tasksByWeek: Record<number, Task[]>;
  expandedWeeks: Record<string, boolean>;
  toggleWeek: (weekNumber: number) => void;
}

const DroppableWeekList: React.FC<DroppableWeekListProps> = ({
  phaseWeeks,
  tasksByWeek,
  expandedWeeks,
  toggleWeek,
}) => {
  const { moveTaskVisually } = useTaskContext();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingTask(null);
    setIsFormOpen(false);
  };

  const handleDragEnd = (result: DropResult) => {
    console.log('Drag end result:', result);
    console.log('Drag end result JSON:', JSON.stringify(result, null, 2));

    // If there's no destination or the drag was cancelled, return early
    if (!result.destination) {
      console.log('No destination, drag cancelled');
      return;
    }

    // Log the source and destination
    console.log('Source:', result.source);
    console.log('Destination:', result.destination);

    const { draggableId, source, destination } = result;

    // Extract week numbers from droppable IDs
    // Format is "week-X" where X is the week number
    const sourceWeekMatch = source.droppableId.match(/week-(\d+)/);
    const destWeekMatch = destination.droppableId.match(/week-(\d+)/);

    if (!sourceWeekMatch || !destWeekMatch) {
      console.error('Could not extract week numbers from droppable IDs:', source.droppableId, destination.droppableId);
      return;
    }

    const sourceWeekNumber = parseInt(sourceWeekMatch[1], 10);
    const destWeekNumber = parseInt(destWeekMatch[1], 10);

    console.log(`Moving from week ${sourceWeekNumber} to week ${destWeekNumber}`);

    // If the task was dropped in the same week, do nothing for now
    if (sourceWeekNumber === destWeekNumber) {
      console.log('Task dropped in the same week, no action needed');
      return;
    }

    // Find the task that was moved
    const task = tasksByWeek[sourceWeekNumber]?.find(t => t.id === draggableId);
    if (!task) {
      console.error('Task not found:', draggableId);
      return;
    }

    // Calculate visual start date for the destination week (for display purposes only)
    const destWeekStart = getWeekStartDate(destWeekNumber);

    // Determine the day offset based on task category or keep same day of week
    let dayOffset = 0;
    if (task.category) {
      // Use category-based positioning
      switch (task.category) {
        case 'GS Subject 1':
          dayOffset = 0; // Monday
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
    } else if (task.startDate) {
      // Keep the same day of the week if no category
      const taskDate = new Date(task.startDate);
      const dayOfWeek = taskDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      dayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Sunday
    }

    // Calculate visual start date (for display positioning only)
    const visualStartDate = addDays(destWeekStart, dayOffset);
    const formattedVisualStartDate = format(visualStartDate, 'yyyy-MM-dd');

    console.log('Moving task visually:', {
      taskId: task.id,
      from: sourceWeekNumber,
      to: destWeekNumber,
      visualStartDate: formattedVisualStartDate,
      originalDueDate: task.dueDate, // This remains unchanged
    });

    // Call the visual movement function (preserves original due dates)
    moveTaskVisually(task.id, destWeekNumber, formattedVisualStartDate);
  };

  return (
    <>
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          {phaseWeeks.map(weekNumber => (
            <div key={weekNumber} className="rounded-lg shadow-md overflow-hidden border border-space-cadet/30" style={{ backgroundColor: '#C2AFF0' }}>
              {/* Week Header - Clickable to expand/collapse */}
              <div
                className="p-4 cursor-pointer flex justify-between items-center"
                style={{ backgroundColor: '#C2AFF0' }}
                onClick={() => toggleWeek(weekNumber)}
              >
                <h3 className="text-lg font-medium text-space-cadet">
                  Week {weekNumber}: {tasksByWeek[weekNumber][0]?.primaryFocus || 'Tasks'}
                </h3>
                <svg
                  className={`w-5 h-5 text-royal-purple transform transition-transform ${expandedWeeks[weekNumber] ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Week Content - Shown when expanded */}
              {expandedWeeks[weekNumber] && (
                <div className="p-4 border-t border-space-cadet/30" style={{ backgroundColor: '#C2AFF0' }}>
                  <div className="mb-2">
                    <h4 className="font-medium text-royal-purple">Tasks:</h4>
                  </div>
                  <StrictDroppable droppableId={`week-${weekNumber}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`${snapshot.isDraggingOver ? 'bg-royal-purple/10 rounded-lg p-2' : ''}`}
                      >
                        {tasksByWeek[weekNumber].length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-space-cadet/70">No tasks for this week</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {tasksByWeek[weekNumber].map((task, index) => (
                              <DraggableTaskItemWithHandle
                                key={task.id}
                                task={task}
                                index={index}
                                onEdit={handleEdit}
                              />
                            ))}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </StrictDroppable>
                </div>
              )}
            </div>
          ))}
        </div>
      </DragDropProvider>

      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
        />
      )}
    </>
  );
};

export default DroppableWeekList;
