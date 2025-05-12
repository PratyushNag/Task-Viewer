const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// MongoDB connection string - hardcoded for migration script
const MONGODB_URI = 'mongodb+srv://pratyushnag:8jNqFUrq84OyzCgJ@personalprojects.ncinugq.mongodb.net/TaskViewer?retryWrites=true&w=majority&appName=PersonalProjects';

// Define schemas
const TaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    weekNumber: { type: Number },
    category: { type: String },
    phase: { type: Number },
    primaryFocus: { type: String },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const MilestoneSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    color: { type: String },
    weekNumber: { type: Number },
    phase: { type: Number },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create models
const Task = mongoose.model('Task', TaskSchema, 'tasks');
const Milestone = mongoose.model('Milestone', MilestoneSchema, 'milestones');

async function migrateData() {
  try {
    console.log('Starting migration...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
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

    // Process tasks data to fix date formats
    const processedTasks = tasksData.map(task => {
      return {
        ...task,
        startDate: new Date(task.startDate),
        dueDate: new Date(task.dueDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Process milestones data to fix date formats
    const processedMilestones = milestonesData.map(milestone => {
      return {
        ...milestone,
        startDate: new Date(milestone.startDate),
        dueDate: new Date(milestone.dueDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    // Insert tasks
    await Task.insertMany(processedTasks);
    console.log(`Inserted ${processedTasks.length} tasks into MongoDB`);

    // Insert milestones
    await Milestone.insertMany(processedMilestones);
    console.log(`Inserted ${processedMilestones.length} milestones into MongoDB`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateData();
