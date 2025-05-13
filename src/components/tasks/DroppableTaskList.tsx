'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import { StrictDragDropContext, StrictDroppable, DropResult } from '@/components/dnd/DragDropWrapper';
import { useTaskContext } from '@/context';

interface DroppableTaskListProps {
  tasks: Task[];
  droppableId: string;
  title: string;
  emptyMessage?: string;
  onTaskMoved?: (result: DropResult) => void;
}

const DroppableTaskList: React.FC<DroppableTaskListProps> = ({
  tasks,
  droppableId,
  title,
  emptyMessage = 'No tasks found',
  onTaskMoved,
}) => {
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
    if (!result.destination) return;

    if (onTaskMoved) {
      onTaskMoved(result);
    }
  };

  return (
    <div className="rounded-lg shadow p-6" style={{ backgroundColor: '#C2AFF0' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-space-cadet">{title}</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-purple"
          style={{ backgroundColor: '#7E52A0' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#29274C' }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#7E52A0' }}
        >
          Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-space-cadet/70">{emptyMessage}</p>
        </div>
      ) : (
        <StrictDragDropContext onDragEnd={handleDragEnd}>
          <StrictDroppable droppableId={droppableId} isDropDisabled={false}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-4 min-h-[100px] ${snapshot.isDraggingOver ? 'bg-royal-purple/10 rounded-lg p-2' : ''
                  }`}
              >
                {tasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    onEdit={() => handleEdit(task)}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </StrictDroppable>
        </StrictDragDropContext>
      )}

      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default DroppableTaskList;
