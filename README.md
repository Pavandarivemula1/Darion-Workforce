# 🏢 Darion Workforce Management System (Enterprise Edition v3.0)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015%20%7C%20RLS%20%7C%20Auth%20%7C%20Realtime-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-CSS%204-38B2AC?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Google APIs](https://img.shields.io/badge/Google%20Drive-Recording%20Sync-EA4335?style=for-the-badge&logo=googledrive)](https://developers.google.com/drive)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-0052CC?style=for-the-badge)](LICENSE)

An enterprise-grade, high-concurrency workforce operations, shift scheduling, real-time attendance tracking, video conferencing, automated payroll calculation, and digital credential verification platform. Engineered with **Next.js 16 (App Router)**, **React 19**, **Supabase (PostgreSQL with Row Level Security, Auth, Storage, & Realtime WebSockets)**, **Google Meet / Google Drive API integrations**, and a customized **Material Design 3** design system.

---

## 📑 Table of Contents

- [Executive Summary & Core Architecture](#-executive-summary--core-architecture)
- [Enterprise System Modules & Feature Matrix](#-enterprise-system-modules--feature-matrix)
  - [1. Authentication, MFA & Zero-Trust Access Control](#1-authentication-mfa--zero-trust-access-control)
  - [2. Workforce Time Tracking & Live Shift Engine](#2-workforce-time-tracking--live-shift-engine)
  - [3. Shift Scheduling & Roster Planning System](#3-shift-scheduling--roster-planning-system)
  - [4. Overshift & Overtime Management Engine](#4-overshift--overtime-management-engine)
  - [5. Leave Management & PTO System](#5-leave-management--pto-system)
  - [6. Daily Task Reporting & Performance Accountability](#6-daily-task-reporting--performance-accountability)
  - [7. Automated Enterprise Payroll & Compensation Engine](#7-automated-enterprise-payroll--compensation-engine)
  - [8. Darion Meet — HD Video Conferencing & Cloud Recording Sync](#8-darion-meet--hd-video-conferencing--cloud-recording-sync)
  - [9. Candidate Feedback & 360 Performance / Inquiry Hub](#9-candidate-feedback--360-performance--inquiry-hub)
  - [10. Real-Time In-App Notification Center](#10-real-time-in-app-notification-center)
  - [11. Weekly Timesheet Matrix & BI Reporting Suite](#11-weekly-timesheet-matrix--bi-reporting-suite)
  - [12. Darion Verify Digital Credential Engine](#12-darion-verify-digital-credential-engine)
- [System Architecture & Data Flow](#-system-architecture--data-flow)
- [Project Directory Structure](#-project-directory-structure)
- [Database Schema & Migrations Reference (24 Migrations)](#-database-schema--migrations-reference-24-migrations)
- [Environment Variables Configuration](#-environment-variables-configuration)
- [Initial Provisioning & Setup](#-initial-provisioning--setup)
- [Local Development & Quality Assurance Suite](#-local-development--quality-assurance-suite)
- [Production Deployment (Vercel & Supabase)](#-production-deployment-vercel--supabase)
- [Enterprise Security, Compliance & Data Guarantees](#-enterprise-security-compliance--data-guarantees)
- [License & Commercial Support](#-license--commercial-support)

---

## 🌟 Executive Summary & Core Architecture

Darion Workforce is architected for organizations demanding bulletproof time tracking, strict regulatory compliance, transparent payroll distribution, and seamless team collaboration:

- **⚡ Sub-10ms SSR Cold Start & Cookie Parsing**: High-performance SSR authentication middleware leveraging native JWT extraction and base64 parsing without blocking round-trips.
- **🛡️ Multi-Factor Authentication (TOTP MFA)**: Built-in authenticator app enrollment (Google Authenticator, Microsoft Authenticator, Authy) with client-side QR generation, recovery codes, and an administrative MFA reset approval queue.
- **⏱️ Authoritative Server-Clock Shift Engine**: Zero reliance on client-side time. Shift transitions, breaks, auto-cutoffs, and punctuality assessments execute against PostgreSQL `NOW()`.
- **📊 Real-Time WebSocket Synchronization**: Live Supabase Realtime channel subscriptions reflecting attendance, tasks, meetings, notifications, and shift changes instantly across all devices without page reloads.
- **💵 Automated Timesheet Matrix & Payroll Engine**: Interactive Monday–Sunday matrix calculating candidate hours and wage payouts in `Asia/Kolkata` (IST) timezone with one-click CSV exports and printable A4 payslips.
- **📹 Cloud-Synchronized Meeting Rooms (Darion Meet)**: Built-in video meeting rooms with participant lobby controls, screen sharing, real-time notes, floating reactions, and automatic Google Drive recording synchronization.

---

## 🚀 Enterprise System Modules & Feature Matrix

### 1. Authentication, MFA & Zero-Trust Access Control
- **Supabase SSR Session Engine**: Secure password-based authentication with persistent SSR session management using `@supabase/ssr` (`v0.12.4`).
- **Role-Based Access Control (RBAC)**: Strict role separation between Admin (`/admin/*`), Candidate (`/candidate/*`), and Guest routes enforced in Next.js Middleware and Server Components.
- **First-Login Mandatory Password Change**: Candidate accounts default to temporary access requiring an immediate secure password update at `/force-change-password`.
- **TOTP Multi-Factor Authentication**: Candidates can enroll authenticator apps at `/candidate/profile` with live QR code generation via `react-qr-code`.
- **Administrative Security & Reset Queue (`/admin/reset-requests`, `/admin/security`)**: Dedicated administrative approval hub to inspect, approve, or reject self-service password reset and MFA unenrollment requests.
- **Non-Recursive RLS Engine**: Database policies leverage a `SECURITY DEFINER` function (`is_admin()`) with `SET search_path = public` to guarantee zero-recursion policy execution.

### 2. Workforce Time Tracking & Live Shift Engine
- **Live Work Session Controller (`/candidate`)**: Authoritative server-side `NOW()` shift clock-in, break pause/resume, and clock-out.
- **Active Shift Live Timer**: Dynamic shift duration counter displaying live elapsed time (`03h 42m 12s`) with active browser tab title updates (`🟢 Working... - 03h 42m`).
- **Break Time Tracker**: Track meal and rest intervals (`break_start_time`, `break_duration_seconds`) with automated deduction from gross shift hours.
- **Auto-Cutoff & Punctuality Engine**: Intelligent shift status evaluation (`On-Time`, `Late Arrival`, `Early Departure`, `Overtime`) with automatic shift cutoffs at boundary limits.
- **Admin Attendance Management Hub (`/admin/attendance`)**:
  - Live active session inspector with candidate avatar and duration.
  - Administrative timer controls (Remote Start Timer, Remote Stop Timer).
  - Retroactive shift editor (`EditShiftModal`) and manual shift injection (`ManualShiftModal`) with audit notes (`modified_by_admin`).
  - Shift Approval / Rejection workflow with customizable rejection feedback notes.

### 3. Shift Scheduling & Roster Planning System
- **Shift Template Management (`/admin/shifts`)**: Create, edit, and organize shift templates (Morning, Evening, Night, Custom) with predefined operating windows and hour limits.
- **Weekly Roster Planner**: Interactive calendar grid for scheduling and publishing candidate shift assignments up to weeks in advance.
- **Shift Swapping Workflow**: Candidate-initiated shift swap requests with peer confirmation and administrative approval checks.
- **Candidate Shift Hub (`/candidate/shifts`)**: Dedicated view for candidates to inspect upcoming rosters, acknowledge assigned shifts, and monitor schedule changes.

### 4. Overshift & Overtime Management Engine
- **Multi-Type Overshift Requests**: Support for both Immediate Overtime ("Now" - when working past scheduled bounds) and Scheduled Overtime ("Later" - planned future overtime).
- **Candidate Status Dialogs**: Real-time status badges (`Pending`, `Approved`, `Rejected`) with instant reason inspection and submission modals.
- **Administrative Review Queue**: Centralized review interface with candidate shift history, reason justification, and one-click approval/rejection.

### 5. Leave Management & PTO System
- **Multi-Type Leave Applications (`/candidate/leaves`)**: Apply for Annual, Sick, Casual, or Unpaid PTO with date pickers, reason inputs, and document attachments.
- **Automated Balance Tracking**: Dedicated leave balance ledger (`leave_balances`) calculating accrued, used, and remaining PTO balances.
- **Admin Leave Review Hub (`/admin/leaves`)**: Comprehensive leave approval pipeline with shift conflict warnings, historical leave records, and administrative approval actions.
- **Automated Schedule Synchronization**: Approved leaves automatically reflect on weekly timesheets and candidate rosters.

### 6. Daily Task Reporting & Performance Accountability
- **Daily Task Submissions (`/candidate/tasks`)**: Candidates log daily work deliverables with itemized sub-tasks, work category tags, and completion status.
- **Self-Assessment & Reflection**: Candidates submit productivity self-ratings (1–5 stars) and blocker notes alongside their daily deliverables.
- **Admin Task Evaluation Hub (`/admin/tasks`)**: Administrators review submissions, assign performance scores (1–10), and provide structured qualitative feedback via `TaskFeedbackModal`.
- **Historical Task Analytics**: Visual metrics and submission archives tracking performance trends and sprint deliverables.

### 7. Automated Enterprise Payroll & Compensation Engine
- **Automated Daily Wage Trigger**: Automatic calculation of daily wages via database trigger (`calculate_daily_pay`) using candidate-assigned `hourly_rate`.
- **Payroll Period Generation (`/admin/payroll`)**: Create and manage weekly and monthly payroll cycles with batch summary cards (`Total Gross`, `Total Deductions`, `Net Payout`).
- **Adjustments & Overtime Multipliers**: Granular addition of custom bonuses, performance incentives, overtime multipliers, and tax/advance deductions.
- **Encrypted Bank Vault (`CandidateBankDetailsModal`)**: Store and update candidate banking details (Account Number, IFSC / SWIFT Code, Bank Name, UPI ID).
- **One-Click Payslip Generation (`PayslipModal`)**: Interactive candidate payslips with full earnings/deductions breakdown and print-ready `@media print` A4 PDF layouts.
- **Direct Payout Settlement**: Mark payouts as `Settled`, log payment transaction reference numbers, and archive historical settlement receipts.

### 8. Darion Meet — HD Video Conferencing & Cloud Recording Sync
- **Meeting Room Engine (`/meet/[roomId]`)**: Low-latency video calling and screen sharing powered by WebRTC.
- **Lobby & Admission Controls (`LobbyView`, `HostControlsModal`)**: Host controls for admitting guests, muting participants, and locking rooms.
- **Interactive Collaboration**: In-room chat, shared collaborative meeting notes (`MeetingSidebar`), and live floating emoji reactions (`FloatingReactions`).
- **Google Drive Recording Synchronization**: Automatic background synchronization of meeting recordings to Google Drive via Google Drive API (`googleapis`, Service Account / OAuth2 credentials).
- **Beta Access Control Engine (`MEETS_BETA_ALLOWED_EMAILS`, `NEXT_PUBLIC_ENABLE_MEETS_ALL`)**: Granular beta flagging allowing selective rollout of meeting features to specific candidate emails.

### 9. Candidate Feedback & 360 Performance / Inquiry Hub
- **Two-Way Structured Communication (`/candidate/feedback`, `/admin/feedback`)**: Candidates report workplace concerns, technical blockers, shift feedback, or facility inquiries.
- **Categorization & Urgency Flags**: Tag feedback by category (`Technical`, `Operations`, `Payroll`, `General`) and urgency (`Low`, `Medium`, `High`, `Critical`).
- **Administrative Resolution Pipeline**: Admins reply directly to feedback threads, update resolution status (`Open`, `In-Review`, `Resolved`), and maintain audit records.

### 10. Real-Time In-App Notification Center
- **Centralized Notification Drawer (`NotificationDrawer.tsx`, `NotificationBell.tsx`)**: Real-time notification hub accessible across all candidate and admin pages.
- **Real-Time Supabase WebSocket Subscriptions**: Instant alerts pushed on shift approvals, leave status changes, task feedback, payroll settlements, and meeting invites.
- **Badge Counters & Mark-as-Read**: Dynamic unread counter badges and one-click "Mark All as Read" functionality.

### 11. Weekly Timesheet Matrix & BI Reporting Suite
- **Interactive Monday–Sunday Matrix (`/admin/timesheet`)**: Dynamic weekly grid mapping daily hours, shift counts, and calculated earnings in `Asia/Kolkata` (IST).
- **Week-by-Week Navigation**: Easy weekly date range picker with automated ISO week calculation and aggregated workforce totals.
- **One-Click CSV Export (`exportCsv.ts`)**: Export comprehensive attendance and payroll datasets directly to CSV.
- **Printable A4 Reports**: Fully formatted `@media print` CSS layout for printing official physical timesheets and compliance records.

### 12. Darion Verify Digital Credential Engine
- **Tamper-Proof Verification Tokens**: Scannable QR code verification tokens issued on digital ID badges.
- **Credential Resolver API (`/api/verify-redirect`)**: Secure server-side redirect resolver verifying employee status and credential validity.
- **Audit Logging**: Comprehensive database logging of verification scans, IP addresses, geo-location, user-agents, and employee profile updates.

---

## 🛠️ System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Clients["Enterprise Client Interfaces"]
        AdminApp["Admin Portal (/admin)"]
        CandidateApp["Candidate Portal (/candidate)"]
        MeetRoom["Darion Meet Room (/meet/:roomId)"]
    end

    subgraph NextServer["Next.js 16 Full-Stack Layer"]
        Middleware["SSR Auth Middleware\n(Token & RBAC Guard)"]
        ServerActions["Server Actions\n(Admin, Attendance, Payroll, Tasks, Meets)"]
        RouteHandlers["API Route Handlers\n(/api/verify-redirect, /auth/callback)"]
    end

    subgraph SupabaseCloud["Supabase Managed Cloud Infrastructure"]
        PostgresDB[("PostgreSQL 15+\n(Row Level Security & Functions)")]
        RealtimeSockets["Supabase Realtime\n(PostgreSQL CDC WebSockets)"]
        StorageBuckets["Supabase Storage\n(avatars, employee-photos)"]
        AuthEngine["Supabase Auth Engine\n(JWT, Sessions, TOTP MFA)"]
    end

    subgraph ExternalServices["External Cloud Integrations"]
        GoogleDrive["Google Drive API\n(Meeting Recordings Sync)"]
        VerifyApp["Darion Verify Portal\n(Badge Scanning & Credential Checks)"]
    end

    Clients -->|HTTPS Requests| Middleware
    Middleware -->|Authorized Session| NextServer
    NextServer -->|Server Actions & RPCs| PostgresDB
    NextServer -->|Admin Auth Operations| AuthEngine
    PostgresDB -->|CDC Triggers| RealtimeSockets
    RealtimeSockets -->|Push Events| Clients
    NextServer -->|Upload Media| StorageBuckets
    NextServer -->|Background Sync| GoogleDrive
    Clients -->|Credential QR Checks| VerifyApp
```

### Core Technology Stack

| Layer | Technology | Details / Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.3.0** | App Router, Server Actions, Route Handlers, Turbopack |
| **Frontend Core** | **React 19.2.8** & **TypeScript 5** | Strict TypeScript typings, React 19 hooks and transitions |
| **Database** | **Supabase PostgreSQL 15+** | Row Level Security (RLS), Partial Indexes, Triggers, RPCs |
| **Authentication** | **Supabase Auth & SSR** | `@supabase/ssr` (v0.12.4), TOTP MFA, Secure HTTP Cookies |
| **File Storage** | **Supabase Storage** | Public & authenticated buckets (`avatars`, `employee-photos`) |
| **Styling** | **Tailwind CSS 4 & Vanilla CSS** | Material Design 3 design tokens, responsive CSS variables |
| **Icons & QR** | **Lucide React & react-qr-code** | Iconography and instant client-side QR generation |
| **Cloud Storage Sync** | **Google APIs (`googleapis`)** | Google Drive API meeting recording background synchronization |
| **Timezone Engine** | **`Asia/Kolkata` (IST)** | Standardized time computations across matrices & server actions |

---

## 📂 Project Directory Structure

```
Attendance/
├── src/
│   ├── app/
│   │   ├── actions/                  # Next.js Server Actions
│   │   │   ├── admin.ts              # Roster management, candidate editing, approvals
│   │   │   ├── admin-reset.ts        # Admin password & MFA reset actions
│   │   │   ├── attendance.ts         # Clock in, clock out, break tracking
│   │   │   ├── auth.ts               # Login, MFA verification, password change
│   │   │   ├── feedback.ts           # Feedback submissions, inquiries, resolution
│   │   │   ├── forgot-password.ts    # Self-service password reset requests
│   │   │   ├── leaves.ts             # Leave requests, balance tracking, approvals
│   │   │   ├── meet.ts               # Meeting room creation, participants, recording sync
│   │   │   ├── notifications.ts      # In-app notification creation & read management
│   │   │   ├── overshift.ts          # Overshift requests submission and handling
│   │   │   ├── payroll.ts            # Payroll runs, payslip generation, bank details
│   │   │   ├── shift.ts              # Shift templates, roster assignments, swap requests
│   │   │   └── tasks.ts              # Daily task submissions, grading, performance feedback
│   │   ├── admin/                    # Admin Portal Pages
│   │   │   ├── attendance/           # Shift approval log, active sessions & CSV export
│   │   │   ├── candidates/           # Candidate roster, photo upload & settings
│   │   │   ├── feedback/             # Candidate feedback review & inquiry hub
│   │   │   ├── leaves/               # PTO & leave request approval pipeline
│   │   │   ├── meets/                # Video conference rooms & recording logs
│   │   │   ├── payroll/              # Payroll periods, payslips & settlement hub
│   │   │   ├── profile/              # Admin personal profile & settings
│   │   │   ├── reset-requests/       # Password & MFA reset request queues
│   │   │   ├── security/             # Security management & access control
│   │   │   ├── shifts/               # Shift templates & weekly roster planner
│   │   │   ├── tasks/                # Daily task submissions review & score grading
│   │   │   └── timesheet/            # Weekly Monday-Sunday timesheet matrix
│   │   ├── candidate/                # Candidate Portal Pages
│   │   │   ├── attendance/           # Shift history, filters & SVG charts
│   │   │   ├── feedback/             # Submit feedback, workplace inquiries & reviews
│   │   │   ├── leaves/               # Apply for leave, view PTO balance & status
│   │   │   ├── meets/                # Join meeting rooms & view recorded sessions
│   │   │   ├── payroll/              # View payslips, monthly earnings & bank info
│   │   │   ├── profile/              # Personal info, avatar zoom, TOTP MFA setup
│   │   │   └── tasks/                # Submit daily task reports & view scores
│   │   ├── meet/
│   │   │   └── [roomId]/             # Full-screen WebRTC video meeting room
│   │   ├── api/
│   │   │   └── verify-redirect/      # Darion Verify credential resolver
│   │   ├── auth/callback/            # Supabase Auth OAuth/email callback handler
│   │   ├── force-change-password/    # Mandatory initial password change portal
│   │   ├── forgot-password/          # Request password reset portal
│   │   ├── reset-password/           # Reset password submission portal
│   │   ├── login/                    # Login portal with MFA challenge step
│   │   ├── layout.tsx                # Root layout & font configurations
│   │   └── globals.css               # Material 3 CSS variables & utility classes
│   ├── components/
│   │   ├── admin/                    # Admin UI components
│   │   │   ├── attendance/           # ActiveSessionsCard, EditShiftModal, ManualShiftModal, Timer modals
│   │   │   ├── candidates/           # CandidateCard, AddCandidateModal, EditCandidateModal
│   │   │   ├── feedback/             # AdminFeedbackClient, MobileAdminFeedback
│   │   │   ├── leaves/               # AdminLeavesClient, MobileAdminLeaves
│   │   │   ├── meets/                # AdminMeetsClient, MeetingList, RecordingSyncModal
│   │   │   ├── payroll/              # AdminPayrollClient, PayslipModal, BatchPayrollModal, SettlePaymentModal
│   │   │   ├── shifts/               # AdminShiftsClient, ShiftTemplateModal, AssignShiftModal
│   │   │   ├── tasks/                # AdminTasksClient, TaskFeedbackModal
│   │   │   └── timesheet/            # TimesheetTable, TimesheetSummaryCards
│   │   ├── candidate/                # Candidate UI components
│   │   │   ├── leaves/               # CandidateLeavesClient, LeaveRequestModal
│   │   │   ├── tasks/                # CandidateTasksClient, TaskEntryModal
│   │   │   ├── WorkStatusCard.tsx    # Live shift clock, timer counter, breaks & overshifts
│   │   │   ├── CandidatePayrollClient.tsx # Candidate payslip viewer & earnings dashboard
│   │   │   ├── CandidateFeedbackClient.tsx# Feedback submission forms & dialogs
│   │   │   └── AttendanceTable.tsx   # Filterable attendance logs & SVG metrics
│   │   ├── meet/                     # Meeting room UI components
│   │   │   ├── MeetingStage.tsx      # Video grid & active speaker stage
│   │   │   ├── MeetingControls.tsx   # Mic, Camera, Screen share, Leave controls
│   │   │   ├── MeetingSidebar.tsx    # In-room chat, attendees & collaborative notes
│   │   │   ├── LobbyView.tsx         # Participant lobby & waiting room
│   │   │   └── FloatingReactions.tsx # Live floating emoji reactions
│   │   ├── notifications/            # Notification UI
│   │   │   ├── NotificationBell.tsx  # Dynamic unread count bell icon
│   │   │   └── NotificationDrawer.tsx# Slide-over real-time notification drawer
│   │   └── ui/                       # Reusable UI primitives
│   │       ├── Button.tsx            # Styled Material 3 button with variants
│   │       ├── Card.tsx              # Surface elevation container
│   │       ├── Dialog.tsx            # Accessible modal dialog primitive
│   │       ├── DynamicSidebar.tsx    # Role-aware responsive navigation sidebar
│   │       ├── LiveTabTitle.tsx      # Browser tab title clock synchronizer
│   │       ├── ProfileAvatarZoom.tsx # High-resolution avatar zoom inspector
│   │       ├── PunctualityBadge.tsx  # Color-coded punctuality status indicator
│   │       ├── RealtimeAttendanceListener.tsx # Supabase CDC WebSocket listener
│   │       ├── Snackbar.tsx          # Toast notification feedback system
│   │       └── TextField.tsx         # Outlined Material 3 input field
│   └── lib/
│       ├── meet/                     # Meeting room helpers, Google Drive sync & beta flags
│       ├── supabase/                 # Supabase client, server action, & middleware creators
│       └── utils/                    # Payroll math, punctuality, CSV export & date helpers
├── supabase/
│   └── migrations/                   # 24 Complete SQL migration files
├── .env.example                      # Comprehensive environment template
├── create-admin.js                   # Automated admin account provisioning script
├── package.json                      # Project dependencies and npm scripts
└── tsconfig.json                     # TypeScript strict configuration
```

---

## 🗄️ Database Schema & Migrations Reference (24 Migrations)

All database schemas, RLS policies, triggers, and helper functions are version-controlled under `supabase/migrations/`:

| # | Migration File | Purpose & Tables Created / Modified |
| :---: | :--- | :--- |
| **01** | `001_initial_schema.sql` | Creates `profiles` table, `handle_new_user` trigger, and `is_admin()` `SECURITY DEFINER` function. |
| **02** | `002_attendance_schema.sql` | Creates `attendance` table, `unique_active_attendance_per_user` partial index, and initial RLS policies. |
| **03** | `003_overshift_schema.sql` | Creates `overshift_requests` table, timestamps, and candidate overtime policies. |
| **04** | `004_forgot_password.sql` | Creates `password_reset_requests` table, status checks, and `request_password_reset()` RPC. |
| **05** | `20260813100000_fix_admin.sql` | Hardens admin RLS policies across profiles and attendance to eliminate infinite recursion. |
| **06** | `20260813110000_password_changed.sql` | Adds `password_changed` boolean flag for mandatory candidate initial password changes. |
| **07** | `20260813110001_final_schema.sql` | Adds `hourly_rate`, `break_start_time`, `break_duration_seconds`, `approval_status`, `rejection_reason`, and `payout_amount`. |
| **08** | `20260813160000_mfa_reset_requests.sql` | Creates `mfa_reset_requests` table and administrative review policies. |
| **09** | `20260813170000_add_overshift_type.sql` | Adds `request_type` (`now` vs `later`) to overshift requests and drops legacy unique constraint. |
| **10** | `20260813180000_add_profile_info_and_storage.sql` | Adds `avatar_url`, `phone_number`, `address`, `id_number` to profiles; creates `avatars` storage bucket. |
| **11** | `20260813190000_darion_verify_schema.sql` | Creates Darion Verify tables (`employees`, `verification_logs`, `employee_activity_logs`) and `employee-photos` bucket. |
| **12** | `20260814000000_payroll_schema.sql` | Creates `payroll_periods`, `candidate_payrolls`, `bank_details`, `payout_transactions`. |
| **13** | `20260814000001_auto_daily_pay_calculation.sql` | Adds automatic daily wage calculation trigger (`calculate_daily_pay`) executing on attendance updates. |
| **14** | `20260814010000_shifts_schema.sql` | Creates shift scheduling engine (`shift_templates`, `shift_assignments`, `shift_swaps`). |
| **15** | `20260814020000_feedback_schema.sql` | Creates 360 feedback engine (`feedback_inquiries`, `feedback_messages`, `feedback_ratings`). |
| **16** | `20260814030000_leaves_schema.sql` | Creates PTO & leave engine (`leave_requests`, `leave_balances`, `leave_types`). |
| **17** | `20260814040000_meet_schema.sql` | Creates Darion Meet video engine (`meeting_rooms`, `meeting_participants`, `meeting_recordings`, `meeting_notes`). |
| **18** | `20260814050000_add_google_drive_to_recordings.sql` | Adds Google Drive cloud storage metadata fields and triggers to `meeting_recordings`. |
| **19** | `20260814060000_add_beta_flags.sql` | Adds beta feature flags and permissions (`meets_enabled_for_all`). |
| **20** | `20260818000000_admin_attendance_management.sql` | Adds admin attendance adjustment capabilities (`modified_by_admin`, `admin_notes`). |
| **21** | `20260818010000_auto_cutoff_punctuality.sql` | Adds punctuality status classification (`punctuality_status`) and automated boundary cutoffs. |
| **22** | `20260818020000_fix_mfa_reset_requests_fk.sql` | Hardens foreign key references and cascade rules on `mfa_reset_requests`. |
| **23** | `20260818030000_notifications_schema.sql` | Creates real-time `notifications` table, delivery status tracking, and notification triggers. |
| **24** | `20260819000000_daily_tasks_schema.sql` | Creates daily task reporting engine (`daily_task_submissions`, `daily_task_items`, admin score grading). |

### Applying Database Migrations

#### Option 1: Supabase CLI (Recommended)
```bash
npx supabase db push
```

#### Option 2: Supabase SQL Editor
Open the Supabase Dashboard SQL Editor and execute the SQL scripts sequentially from `supabase/migrations/001_initial_schema.sql` through `supabase/migrations/20260819000000_daily_tasks_schema.sql`.

---

## ⚙️ Environment Variables Configuration

Create a `.env.local` file in the project root based on `.env.example`:

```env
# ------------------------------------------------------------------------------
# 1. Supabase Public Client Credentials (Required)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# ------------------------------------------------------------------------------
# 2. Supabase Server-Side Admin Key (Required for Server Actions & API)
# ------------------------------------------------------------------------------
# Bypasses RLS on the server for user provisioning and admin operations.
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ------------------------------------------------------------------------------
# 3. Application URLs (Required)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_VERIFY_APP_URL=https://darion-verify.vercel.app

# ------------------------------------------------------------------------------
# 4. Darion Meet & Feature Flags (Optional)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_ENABLE_MEETS_ALL=false
MEETS_BETA_ALLOWED_EMAILS=pavan@darion.in,admin@darion.in

# ------------------------------------------------------------------------------
# 5. Google Drive API Integration for Meeting Recordings (Optional)
# ------------------------------------------------------------------------------
GOOGLE_SERVICE_ACCOUNT_JSON=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_DRIVE_FOLDER_ID=
```

> ⚠️ **Security Notice**: `SUPABASE_SERVICE_ROLE_KEY` and Google Cloud Private Keys must NEVER be committed to version control or exposed to client-side bundles.

---

## 👥 Initial Provisioning & Setup

### 1. Provision Admin Account
Run the automated admin provisioning script:
```bash
node create-admin.js
```
Alternatively, create an admin user in the Supabase Auth dashboard and ensure their profile record in `public.profiles` has:
```sql
UPDATE public.profiles 
SET role = 'admin', password_changed = TRUE 
WHERE email = 'your-admin@example.com';
```

### 2. Provision Candidate Accounts
Create candidate accounts directly through the **Admin Portal** at `/admin/candidates`:
1. The system creates the user in Supabase Auth via `createAdminClient()`.
2. Automatically inserts the linked record in `public.profiles` with `role = 'candidate'` and `password_changed = false`.
3. Sets their assigned `hourly_rate`.
4. Prompts the candidate to set a new password on their first login at `/force-change-password`.

---

## 💻 Local Development & Quality Assurance Suite

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Verification & Code Quality Suite
Run the full quality inspection suite before committing or deploying changes:

```bash
# 1. TypeScript Strict Type Verification
npm run type-check

# 2. ESLint Static Code Analysis
npm run lint

# 3. Production Build Validation
npm run build
```

---

## ☁️ Production Deployment (Vercel & Supabase)

This platform is optimized for zero-configuration deployment on Vercel:

### 1. Push Repository to Git
```bash
git add .
git commit -m "Deploy enterprise release"
git push origin main
```

### 2. Configure Vercel Project
1. Navigate to the [Vercel Dashboard](https://vercel.com) -> **New Project**.
2. Select your repository and set the Framework Preset to **Next.js**.
3. Under **Environment Variables**, add all keys from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (e.g., `https://workforce.darion.in`)
   - `NEXT_PUBLIC_VERIFY_APP_URL`
   - Google Drive & Beta flags (if enabled).

### 3. Configure Supabase Authentication Redirect URLs
In Supabase Dashboard -> **Authentication** -> **URL Configuration**:
- **Site URL**: `https://workforce.darion.in`
- **Redirect URLs**:
  - `https://workforce.darion.in/auth/callback`
  - `https://workforce.darion.in/reset-password`
  - `http://localhost:3000/auth/callback` (for local development)

---

## 🔒 Enterprise Security, Compliance & Data Guarantees

- **Zero-Trust Clock Integrity**: All shift start, pause, resume, and completion timestamps are computed exclusively using PostgreSQL `NOW()` / Server Actions. Client-side device clocks are never trusted for payroll or attendance records.
- **Single Active Shift Invariant**: Enforced at the database level by a unique partial index `WHERE logout_time IS NULL`.
- **Recursion-Free Row Level Security**: Role checks utilize `SECURITY DEFINER` functions with fixed `search_path = public` to prevent infinite recursion loops and optimize query execution plans.
- **Strict Role Enforcement & SSR Guardrails**: Next.js Middleware inspects encrypted session cookies before routing requests, preventing candidates from accessing `/admin/*` and unauthenticated users from accessing protected views.
- **Service Key Isolation**: High-privilege admin actions (`createUser`, `mfa.admin.unenrollFactor`, `deleteUser`) are restricted strictly to isolated server-side action files using `createAdminClient()`.

---

## 📄 License & Commercial Support

This software is open-source and licensed under the **[GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE)**.

### Why AGPLv3?
- **Open-Source Guarantee**: Anyone modifying or hosting this software over a network is required to make their full source code available under the same license.
- **Community Protection**: Prevents closed-source proprietary clouds from encapsulating the software without contributing upstream improvements.

### 💼 Commercial & Enterprise Licensing
If your organization requires a proprietary license without copyleft obligations (e.g., embedding in closed-source SaaS ecosystems, customized enterprise hosting, or dedicated SLA support agreements), custom commercial licensing terms are available.

Contact: **Darion Workforce** (`dkindustrial.finance@gmail.com`)

---

© 2026 **Darion Workforce**. Released under the [GNU Affero General Public License v3.0](LICENSE).
