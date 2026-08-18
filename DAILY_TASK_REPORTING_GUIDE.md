# Darion Workforce — Daily Task Reporting Guide

A complete step-by-step visual handbook for **Candidates** and **Administrators** on how to report, track, review, and manage daily work accomplishments, deliverables, and blockers.

---

## Table of Contents
1. [Candidate Guide: How to Report Daily Tasks](#candidate-guide-how-to-report-daily-tasks)
   - [Step 1: Accessing the Daily Tasks Center](#step-1-accessing-the-daily-tasks-center)
   - [Step 2: Opening the Task Entry Form](#step-2-opening-the-task-entry-form)
   - [Step 3: Filling Out Task Details](#step-3-filling-out-task-details)
   - [Step 4: Managing Logged Tasks & Quick Status Updates](#step-4-managing-logged-tasks--quick-status-updates)
   - [Step 5: End-of-Shift Quick Reporting](#step-5-end-of-shift-quick-reporting)
2. [Admin Guide: How to Track & Review Task Reports](#admin-guide-how-to-track--review-task-reports)
   - [Step 1: Opening the Task Reporting Matrix](#step-1-opening-the-task-reporting-matrix)
   - [Step 2: Understanding KPI Summary Metrics](#step-2-understanding-kpi-summary-metrics)
   - [Step 3: "Who Completed Which Task" Candidate Matrix](#step-3-who-completed-which-task-candidate-matrix)
   - [Step 4: Filtering & Searching Task Logs](#step-4-filtering--searching-task-logs)
   - [Step 5: Reviewing Tasks & Adding Manager Feedback](#step-5-reviewing-tasks--adding-manager-feedback)
   - [Step 6: Exporting Task Reports to CSV](#step-6-exporting-task-reports-to-csv)
3. [Best Practices for Daily Task Reporting](#best-practices-for-daily-task-reporting)

---

# Candidate Guide: How to Report Daily Tasks

### Step 1: Accessing the Daily Tasks Center
1. Sign in to your **Candidate Portal**.
2. Click on the **"Daily Tasks"** tab in the desktop sidebar or tap **"Tasks"** in the mobile navigation bar at the bottom.
3. You can also click the **"Log Daily Tasks"** green button displayed on your dashboard once your shift ends.

---

### Step 2: Opening the Task Entry Form
1. Select the date you are logging work for (defaults to **Today**).
2. Click the **"+ Log Daily Task"** button on the top right.

---

### Step 3: Filling Out Task Details
Complete the fields in the **Log Daily Task Report** dialog:

| Field | Description | Example |
| :--- | :--- | :--- |
| **Task Summary** *(Required)* | Concise summary of what you worked on. | `Implemented responsive navigation menu in candidate portal` |
| **Project / Category** | Select a quick tag or enter a custom module. | `Frontend`, `Backend`, `Bugfix`, `UI/UX Design`, `QA & Testing` |
| **Status** | Choose between `Completed`, `In Progress`, or `Blocked`. | `Completed` (Green), `In Progress` (Blue), `Blocked` (Rose) |
| **Hours Spent** | Estimated duration dedicated to this specific task. | Use quick chips: `1h`, `2h`, `3.5h`, `4h`, `8h` |
| **Priority Level** | Priority of the deliverable. | `Low`, `Medium`, `High`, `Urgent` |
| **Deliverable Link** *(Optional)* | Link to proof of work. | GitHub PR, Figma link, Loom demo, Google Doc |
| **Roadblock / Blocker** | If status is set to **Blocked**, explain the issue. | `Waiting on API keys` or `Merge conflict on branch` |
| **Additional Notes** | Key accomplishments, edge cases, or next steps. | `Tested on mobile and desktop viewports` |

3. Click **"Submit Daily Task"**.

---

### Step 4: Managing Logged Tasks & Quick Status Updates
- **Quick Status Change**: Click **"Mark Completed"** or **"In Progress"** directly on any task card to transition status without opening the full editor.
- **Edit Task**: Click the pencil icon (`Edit`) to update hours, deliverable links, or notes.
- **Delete Task**: Click the trash icon (`Delete`) to remove a task entry.

---

# Admin Guide: How to Track & Review Task Reports

### Step 1: Opening the Task Reporting Matrix
1. Sign in to the **Admin Console**.
2. Click **"Task Reports"** in the sidebar navigation or from the quick links on your Admin Dashboard.

---

### Step 2: Understanding KPI Summary Metrics
The top KPI cards provide immediate visibility into daily workforce productivity:

1. **Completed Tasks (Green)**: Total tasks marked finished for the selected date.
2. **In Progress (Blue)**: Ongoing tasks carrying over to the next shift.
3. **Blockers (Rose / Pulse)**: Tasks flagged with impediments requiring management assistance.
4. **Reporting Rate**: Ratio of candidates who submitted reports vs total active workforce (e.g., `8/10`).
5. **Total Task Hours**: Cumulative working duration recorded across all tasks.

---

### Step 3: "Who Completed Which Task" Candidate Matrix
- The **By Candidate** grouped view organizes tasks under each candidate's card:
  - Displays their avatar, full name, and whether they are currently clocked into an active shift.
  - Summarizes total tasks and cumulative hours logged.
  - Expand/collapse to inspect individual tasks, project tags, hours, and deliverable links.
  - Highlights candidates who finished shifts but haven't submitted their task log.

---

### Step 4: Filtering & Searching Task Logs
- **Search Bar**: Real-time search across task titles, descriptions, candidate names, and blockers.
- **Candidate Filter**: Filter tasks by a specific team member.
- **Status Filter**: View only `Completed`, `In Progress`, or `Blocked` items.
- **Project Filter**: Filter by project (`Frontend`, `Backend`, etc.).
- **Date Switcher**: Toggle between single-day view or **"All Dates"** scope.

---

### Step 5: Reviewing Tasks & Adding Manager Feedback
1. Click **"Review"** on any task item to open the **Task Review & Feedback** dialog.
2. In this modal, administrators can:
   - Inspect the candidate's work description and click directly into their **Deliverable Proof Link**.
   - **Update Status**: Override status or mark a blocker as resolved.
   - **Add Guidance Notes**: Type feedback in the **Manager Review & Guidance Notes** box.
   - Click **"Save Review Notes"**. The candidate will see this feedback directly on their task card.

---

### Step 6: Exporting Task Reports to CSV
1. Apply any desired filters (date range, candidate, status, or project).
2. Click the **"Export CSV"** button on the top right.
3. A spreadsheet file named `daily_task_reports_<date>.csv` will immediately download with all columns (Candidate Name, Date, Project, Title, Status, Hours, Proof URL, Blockers, Admin Notes).

---

# Best Practices for Daily Task Reporting

> [!TIP]
> **For Candidates**:
> - **Log discrete tasks**: Rather than writing "Worked on app (8h)", split your day into 2–3 clear tasks (e.g. *Task A: 3.5h, Task B: 3.5h, Task C: 1h*).
> - **Attach Deliverable Links**: Include PR links, Figma files, or documentation URLs so managers can review your work immediately.
> - **Flag Blockers Early**: If you are waiting on credentials or blocked by another service, select **"Blocked"** so the team can unblock you.

> [!IMPORTANT]
> **For Administrators**:
> - Check the **Blockers** counter at the start of each morning/shift to resolve roadblocks quickly.
> - Use the **CSV Export** for weekly stakeholder reports and client billing audits.
