# Phase 2: Structural Performance Improvements

This document outlines the implementation details for Phase 2 of our performance optimization plan, focusing on structural improvements to the application architecture.

## 1. Implement Advanced Code Splitting

### Implementation Steps:

1. **Create Route-Based Code Splitting**:
   - Ensure all page components use dynamic imports where appropriate
   - Example implementation for the Week view:

   ```tsx
   // src/app/week/page.tsx
   import dynamic from 'next/dynamic';
   import { Suspense } from 'react';
   
   // Loading component
   const WeekViewSkeleton = () => (
     <div className="animate-pulse">
       <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
       <div className="h-64 bg-gray-200 rounded mb-4"></div>
     </div>
   );
   
   // Dynamically import the WeekView component
   const DynamicWeekView = dynamic(
     () => import('@/components/week/WeekView'),
     { loading: () => <WeekViewSkeleton /> }
   );
   
   export default function WeekPage() {
     return (
       <Suspense fallback={<WeekViewSkeleton />}>
         <DynamicWeekView />
       </Suspense>
     );
   }
   ```

2. **Component-Level Code Splitting**:
   - Split large components into smaller, more focused components
   - Use dynamic imports for heavy components like drag-and-drop functionality

3. **Create Shared Component Bundle**:
   - Group commonly used components to be loaded together
   - Example implementation:

   ```tsx
   // src/components/shared/index.ts
   export { default as Button } from './Button';
   export { default as Card } from './Card';
   export { default as Badge } from './Badge';
   // etc.
   ```

## 2. Implement SWR for Data Fetching

### Implementation Steps:

1. **Install SWR**:
   ```bash
   npm install swr
   ```

2. **Create API Hooks**:
   - Create a hooks directory with SWR-based data fetching hooks:

   ```tsx
   // src/hooks/useTasks.ts
   import useSWR from 'swr';
   
   const fetcher = (url: string) => fetch(url).then(res => res.json());
   
   export function useTasks(phase?: number, weekNumber?: number) {
     const queryParams = new URLSearchParams();
     if (phase !== undefined) queryParams.append('phase', phase.toString());
     if (weekNumber !== undefined) queryParams.append('weekNumber', weekNumber.toString());
     
     const queryString = queryParams.toString();
     const url = `/api/tasks${queryString ? `?${queryString}` : ''}`;
     
     const { data, error, mutate } = useSWR(url, fetcher, {
       revalidateOnFocus: false,
       revalidateIfStale: true,
       dedupingInterval: 60000, // 1 minute
     });
     
     return {
       tasks: data || [],
       isLoading: !error && !data,
       isError: error,
       mutate,
     };
   }
   ```

3. **Replace Context with SWR**:
   - Gradually replace context-based data fetching with SWR hooks
   - Example implementation in a component:

   ```tsx
   // In a component
   import { useTasks } from '@/hooks/useTasks';
   
   function TasksComponent({ phase, weekNumber }) {
     const { tasks, isLoading, isError, mutate } = useTasks(phase, weekNumber);
     
     if (isLoading) return <LoadingComponent />;
     if (isError) return <ErrorComponent />;
     
     return (
       <div>
         {tasks.map(task => (
           <TaskItem key={task.id} task={task} onUpdate={() => mutate()} />
         ))}
       </div>
     );
   }
   ```

## 3. Optimize MongoDB Integration

### Implementation Steps:

1. **Create Indexes for Common Queries**:
   - Add indexes to MongoDB collections for frequently queried fields:

   ```typescript
   // src/models/Task.ts
   import mongoose from 'mongoose';
   
   const taskSchema = new mongoose.Schema({
     // Schema definition...
   });
   
   // Add indexes for common query patterns
   taskSchema.index({ id: 1 }, { unique: true });
   taskSchema.index({ phase: 1 });
   taskSchema.index({ weekNumber: 1 });
   taskSchema.index({ dueDate: 1 });
   taskSchema.index({ completed: 1 });
   
   const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
   
   export default Task;
   ```

2. **Implement Query Projection**:
   - Modify API routes to only return needed fields:

   ```typescript
   // In src/app/api/tasks/route.ts
   export async function GET(req: NextRequest) {
     try {
       await connectToDatabase();
       
       // Get query parameters
       const url = new URL(req.url);
       const phase = url.searchParams.get('phase');
       const weekNumber = url.searchParams.get('weekNumber');
       const fields = url.searchParams.get('fields')?.split(',') || [];
       
       // Build query
       const query: any = {};
       if (phase) query.phase = parseInt(phase);
       if (weekNumber) query.weekNumber = parseInt(weekNumber);
       
       // Build projection
       const projection: any = {};
       if (fields.length > 0) {
         fields.forEach(field => {
           projection[field] = 1;
         });
       }
       
       const tasks = await Task.find(query, projection).sort({ weekNumber: 1, startDate: 1 });
       
       return NextResponse.json(tasks, { status: 200 });
     } catch (error) {
       console.error('Error fetching tasks:', error);
       return NextResponse.json(
         { error: 'Failed to fetch tasks' },
         { status: 500 }
       );
     }
   }
   ```

3. **Implement Server-Side Caching**:
   - Add Redis or a simple in-memory cache for database queries:

   ```typescript
   // src/lib/redis.ts
   import { Redis } from '@upstash/redis';
   
   export const redis = new Redis({
     url: process.env.REDIS_URL || '',
     token: process.env.REDIS_TOKEN || '',
   });
   
   // Cache wrapper for database queries
   export async function cachedQuery(key: string, queryFn: () => Promise<any>, ttl = 60) {
     // Try to get from cache first
     const cached = await redis.get(key);
     if (cached) return JSON.parse(cached as string);
     
     // If not in cache, run the query
     const result = await queryFn();
     
     // Store in cache
     await redis.set(key, JSON.stringify(result), { ex: ttl });
     
     return result;
   }
   ```

## 4. Implement Proper Memoization

### Implementation Steps:

1. **Audit and Fix Component Re-renders**:
   - Use React DevTools to identify components that re-render unnecessarily
   - Wrap pure components with React.memo:

   ```tsx
   // src/components/tasks/TaskItem.tsx
   import React from 'react';
   
   const TaskItem = ({ task, onEdit }) => {
     // Component implementation...
   };
   
   // Memoize the component to prevent unnecessary re-renders
   export default React.memo(TaskItem, (prevProps, nextProps) => {
     // Custom comparison function
     return (
       prevProps.task.id === nextProps.task.id &&
       prevProps.task.completed === nextProps.task.completed &&
       prevProps.task.updatedAt === nextProps.task.updatedAt
     );
   });
   ```

2. **Optimize Event Handlers with useCallback**:
   - Wrap event handlers with useCallback to prevent unnecessary re-creation:

   ```tsx
   // In a component
   const handleEdit = useCallback(() => {
     setEditingTask(task);
     setIsFormOpen(true);
   }, [task]);
   
   const handleDelete = useCallback(() => {
     if (window.confirm('Are you sure you want to delete this task?')) {
       deleteTask(task.id);
     }
   }, [task.id, deleteTask]);
   ```

3. **Optimize Computed Values with useMemo**:
   - Use useMemo for expensive computations:

   ```tsx
   // In a component
   const sortedTasks = useMemo(() => {
     return [...tasks].sort((a, b) => {
       // Complex sorting logic
       if (a.priority !== b.priority) {
         const priorityOrder = { high: 0, medium: 1, low: 2 };
         return priorityOrder[a.priority] - priorityOrder[b.priority];
       }
       return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
     });
   }, [tasks]);
   ```

## 5. Optimize Drag and Drop Implementation

### Implementation Steps:

1. **Virtualize Long Lists**:
   - Implement virtualization for long lists of draggable items:

   ```tsx
   // Install react-window
   // npm install react-window
   
   import { FixedSizeList as List } from 'react-window';
   import { DragDropContext, Droppable } from 'react-beautiful-dnd';
   
   const VirtualizedTaskList = ({ tasks }) => {
     // Implementation with react-window and react-beautiful-dnd
   };
   ```

2. **Optimize Draggable Components**:
   - Ensure draggable components are properly memoized
   - Minimize the size and complexity of draggable items

## Expected Outcomes

After implementing these Phase 2 optimizations, we expect:

1. **Faster Data Loading**: Through SWR's caching and revalidation strategy
2. **Reduced Bundle Size**: Through more granular code splitting
3. **Faster Database Queries**: Through proper indexing and caching
4. **Smoother UI Interactions**: Through proper memoization and optimized rendering
5. **Better User Experience**: Through faster loading times and more responsive UI

These structural improvements will provide a solid foundation for the final phase of optimizations focused on build and deployment.
