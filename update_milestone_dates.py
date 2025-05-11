import json
from datetime import datetime, timedelta

def get_week_start_date(week_number, base_date=datetime(2025, 5, 12)):
    """Calculate the Monday of the given week number starting from May 12, 2025."""
    # May 12, 2025 is a Monday (the day after May 11, 2025)
    # This will be our reference point for week 1
    week_start = base_date + timedelta(weeks=(week_number - 1))
    return week_start

def update_milestone_dates():
    """Update milestone start dates to align with the thematic approach."""
    # Load the JSON file
    with open("src/data/study_plan_milestones.json", "r", encoding="utf-8") as f:
        milestones = json.load(f)
    
    # Update each milestone's start date to the Monday of its week
    for milestone in milestones:
        week_number = milestone["weekNumber"]
        
        # Get the week start date (Monday)
        week_start = get_week_start_date(week_number)
        
        # Update the milestone's start date
        milestone["startDate"] = week_start.strftime("%Y-%m-%d")
        
        # Add a note to the description to indicate the milestone is for the entire week
        if not milestone["description"].startswith("Week-long milestone:"):
            milestone["description"] = f"Week-long milestone: {milestone['description']}"
    
    # Save the updated JSON file
    with open("src/data/study_plan_milestones.json", "w", encoding="utf-8") as f:
        json.dump(milestones, f, indent=2)
    
    print(f"Updated start dates for {len(milestones)} milestones to align with the thematic approach.")
    print("All milestone start dates now begin on Monday of their respective weeks.")

if __name__ == "__main__":
    update_milestone_dates()
