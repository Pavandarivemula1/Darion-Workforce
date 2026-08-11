'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, Calendar } from 'lucide-react'

export const AttendanceFilters: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get('filter') || 'this_week'
  const startDate = searchParams.get('startDate') || ''
  const endDate = searchParams.get('endDate') || ''

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('filter', filter)
    if (filter !== 'custom') {
      params.delete('startDate')
      params.delete('endDate')
    }
    router.push(`/candidate/attendance?${params.toString()}`)
  }

  const handleDateChange = (start: string, end: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('filter', 'custom')
    if (start) params.set('startDate', start)
    else params.delete('startDate')
    if (end) params.set('endDate', end)
    else params.delete('endDate')
    router.push(`/candidate/attendance?${params.toString()}`)
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-[var(--md-sys-shape-corner-large)] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
      {/* Preset Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        <Filter className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] shrink-0 mr-1" />
        {[
          { id: 'this_week', label: 'This Week' },
          { id: 'last_week', label: 'Last Week' },
          { id: 'this_month', label: 'This Month' },
          { id: 'all', label: 'All Records' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => handleFilterChange(f.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
              currentFilter === f.id
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs'
                : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Picker */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <Calendar className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)] shrink-0" />
        <span className="text-[var(--md-sys-color-on-surface-variant)] font-medium">Custom:</span>
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
  )
}
