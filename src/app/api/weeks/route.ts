import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/models/Task';
import Milestone from '@/models/Milestone';

// GET /api/weeks - Get all weeks
export async function GET() {
  try {
    await connectToDatabase();
    
    // Get all unique week numbers from tasks
    const taskWeeks = await Task.distinct('weekNumber');
    
    // Get all unique week numbers from milestones
    const milestoneWeeks = await Milestone.distinct('weekNumber');
    
    // Combine and deduplicate week numbers
    const allWeeks = [...new Set([...taskWeeks, ...milestoneWeeks])];
    
    // Sort week numbers
    const sortedWeeks = allWeeks.sort((a, b) => a - b);
    
    return NextResponse.json(sortedWeeks, { status: 200 });
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weeks' },
      { status: 500 }
    );
  }
}
