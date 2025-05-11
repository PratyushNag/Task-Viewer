import csv
import json
import uuid
from datetime import datetime, timezone

# Define column indices for the CSV file
COL_WEEK_NO = 0
COL_START_DATE = 1
COL_END_DATE = 2
COL_PHASE = 3
COL_PRIMARY_FOCUS = 4
COL_GS_SUBJECT_1 = 5
COL_GS_SUBJECT_2_OPTIONAL = 6
COL_CSAT = 7
COL_CURRENT_AFFAIRS = 8
COL_ANSWER_WRITING = 9
COL_WEEKLY_TEST = 10
COL_MILESTONE = 11


def parse_date(date_str):
    """Parse date string in format DD-MMM-YY to ISO format."""
    if not date_str:
        return None
    try:
        # Try to parse the date in the format from the CSV (e.g., "12-May-25")
        date_obj = datetime.strptime(date_str, "%d-%b-%y")
        return date_obj.strftime("%Y-%m-%d")
    except ValueError:
        try:
            # Try alternative format if first one fails
            date_obj = datetime.strptime(date_str, "%d-%B-%y")
            return date_obj.strftime("%Y-%m-%d")
        except ValueError:
            # If both fail, return the original string
            return date_str


def generate_id():
    """Generate a unique ID."""
    return str(uuid.uuid4())


def get_priority(text):
    """Determine priority based on text content."""
    if not text:
        return "medium"

    text = text.lower()
    if "urgent" in text or "critical" in text or "high" in text:
        return "high"
    elif "low" in text or "optional" in text:
        return "low"
    else:
        return "medium"


def convert_csv_to_json():
    """Convert the CSV file to JSON format for tasks and milestones."""
    tasks = []
    milestones = []

    # Current timestamp for created_at and updated_at fields
    current_timestamp = datetime.now(timezone.utc).isoformat()

    with open("plan.csv", "r", encoding="utf-8") as csvfile:
        reader = csv.reader(csvfile)
        next(reader)  # Skip header row

        for row in reader:
            if len(row) <= COL_MILESTONE:  # Skip rows that don't have enough columns
                continue

            week_number = int(row[COL_WEEK_NO]) if row[COL_WEEK_NO].isdigit() else 0
            end_date = parse_date(row[COL_END_DATE])
            phase = int(row[COL_PHASE]) if row[COL_PHASE].isdigit() else 0

            # Create milestone if one exists for this week
            if row[COL_MILESTONE]:
                start_date = parse_date(row[COL_START_DATE])
                milestone = {
                    "id": generate_id(),
                    "title": f"Week {week_number}: {row[COL_MILESTONE]}",
                    "description": f"Phase {phase} - {row[COL_PRIMARY_FOCUS]}",
                    "startDate": start_date,
                    "dueDate": end_date,
                    "completed": False,
                    "weekNumber": week_number,
                    "phase": phase,
                    "createdAt": current_timestamp,
                    "updatedAt": current_timestamp,
                }
                milestones.append(milestone)

            # Create tasks for each activity in this week
            task_categories = [
                ("GS Subject 1", row[COL_GS_SUBJECT_1]),
                ("GS Subject 2 / Optional", row[COL_GS_SUBJECT_2_OPTIONAL]),
                ("CSAT", row[COL_CSAT]),
                ("Current Affairs", row[COL_CURRENT_AFFAIRS]),
                ("Answer Writing / Essay", row[COL_ANSWER_WRITING]),
                ("Weekly Test", row[COL_WEEKLY_TEST]),
            ]

            for category, content in task_categories:
                if content:
                    start_date = parse_date(row[COL_START_DATE])
                    task = {
                        "id": generate_id(),
                        "title": f"Week {week_number}: {category}",
                        "description": content,
                        "startDate": start_date,
                        "dueDate": end_date,
                        "completed": False,
                        "priority": get_priority(content),
                        "weekNumber": week_number,
                        "phase": phase,
                        "category": category,
                        "primaryFocus": row[COL_PRIMARY_FOCUS],
                        "createdAt": current_timestamp,
                        "updatedAt": current_timestamp,
                    }
                    tasks.append(task)

    # Write tasks to JSON file
    with open("study_plan_tasks.json", "w", encoding="utf-8") as f:
        json.dump(tasks, f, indent=2)
        print("Successfully created study_plan_tasks.json")

    # Write milestones to JSON file
    with open("study_plan_milestones.json", "w", encoding="utf-8") as f:
        json.dump(milestones, f, indent=2)
        print("Successfully created study_plan_milestones.json")


if __name__ == "__main__":
    convert_csv_to_json()
