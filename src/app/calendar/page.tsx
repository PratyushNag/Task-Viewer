'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { useTaskContext, useMilestoneContext } from '@/context';
import { Task, Milestone } from '@/types';
import { getWeekStartDate, getCurrentDate } from '@/utils/dateUtils';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

// Define the event type for the calendar
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Task | Milestone;
  type: 'task' | 'milestone';
}

export default function CalendarPage() {
  const { state: { tasks, loading: tasksLoading } } = useTaskContext();
  const { state: { milestones, loading: milestonesLoading } } = useMilestoneContext();
  const [view, setView] = useState<string>(Views.MONTH);
  const [date, setDate] = useState<Date>(getCurrentDate());

  // Convert tasks and milestones to calendar events
  const events = useMemo(() => {
    const taskEvents: CalendarEvent[] = tasks.map((task) => {
      // For tasks, use the startDate to distribute them across different days
      let displayDate;

      if (task.startDate) {
        // Use startDate if available
        const dateStr = typeof task.startDate === 'string' ? task.startDate : task.startDate.toString();
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
        displayDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date
      } else if (task.weekNumber) {
        // If no startDate but has weekNumber, use a day offset based on category
        // This distributes tasks within the same week across different days
        const weekStartDate = getWeekStartDate(task.weekNumber);

        // Add day offset based on category to distribute tasks
        let dayOffset = 0;
        if (task.category) {
          switch (task.category) {
            case 'GS Subject 1':
              dayOffset = 1; // Monday
              break;
            case 'GS Subject 2 / Optional':
              dayOffset = 2; // Tuesday
              break;
            case 'CSAT':
              dayOffset = 3; // Wednesday
              break;
            case 'Current Affairs':
              dayOffset = 5; // Friday
              break;
            case 'Weekly Test':
              dayOffset = 6; // Saturday
              break;
            default:
              dayOffset = 4; // Thursday for any other category
          }
        }

        displayDate = new Date(weekStartDate);
        displayDate.setDate(weekStartDate.getDate() + dayOffset);
      } else {
        // Fall back to dueDate if neither startDate nor weekNumber is available
        const dateStr = typeof task.dueDate === 'string' ? task.dueDate : task.dueDate.toString();
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
        displayDate = new Date(year, month - 1, day);
      }

      return {
        id: task.id,
        title: task.title,
        start: displayDate,
        end: displayDate,
        allDay: true,
        resource: task,
        type: 'task',
      };
    });

    const milestoneEvents: CalendarEvent[] = milestones.map((milestone) => {
      // For milestones, use the week-based approach to ensure proper display
      // This places milestones at the beginning of their respective weeks
      let displayDate;

      if (milestone.weekNumber) {
        // Use the week number to determine the display date
        displayDate = getWeekStartDate(milestone.weekNumber);
      } else if (milestone.startDate) {
        // If no week number but has startDate, use that
        const dateStr = typeof milestone.startDate === 'string' ? milestone.startDate : milestone.startDate.toString();
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
        displayDate = new Date(year, month - 1, day);
      } else {
        // Fall back to dueDate if neither weekNumber nor startDate is available
        const dateStr = typeof milestone.dueDate === 'string' ? milestone.dueDate : milestone.dueDate.toString();
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
        displayDate = new Date(year, month - 1, day);
      }

      return {
        id: milestone.id,
        title: milestone.title,
        start: displayDate,
        end: displayDate,
        allDay: true,
        resource: milestone,
        type: 'milestone',
      };
    });

    return [...taskEvents, ...milestoneEvents];
  }, [tasks, milestones]);

  // Custom event styling
  const eventStyleGetter = (event: CalendarEvent) => {
    let style: React.CSSProperties = {
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0',
      display: 'block',
    };

    if (event.type === 'task') {
      const task = event.resource as Task;
      if (task.completed) {
        style.backgroundColor = '#9CA3AF'; // Gray for completed tasks
      } else {
        // Color based on priority
        switch (task.priority) {
          case 'high':
            style.backgroundColor = '#EF4444'; // Red for high priority
            break;
          case 'medium':
            style.backgroundColor = '#F59E0B'; // Yellow for medium priority
            break;
          case 'low':
            style.backgroundColor = '#3B82F6'; // Blue for low priority
            break;
          default:
            style.backgroundColor = '#3B82F6';
        }
      }
    } else {
      // Milestone styling
      const milestone = event.resource as Milestone;
      if (milestone.completed) {
        style.backgroundColor = '#9CA3AF'; // Gray for completed milestones
      } else {
        style.backgroundColor = '#7E52A0'; // Royal Purple for milestones
        style.borderLeft = '4px solid #29274C'; // Space Cadet border
      }
    }

    return { style };
  };

  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.type === 'task') {
      const task = event.resource as Task;
      const startDate = task.startDate ? moment(task.startDate).format('MMMM D, YYYY') : 'Not set';
      const dueDate = moment(task.dueDate).format('MMMM D, YYYY');

      alert(`Task: ${event.title}\nStart Date: ${startDate}\nDue Date: ${dueDate}\nCategory: ${task.category || 'None'}\nStatus: ${task.completed ? 'Completed' : 'Pending'}`);
    } else {
      const milestone = event.resource as Milestone;
      const startDate = milestone.startDate ? moment(milestone.startDate).format('MMMM D, YYYY') : 'Not set';
      const dueDate = moment(milestone.dueDate).format('MMMM D, YYYY');

      alert(`Milestone: ${event.title}\nStart Date: ${startDate}\nDue Date: ${dueDate}\nStatus: ${milestone.completed ? 'Completed' : 'Pending'}`);
    }
  };

  if (tasksLoading || milestonesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-2">View all your tasks and milestones</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setView(Views.MONTH)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${view === Views.MONTH
              ? 'bg-lilac text-white'
              : 'text-gray-700 hover:bg-space-cadet hover:text-white'
              }`}
          >
            Month
          </button>
          <button
            onClick={() => setView(Views.WEEK)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${view === Views.WEEK
              ? 'bg-lilac text-white'
              : 'text-gray-700 hover:bg-space-cadet hover:text-white'
              }`}
          >
            Week
          </button>
          <button
            onClick={() => setView(Views.DAY)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${view === Views.DAY
              ? 'bg-lilac text-white'
              : 'text-gray-700 hover:bg-space-cadet hover:text-white'
              }`}
          >
            Day
          </button>
        </div>

        <div className="h-[600px] max-w-full overflow-x-auto">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            view={view as any}
            onView={(newView) => setView(newView)}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            popup
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            components={{
              toolbar: (props) => (
                <div className="rbc-toolbar">
                  <span className="rbc-btn-group">
                    <button type="button" onClick={() => props.onNavigate('PREV')}>
                      &lt;
                    </button>
                    <button type="button" onClick={() => props.onNavigate('TODAY')}>
                      Today
                    </button>
                    <button type="button" onClick={() => props.onNavigate('NEXT')}>
                      &gt;
                    </button>
                  </span>
                  <span className="rbc-toolbar-label">{props.label}</span>
                </div>
              ),
            }}
          />
        </div>
      </div>
    </div>
  );
}
