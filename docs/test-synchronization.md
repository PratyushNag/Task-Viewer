# Task Synchronization Test Plan

## Test Scenario

Test that tasks created in the week view appear correctly in the phase view.

## Manual Test Steps

### Step 1: Test Week View Task Creation

1. Navigate to <http://localhost:3001/week>
2. Select a week (e.g., Week 15 which should be in Phase 2)
3. Click "Add Task" button
4. Fill in task details:
   - Title: "Test Task for Week 15"
   - Description: "Testing synchronization between views"
   - Week Number: 15 (should auto-calculate Phase 2)
   - Category: "Test"
5. Submit the form
6. Verify the task appears in the week view

### Step 2: Test Phase View Display

1. Navigate to <http://localhost:3001/> (phase view)
2. Select Phase 2 (Core Syllabus Development)
3. Switch to "weeks" view
4. Look for Week 15 section
5. Verify the test task appears in Week 15

### Step 3: Test Different Phase

1. Navigate back to week view
2. Select Week 30 (should be in Phase 4)
3. Create another task:
   - Title: "Test Task for Week 30"
   - Week Number: 30 (should auto-calculate Phase 4)
4. Navigate to phase view
5. Select Phase 4 (Comprehensive Coverage)
6. Verify the task appears in Week 30

## Expected Results

- Tasks created in week view should automatically get the correct phase assigned
- Tasks should appear in the corresponding phase view
- Phase field in TaskForm should auto-update when week number changes
- Both views should show the same tasks consistently

## Phase Mapping to Test (CORRECTED)

- Week 1-8: Phase 1 (Foundation & Basics)
- Week 9-16: Phase 2 (Core Syllabus Development)
- Week 17-25: Phase 3 (Advanced Topics & Integration)
- Week 26-40: Phase 4 (Comprehensive Coverage)
- Week 41-54: Phase 5 (Revision & Practice)
- Week 55-68: Phase 6 (Final Preparation)
