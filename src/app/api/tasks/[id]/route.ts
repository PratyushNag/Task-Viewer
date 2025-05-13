import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Task from '@/models/Task';

export type RouteParams = {
  params: {
    id: string;
  };
};

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const taskId = params.id;
    await connectToDatabase();

    const task = await Task.findOne({ id: taskId });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const taskId = params.id;
    console.log('API: Updating task with ID:', taskId);
    await connectToDatabase();

    const body = await req.json();
    console.log('API: Request body:', body);

    // Update the task
    const updatedTask = await Task.findOneAndUpdate(
      { id: taskId },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      console.log('API: Task not found with ID:', taskId);
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    console.log('API: Task updated successfully:', updatedTask);
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error('API: Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const taskId = params.id;
    await connectToDatabase();

    const deletedTask = await Task.findOneAndDelete({ id: taskId });

    if (!deletedTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
