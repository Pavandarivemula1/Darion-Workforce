'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Filter, Calendar, Users, CheckCircle2, Clock, AlertTriangle, FileSpreadsheet } from 'lucide-react'

export interface CandidateOption {
  id: string
  full_name: string
}

export interface SystemAttendanceItem {
  id: string
  user_id: string
  login_time: string
  logout_time: string | null
  created_at: string
  candidateName: string
}

export interface AdminAttendanceClientProps {
  candidates: CandidateOption[]
  records: SystemAttendanceItem[]
}

export const AdminAttendanceClient: React.FC<AdminAttendanceClientProps> = ({
  candidates,
  records,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedCandidate = searchParams.get('candidateId') || 'all'
  const selectedFilter = searchParams.get('filter') || 'this_week'
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''

  const updateQueryParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/admin/attendance?${params.toString()}`)
  }

  const handleDateChange = (start: string, end: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('filter', 'custom')
    if (start) params.set('startDate', start)
    else params.delete('startDate')
    if (end) params.set('endDate', end)
    else params.delete('endDate')
    router.push(`/admin/attendance?${params.toString()}`)
  }

  const isToday = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const calculateTotal = (loginIso: string, logoutIso: string | null) => {
    if (!logoutIso) return '--'
    const start = new Date(loginIso).getTime()
    const end = new Date(logoutIso).getTime()
    const diffMs = Math.max(0, end - start)
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${mins.toString().padStart(2, '0')}m`
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">System Attendance Records</h2>
        <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
          View and filter attendance activity across candidates
        </p>
      </div>

      {/* Filter Toolbar Card */}
      <Card variant="elevated" className="border border-[var(--md-sys-color-outline-variant)] flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Candidate Dropdown */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <Users className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
            <span className="text-[var(--md-sys-color-on-surface-variant)]">Candidate:</span>
            <select
              value={selectedCandidate}
              onChange={(e) => updateQueryParams('candidateId', e.target.value)}
              className="h-9 px-3 rounded-[var(--md-sys-shape-corner-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs font-medium focus:outline-none focus:border-[var(--md-sys-color-primary)] cursor-pointer"
            >
              <option value="all">All Candidates</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Preset Date Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] shrink-0 mr-1" />
            {[
              { id: 'today', label: 'Today' },
              { id: 'this_week', label: 'This Week' },
              { id: 'last_week', label: 'Last Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'all', label: 'All Time' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => updateQueryParams('filter', f.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === f.id
                    ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                    : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] shrink-0" />
            <span className="text-[var(--md-sys-color-on-surface-variant)]">Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange(e.target.value, endDate)}
              className="h-8 px-2 rounded-[var(--md-sys-shape-corner-extra-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
            <span className="text-[var(--md-sys-color-on-surface-variant)]">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange(startDate, e.target.value)}
              className="h-8 px-2 rounded-[var(--md-sys-shape-corner-extra-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
            />
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card variant="outlined" className="p-0 border border-[var(--md-sys-color-outline-variant)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] text-xs font-semibold uppercase tracking-wider border-b border-[var(--md-sys-color-outline-variant)]">
                <th className="py-3.5 px-4 sm:px-6">Candidate</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Login</th>
                <th className="py-3.5 px-4">Logout</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4 sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
              {records && records.length > 0 ? (
                records.map((item) => {
                  const hasLogout = !!item.logout_time
                  const today = isToday(item.login_time)
                  const isWorking = !hasLogout && today

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors"
                    >
                      <td className="py-4 px-4 sm:px-6 font-semibold whitespace-nowrap">
                        {item.candidateName}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-xs">
                        {formatDate(item.login_time)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs">
                        {formatTime(item.login_time)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs">
                        {formatTime(item.logout_time)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-xs font-semibold">
                        {isWorking ? (
                          <span className="text-[var(--md-sys-color-primary)] animate-pulse">
                            In Progress
                          </span>
                        ) : (
                          calculateTotal(item.login_time, item.logout_time)
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        {hasLogout ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        ) : isWorking ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                            <Clock className="w-3.5 h-3.5" />
                            Working
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Incomplete
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    <div className="flex flex-col items-center gap-2">
                      <FileSpreadsheet className="w-8 h-8 opacity-40" />
                      <span>No attendance records matching the selected filters.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
