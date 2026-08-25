import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getShiftEndTimeForSession, DEFAULT_FALLBACK_SHIFT, ShiftConfig } from '@/lib/utils/shift'

// Initialize a Supabase admin client to bypass RLS for background cron jobs
// Ensure these environment variables are set in your production environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function GET(request: Request) {
  // Optional: Verify a secret cron key to prevent unauthorized execution
  const authHeader = request.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Server configuration missing service role key' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Fetch all active sessions
    const { data: activeSessions, error: sessionError } = await supabase
      .from('attendance')
      .select('id, user_id, login_time, break_start_time, break_duration_seconds')
      .is('logout_time', null)

    if (sessionError) throw sessionError

    if (!activeSessions || activeSessions.length === 0) {
      return NextResponse.json({ message: 'No active sessions to process' })
    }

    // Process each active session
    let endedCount = 0
    const now = new Date()
    const nowMs = now.getTime()

    for (const session of activeSessions) {
      // Fetch user's assigned shift and profile for hourly rate
      const { data: profile } = await supabase
        .from('profiles')
        .select('shift_id, hourly_rate, shifts(*)')
        .eq('id', session.user_id)
        .single()

      let assignedShift: ShiftConfig = DEFAULT_FALLBACK_SHIFT
      if (profile?.shifts) {
        assignedShift = profile.shifts as unknown as ShiftConfig
      }

      if (!assignedShift.auto_logout_enabled) {
        continue // Skip if auto logout is disabled for this shift
      }

      const endTime = getShiftEndTimeForSession(session.login_time, assignedShift)

      // Check if current time is past the shift's scheduled end time
      if (nowMs >= endTime.getTime()) {
        // Calculate final break duration
        let finalBreakSeconds = session.break_duration_seconds || 0
        if (session.break_start_time) {
          const breakStart = new Date(session.break_start_time).getTime()
          // Ensure we don't calculate break time beyond the shift end time
          const effectiveBreakEnd = Math.min(nowMs, endTime.getTime())
          const elapsedSec = Math.max(0, Math.floor((effectiveBreakEnd - breakStart) / 1000))
          finalBreakSeconds += elapsedSec
        }

        // Calculate auto daily payout
        const hourlyRate = Number(profile?.hourly_rate || 0)
        const loginDate = new Date(session.login_time)
        // Gross MS is clamped to the actual shift end time since it's an auto-cutoff
        const grossMs = Math.max(0, endTime.getTime() - loginDate.getTime())
        const netMs = Math.max(0, grossMs - finalBreakSeconds * 1000)
        const netHours = netMs / (1000 * 60 * 60)
        const autoDailyPayout = Math.round(netHours * hourlyRate * 100) / 100

        // Auto end the shift at the scheduled end time
        const { error: updateError } = await supabase
          .from('attendance')
          .update({
            logout_time: endTime.toISOString(),
            break_start_time: null,
            break_duration_seconds: finalBreakSeconds,
            payout_amount: autoDailyPayout,
            payment_status: 'unpaid',
            is_auto_cutoff: true // Flag that this was an automated cutoff
          })
          .eq('id', session.id)

        if (!updateError) {
          endedCount++
        } else {
          console.error(`Failed to auto-end session ${session.id}:`, updateError)
        }
      }
    }

    return NextResponse.json({
      message: `Cron job completed successfully`,
      processed: activeSessions.length,
      ended: endedCount
    })
  } catch (error: any) {
    console.error('Error in auto-logout cron:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
