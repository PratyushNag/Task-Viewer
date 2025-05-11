'use client';

import React, { useState } from 'react';
import { Milestone } from '@/types';
import MilestoneItem from './MilestoneItem';
import MilestoneForm from './MilestoneForm';
import { getMilestonesForWeek, getDateRangeForWeek } from '@/utils/dataLoader';

interface WeeklyMilestoneListProps {
  milestones: Milestone[];
  weekNumber: number;
  title?: string;
  emptyMessage?: string;
}

const WeeklyMilestoneList: React.FC<WeeklyMilestoneListProps> = ({
  milestones,
  weekNumber,
  title,
  emptyMessage = 'No milestones found for this week',
}) => {
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const weekMilestones = getMilestonesForWeek(weekNumber, milestones);
  const dateRange = getDateRangeForWeek(weekNumber, [], milestones);

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingMilestone(null);
    setIsFormOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {title || `Week ${weekNumber} Milestones`}
          </h2>
          {dateRange && (
            <p className="text-sm text-gray-500">
              {dateRange.start} to {dateRange.end}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Milestone
        </button>
      </div>

      {weekMilestones.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {weekMilestones.map((milestone) => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              onEdit={() => handleEdit(milestone)}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <MilestoneForm
          milestone={editingMilestone}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default WeeklyMilestoneList;
