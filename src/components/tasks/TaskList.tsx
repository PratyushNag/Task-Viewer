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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {currentTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
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
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
