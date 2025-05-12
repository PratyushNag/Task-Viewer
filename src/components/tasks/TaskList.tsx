'use client';

import React, { useState } from 'react';
import { Task } from '@/types';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

interface TaskListProps {
  tasks: Task[];
  title: string;
  emptyMessage?: string;
  itemsPerPage?: number;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  title,
  emptyMessage = 'No tasks found',
  itemsPerPage = 10,
}) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  // Get current tasks for the page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = tasks.slice(indexOfFirstItem, indexOfLastItem);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingTask(null);
    setIsFormOpen(false);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
        <>
          <div className="space-y-4">
            {currentTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                onEdit={() => handleEdit(task)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === 1
                  ? 'bg-lilac/30 text-space-cadet/50 cursor-not-allowed'
                  : 'bg-space-cadet/20 text-space-cadet hover:bg-royal-purple/30'
                  }`}
                aria-label="Previous page"
              >
                &laquo;
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === page
                    ? 'bg-lilac text-white'
                    : 'bg-space-cadet/20 text-space-cadet hover:bg-royal-purple/30'
                    }`}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm font-medium ${currentPage === totalPages
                  ? 'bg-lilac/30 text-space-cadet/50 cursor-not-allowed'
                  : 'bg-space-cadet/20 text-space-cadet hover:bg-royal-purple/30'
                  }`}
                aria-label="Next page"
              >
                &raquo;
              </button>
            </div>
          )}
        </>
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

export default TaskList;
