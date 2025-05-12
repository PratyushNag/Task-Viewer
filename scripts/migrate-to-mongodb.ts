import fs from 'fs';
import path from 'path';
import { connectToDatabase, disconnectFromDatabase } from '../src/lib/mongodb';
import Task from '../src/models/Task';
import Milestone from '../src/models/Milestone';

async function migrateData() {
  try {
    console.log('Starting migration...');
    
    // Connect to MongoDB
    await connectToDatabase();
    console.log('Connected to MongoDB');
    
    // Read tasks from JSON file
    const tasksPath = path.join(process.cwd(), 'src/data/study_plan_tasks.json');
    const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
    console.log(`Read ${tasksData.length} tasks from JSON file`);
    
    // Read milestones from JSON file
    const milestonesPath = path.join(process.cwd(), 'src/data/study_plan_milestones.json');
    const milestonesData = JSON.parse(fs.readFileSync(milestonesPath, 'utf8'));
    console.log(`Read ${milestonesData.length} milestones from JSON file`);
    
    // Clear existing data
    await Task.deleteMany({});
    await Milestone.deleteMany({});
    console.log('Cleared existing data from MongoDB');
    
    // Insert tasks
    await Task.insertMany(tasksData);
    console.log(`Inserted ${tasksData.length} tasks into MongoDB`);
    
    // Insert milestones
    await Milestone.insertMany(milestonesData);
    console.log(`Inserted ${milestonesData.length} milestones into MongoDB`);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Disconnect from MongoDB
    await disconnectFromDatabase();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateData();
