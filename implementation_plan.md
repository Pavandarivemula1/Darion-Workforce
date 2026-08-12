# Performance Optimization — Reduce Page Load Times

## Root Cause Analysis

I measured the **raw network latency** from your dev machine to Supabase's servers:

```
TCP connect:     878ms
TLS handshake:  1,734ms
First byte:     2,895ms
Total:          2,901ms   ← This is ONE HTTPS request
```

> [!CAUTION]
> **Each Supabase API call takes ~2-3 seconds from your local machine.** This is physical network latency — your dev machine → internet → Supabase servers (likely US/EU region) and back. No code change can make a 2,900ms network round-trip happen in 10ms.

### Current Request Flow (per page load)

```
Browser → Next.js
  │
  ├─ proxy.ts (middleware):
  │   └─ supabase.auth.getUser()  ← 2,900ms HTTPS call #1
  │
  └─ Server Component (application-code):
      ├─ supabase.auth.getUser()  ← 2,900ms HTTPS call #2 (DUPLICATE!)
      ├─ supabase.from('profiles').select()  ← 2,900ms HTTPS call #3
      └─ supabase.from('attendance').select() ← 2,900ms HTTPS call #4
```

**Total: 4 sequential HTTPS calls × ~2,900ms = ~8-12 seconds**

Even with `Promise.all()` parallelization, you still need at least 1 network call in proxy + 1 parallel batch in the page = ~6 seconds minimum.

---

## What Is Achievable

| Target | Realistic? | Explanation |
|:---|:---:|:---|
| proxy.ts: 10ms | ✅ **YES** | Local JWT cookie parsing — zero network calls |
| application-code: 10ms | ❌ **NO** | Database lives remotely; each query = ~2,900ms network |
| application-code: ~3,000ms | ✅ **YES** | 1 parallel batch of DB queries (current best case) |
| All routes: 10ms total | ❌ **Physically impossible** | Data lives on remote Supabase servers |

> [!IMPORTANT]
> **To achieve sub-100ms total page loads, the database must be co-located with the application server.** This means either:
> 1. **Deploy to Vercel** in the same region as your Supabase instance (both in `ap-south-1` Mumbai) — reduces each call from ~2,900ms to ~5-20ms
> 2. **Use a local PostgreSQL database** for development instead of the remote Supabase cloud instance

---

## Proposed Changes

### Phase A: Fix Proxy to True 0ms (no network calls)

The JWT parsing in `updateSession` currently falls back to `supabase.auth.getUser()` (a 2,900ms network call) when the local parse fails. I'll add debug logging to diagnose why, fix the cookie parsing, and **remove the fallback entirely** for authenticated page visits.

#### [MODIFY] [middleware.ts](file:///home/ubuntu/Documents/Docs/Attendance/src/lib/supabase/middleware.ts)
- Add `console.log` debugging to see actual cookie names/values at runtime
- Fix any cookie parsing issues discovered
- Remove the `createServerClient` fallback for authenticated routes (keep only for setting fresh cookies on login redirect)

---

### Phase B: Eliminate Duplicate `auth.getUser()` from All Server Components

Every page currently calls `await supabase.auth.getUser()` — another 2,900ms network call that **duplicates** what the proxy already did. Replace with the `getCurrentUserFast()` header-reading approach across ALL pages.

#### Files to modify (all follow the same pattern):

#### [MODIFY] [candidates/page.tsx](file:///home/ubuntu/Documents/Docs/Attendance/src/app/admin/candidates/page.tsx)
- Replace `supabase.auth.getUser()` with `getCurrentUserFast()`
- Parallelize the 3 sequential DB queries into `Promise.all()`

#### [MODIFY] [timesheet/page.tsx](file:///home/ubuntu/Documents/Docs/Attendance/src/app/admin/timesheet/page.tsx)
- Replace `supabase.auth.getUser()` with `getCurrentUserFast()`

#### [MODIFY] [admin/profile/page.tsx](file:///home/ubuntu/Documents/Docs/Attendance/src/app/admin/profile/page.tsx)
- Replace `supabase.auth.getUser()` with `getCurrentUserFast()`

#### [MODIFY] [candidate/page.tsx](file:///home/ubuntu/Documents/Docs/Attendance/src/app/candidate/page.tsx)
- Replace `supabase.auth.getUser()` with `getCurrentUserFast()`

#### [MODIFY] [candidate/attendance/page.tsx](file:///home/ubuntu/Documents/Docs/Attendance/src/app/candidate/attendance/page.tsx)
- Replace `supabase.auth.getUser()` with `getCurrentUserFast()`

#### [MODIFY] [candidate/profile/page.tsx](file:///home/ubuntu/Documents/Docs/Attendance/src/app/candidate/profile/page.tsx)
- Replace `supabase.auth.getUser()` with `getCurrentUserFast()`

---

### Phase C (Optional): Local PostgreSQL for Development

To truly get 10ms page loads during development, set up a local PostgreSQL + Supabase CLI for local development. Each query would take ~1-5ms instead of ~2,900ms.

---

## Expected Results After Phase A + B

| Route | Before | After (Local Dev) | After (Vercel + Same Region) |
|:---|:---:|:---:|:---:|
| proxy.ts | ~2,700ms | **< 1ms** | **< 1ms** |
| application-code | ~4,200ms | **~3,000ms** (1 parallel DB batch) | **~20-50ms** |
| **Total** | **~7,000ms** | **~3,000ms** | **~50-80ms** |

The ~3,000ms in local dev is the **irreducible network latency** to your remote Supabase instance. When deployed to Vercel in the same cloud region, it drops to ~50ms.

## Verification Plan

### Manual Verification
- Restart dev server, visit each admin and candidate page
- Confirm proxy.ts shows < 5ms in dev logs  
- Confirm application-code is reduced (only DB query latency remaining)
- Run `npm run type-check && npm run lint && npm run build` — 0 errors
