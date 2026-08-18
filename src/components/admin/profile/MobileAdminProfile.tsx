'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import {
  ShieldCheck,
  Mail,
  Calendar,
  Key,
  Phone,
  MapPin,
  IdCard,
  User,
  Shield,
} from 'lucide-react'
import { ProfileAvatarZoom } from '@/components/ui/ProfileAvatarZoom'

export interface MobileAdminProfileProps {
  adminProfile: any
  authUser: any
  userId: string
}

export const MobileAdminProfile: React.FC<MobileAdminProfileProps> = ({
  adminProfile,
  authUser,
  userId,
}) => {
  return (
    <div className="flex flex-col gap-2.5">
      {/* 1. Executive Profile Command Strip */}
      <div className="p-3 rounded-2xl bg-slate-900 dark:bg-slate-950 text-slate-100 border border-slate-800 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin Credentials</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 truncate">
            {adminProfile?.full_name || 'System Administrator'}
          </p>
        </div>

        <span className="px-2 py-1 rounded-xl bg-slate-800 text-slate-200 text-[10px] font-bold border border-slate-700 uppercase tracking-wider">
          Super Admin
        </span>
      </div>

      {/* 2. Centered Identity Deck */}
      <Card
        variant="outlined"
        className="p-4 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col items-center text-center gap-2 relative overflow-hidden"
      >
        <ProfileAvatarZoom
          avatarUrl={adminProfile?.avatar_url}
          altText={adminProfile?.full_name || 'Admin'}
          fallbackInitials={adminProfile?.full_name?.charAt(0).toUpperCase() || 'A'}
        />

        <div>
          <h3 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">
            {adminProfile?.full_name || 'Admin'}
          </h3>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono">
            {authUser?.email || 'Not provided'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-center mt-0.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
            <ShieldCheck className="w-3 h-3" /> System Administrator
          </span>

          {adminProfile?.id_number && (
            <a
              href={`/api/verify-redirect?idNumber=${adminProfile.id_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] border border-[var(--md-sys-color-outline-variant)]"
            >
              <IdCard className="w-3 h-3" /> {adminProfile.id_number}
            </a>
          )}
        </div>
      </Card>

      {/* 3. 2x2 Bento Matrix */}
      <div className="grid grid-cols-2 gap-2">
        {/* Email */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Email
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Mail className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 overflow-hidden">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] block truncate font-mono">
              {authUser?.email || '—'}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Primary Login</span>
          </div>
        </div>

        {/* Phone */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Phone
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Phone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 overflow-hidden">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] block truncate font-mono">
              {adminProfile?.phone_number || 'Not provided'}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Direct Contact</span>
          </div>
        </div>

        {/* Member Since */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Created Date
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 overflow-hidden">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] block truncate font-mono">
              {adminProfile?.created_at
                ? new Date(adminProfile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : '—'}
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Admin Since</span>
          </div>
        </div>

        {/* User ID */}
        <div className="p-2.5 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
              Auth ID
            </span>
            <div className="w-6 h-6 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center">
              <Key className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-1.5 overflow-hidden">
            <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)] block truncate font-mono">
              {userId.slice(0, 8)}...
            </span>
            <span className="text-[10px] text-[var(--md-sys-color-on-surface-variant)] block truncate">Unique Identifier</span>
          </div>
        </div>
      </div>

      {/* 4. Address Details */}
      {adminProfile?.address && (
        <Card variant="outlined" className="p-3 rounded-2xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] shadow-2xs flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 text-xs">
            <span className="text-[10px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider block">
              Official Address
            </span>
            <p className="text-[var(--md-sys-color-on-surface)] font-medium mt-0.5">
              {adminProfile.address}
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
