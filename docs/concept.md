# Summary

I’m looking to create a habit tracker, one-off task manager, and recurring task manager.

## Delineation of Task Types

### Habits

A habit is something that you want to do on a regular basis.
For example, “brushing your teeth (AM)” is a habit that you would want to do every morning. Whereas, “Journaling” is a habit you would want to do at some point during the day.

#### Technical Specifications

Habits can be grouped into either AM, PM, or Misc.
Habits can be assigned an alarm time that will notify the user at that time.
Habits can recur on a user-set basis. They could be daily, every other day, every weekday, etc.

### Errands

An errand is something that you need to or should do on a regular basis.
For example, “take out the trash” is a habit that you would want to do every week on trash day. Whereas, “Wish [PERSON] happy birthday” is an errand you would want to do once a year.

#### Technical Specifications

Errands can be assigned to a “List” — Ex.) “Birthdays”
Errands can be assigned an alarm time that will notify the user at that time.
Errands can be assigned a date and recur based on that date

### Tasks

A task is something that you need to do or should do one time.
For example, “Send [PERSON] money for dinner” is a task that you would want to do once for when they paid for dinner.
Whereas, “Call [PERSON] about their website” is a task in the “Freelance” project that should be done ASAP.

#### Technical Specifications

Tasks can be given a priority using a number. Higher number tasks are the most important.
Tasks can be grouped by “Project” and by default will be in the “Inbox” project.
Tasks can be assigned an alarm time that will notify the user at that time.
Tasks can be assigned a date

## User Interface

### Habits Page

#### Technical Specifications

Only displays habits that are to be done on that day
When a habit is checked off, it goes away

### Errands Page

#### Technical Specifications

Displays a “Today” section with errands to be done that day
Displays a “Tomorrow” section for errands to be done tomorrow
Displays a “Later” section with 5 errands in the future
Displays a “Someday” section with errands that are not assigned a date
When an errand is checked off, it goes away

### Tasks Page

#### Technical Specifications

By default, displays tasks in priority order
Can be filtered to only show tasks in a certain project
