import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Milestone from '@/models/Milestone';

// GET /api/milestones - Get all milestones
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get query parameters
    const url = new URL(req.url);
    const phase = url.searchParams.get('phase');
    const weekNumber = url.searchParams.get('weekNumber');
    
    // Build query
    const query: any = {};
    if (phase) query.phase = parseInt(phase);
    if (weekNumber) query.weekNumber = parseInt(weekNumber);
    
    const milestones = await Milestone.find(query).sort({ weekNumber: 1, startDate: 1 });
    
    return NextResponse.json(milestones, { status: 200 });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

// POST /api/milestones - Create a new milestone
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const milestone = new Milestone(body);
    await milestone.save();
    
    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error('Error creating milestone:', error);
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    );
  }
}
