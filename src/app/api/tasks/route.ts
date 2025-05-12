import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/models/Task';

// GET /api/tasks - Get all tasks
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
    
    const tasks = await Task.find(query).sort({ weekNumber: 1, startDate: 1 });
    
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const task = new Task(body);
    await task.save();
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
