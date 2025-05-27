# Calendar Application - Technical Design Reference

## Overview

This document catalogs all implemented features and technical constraints in the calendar application to guide UI/UX design decisions that align with the existing technical implementation.

## 1. Functional Features Catalog

### 1.1 Task Management Capabilities

#### Core Task Operations

- **Task Creation**: Modal-based form with validation (`TaskForm.tsx`)
  - Required fields: title, due date
  - Optional fields: description, start date, priority, category, week number, phase
  - Auto-calculates phase from week number (phases 1-6)
  - Default values can be pre-populated based on context

- **Task Editing**: In-place editing via same modal form
  - Preserves all existing task properties
  - Updates `updatedAt` timestamp automatically
  - Validation ensures data integrity

- **Task Deletion**: Confirmation dialog before deletion
  - "Are you sure?" confirmation prevents accidental deletion
  - Immediate removal from UI and database

- **Task Completion**: Checkbox toggle functionality
  - Visual strikethrough for completed tasks
  - Maintains completion state across views
  - Updates task styling (grayed out text)

#### Task Properties & Data Structure

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  startDate?: Date | string;
  dueDate: Date | string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  weekNumber?: number;
  category?: string;
  phase?: number;
  primaryFocus?: string;
  // Visual positioning (separate from actual dates)
  visualWeekNumber?: number;
  visualStartDate?: Date | string;
}
```

### 1.2 Calendar View Functionality

#### Multiple View Types

- **Monthly View**: Full month calendar with event distribution
- **Weekly View**: Week-by-week task organization
- **Daily View**: Single day focus
- **Phase View**: Organized by 6 phases with specific week ranges

#### Calendar Navigation

- **Date Navigation**: Previous/Next/Today buttons
- **View Switching**: Month/Week/Day toggle buttons
- **Event Selection**: Click events to view details in alert dialog

#### Event Styling & Colors

- **Priority-based colors**: Different colors for low/medium/high priority
- **Overdue indicators**: Bright red background for overdue tasks
- **Completion status**: Visual distinction for completed tasks

### 1.3 Drag-and-Drop Interactions

#### Current Capabilities

- **Visual Repositioning**: Tasks can be dragged between positions
- **Cross-week Movement**: Tasks can be moved between different weeks
- **Real-time Feedback**: Visual indicators during drag operations
- **Drag Handles**: Dedicated drag handle icons for better UX

#### Technical Implementation

- Uses `react-beautiful-dnd` library with strict mode wrappers
- Separate visual positioning from actual due dates
- `visualWeekNumber` and `visualStartDate` properties for display
- Maintains original due dates while allowing visual organization

#### Drag Behavior Constraints

- **Visual Only**: Drag-and-drop changes visual position, not actual due dates
- **No Date Changes**: Original due dates preserved for overdue calculations
- **Position Memory**: Visual positions persist across sessions

### 1.4 Phase-Based Organization System

#### Phase Structure (Phases 1-6)

- **Phase 1**: Weeks 1-8 (Foundation & Basics)
- **Phase 2**: Weeks 9-16 (Core Syllabus Development)
- **Phase 3**: Weeks 17-25 (Advanced Topics & Integration)
- **Phase 4**: Weeks 26-40 (Comprehensive Coverage)
- **Phase 5**: Weeks 41-54 (Revision & Practice)
- **Phase 6**: Weeks 55-68 (Final Preparation)

#### Phase Navigation

- **Phase Selection**: Grid-based phase selector buttons
- **Auto-calculation**: Phase automatically determined from week number
- **Phase Filtering**: View tasks/milestones filtered by selected phase
- **Week Grouping**: Tasks grouped by weeks within each phase

### 1.5 Overdue Task Handling

#### Visual Indicators

- **Bright Red Borders**: `border-red-500 border-2` for overdue tasks
- **Enhanced Borders**: `border-red-600 border-4` for rollover reminders
- **Text Styling**: Red text color for overdue dates
- **Background Colors**: Red backgrounds in calendar views

#### Rollover Functionality

- **Overdue Reminders**: Virtual task instances appear in future weeks
- **Visual Distinction**: "Overdue Reminder" badges on rollover tasks
- **Original Date Preservation**: Maintains original due dates
- **Cross-week Visibility**: Overdue tasks visible in current and future weeks

#### Utility Functions

```typescript
isTaskOverdue(task: Task): boolean
getTaskBorderClasses(task: Task, defaultBorder?: string): string
getOverdueTextClasses(task: Task, defaultTextColor?: string): string
generateOverdueRolloverTasks(tasks: Task[], currentWeek: number): Task[]
```

## 2. Technical Constraints

### 2.1 Mobile-First Responsive Design

#### Breakpoint Strategy

- **Mobile**: < 640px (primary design target)
- **Tablet**: 641px - 1024px
- **Desktop**: > 1024px
- **Extra Small**: 475px+ (custom `xs` breakpoint)

#### Touch Target Requirements

- **Minimum Size**: 44px × 44px for all interactive elements
- **Button Padding**: 8px × 16px minimum
- **Touch-friendly Spacing**: Adequate spacing between interactive elements

#### Mobile Optimizations

- **Typography Scaling**: Responsive font sizes (h1: 1.5rem on mobile)
- **Navigation Adaptation**: Horizontal scrolling sidebar on mobile
- **Form Elements**: 16px font size to prevent iOS zoom
- **Gesture Support**: Touch-friendly drag and drop

### 2.2 Color Scheme (tailwind.config.js)

#### Primary Color Palette

```javascript
colors: {
  'gunmetal': '#012A36',        // Dark blue-green (headers)
  'space-cadet': '#29274C',     // Dark purple (primary text)
  'royal-purple': '#7E52A0',    // Medium purple (accents)
  'lilac': '#D295BF',          // Light purple (highlights)
  'fairy-tale': '#E6BCCD',     // Pink (background)
}
```

#### Color Usage Patterns

- **Background**: Fairy tale pink (`#E6BCCD`)
- **Headers**: Gunmetal (`#012A36`)
- **Primary Text**: Space cadet (`#29274C`)
- **Interactive Elements**: Royal purple (`#7E52A0`)
- **Highlights**: Lilac (`#D295BF`)
- **Error States**: Red variants for overdue tasks

### 2.3 Component Architecture

#### Context-Based State Management

- **TaskContext**: Centralized task state and operations
- **MilestoneContext**: Milestone management
- **Global Providers**: Wrapped in `AppProvider`

#### Component Hierarchy

```
MainLayout
├── Header (Navigation)
├── Main Content
│   ├── Phase View (/)
│   ├── Week View (/week)
│   └── Calendar View (/calendar)
└── Modal Components (TaskForm, etc.)
```

#### Reusable Components

- **TaskItem**: Standard task display component
- **DraggableTaskItem**: Drag-enabled task component
- **TaskList**: Paginated task list with drag-and-drop
- **TaskForm**: Modal form for task creation/editing

### 2.4 TypeScript Type System

#### Strict Type Definitions

- All components use TypeScript interfaces
- Comprehensive type coverage for props and state
- Type-safe context providers and hooks
- Utility functions with proper type annotations

#### Key Interfaces

- `Task`: Core task data structure
- `Milestone`: Milestone data structure
- `TaskContextType`: Context interface
- `CalendarEvent`: Calendar-specific event type

## 3. User Interaction Patterns

### 3.1 Navigation Patterns

#### Primary Navigation (Header)

- **Route-based**: Next.js App Router with file-based routing
- **Active States**: Visual indication of current page
- **Mobile Menu**: Hamburger menu for mobile devices
- **Responsive**: Collapses to mobile menu on smaller screens

#### View Switching

- **Phase View**: Button-based phase selection
- **Week View**: Sidebar toggle between milestones/weeks
- **Calendar View**: Built-in calendar navigation controls

### 3.2 Form Interactions

#### Task Creation/Editing

- **Modal Interface**: Overlay modal with backdrop blur
- **Form Validation**: Client-side validation with error messages
- **Auto-save**: Immediate persistence on form submission
- **Keyboard Navigation**: Tab order and enter key support

#### Input Behaviors

- **Date Pickers**: Standard HTML date inputs
- **Dropdowns**: Select elements for priority, phase
- **Text Areas**: Multi-line description input
- **Checkboxes**: Task completion toggles

### 3.3 Visual Feedback Systems

#### Loading States

- **Spinner**: Animated loading indicator during data fetch
- **Skeleton Loading**: Placeholder content during load
- **Disabled States**: Visual indication of non-interactive elements

#### Success/Error Feedback

- **Toast Notifications**: Temporary success/error messages
- **Form Validation**: Inline error messages
- **Confirmation Dialogs**: Delete confirmations

#### Hover/Focus States

- **Button Hovers**: Color transitions on hover
- **Focus Outlines**: Accessibility-compliant focus indicators
- **Active States**: Visual feedback for pressed buttons

## 4. Implementation Details for Design

### 4.1 CSS Framework & Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Utilities**: Scrollbar hiding, drag-and-drop styles
- **Responsive Classes**: Mobile-first responsive utilities
- **CSS Variables**: Custom color definitions in globals.css

### 4.2 Accessibility Considerations

- **ARIA Labels**: Screen reader support for interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus order and visibility
- **Color Contrast**: Sufficient contrast ratios for text
- **Touch Targets**: Minimum 44px touch target sizes

### 4.3 Performance Considerations

- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo and useMemo for optimization
- **Efficient Rendering**: Minimal re-renders with proper dependencies
- **Local Storage**: Client-side data persistence

### 4.4 Browser Compatibility

- **Modern Browsers**: ES6+ features with Next.js transpilation
- **Mobile Browsers**: iOS Safari and Android Chrome optimization
- **Progressive Enhancement**: Graceful degradation for older browsers

## 5. Design Guidelines for New Features

### 5.1 Visual Consistency

- Use established color palette from tailwind.config.js
- Maintain 44px minimum touch targets for mobile
- Follow existing spacing patterns (space-y-4, space-y-6, space-y-8)
- Preserve mobile-first responsive design approach

### 5.2 Interaction Patterns

- Modal overlays for complex forms
- Inline editing for simple changes
- Confirmation dialogs for destructive actions
- Toast notifications for feedback

### 5.3 Component Reusability

- Extend existing components rather than creating new ones
- Use established TypeScript interfaces
- Follow existing prop patterns and naming conventions
- Maintain context-based state management approach

This reference document ensures that any new UI/UX designs will be technically feasible within the current architecture while maintaining consistency with established patterns and constraints.
