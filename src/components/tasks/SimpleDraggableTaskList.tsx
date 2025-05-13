'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import { StrictDragDropContext, StrictDroppable, DropResult } from '@/components/dnd/DragDropWrapper';
import { useTaskContext } from '@/context';
import { getWeekStartDate } from '@/utils/dateUtils';
import { addDays, format } from 'date-fns';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

interface SimpleDraggableTaskListProps {
  phaseWeeks: number[];
  tasksByWeek: Record<number, Task[]>;
  expandedWeeks: Record<string, boolean>;
  toggleWeek: (weekNumber: number) => void;
}

const SimpleDraggableTaskList: React.FC<SimpleDraggableTaskListProps> = ({
  phaseWeeks,
  tasksByWeek,
  expandedWeeks,
  toggleWeek,
}) => {
  const { moveTask } = useTaskContext();
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
    
    // If there's no destination or the drag was cancelled, return early
    if (!result.destination) {
      console.log('No destination, drag cancelled');
      return;
    }

    const { draggableId, source, destination } = result;

    // Extract week numbers from droppable IDs
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

    // Calculate new start and due dates based on the destination week
    const destWeekStart = getWeekStartDate(destWeekNumber);
    
    // Determine how many days to add to the week start date
    // For simplicity, we'll keep the same day of the week
    const taskDate = new Date(task.startDate);
    const dayOfWeek = taskDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate new start date (same day of week in the new week)
    const newStartDate = addDays(destWeekStart, dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Adjust for Sunday
    
    // Calculate new due date (maintain the same duration)
    const taskDuration = Math.max(
      1,
      Math.round((new Date(task.dueDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24))
    );
    const newDueDate = addDays(newStartDate, taskDuration);

    // Format dates as strings
    const formattedStartDate = format(newStartDate, 'yyyy-MM-dd');
    const formattedDueDate = format(newDueDate, 'yyyy-MM-dd');

    console.log('Moving task:', {
      taskId: task.id,
      from: sourceWeekNumber,
      to: destWeekNumber,
      newStartDate: formattedStartDate,
      newDueDate: formattedDueDate
    });

    // Call the moveTask function from context
    moveTask(task.id, formattedStartDate, formattedDueDate, destWeekNumber);
  };

  return (
    <>
      <StrictDragDropContext onDragEnd={handleDragEnd}>
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
                              <TaskItem
                                key={task.id}
                                task={task}
                                index={index}
                                onEdit={() => handleEdit(task)}
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
      </StrictDragDropContext>
      
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
        />
      )}
    </>
  );
};

export default SimpleDraggableTaskList;
