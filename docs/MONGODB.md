# MongoDB Integration Guide

This document provides instructions on how to set up and use the MongoDB integration for the Calendar View application.

## Prerequisites

1. MongoDB Atlas account (free tier is sufficient)
2. Node.js 18.0.0 or higher
3. npm or yarn

## Setup

### 1. Create a MongoDB Atlas Cluster

1. Sign up for a free MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Create a new cluster (the free tier is sufficient)
3. Set up database access:
   - Create a new database user with read/write permissions
   - Remember the username and password
4. Set up network access:
   - Add your IP address to the IP access list
   - For development, you can allow access from anywhere (0.0.0.0/0)
5. Get your connection string:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string

### 2. Configure Environment Variables

1. Create a `.env.local` file in the root of your project (or edit the existing one)
2. Add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/calendar-view?retryWrites=true&w=majority
   ```
3. Replace `<username>`, `<password>`, and `<cluster>` with your actual values

### 3. Run the Migration Script

To migrate your existing data from JSON files to MongoDB, run:

```bash
npm run migrate
```

This will:
1. Read data from the JSON files
2. Insert it into your MongoDB database
3. Log the results

## API Routes

The application now uses the following API routes:

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a specific task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/milestones` - Get all milestones
- `GET /api/milestones/:id` - Get a specific milestone
- `POST /api/milestones` - Create a new milestone
- `PUT /api/milestones/:id` - Update a milestone
- `DELETE /api/milestones/:id` - Delete a milestone
- `GET /api/phases` - Get all phases
- `GET /api/weeks` - Get all weeks

## Deployment

### Vercel Deployment

1. Add your MongoDB connection string to your Vercel project's environment variables:
   - Go to your project settings in Vercel
   - Navigate to the "Environment Variables" section
   - Add `MONGODB_URI` with your connection string

2. Deploy your application as usual:
   ```bash
   vercel
   ```

## Troubleshooting

### Connection Issues

If you're having trouble connecting to MongoDB:

1. Check that your connection string is correct
2. Ensure your IP address is in the MongoDB Atlas IP access list
3. Verify that your database user has the correct permissions

### Data Migration Issues

If the migration script fails:

1. Check the error message for details
2. Ensure your JSON files are valid
3. Try running the script with the `--verbose` flag for more information:
   ```bash
   npm run migrate -- --verbose
   ```

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
