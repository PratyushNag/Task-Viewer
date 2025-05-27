'use client';

import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { useTaskContext } from '@/context';
import { formatDate, getCurrentDate } from '@/utils/dateUtils';
import { getPhaseForWeek, getPhaseName } from '@/utils/phaseUtils';

interface TaskFormProps {
  task?: Task | null;
  onClose: () => void;
  defaultDate?: string;
  defaultWeekNumber?: number;
  defaultPhase?: number;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose, defaultDate, defaultWeekNumber, defaultPhase }) => {
  const { addTask, updateTask } = useTaskContext();

  // Calculate phase from week number if not provided
  const calculatedPhase = defaultPhase ?? (defaultWeekNumber ? getPhaseForWeek(defaultWeekNumber) : 1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: defaultDate || formatDate(getCurrentDate()),
    dueDate: defaultDate || formatDate(getCurrentDate()),
    priority: 'medium',
    weekNumber: defaultWeekNumber || 1,
    category: '',
    phase: calculatedPhase,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      const taskPhase = task.phase ?? (task.weekNumber ? getPhaseForWeek(task.weekNumber) : calculatedPhase);
      setFormData({
        title: task.title,
        description: task.description || '',
        startDate: task.startDate ? formatDate(task.startDate) : formatDate(getCurrentDate()),
        dueDate: formatDate(task.dueDate),
        priority: task.priority,
        weekNumber: task.weekNumber || defaultWeekNumber || 1,
        category: task.category || '',
        phase: taskPhase,
      });
    }
  }, [task, defaultWeekNumber, calculatedPhase]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Auto-update phase when week number changes
      if (name === 'weekNumber') {
        const weekNum = parseInt(value);
        if (!isNaN(weekNum)) {
          newData.phase = getPhaseForWeek(weekNum);
        }
      }

      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (task) {
      updateTask({
        ...task,
        title: formData.title,
        description: formData.description || undefined,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        priority: formData.priority as 'low' | 'medium' | 'high',
        weekNumber: formData.weekNumber,
        category: formData.category || undefined,
        phase: formData.phase,
      });
    } else {
      addTask({
        title: formData.title,
        description: formData.description || undefined,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        completed: false,
        priority: formData.priority as 'low' | 'medium' | 'high',
        weekNumber: formData.weekNumber,
        category: formData.category || undefined,
        phase: formData.phase,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-space-cadet bg-opacity-60 flex items-center justify-center z-50">
      <div className="rounded-lg p-4 w-full max-w-md" style={{ backgroundColor: '#F8D8E3', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">
            {task ? 'Edit Task' : `Add New Task${defaultWeekNumber ? ` for Week ${defaultWeekNumber}` : ''}`}
          </h2>
          <button
            onClick={onClose}
            className="text-black/70 hover:text-black"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-black mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-0 px-3 py-2 shadow-md focus:border-royal-purple focus:ring-royal-purple text-sm bg-royal-purple text-black ${errors.title ? 'border-red-300' : ''
                }`}
              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>
          <div className="mb-3">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-black mb-1"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-0 px-3 py-2 shadow-md focus:border-royal-purple focus:ring-royal-purple text-sm bg-royal-purple text-black"
              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="startDate"
              className="block text-sm font-semibold text-black mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-0 px-3 py-2 shadow-md focus:border-royal-purple focus:ring-royal-purple text-sm bg-royal-purple text-black`}
              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="dueDate"
              className="block text-sm font-semibold text-black mb-1"
            >
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-lg border-0 px-3 py-2 shadow-md focus:border-royal-purple focus:ring-royal-purple text-sm bg-royal-purple text-black ${errors.dueDate ? 'border-red-300' : ''
                }`}
              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
            )}
          </div>
          <div className="mb-3">
            <label
              htmlFor="priority"
              className="block text-sm font-semibold text-black mb-1"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-0 px-3 py-2 shadow-md focus:border-royal-purple focus:ring-royal-purple text-sm bg-royal-purple text-black"
              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mb-3">
            <label
              htmlFor="weekNumber"
              className="block text-sm font-semibold text-black mb-1"
            >
              Week Number
            </label>
            <input
              type="number"
              id="weekNumber"
              name="weekNumber"
              value={formData.weekNumber}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full rounded-lg border-0 px-3 py-2 shadow-md focus:border-royal-purple focus:ring-royal-purple text-sm bg-royal-purple text-black"
              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="category"
              className="block text-sm font-semibold text-black mb-1"
            >
              Category (optional)
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-0 px-3 py-2 shadow-md focus:border-royal-purple focus:ring-royal-purple text-sm bg-royal-purple text-black"
              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
            />
          </div>

          <div className="mb-3">
            <label
              htmlFor="phase"
              className="block text-sm font-semibold text-black mb-1"
            >
              Phase
            </label>
            <select
              id="phase"
              name="phase"
              value={formData.phase}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-0 px-3 py-2 shadow-md focus:border-royal-purple focus:ring-royal-purple text-sm bg-royal-purple text-black"
              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
            >
              <option value={1}>{getPhaseName(1)}</option>
              <option value={2}>{getPhaseName(2)}</option>
              <option value={3}>{getPhaseName(3)}</option>
              <option value={4}>{getPhaseName(4)}</option>
              <option value={5}>{getPhaseName(5)}</option>
              <option value={6}>{getPhaseName(6)}</option>
            </select>
            <p className="mt-1 text-xs text-black/70">
              Auto-updated based on week number
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center py-2 px-4 border-0 shadow-md text-sm font-medium rounded-lg text-black bg-royal-purple hover:bg-space-cadet focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-purple transition-colors duration-200"
              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border-0 shadow-md text-sm font-medium rounded-lg text-white bg-royal-purple hover:bg-space-cadet focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-purple transition-colors duration-200"
              style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', backgroundColor: '#7E52A0' }}
            >
              {task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
