# Candidate Time Tracking System

A full-stack time-tracking application designed for **1 Admin** and **2 Candidates**, built with Next.js 16 (App Router), TypeScript, Supabase Auth & PostgreSQL Database with Row Level Security (RLS), and Material Design 3 UI aesthetics.

---

## 🚀 Features

### 🔐 Auth & Role-Based Access Control
- **Supabase Auth Integration**: Secure password-based authentication with persistent SSR session management using `@supabase/ssr`.
- **Role Isolation**: Strict separation between Admin (`/admin`) and Candidate (`/candidate`) portals.
- **Server-Side Authorization**: Route protection enforced at both Next.js Middleware and Server Component levels.

### ⏱️ Candidate Portal (`/candidate`)
- **Live Work Session**: Start Work & End Work with authoritative server-side timestamps (`NOW()`).
- **Real-Time Duration Counter**: Live updating shift duration counter (`03h 42m 12s`).
- **Active Session Enforcement**: PostgreSQL database unique partial index prevents candidate from starting multiple active shifts.
- **Attendance History (`/candidate/attendance`)**: Comprehensive attendance history with status badges (`Completed`, `Working`, `Incomplete`) and date range filters (*This Week*, *Last Week*, *This Month*, *Custom*).

### 🛡️ Admin Portal (`/admin`)
- **Real-Time Metrics Dashboard**: System stats showing Total Candidates, Active Shifts ("Working Now"), Today's Records, and Total Combined Hours.
- **Candidate Roster Management (`/admin/candidates`)**: View registered candidates, register new candidates (enforcing 2 candidate project limit), and dispatch password reset triggers.
- **System Attendance Log (`/admin/attendance`)**: Multi-criteria filtering by candidate, date preset, or custom date range.
- **Weekly Timesheet Matrix (`/admin/timesheet`)**: Monday through Sunday grid matrix aggregating candidate hours in `Asia/Kolkata` timezone.
- **Real Data CSV Export**: One-click export of actual database logs to CSV format.
- **Printable Weekly Report**: Styled `@media print` layout for weekly timesheets.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16.3.0 (App Router, Server Actions, Turbopack)
- **Language**: TypeScript 5 (Strict Mode)
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Design System**: Material Design 3 (Vanilla CSS variables, dynamic Light/Dark/System themes)
- **Icons**: Lucide React
- **Timezone**: `Asia/Kolkata`

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory (never commit `.env.local` to git):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Security Note**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or client-side code.

---

## 🗄️ Database Setup & Migrations

Execute the SQL migration scripts located in the `supabase/migrations/` folder in your Supabase SQL Editor:

1. **`supabase/migrations/001_initial_schema.sql`**
   - Creates `public.profiles` table linked to `auth.users(id)`.
   - Creates `handle_new_user` trigger for automatic profile creation.
   - Creates `public.is_admin(user_id)` SECURITY DEFINER helper function to prevent infinite RLS recursion.
   - Sets RLS policies on `profiles`.

2. **`supabase/migrations/002_attendance_schema.sql`**
   - Creates `public.attendance` table (`id`, `user_id`, `login_time`, `logout_time`, `created_at`).
   - Creates unique partial index `unique_active_attendance_per_user` (`WHERE logout_time IS NULL`) enforcing at most 1 active shift per candidate.
   - Sets RLS policies allowing candidates to read/insert/update only their own records, and admins to read all records.

---

## 👥 Initial User Provisioning

### 1. Create Admin Account
In your Supabase Auth Dashboard:
1. Create user `admin@example.com` with a secure password.
2. In the `profiles` table, set `role = 'admin'` for this user ID.

### 2. Create Candidate Accounts (Max 2)
Create 2 candidate users via the Admin Portal (`/admin/candidates`) or Supabase Dashboard with user metadata `role: 'candidate'`:
- `candidate1@example.com`
- `candidate2@example.com`

---

## 💻 Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Testing Commands

Run the full code quality test suite before deploying:

```bash
# 1. Strict TypeScript Type Check
npm run type-check

# 2. ESLint Code Quality Inspection
npm run lint

# 3. Next.js Production Build Validation
npm run build
```

---

## ☁️ Vercel Production Deployment Guide

This application is **Deployment-ready** for Vercel.

### Step-by-Step Deployment:
1. **Push Code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial release of Candidate Time Tracking System"
   git remote add origin https://github.com/your-username/attendance-app.git
   git push -u origin main
   ```

2. **Connect Project to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com) -> **Add New Project**.
   - Import your GitHub repository.

3. **Configure Environment Variables**:
   Add the following in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**:
   - Framework Preset: **Next.js**
   - Click **Deploy**. Vercel will automatically build and publish your application.

5. **Configure Supabase Redirect URLs**:
   In Supabase Dashboard -> **Authentication** -> **URL Configuration**:
   - Add your production Vercel domain (e.g., `https://your-app.vercel.app/auth/callback`).

---

## 🔒 Security Summary & Architecture Notes

- **Row Level Security (RLS)**: Enforced on all database tables (`profiles` and `attendance`).
- **Timestamp Integrity**: All shift login and logout timestamps are generated on the server via PostgreSQL `NOW()` / Server Actions.
- **Server Authorization**: Next.js Middleware and Server Page components double-check user role to block unauthorized access to `/admin` routes.
- **Timezone**: All week boundaries and daily matrix columns calculate Monday-Sunday shifts in `Asia/Kolkata` time.

---

## 📌 Known Limitations

- **Candidate Limit**: Enforces a maximum limit of 2 candidates per project requirement.
- **Single Active Shift**: Candidate must end their active shift before starting a new shift.
