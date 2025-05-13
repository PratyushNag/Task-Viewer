import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the Milestone interface
export interface IMilestone extends Document {
  id: string;
  title: string;
  description?: string;
  startDate?: Date | string;
  dueDate: Date | string;
  completed: boolean;
  color?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  weekNumber?: number;
  phase?: number;
}

// Define the Milestone schema
const MilestoneSchema: Schema = new Schema(
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
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create and export the Milestone model
// Check if the model already exists to prevent overwriting during hot reloads
// Use the collection name 'milestones' to match your MongoDB collection
export const Milestone: Model<IMilestone> =
  mongoose.models.Milestone || mongoose.model<IMilestone>('Milestone', MilestoneSchema, 'milestones');

export default Milestone;
