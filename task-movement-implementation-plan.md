# Task Movement Implementation Plan

This document outlines the plan for implementing task movement functionality in the Calendar View application, allowing users to move tasks between weeks and days.

## Overview

The goal is to enable users to:

1. Move tasks between different days within the same week
2. Move tasks between different weeks
3. Update the database when tasks are moved
  
## Implementation Approach

We'll implement this using a drag-and-drop interface with the following components:

1. **Draggable Task Items**: Make individual task items draggable
2. **Drop Zones**: Create drop zones for days and weeks
3. **Task Movement Logic**: Implement the logic to update task dates and week numbers
4. **Database Updates**: Update the MongoDB database when tasks are moved

## Detailed Implementation Steps

### 1. Add Drag-and-Drop Library

We'll use the `react-beautiful-dnd` library for implementing drag-and-drop functionality:

```bash
npm install react-beautiful-dnd
npm install @types/react-beautiful-dnd --save-dev
```

### 2. Modify Task Components

#### 2.1. Update Task Item Component

Modify the `TaskItem` component to be draggable:

```tsx
// src/components/tasks/TaskItem.tsx
import { Draggable } from 'react-beautiful-dnd';

interface TaskItemProps {
  task: Task;
  index: number; // Position in the list for drag-and-drop
  onEdit?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, index, onEdit }) => {
  // Existing code...

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-item ${snapshot.isDragging ? 'is-dragging' : ''}`}
        >
          {/* Existing task content */}
        </div>
      )}
    </Draggable>
  );
};
```

#### 2.2. Create Task List Container

Create a droppable container for task lists:

```tsx
// src/components/tasks/TaskList.tsx
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

const TaskList: React.FC<TaskListProps> = ({ tasks, title, onTaskMoved }) => {
  // Existing code...

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    onTaskMoved({
      taskId: result.draggableId,
      sourceIndex: result.source.index,
      destinationIndex: result.destination.index,
      sourceDroppableId: result.source.droppableId,
      destinationDroppableId: result.destination.droppableId
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={`task-list-${title}`}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="task-list"
          >
            {tasks.map((task, index) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                index={index} 
                onEdit={onEdit}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
```

### 3. Implement Task Movement Logic

#### 3.1. Update TaskContext

Add a new action and function to handle task movement:

```tsx
// src/context/TaskContext.tsx

// Add new action type
type TaskAction =
  // Existing actions...
  | { type: 'MOVE_TASK'; payload: { taskId: string; newStartDate: string; newDueDate: string; newWeekNumber: number } };

// Add reducer case
case 'MOVE_TASK': {
  const { taskId, newStartDate, newDueDate, newWeekNumber } = action.payload;
  return {
    ...state,
    tasks: state.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            startDate: newStartDate,
            dueDate: newDueDate,
            weekNumber: newWeekNumber,
            updatedAt: new Date().toISOString(),
          }
        : task
    ),
  };
}

// Add context function
const moveTask = async (
  taskId: string,
  newStartDate: string,
  newDueDate: string,
  newWeekNumber: number
) => {
  try {
    const task = state.tasks.find((t) => t.id === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...task,
      startDate: newStartDate,
      dueDate: newDueDate,
      weekNumber: newWeekNumber,
      updatedAt: new Date().toISOString(),
    };
    
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedTask),
    });
    
    if (!response.ok) {
      throw new Error('Failed to move task');
    }
    
    dispatch({
      type: 'MOVE_TASK',
      payload: { taskId, newStartDate, newDueDate, newWeekNumber },
    });
  } catch (error) {
    console.error('Error moving task:', error);
  }
};
```

### 4. Implement Week View Task Movement

Update the Week view to handle task movement between days:

```tsx
// src/app/week/page.tsx

const WeekPage: React.FC = () => {
  // Existing code...
  const { moveTask } = useTaskContext();

  const handleTaskMoved = (moveData) => {
    const { taskId, sourceDroppableId, destinationDroppableId } = moveData;
    
    // Extract day information from droppable IDs
    const sourceDayStr = sourceDroppableId.split('-').pop();
    const destDayStr = destinationDroppableId.split('-').pop();
    
    if (sourceDayStr === destDayStr) return; // No day change
    
    const task = weekTasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Calculate new dates
    const sourceDate = new Date(task.startDate);
    const daysDifference = getDaysDifference(sourceDayStr, destDayStr);
    
    const newStartDate = new Date(sourceDate);
    newStartDate.setDate(newStartDate.getDate() + daysDifference);
    
    const newDueDate = new Date(newStartDate); // Assuming due date is same as start date for daily tasks
    
    moveTask(
      taskId,
      newStartDate.toISOString().split('T')[0],
      newDueDate.toISOString().split('T')[0],
      task.weekNumber // Week number stays the same for moves within a week
    );
  };
  
  // Render with droppable day containers
  // ...
};
```

### 5. Implement Phase View Task Movement

Update the Phase view to handle task movement between weeks:

```tsx
// src/app/page.tsx

const PhasePage: React.FC = () => {
  // Existing code...
  const { moveTask } = useTaskContext();

  const handleTaskMoved = (moveData) => {
    const { taskId, sourceDroppableId, destinationDroppableId } = moveData;
    
    // Extract week information from droppable IDs
    const sourceWeekStr = sourceDroppableId.split('-').pop();
    const destWeekStr = destinationDroppableId.split('-').pop();
    
    if (sourceWeekStr === destWeekStr) return; // No week change
    
    const sourceWeek = parseInt(sourceWeekStr);
    const destWeek = parseInt(destWeekStr);
    const task = tasksByWeek[sourceWeek].find(t => t.id === taskId);
    
    if (!task) return;
    
    // Calculate new dates based on week difference
    const weeksDifference = destWeek - sourceWeek;
    const sourceDate = new Date(task.startDate);
    const sourceDueDate = new Date(task.dueDate);
    
    const newStartDate = new Date(sourceDate);
    newStartDate.setDate(newStartDate.getDate() + (weeksDifference * 7));
    
    const newDueDate = new Date(sourceDueDate);
    newDueDate.setDate(newDueDate.getDate() + (weeksDifference * 7));
    
    moveTask(
      taskId,
      newStartDate.toISOString().split('T')[0],
      newDueDate.toISOString().split('T')[0],
      destWeek
    );
  };
  
  // Render with droppable week containers
  // ...
};
```

### 6. Add Styling for Drag-and-Drop

Add CSS styles for drag-and-drop interactions:

```css
/* src/app/globals.css */

/* Draggable task item */
.task-item {
  transition: background-color 0.2s, box-shadow 0.2s;
}

.task-item.is-dragging {
  background-color: rgba(126, 82, 160, 0.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Droppable container */
.droppable-container {
  min-height: 50px;
  transition: background-color 0.2s;
}

.droppable-container.is-over {
  background-color: rgba(210, 149, 191, 0.2);
}
```

### 7. Add Visual Feedback

Implement visual feedback for drag operations:

1. Highlight the day or week where the task is being dragged over
2. Show a preview of where the task will be placed
3. Add subtle animations for drag start and drop

### 8. Testing

Test the implementation thoroughly:

1. Test moving tasks between days in the Week view
2. Test moving tasks between weeks in the Phase view
3. Verify that the database is updated correctly
4. Test edge cases (e.g., moving tasks across phase boundaries)

## Timeline

1. **Setup (1 day)**
   - Install dependencies
   - Set up basic drag-and-drop structure

2. **Task Item Implementation (1 day)**
   - Make task items draggable
   - Create droppable containers

3. **Movement Logic (2 days)**
   - Implement task movement logic
   - Update database integration

4. **UI Refinement (1 day)**
   - Add visual feedback
   - Polish animations and interactions

5. **Testing and Debugging (1 day)**
   - Test all movement scenarios
   - Fix any issues

## Conclusion

This implementation will provide a smooth, intuitive interface for moving tasks between different days and weeks. The drag-and-drop functionality will make task management more efficient and user-friendly.
