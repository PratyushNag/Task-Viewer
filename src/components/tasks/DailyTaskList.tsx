'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { format } from 'date-fns';

interface DailyTaskListProps {
  date: Date;
  tasks: Task[];
  onTaskMoved?: (result: DropResult, day: Date) => void;
}

const DailyTaskList: React.FC<DailyTaskListProps> = ({
  date,
  tasks,
  onTaskMoved,
}) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const dayName = format(date, 'EEEE');
  const dayDate = format(date, 'MMM d');
  const droppableId = `day-${format(date, 'yyyy-MM-dd')}`;

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingTask(null);
    setIsFormOpen(false);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    if (onTaskMoved) {
      onTaskMoved(result, date);
    }
  };

  return (
    <div className="border border-space-cadet/20 rounded-lg overflow-hidden">
      <div className="bg-space-cadet text-white p-3">
        <h3 className="font-medium">{dayName}</h3>
        <p className="text-sm text-white/80">{dayDate}</p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={droppableId} isDropDisabled={false} isCombineEnabled={false}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-3 min-h-[150px] ${snapshot.isDraggingOver ? 'bg-royal-purple/10' : ''
                }`}
            >
              {tasks.length === 0 ? (
                <p className="text-center text-space-cadet/50 py-4 text-sm">
                  No tasks for this day
                </p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task, index) => (
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
        </Droppable>
      </DragDropContext>

      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
          defaultDate={date.toISOString().split('T')[0]}
        />
      )}
    </div>
  );
};

export default DailyTaskList;
