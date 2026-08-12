'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, Calendar, Download, Printer } from 'lucide-react'

export interface WeekSelectorProps {
  weekLabel: string
  currentDateIso: string
  onExportCsv: () => void
}

export const WeekSelector: React.FC<WeekSelectorProps> = ({
  weekLabel,
  currentDateIso,
  onExportCsv,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateWeek = (offsetDays: number) => {
    let year: number, month: number, day: number

    if (currentDateIso && currentDateIso.includes('-')) {
      const parts = currentDateIso.split('-').map(Number)
      year = parts[0]
      month = parts[1] - 1
      day = parts[2]
    } else {
      const now = new Date()
      year = now.getFullYear()
      month = now.getMonth()
      day = now.getDate()
    }

    // Calculate target date by offsetting days
    const targetDate = new Date(Date.UTC(year, month, day + offsetDays, 12, 0, 0))
    const yStr = targetDate.getUTCFullYear()
    const mStr = String(targetDate.getUTCMonth() + 1).padStart(2, '0')
    const dStr = String(targetDate.getUTCDate()).padStart(2, '0')
    const newIso = `${yStr}-${mStr}-${dStr}`

    const params = new URLSearchParams(searchParams)
    params.set('week', newIso)
    router.push(`/admin/timesheet?${params.toString()}`)
  }

  const handleDateChange = (isoDate: string) => {
    if (!isoDate) return
    const params = new URLSearchParams(searchParams)
    params.set('week', isoDate)
    router.push(`/admin/timesheet?${params.toString()}`)
  }

  const handleResetCurrent = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('week')
    router.push(`/admin/timesheet?${params.toString()}`)
  }

  const handlePrint = () => {
    window.print()
  }

  const isSelectedWeekSpecified = searchParams.has('week')

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-[var(--md-sys-shape-corner-large)] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] shadow-[var(--md-sys-elevation-1)] print:hidden">
      {/* Week Navigation Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center rounded-[var(--md-sys-shape-corner-full)] border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] p-0.5">
          <button
            onClick={() => navigateWeek(-7)}
            className="px-3 py-1.5 rounded-l-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Previous Week (-7 Days)"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev Week</span>
          </button>

          <button
            onClick={handleResetCurrent}
            className={`px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              !isSelectedWeekSpecified
                ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]'
                : 'text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)]'
            }`}
            title="Reset to Current Week"
          >
            Current Week
          </button>

          <button
            onClick={() => navigateWeek(7)}
            className="px-3 py-1.5 rounded-r-full hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            title="Next Week (+7 Days)"
          >
            <span className="hidden sm:inline">Next Week</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Date Picker */}
        <div className="flex items-center gap-2 text-xs font-medium bg-[var(--md-sys-color-surface-container-highest)] px-3 py-1.5 rounded-[var(--md-sys-shape-corner-small)] border border-[var(--md-sys-color-outline-variant)]">
          <Calendar className="w-4 h-4 text-[var(--md-sys-color-primary)] shrink-0" />
          <span className="text-[var(--md-sys-color-on-surface-variant)]">Jump to Date:</span>
          <input
            type="date"
            value={currentDateIso}
            onChange={(e) => handleDateChange(e.target.value)}
            className="bg-transparent text-[var(--md-sys-color-on-surface)] font-medium focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Week Range Badge & Export Buttons */}
      <div className="flex items-center justify-between lg:justify-end gap-3 flex-wrap">
        <span className="text-sm font-bold text-[var(--md-sys-color-on-surface)] px-3.5 py-1.5 rounded-[var(--md-sys-shape-corner-medium)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] border border-[var(--md-sys-color-outline-variant)]">
          {weekLabel}
        </span>

        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="sm"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print
          </Button>

          <Button
            variant="filled"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={onExportCsv}
          >
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  )
}
