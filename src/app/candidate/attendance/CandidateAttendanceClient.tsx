'use client'

import React, { useState, useMemo } from 'react'
import { AttendanceFilters } from '@/components/candidate/AttendanceFilters'
import { AttendanceTable, AttendanceItem } from '@/components/candidate/AttendanceTable'
import { Card } from '@/components/ui/Card'
import { Clock, CalendarRange, CheckCircle, IndianRupee } from 'lucide-react'
import { formatDurationMs } from '@/lib/utils/timesheet'

import { ShiftConfig } from '@/lib/utils/shift'

export interface CandidateAttendanceClientProps {
  allRecords: AttendanceItem[]
  assignedShift?: ShiftConfig
  initialFilter?: string
}

export const CandidateAttendanceClient: React.FC<CandidateAttendanceClientProps> = ({
  allRecords,
  assignedShift,
  initialFilter = 'this_week',
}) => {
  const [filter, setFilter] = useState<string>(initialFilter)
  const [customStart, setCustomStart] = useState<string>('')
  const [customEnd, setCustomEnd] = useState<string>('')

  // Instant in-memory date range filtering (< 1ms execution)
  const filteredRecords = useMemo(() => {
    if (!allRecords || allRecords.length === 0) return []
    if (filter === 'all') return allRecords

    const now = new Date()
    let rangeStart: Date | null = null
    let rangeEnd: Date | null = null

    if (filter === 'this_week') {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1)
      rangeStart = new Date(now.setDate(diff))
      rangeStart.setHours(0, 0, 0, 0)
    } else if (filter === 'last_week') {
      const day = now.getDay()
      const diff = now.getDate() - day - 6
      rangeStart = new Date(now.setDate(diff))
      rangeStart.setHours(0, 0, 0, 0)
      rangeEnd = new Date(rangeStart)
      rangeEnd.setDate(rangeEnd.getDate() + 6)
      rangeEnd.setHours(23, 59, 59, 999)
    } else if (filter === 'this_month') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (filter === 'custom' && (customStart || customEnd)) {
      if (customStart) rangeStart = new Date(customStart)
      if (customEnd) {
        rangeEnd = new Date(customEnd)
        rangeEnd.setHours(23, 59, 59, 999)
      }
    }

    return allRecords.filter((r) => {
      const loginDate = new Date(r.login_time)
      if (rangeStart && loginDate < rangeStart) return false
      if (rangeEnd && loginDate > rangeEnd) return false
      return true
    })
  }, [allRecords, filter, customStart, customEnd])

  // Instant Metrics Calculations (< 1ms)
  const totalShifts = filteredRecords.length
  const completedShifts = filteredRecords.filter((r) => r.logout_time).length

  const totalDurationMs = useMemo(() => {
    let sumMs = 0
    filteredRecords.forEach((r) => {
      if (r.login_time && r.logout_time) {
        const grossMs = Math.max(0, new Date(r.logout_time).getTime() - new Date(r.login_time).getTime())
        const breakMs = (r.break_duration_seconds || 0) * 1000
        sumMs += Math.max(0, grossMs - breakMs)
      }
    })
    return sumMs
  }, [filteredRecords])

  const totalApprovedEarnings = useMemo(() => {
    let sum = 0
    filteredRecords.forEach((r) => {
      if (r.approval_status === 'approved' && r.payout_amount) {
        sum += r.payout_amount
      }
    })
    return sum
  }, [filteredRecords])

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card variant="elevated" className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Total Shifts</p>
            <p className="text-lg font-bold">{totalShifts}</p>
          </div>
        </Card>

        <Card variant="elevated" className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Completed Shifts</p>
            <p className="text-lg font-bold">{completedShifts}</p>
          </div>
        </Card>

        <Card variant="elevated" className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Net Work Duration</p>
            <p className="text-lg font-bold font-mono">{formatDurationMs(totalDurationMs)}</p>
          </div>
        </Card>

        <Card variant="elevated" className="flex items-center gap-4 border border-emerald-500/30">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Approved Earnings</p>
            <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ₹{totalApprovedEarnings.toFixed(2)}
            </p>
          </div>
        </Card>
      </div>

      {/* Instant Filter Bar */}
      <AttendanceFilters
        currentFilter={filter}
        onFilterChange={setFilter}
        startDate={customStart}
        endDate={customEnd}
        onDateChange={(start, end) => {
          setFilter('custom')
          setCustomStart(start)
          setCustomEnd(end)
        }}
      />

      {/* History Table */}
      <AttendanceTable records={filteredRecords} assignedShift={assignedShift} />
    </div>
  )
}
