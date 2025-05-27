# Database Migration System

## Quick Start

### 1. Test Everything First
```bash
npm run test-migration
```
This will verify all components are working correctly.

### 2. Preview Changes (Dry Run)
```bash
npm run reset-data:dry-run
```
See what would happen without making any changes.

### 3. Execute Migration
```bash
npm run reset-data
```
Interactive mode with confirmations and safety prompts.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run test-migration` | Run comprehensive tests |
| `npm run reset-data:dry-run` | Preview changes without executing |
| `npm run reset-data` | Interactive migration with confirmations |
| `npm run reset-data:force` | Skip confirmations (use with caution) |
| `npm run reset-data:backup` | Create backup before migration |

## What It Does

1. **Connects** to your MongoDB database
2. **Shows** current database statistics
3. **Validates** your JSON files
4. **Warns** about data loss with confirmation prompts
5. **Optionally creates** backup files
6. **Deletes** all existing tasks and milestones
7. **Inserts** new data from JSON files
8. **Verifies** the final state

## Safety Features

- ✅ **Dry run mode** - Preview without changes
- ✅ **Interactive confirmations** - Multiple safety prompts
- ✅ **Backup creation** - Timestamped backup files
- ✅ **Data validation** - Checks JSON structure and required fields
- ✅ **Error handling** - Graceful failure with detailed error messages
- ✅ **Progress tracking** - Colored output with clear status updates

## Files Required

- `study_plan_tasks.json` (in project root)
- `study_plan_milestones.json` (in project root)
- Valid MongoDB connection (MONGODB_URI environment variable)

## Example Output

```
🔄 Database Reset and Reload Script
==================================================

ℹ️  Connecting to MongoDB...
✅ Connected to MongoDB

📊 Current Database State
Tasks: 1,234
Milestones: 68

📈 New Data to be Inserted
Tasks: 1,456
Milestones: 72

⚠️  WARNING: This will permanently delete ALL existing data!
Do you want to continue? (y/N): y

✅ Deleted 1,234 tasks and 68 milestones
✅ Inserted 1,456 tasks and 72 milestones

🎉 Migration completed successfully!
```

## Troubleshooting

If you encounter issues:

1. **Run tests first**: `npm run test-migration`
2. **Check JSON files**: Ensure they exist and are valid
3. **Verify MongoDB connection**: Check your MONGODB_URI
4. **Use dry run**: Test with `npm run reset-data:dry-run`
5. **Check documentation**: See `docs/database-reset-guide.md`

## Documentation

For detailed documentation, see:
- `docs/database-reset-guide.md` - Complete guide with examples
- `scripts/reset-and-reload-data.js` - Main migration script
- `scripts/test-migration.js` - Test suite

## Emergency Recovery

If something goes wrong:
1. Check `backups/` directory for recent backups
2. Use your existing migration tools to restore from backup
3. Verify your JSON files are correct and try again
