import json
from datetime import datetime, timedelta
import random

def get_week_start_date(week_number, base_date=datetime(2025, 5, 12)):
    """Calculate the Monday of the given week number starting from May 12, 2025."""
    # May 12, 2025 is a Monday (the day after May 11, 2025)
    # This will be our reference point for week 1
    week_start = base_date + timedelta(weeks=(week_number - 1))
    return week_start

def distribute_tasks_within_week(tasks_by_week):
    """
    Distribute tasks within each week following the thematic approach:
    - Current Affairs is daily
    - Multiple components are studied each day
    - Tasks are distributed more evenly throughout the week
    - Weekly tests remain on Saturdays
    - Revision is integrated regularly
    """
    updated_tasks = []
    
    for week_number, week_tasks in tasks_by_week.items():
        week_start = get_week_start_date(week_number)
        
        # Sort tasks by category to ensure consistent ordering
        week_tasks.sort(key=lambda x: x["category"])
        
        # Fixed assignments:
        # - Weekly Test always on Saturday
        # - Current Affairs spread throughout the week
        
        for task in week_tasks:
            # Weekly Test is always on Saturday
            if task["category"] == "Weekly Test":
                task["startDate"] = (week_start + timedelta(days=5)).strftime("%Y-%m-%d")  # Saturday
                updated_tasks.append(task)
                continue
                
            # Current Affairs starts on Monday but is understood to be a daily task
            if task["category"] == "Current Affairs":
                task["startDate"] = week_start.strftime("%Y-%m-%d")  # Monday
                task["description"] = "Daily: " + task["description"]
                updated_tasks.append(task)
                continue
            
            # Distribute other tasks throughout the week
            if task["category"] == "GS Subject 1":
                # Main GS subject starts on Monday
                task["startDate"] = week_start.strftime("%Y-%m-%d")  # Monday
                # Update description to indicate daily breakdown if not already specified
                if not task["description"].startswith("Daily:"):
                    parts = task["description"].split(":")
                    if len(parts) > 1:
                        task["description"] = f"Mon-Thu: {parts[0].strip()}: {parts[1].strip()}"
                    else:
                        task["description"] = f"Mon-Thu: {task['description']}"
            
            elif task["category"] == "GS Subject 2 / Optional":
                # Optional subject starts on Monday but continues throughout week
                task["startDate"] = week_start.strftime("%Y-%m-%d")  # Monday
                # Update description to indicate daily breakdown
                if not task["description"].startswith("Daily:"):
                    parts = task["description"].split(":")
                    if len(parts) > 1:
                        task["description"] = f"Mon-Thu: {parts[0].strip()}: {parts[1].strip()}"
                    else:
                        task["description"] = f"Mon-Thu: {task['description']}"
            
            elif task["category"] == "CSAT":
                # CSAT practice on Wednesday and Friday
                task["startDate"] = (week_start + timedelta(days=2)).strftime("%Y-%m-%d")  # Wednesday
                # Update description
                if not task["description"].startswith("Wed"):
                    task["description"] = f"Wed & Fri: {task['description']}"
            
            elif task["category"] == "Answer Writing / Essay":
                # Answer writing on Tuesday and Thursday
                task["startDate"] = (week_start + timedelta(days=3)).strftime("%Y-%m-%d")  # Thursday
                # Update description
                if not task["description"].startswith("Tue"):
                    task["description"] = f"Tue & Thu: {task['description']}"
            
            else:
                # Any other category - assign to Tuesday
                task["startDate"] = (week_start + timedelta(days=1)).strftime("%Y-%m-%d")  # Tuesday
            
            updated_tasks.append(task)
    
    return updated_tasks

def update_thematic_dates():
    # Load the JSON file
    with open("src/data/study_plan_tasks.json", "r", encoding="utf-8") as f:
        tasks = json.load(f)
    
    # Group tasks by week
    tasks_by_week = {}
    for task in tasks:
        week_number = task["weekNumber"]
        if week_number not in tasks_by_week:
            tasks_by_week[week_number] = []
        tasks_by_week[week_number].append(task)
    
    # Distribute tasks within each week
    updated_tasks = distribute_tasks_within_week(tasks_by_week)
    
    # Save the updated JSON file
    with open("src/data/study_plan_tasks.json", "w", encoding="utf-8") as f:
        json.dump(updated_tasks, f, indent=2)
    
    print(f"Updated start dates for {len(updated_tasks)} tasks based on the thematic approach.")
    print("Key changes:")
    print("- Current Affairs is now marked as a daily task starting Monday")
    print("- GS Subject 1 and Optional subjects are scheduled Mon-Thu")
    print("- CSAT practice is on Wednesday and Friday")
    print("- Answer Writing is on Tuesday and Thursday")
    print("- Weekly Tests remain on Saturday")

if __name__ == "__main__":
    update_thematic_dates()
