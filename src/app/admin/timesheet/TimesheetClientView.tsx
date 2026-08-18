'use client'

import React, { useState } from 'react'
import {
  AttendanceRecord,
  CandidateProfile,
  getWeekBoundaries,
  processWeeklyTimesheet,
} from '@/lib/utils/timesheet'
import { exportAttendanceToCsv } from '@/lib/utils/exportCsv'
import { WeekSelector } from '@/components/admin/timesheet/WeekSelector'
import { WeeklySummaryCards } from '@/components/admin/timesheet/WeeklySummaryCards'
import { WeeklyMatrixTable } from '@/components/admin/timesheet/WeeklyMatrixTable'
import { MobileAdminTimesheet } from '@/components/admin/timesheet/MobileAdminTimesheet'
import { Snackbar } from '@/components/ui/Snackbar'

export interface TimesheetClientViewProps {
  candidates: CandidateProfile[]
  records: AttendanceRecord[]
  referenceDateIso: string
}

export const TimesheetClientView: React.FC<TimesheetClientViewProps> = ({
  candidates,
  records,
  referenceDateIso,
}) => {
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null)

  const refDate = referenceDateIso ? new Date(referenceDateIso) : new Date()
  const { weekLabel, daysHeader } = getWeekBoundaries(refDate)
  const timesheetRows = processWeeklyTimesheet(candidates, records, daysHeader)

  const handleExportCsv = () => {
    exportAttendanceToCsv(records, candidates, weekLabel)
    setSnackbarMsg(`Exported CSV for ${weekLabel}`)
  }

  return (
    <div className="flex flex-col gap-2.5 sm:gap-6">
      {/* DEDICATED PURPOSE-BUILT MOBILE VIEW (< 768px) */}
      <div className="md:hidden">
        <MobileAdminTimesheet
          timesheetRows={timesheetRows}
          daysHeader={daysHeader}
          weekLabel={weekLabel}
          currentDateIso={referenceDateIso}
          onExportCsv={handleExportCsv}
        />
      </div>

      {/* DESKTOP VIEW (>= 768px) - 100% UNTOUCHED ORIGINAL LAYOUT */}
      <div className="hidden md:flex flex-col gap-6">
        {/* Week Navigation Header */}
        <WeekSelector
          weekLabel={weekLabel}
          currentDateIso={referenceDateIso}
          onExportCsv={handleExportCsv}
        />

        {/* Summary Metric Cards */}
        <WeeklySummaryCards timesheetRows={timesheetRows} weekLabel={weekLabel} />

        {/* Weekly Matrix Table */}
        <WeeklyMatrixTable timesheetRows={timesheetRows} daysHeader={daysHeader} />
      </div>

      {/* Export Snackbar Notification */}
      <Snackbar
        message={snackbarMsg}
        variant="success"
        onClose={() => setSnackbarMsg(null)}
      />
    </div>
  )
}
