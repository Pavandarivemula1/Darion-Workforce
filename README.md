# Darion Workforce Time Tracking System (v2.4)

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.0-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%7C%20Auth%20%7C%20Storage%20%7C%20Realtime-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-CSS%204-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red)]()

An enterprise-grade, full-stack workforce and shift tracking platform built for high-reliability attendance monitoring, candidate roster administration, automated payroll calculation, and digital credential verification. Powered by Next.js 16 (App Router), React 19, Supabase (PostgreSQL with Row Level Security, Auth, Storage, and Realtime), and a Material Design 3 design system.

---

## 📑 Table of Contents

- [Key Highlights](#-key-highlights)
- [Comprehensive Feature Matrix](#-comprehensive-feature-matrix)
  - [1. Security, MFA & Access Control](#1-security-mfa--access-control)
  - [2. Candidate Portal (`/candidate`)](#2-candidate-portal-candidate)
  - [3. Admin Portal (`/admin`)](#3-admin-portal-admin)
  - [4. Darion Verify Credential Engine](#4-darion-verify-credential-engine)
- [System Architecture & Tech Stack](#-system-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Environment Configuration](#-environment-configuration)
- [Database Schema & Migrations](#-database-schema--migrations)
- [Initial Provisioning & Setup](#-initial-provisioning--setup)
- [Local Development & Testing](#-local-development--testing)
- [Production Deployment (Vercel)](#-production-deployment-vercel)
- [Security & Data Integrity Guarantees](#-security--data-integrity-guarantees)

---

## 🌟 Key Highlights

- **⚡ Sub-10ms SSR Cold Start & Cookie Parsing**: High-performance SSR authentication middleware leveraging native JWT extraction and base64 parsing without blocking round-trips.
- **🛡️ Two-Factor Authentication (TOTP MFA)**: Built-in authenticator app enrollment (Google Authenticator, Authy) with QR code generator, recovery codes, and an administrative MFA reset approval queue.
- **⏱️ Automated Shift Timer Logic (v2.4)**: Authoritative server timestamps, live tab title countdown, automated shift bounds (6:00 AM – 6:00 PM IST), break duration logging, and single-active-session PostgreSQL constraints.
- **🚀 Dynamic Overshift Management**: Multi-type overshift workflows (Immediate "Now" vs Scheduled "Later") with instant candidate status feedback and admin review.
- **📊 Real-Time KPI Dashboards & Analytics**: Live Supabase Realtime channel subscriptions reflecting attendance state changes across all devices without page reloads.
- **💵 Automated Timesheet Matrix & Payroll Engine**: Interactive Monday–Sunday matrix calculating candidate hours and wage payouts in `Asia/Kolkata` timezone with one-click CSV export and printable A4 reports.
- **🪪 Digital Credential Verification (Darion Verify)**: Scannable QR code verification tokens, activity audit trails, and instant status verification APIs.

---

## 🚀 Comprehensive Feature Matrix

### 1. Security, MFA & Access Control
- **Supabase SSR Session Engine**: Secure password-based authentication with persistent SSR session management using `@supabase/ssr`.
- **Role-Based Isolation (RBAC)**: Strict role separation between Admin (`/admin`) and Candidate (`/candidate`) routes enforced in Next.js Middleware and Server Components.
- **First-Login Mandatory Password Change**: Candidate accounts default to temporary access requiring an immediate secure password update at `/force-change-password`.
- **TOTP Multi-Factor Authentication**: Candidates can enroll authenticator apps at `/candidate/profile` with live QR code generation via `react-qr-code`.
- **Administrative Reset Queue**: Dedicated hub at `/admin/reset-requests` and `/admin/security` to approve or reject self-service password reset and MFA unenrollment requests.

### 2. Candidate Portal (`/candidate`)
- **Live Work Session Controller**: Authoritative server-side `NOW()` shift initiation and termination.
- **Active Shift Live Timer**: Dynamic shift duration counter displaying live elapsed time (`03h 42m 12s`) with active browser tab title updates (`🟢 Working... - 03h 42m`).
- **Automated Shift Window**: Built-in logic warning users before shift boundaries and enforcing standard working windows.
- **Break Time Tracker**: Track lunch and rest intervals (`break_start_time`, `break_duration_seconds`) with auto-deductions.
- **Overshift Request System**: Submit requests for extra working hours either immediately ("Now") or pre-scheduled ("Later").
- **Attendance History & Analytics (`/candidate/attendance`)**:
  - Filterable by date presets (*This Week*, *Last Week*, *This Month*, *Custom Date Range*).
  - Status badges: `Working`, `Completed`, `Incomplete`, `Pending Approval`, `Approved`, `Rejected`.
  - Responsive SVG analytics charts showing hours worked and daily trends.
  - Optimized mobile card layout for small screen viewports (320px+).
- **Candidate Profile (`/candidate/profile`)**:
  - Personal info management (Phone, Address, ID Number).
  - Profile photo preview with interactive zoom dialog (`ProfileAvatarZoom`).
  - Hourly rate and employment details inspection.

### 3. Admin Portal (`/admin`)
- **Real-Time KPI Dashboard (`/admin`)**:
  - Live metric cards: Total Candidates, Working Now, Today's Records, Total Hours, Pending Approvals, Pending Overshifts.
  - Interactive SVG analytics charts displaying workforce distribution and hour trends.
  - `RealtimeAttendanceListener` keeping stats synchronized across tabs in real-time.
- **Candidate Roster Management (`/admin/candidates`)**:
  - Candidate roster cards with avatar uploads to Supabase Storage (`avatars` bucket).
  - Add candidate modal enforcing 2-candidate project capacity.
  - Edit candidate profile records (Name, Phone, Address, ID, Hourly Rate).
  - Direct Admin Password Reset and MFA Factor Unenrollment triggers.
- **Attendance Approval & Payroll Engine (`/admin/attendance`)**:
  - Multi-criteria filtering by candidate, date presets, or custom range.
  - Shift Approval / Rejection workflow with customizable rejection feedback notes.
  - Automated payout calculation (`hours * hourly_rate`).
  - One-click CSV Export of actual database attendance logs.
- **Weekly Timesheet Matrix (`/admin/timesheet`)**:
  - Monday through Sunday weekly grid view with week-by-week selector.
  - Aggregated candidate daily hours, weekly totals, and calculated payouts in `Asia/Kolkata` timezone.
  - Styled `@media print` A4 printable timesheet layout.
- **Security & Reset Portal (`/admin/reset-requests`)**:
  - Review, approve, and resolve pending password reset requests and MFA reset requests.

### 4. Darion Verify Credential Engine
- **Verification Schema**: Dedicated PostgreSQL tables (`employees`, `verification_logs`, `employee_activity_logs`).
- **QR Code Verification**: Unique verification tokens for employee badges with verification redirect API (`/api/verify-redirect`).
- **Audit Logging**: Comprehensive logging of verification scans, IP addresses, and employee record updates.

---

## 🛠️ System Architecture & Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.3.0** | App Router, Server Actions, Route Handlers, Turbopack |
| **Frontend Core** | **React 19.2.8** & **TypeScript 5** | Strict TypeScript typings, React 19 hooks and transitions |
| **Database** | **Supabase PostgreSQL** | Row Level Security (RLS), Partial Indexes, Triggers, RPCs |
| **Authentication** | **Supabase Auth & SSR** | `@supabase/ssr` (v0.12.4), TOTP MFA, Secure HTTP Cookies |
| **File Storage** | **Supabase Storage** | Public & authenticated buckets (`avatars`, `employee-photos`) |
| **Styling** | **Tailwind CSS 4 & Vanilla CSS** | Material Design 3 design tokens, responsive CSS variables |
| **Icons & QR** | **Lucide React & react-qr-code** | Iconography and instant client-side QR generation |
| **Timezone** | **`Asia/Kolkata` (IST)** | Standardized time computations across matrices & server actions |

---

## 📂 Project Directory Structure

```
Attendance/
├── src/
│   ├── app/
│   │   ├── actions/                  # Server Actions (Admin, Auth, Attendance, Overshift)
│   │   │   ├── admin.ts              # Roster management, candidate editing, approvals
│   │   │   ├── admin-reset.ts        # Admin password & MFA reset actions
│   │   │   ├── attendance.ts         # Clock in, clock out, break tracking
│   │   │   ├── auth.ts               # Login, MFA verification, password change
│   │   │   ├── forgot-password.ts    # Password reset requests
│   │   │   └── overshift.ts          # Overshift requests submission and handling
│   │   ├── admin/                    # Admin portal pages
│   │   │   ├── attendance/           # Shift approval log & CSV export
│   │   │   ├── candidates/           # Roster, photo upload, candidate settings
│   │   │   ├── profile/              # Admin personal profile
│   │   │   ├── reset-requests/       # Password & MFA reset request queues
│   │   │   ├── security/             # Security management hub
│   │   │   └── timesheet/            # Weekly Monday-Sunday timesheet matrix
│   │   ├── api/                      # API Route Handlers
│   │   │   └── verify-redirect/      # Darion Verify credential resolver
│   │   ├── auth/callback/            # Supabase Auth OAuth/email callback handler
│   │   ├── candidate/                # Candidate portal pages
│   │   │   ├── attendance/           # Shift history, filters, SVG charts
│   │   │   └── profile/              # Personal info, avatar zoom, TOTP MFA setup
│   │   ├── force-change-password/    # Mandatory initial password change
│   │   ├── forgot-password/          # Request password reset portal
│   │   ├── reset-password/           # Reset password submission portal
│   │   ├── login/                    # Login portal with MFA challenge step
│   │   ├── layout.tsx                # Root layout & font configurations
│   │   └── globals.css               # Material 3 CSS variables & utility classes
│   ├── components/
│   │   ├── admin/                    # Admin UI components (Dashboard, Matrix, Layout)
│   │   ├── candidate/                # Candidate UI components (WorkStatusCard, Nav, Tables)
│   │   └── ui/                       # Reusable UI primitives (Button, Card, Dialog, TextField, DynamicSidebar, Snackbar)
│   └── lib/
│       ├── supabase/                 # Supabase client, server action, & middleware creators
│       └── utils/                    # CSV export, date formatters, math utilities
├── supabase/
│   └── migrations/                   # 11 Sequential SQL migration files
├── .env.example                      # Template environment variables
├── create-admin.js                   # Automated admin provisioning script
├── package.json                      # Project dependencies and npm scripts
└── tsconfig.json                     # TypeScript compiler settings
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the project root:

```env
# Supabase Public Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Supabase Admin / Service Role Key (Used exclusively by Server Actions & API routes)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_VERIFY_APP_URL=https://darion-verify.vercel.app
```

> ⚠️ **Security Warning**: `SUPABASE_SERVICE_ROLE_KEY` bypasses all Row Level Security policies. It must never be exposed to the client-side or committed to source control.

---

## 🗄️ Database Schema & Migrations

All database schemas, RLS policies, triggers, and helper functions are versioned under `supabase/migrations/`:

| Migration File | Purpose & Description |
| :--- | :--- |
| `001_initial_schema.sql` | Creates `profiles` table, `handle_new_user` trigger, and `is_admin()` SECURITY DEFINER function. |
| `002_attendance_schema.sql` | Creates `attendance` table, `unique_active_attendance_per_user` partial index, and initial RLS policies. |
| `003_overshift_schema.sql` | Creates `overshift_requests` table, timestamps, and RLS policies for candidate overtime requests. |
| `004_forgot_password.sql` | Creates `password_reset_requests` table, status checks, and `request_password_reset()` RPC. |
| `20260813100000_fix_admin.sql` | Hardens admin RLS policies across profiles and attendance. |
| `20260813110000_password_changed.sql` | Adds `password_changed` boolean flag for mandatory candidate password changes. |
| `20260813110001_final_schema.sql` | Unified master schema: adds `hourly_rate`, `break_start_time`, `break_duration_seconds`, `approval_status`, `rejection_reason`, and `payout_amount`. |
| `20260813160000_mfa_reset_requests.sql` | Creates `mfa_reset_requests` table and administrative review policies. |
| `20260813170000_add_overshift_type.sql` | Adds `request_type` (`now` vs `later`) to overshift requests and drops legacy unique constraint. |
| `20260813180000_add_profile_info_and_storage.sql` | Adds `avatar_url`, `phone_number`, `address`, `id_number` to profiles; creates `avatars` storage bucket. |
| `20260813190000_darion_verify_schema.sql` | Creates Darion Verify tables (`employees`, `verification_logs`, `employee_activity_logs`) and `employee-photos` bucket. |

### Applying Migrations

#### Option 1: Supabase CLI (Recommended)
```bash
npx supabase db push
```

#### Option 2: Supabase SQL Editor
Open the Supabase Dashboard SQL Editor and execute the SQL scripts sequentially from `supabase/migrations/`.

---

## 👥 Initial Provisioning & Setup

### 1. Provision Admin Account
Run the automated admin provisioning script:
```bash
node create-admin.js
```
Alternatively, create an admin user in the Supabase Auth dashboard and ensure their profile row in `public.profiles` has:
```sql
UPDATE public.profiles SET role = 'admin', password_changed = TRUE WHERE email = 'your-admin@example.com';
```

### 2. Provision Candidate Accounts (Max 2)
Create up to 2 candidate accounts directly through the **Admin Portal** at `/admin/candidates`. The system automatically:
1. Provisions the user in Supabase Auth.
2. Creates their linked record in `public.profiles` with `role = 'candidate'` and `password_changed = false`.
3. Sets their assigned `hourly_rate`.
4. Prompts the candidate to set a new password on their first login.

---

## 💻 Local Development & Testing

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
Run the full quality inspection suite before committing changes:

```bash
# 1. TypeScript Strict Type Verification
npm run type-check

# 2. ESLint Static Code Analysis
npm run lint

# 3. Production Build Validation
npm run build
```

---

## ☁️ Production Deployment (Vercel)

This project is optimized for zero-configuration deployment on Vercel:

1. **Push Repository to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy release"
   git push origin main
   ```

2. **Import into Vercel**:
   - Navigate to [Vercel Dashboard](https://vercel.com) -> **New Project**.
   - Select your repository.
   - Set Framework Preset: **Next.js**.

3. **Configure Environment Variables**:
   Add the following in the Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (e.g., `https://your-app.vercel.app`)
   - `NEXT_PUBLIC_VERIFY_APP_URL`

4. **Update Supabase Redirect URLs**:
   In Supabase Dashboard -> **Authentication** -> **URL Configuration**:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback` and `https://your-app.vercel.app/reset-password`

---

## 🔒 Security & Data Integrity Guarantees

- **Authoritative Server Timestamps**: Shift start, shift end, and break timestamps are generated exclusively via PostgreSQL `NOW()` / Server Actions. Client-side clocks are never trusted for payroll or attendance records.
- **Single Active Shift Invariant**: Enforced at the database level by a unique partial index `WHERE logout_time IS NULL`.
- **Recursion-Free RLS**: Admin checks utilize a `SECURITY DEFINER` function (`is_admin()`) with `SET search_path = public` to prevent infinite policy recursion loops.
- **Strict Role Enforcement**: Middleware inspects session tokens before routing requests, preventing candidates from accessing `/admin/*` and unauthenticated users from accessing protected views.
- **Service Key Isolation**: High-privilege admin actions (`createUser`, `mfa.admin.unenrollFactor`) are confined strictly to server-side action files using `createAdminClient()`.

---

© 2026 Darion Workforce. All rights reserved.
