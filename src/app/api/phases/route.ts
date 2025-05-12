import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/models/Task';
import Milestone from '@/models/Milestone';

// GET /api/phases - Get all phases
export async function GET() {
  try {
    await connectToDatabase();
    
    // Get all unique phases from tasks
    const taskPhases = await Task.distinct('phase');
    
    // Get all unique phases from milestones
    const milestonePhases = await Milestone.distinct('phase');
    
    // Combine and deduplicate phases
    const allPhases = [...new Set([...taskPhases, ...milestonePhases])];
    
    // Sort phases
    const sortedPhases = allPhases.sort((a, b) => a - b);
    
    return NextResponse.json(sortedPhases, { status: 200 });
  } catch (error) {
    console.error('Error fetching phases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch phases' },
      { status: 500 }
    );
  }
}
