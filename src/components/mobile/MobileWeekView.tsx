'use client';

import React from 'react';
import { format } from 'date-fns';
import { Task } from '@/types';
import { isTaskOverdue } from '@/utils/taskUtils';
import TaskItem from '@/components/tasks/TaskItem';

interface MobileWeekViewProps {
  weekDays: Date[];
  tasksByDay: Record<string, Task[]>;
  onEditTask: (task: Task) => void;
}

const MobileWeekView: React.FC<MobileWeekViewProps> = ({
  weekDays,
  tasksByDay,
  onEditTask,
}) => {
  return (
    <div className="space-y-4 md:hidden">
      {weekDays.map((day, index) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayTasks = tasksByDay[dayKey] || [];
        const dayName = format(day, 'EEEE');
        const dayDate = format(day, 'MMM d');

        return (
          <div key={dayKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-space-cadet text-white px-4 py-3">
              <h3 className="font-medium text-sm">
                {dayName}
              </h3>
              <p className="text-xs opacity-90">{dayDate}</p>
            </div>

            <div className="p-3">
              {dayTasks.length > 0 ? (
                <div className="space-y-2">
                  {dayTasks.map((task, taskIndex) => {
                    const isOverdue = isTaskOverdue(task);
                    return (
                      <div
                        key={task.id}
                        className={`rounded-md p-2 ${isOverdue ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}
                      >
                        <TaskItem
                          task={task}
                          index={taskIndex}
                          onEdit={onEditTask}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                  No tasks for this day
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobileWeekView;
