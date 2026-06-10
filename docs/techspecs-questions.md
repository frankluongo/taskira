# Technical Specifications

Questions to answer before building. Fill in answers under each question.

---

## Platform & Tech Stack

1. **What platform(s) should this run on?** (iOS, Android, Web, Mac desktop, cross-platform?)
   - Answer: Ideally, in the browser, Mac Desktop and iOS.

2. **Do you have a preferred tech stack or framework?** (e.g., React Native, SwiftUI, Flutter, Next.js)
   - Answer: I'm most comfortable with web technologies (HTML, JavaScript, CSS) but I'm open to suggestions.

3. **Should data sync across multiple devices, or is this single-device?**
   - Answer: This will be a single device, bespoke app for now. I'm building it for myself only.

---

## Data & Storage

4. **Does the app require user accounts / authentication?** Or is it single-user with no login?
   - Answer: Nope. This app is only for me.

5. **Where should data live?** (Local-only on device, cloud-backed, or both with offline support?)
   - Answer: Ideally, data will sync between devices. I intend to mainly use this on my Mac and my iPhone.

6. **If cloud-backed, do you have a preferred backend?** (Supabase, Firebase, custom API, etc.)
   - Answer: I have no preferred backend.

---

## Notifications & Alarms

7. **Alarm times are mentioned for all three item types. How should these work?**
   - Push notification only?
   - In-app alert only?
   - Both?
   - Answer: I'd love push notifications, otherwise I will never see it.

8. **Should notifications repeat if not acknowledged?** If so, how often?
   - Answer: Notifications should NOT repeat.

9. **Should there be a global "do not disturb" window?**
   - Answer: No.

---

## Habits

10. **What recurrence options should be supported?**
    - Daily, every other day, specific days of the week (e.g., Mon/Wed/Fri), weekdays only, weekends only — anything else?
    - Answer: The current recurrence options cover it.

11. **AM / PM / Misc groups — are these fixed, or can the user create custom groups?**
    - Answer: These groups are fixed.

12. **When a habit is checked off, does it reset automatically at midnight (or some other time), or does the user manually reset it?**
    - Answer: It will reset automatically at midnight.

13. **What happens if a habit is missed for the day? Is there a streak/history view, or does it just disappear?**
    - Answer: If a habit is missed, it just disappears.

14. **Should habits have a start date and/or end date?** (e.g., "do this for 30 days")
    - Answer: This can be optional, yes.

---

## Errands

15. **"Lists" for errands — are these user-created, or are there predefined lists?**
    - Answer: Lists are user created.

16. **What recurrence patterns should errands support?**
    - Weekly on a specific day, monthly on a date, yearly (for birthdays), custom interval — anything else?
    - Answer: These recurrence patterns cover it.

17. **When a recurring errand is checked off, does the next occurrence auto-generate immediately?**
    - Answer: Yes.

18. **The "Later" section shows 5 upcoming errands. Should this be configurable, or fixed at 5?**
    - Answer: Fix it at 5.

19. **"Someday" errands have no date. Should they appear in any sorted order?** (by list, by creation date, manually reorderable?)
    - Answer: List by creation date.

---

## Tasks

20. **Priority is a number — what's the range?** (1–5? 1–10? Freeform integer?)
    - Answer: it should be between 1-5.

21. **Higher number = higher priority per the concept. Should there be a way to visually distinguish priority levels?** (color coding, labels like High/Medium/Low, etc.)
    - Answer: Yes. Let's use labels

22. **"Inbox" is the default project. Can projects be nested (sub-projects), or are they flat?**
    - Answer: Projects are flat.

23. **Can a task belong to more than one project?**
    - Answer: No.

24. **When a one-off task is checked off, does it disappear immediately or move to a "Completed" archive?**
    - Answer: It disappears immediately.

25. **Should tasks support subtasks?**
    - Answer: Yes.

26. **Tasks can have a date — is this a due date (deadline) or a scheduled date (when you plan to work on it), or both?**
    - Answer: The date is a due date.

---

## User Interface & Navigation

27. **How should the three sections (Habits, Errands, Tasks) be navigated?** (Bottom tab bar, sidebar, top tabs?)
    - Answer: Bottom tab bar.

28. **Should there be a unified "Today" dashboard that combines all three types in one view?**
    - Answer: Yes.

29. **Dark mode / light mode: system default, user-selectable, or light only?**
    - Answer: Support system default

30. **Should items be reorderable via drag-and-drop within their sections?**
    - Answer: Yes.

---

## Stretch / Future Features

31. **Are there any features you know you want but intentionally left out of v1?** (e.g., sharing tasks with others, widgets, Siri/voice input)
    - Answer: None that I can think of.

32. **Any integrations in mind?** (Apple Reminders, Google Calendar, Notion, etc.)
    - Answer: No integrations at the moment. The hope is that this will replace my need for Reminders and notion.
