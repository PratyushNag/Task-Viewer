import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the Task interface
export interface ITask extends Document {
  id: string;
  title: string;
  description?: string;
  startDate?: Date | string;
  dueDate: Date | string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date | string;
  updatedAt: Date | string;
  weekNumber?: number;
  category?: string;
  phase?: number;
  primaryFocus?: string;
}

// Define the Task schema
const TaskSchema: Schema = new Schema(
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
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create and export the Task model
// Check if the model already exists to prevent overwriting during hot reloads
// Use the collection name 'tasks' to match your MongoDB collection
export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema, 'tasks');

export default Task;
