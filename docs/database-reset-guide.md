# Database Reset and Reload Guide

## Overview

The `reset-and-reload-data.js` script provides a safe and comprehensive way to completely reset your MongoDB database and replace all data with fresh content from your JSON files.

## Features

- ✅ **Complete Database Reset**: Removes all existing tasks and milestones
- ✅ **Fresh Data Import**: Loads new data from updated JSON files
- ✅ **Safety Features**: Multiple confirmation prompts and dry-run mode
- ✅ **Backup Support**: Optional backup creation before deletion
- ✅ **Data Validation**: Validates JSON structure and required fields
- ✅ **Progress Tracking**: Detailed logging with colored output
- ✅ **Statistics Display**: Shows before/after database statistics
- ✅ **Error Handling**: Comprehensive error handling and rollback

## Prerequisites

1. **Node.js**: Version 18.0.0 or higher
2. **MongoDB Connection**: Valid MongoDB URI in environment variables
3. **JSON Files**: Updated `study_plan_tasks.json` and `study_plan_milestones.json` in root directory
4. **Dependencies**: All npm packages installed (`npm install`)

## Usage

### Interactive Mode (Recommended)
```bash
npm run reset-data
```
- Shows current database state
- Displays new data to be inserted
- Asks for confirmation before proceeding
- Provides detailed progress updates

### Dry Run Mode (Preview Changes)
```bash
npm run reset-data:dry-run
```
- Shows what would be done without making changes
- Perfect for testing and verification
- No database modifications

### Force Mode (Skip Confirmations)
```bash
npm run reset-data:force
```
- Skips all confirmation prompts
- Useful for automated deployments
- ⚠️ **Use with caution** - no safety prompts

### Backup Mode (Create Backup)
```bash
npm run reset-data:backup
```
- Creates timestamped backup before deletion
- Backup files saved to `backups/` directory
- Includes both tasks and milestones

### Help
```bash
node scripts/reset-and-reload-data.js --help
```

## Data Sources

The script reads data from these files in your project root:

- **`study_plan_tasks.json`**: Contains all task data
- **`study_plan_milestones.json`**: Contains all milestone data

### Required JSON Structure

#### Tasks
```json
[
  {
    "id": "unique-task-id",
    "title": "Task Title",
    "description": "Task description",
    "dueDate": "2025-05-12",
    "startDate": "2025-05-12",
    "completed": false,
    "priority": "high",
    "weekNumber": 1,
    "phase": 1,
    "category": "Category Name",
    "primaryFocus": "Focus Area",
    "createdAt": "2025-05-11T13:03:25.880692+00:00",
    "updatedAt": "2025-05-11T13:03:25.880692+00:00"
  }
]
```

#### Milestones
```json
[
  {
    "id": "unique-milestone-id",
    "title": "Milestone Title",
    "description": "Milestone description",
    "dueDate": "2025-05-18",
    "startDate": "2025-05-12",
    "completed": false,
    "weekNumber": 1,
    "phase": 1,
    "color": "#color-code",
    "createdAt": "2025-05-11T13:03:25.880692+00:00",
    "updatedAt": "2025-05-11T13:03:25.880692+00:00"
  }
]
```

### Required Fields

**Tasks**: `id`, `title`, `dueDate`
**Milestones**: `id`, `title`, `dueDate`

## Output Examples

### Successful Execution
```
🔄 Database Reset and Reload Script
==================================================

ℹ️  Connecting to MongoDB...
✅ Connected to MongoDB
ℹ️  Getting current database state...

📊 Current Database State
Tasks: 1,234
Milestones: 68

Task distribution by phase:
  Phase 1: 456
  Phase 2: 389
  Phase 3: 389

ℹ️  Loading new data from JSON files...
ℹ️  Loaded 1,456 tasks and 72 milestones from JSON files

📈 New Data to be Inserted
Tasks: 1,456
Milestones: 72

⚠️  WARNING: This will permanently delete ALL existing data!
Current data will be lost:
  • 1,234 tasks
  • 68 milestones

Do you want to continue? (y/N): y

ℹ️  Clearing existing data...
✅ Deleted 1,234 tasks and 68 milestones
ℹ️  Inserting new data...
✅ Inserted 1,456 tasks and 72 milestones

✅ Final Database State
Tasks: 1,456
Milestones: 72

🎉 Migration completed successfully!
==================================================
```

### Dry Run Output
```
🔍 DRY RUN MODE - No changes will be made

Operations that would be performed:
  1. Delete 1,234 existing tasks
  2. Delete 68 existing milestones
  3. Insert 1,456 new tasks
  4. Insert 72 new milestones

To execute these changes, run without --dry-run flag
```

## Safety Features

### 1. Confirmation Prompts
- Interactive confirmation before deletion
- Clear warning about data loss
- Option to cancel at any time

### 2. Dry Run Mode
- Preview all operations without changes
- Validate data before execution
- Test script functionality

### 3. Backup Creation
- Timestamped backup files
- Separate files for tasks and milestones
- Stored in `backups/` directory

### 4. Data Validation
- JSON structure validation
- Required field checking
- Error reporting with specific details

### 5. Error Handling
- Database connection errors
- File reading/parsing errors
- MongoDB operation failures
- Graceful cleanup on errors

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
❌ Migration failed: MongoNetworkError: failed to connect to server
```
**Solution**: Check your MongoDB URI in `.env` file

#### 2. JSON File Not Found
```
❌ Migration failed: Tasks file not found: /path/to/study_plan_tasks.json
```
**Solution**: Ensure JSON files exist in project root directory

#### 3. Invalid JSON Structure
```
❌ Migration failed: Tasks data must be an array
```
**Solution**: Verify JSON files contain valid array structure

#### 4. Missing Required Fields
```
❌ Migration failed: Task at index 5 is missing required fields (id, title, dueDate)
```
**Solution**: Check all tasks/milestones have required fields

### Recovery

If something goes wrong:

1. **Check Backup Files**: Look in `backups/` directory for recent backups
2. **Restore from Backup**: Use your existing migration script to restore from backup
3. **Verify JSON Files**: Ensure your JSON files are valid and complete
4. **Check Logs**: Review error messages for specific issues

## File Locations

- **Script**: `scripts/reset-and-reload-data.js`
- **Data Sources**: `study_plan_tasks.json`, `study_plan_milestones.json` (root)
- **Backups**: `backups/` directory (auto-created)
- **Documentation**: `docs/database-reset-guide.md`

## Environment Variables

The script uses these environment variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

If not set, it falls back to the hardcoded URI in the script.
