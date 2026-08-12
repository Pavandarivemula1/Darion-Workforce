'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, Calendar } from 'lucide-react'

export interface AttendanceFiltersProps {
  currentFilter?: string
  onFilterChange?: (filter: string) => void
  startDate?: string
  endDate?: string
  onDateChange?: (start: string, end: string) => void
}

export const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  currentFilter: controlledFilter,
  onFilterChange,
  startDate: controlledStart,
  endDate: controlledEnd,
  onDateChange,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentFilter = controlledFilter || searchParams.get('filter') || 'this_week'
  const startDate = controlledStart ?? (searchParams.get('startDate') || '')
  const endDate = controlledEnd ?? (searchParams.get('endDate') || '')

  const handleFilterClick = (filterId: string) => {
    if (onFilterChange) {
      onFilterChange(filterId)
    } else {
      const params = new URLSearchParams(searchParams)
      params.set('filter', filterId)
      if (filterId !== 'custom') {
        params.delete('startDate')
        params.delete('endDate')
      }
      router.push(`/candidate/attendance?${params.toString()}`)
    }
  }

  const handleDateInput = (start: string, end: string) => {
    if (onDateChange) {
      onDateChange(start, end)
    } else {
      const params = new URLSearchParams(searchParams)
      params.set('filter', 'custom')
      if (start) params.set('startDate', start)
      else params.delete('startDate')
      if (end) params.set('endDate', end)
      else params.delete('endDate')
      router.push(`/candidate/attendance?${params.toString()}`)
    }
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
            onClick={() => handleFilterClick(f.id)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all cursor-pointer whitespace-nowrap ${
              currentFilter === f.id
                ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] shadow-xs font-semibold'
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
          onChange={(e) => handleDateInput(e.target.value, endDate)}
          className="h-8 px-2 rounded-[var(--md-sys-shape-corner-extra-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
        />
        <span className="text-[var(--md-sys-color-on-surface-variant)]">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => handleDateInput(startDate, e.target.value)}
          className="h-8 px-2 rounded-[var(--md-sys-shape-corner-extra-small)] bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] text-xs focus:outline-none focus:border-[var(--md-sys-color-primary)]"
        />
      </div>
    </div>
  )
}
