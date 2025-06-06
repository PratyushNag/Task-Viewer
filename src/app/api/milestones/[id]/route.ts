import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Milestone from '@/models/Milestone';

export type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

// GET /api/milestones/[id] - Get a specific milestone
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const milestone = await Milestone.findOne({ id });

    if (!milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(milestone, { status: 200 });
  } catch (error) {
    console.error('Error fetching milestone:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestone' },
      { status: 500 }
    );
  }
}

// PUT /api/milestones/[id] - Update a milestone
export async function PUT(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const body = await req.json();

    // Update the milestone
    const updatedMilestone = await Milestone.findOneAndUpdate(
      { id },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedMilestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMilestone, { status: 200 });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}

// DELETE /api/milestones/[id] - Delete a milestone
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deletedMilestone = await Milestone.findOneAndDelete({ id });

    if (!deletedMilestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting milestone:', error);
    return NextResponse.json(
      { error: 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}
