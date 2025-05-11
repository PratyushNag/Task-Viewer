import json
from datetime import datetime, timedelta


def get_week_start_date(week_number, base_date=datetime(2025, 5, 12)):
    """Calculate the Monday of the given week number starting from May 12, 2025."""
    # May 12, 2025 is a Monday (the day after May 11, 2025)
    # This will be our reference point for week 1

    # Calculate the Monday of the specified week
    week_start = base_date + timedelta(weeks=(week_number - 1))
    return week_start


def get_day_offset_for_category(category):
    """Get the day offset (0-6) for a given category."""
    if category == "GS Subject 1":
        return 0  # Monday
    elif category == "GS Subject 2 / Optional":
        return 1  # Tuesday
    elif category == "CSAT":
        return 2  # Wednesday
    elif category == "Current Affairs":
        return 4  # Friday
    elif category == "Weekly Test":
        return 5  # Saturday
    else:
        return 3  # Thursday for any other category (including Answer Writing / Essay)


def update_start_dates():
    # Load the JSON file
    with open("src/data/study_plan_tasks.json", "r", encoding="utf-8") as f:
        tasks = json.load(f)

    # Update each task's start date based on its category
    for task in tasks:
        week_number = task["weekNumber"]
        category = task["category"]

        # Get the week start date (Monday)
        week_start = get_week_start_date(week_number)

        # Get the day offset for this category
        day_offset = get_day_offset_for_category(category)

        # Calculate the new start date
        new_start_date = week_start + timedelta(days=day_offset)

        # Update the task's start date
        task["startDate"] = new_start_date.strftime("%Y-%m-%d")

    # Save the updated JSON file
    with open("src/data/study_plan_tasks.json", "w", encoding="utf-8") as f:
        json.dump(tasks, f, indent=2)

    print(f"Updated start dates for {len(tasks)} tasks based on their categories.")


if __name__ == "__main__":
    update_start_dates()
