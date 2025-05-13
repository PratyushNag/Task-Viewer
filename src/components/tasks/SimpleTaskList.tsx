'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

interface SimpleTaskListProps {
  tasks: Task[];
  emptyMessage?: string;
}

const SimpleTaskList: React.FC<SimpleTaskListProps> = ({
  tasks,
  emptyMessage = 'No tasks found',
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

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-space-cadet/70">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
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

      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default SimpleTaskList;
