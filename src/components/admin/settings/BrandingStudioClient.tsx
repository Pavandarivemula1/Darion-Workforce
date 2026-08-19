'use client'

import React, { useState, useTransition } from 'react'
import { BrandingConfig } from '@/lib/branding/types'
import { generateBrandThemeTokens } from '@/lib/branding/palette'
import { updateBrandingAction } from '@/app/actions/branding'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { Snackbar } from '@/components/ui/Snackbar'
import {
  Paintbrush,
  Upload,
  Globe,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Eye,
  Building2,
  Clock,
  LogOut,
  Printer,
  ChevronRight,
  Layers,
  Smartphone,
  Lock,
  Mail,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react'

export interface BrandingStudioClientProps {
  initialBranding: BrandingConfig
}

const PRESET_PALETTES = [
  { name: 'Corporate Blue (Default)', primary: '#0B57D0', secondary: '#4F46E5', accent: '#0284C7' },
  { name: 'Deep Indigo', primary: '#4F46E5', secondary: '#7C3AED', accent: '#06B6D4' },
  { name: 'Emerald Forest', primary: '#059669', secondary: '#0D9488', accent: '#10B981' },
  { name: 'Royal Purple', primary: '#7C3AED', secondary: '#9333EA', accent: '#EC4899' },
  { name: 'Rose Crimson', primary: '#E11D48', secondary: '#BE123C', accent: '#F43F5E' },
  { name: 'Sunset Amber', primary: '#D97706', secondary: '#B45309', accent: '#F59E0B' },
  { name: 'Obsidian Slate', primary: '#1E293B', secondary: '#334155', accent: '#475569' },
]

const FONT_OPTIONS = [
  { label: 'Google Sans (Recommended)', value: 'Google Sans' },
  { label: 'Inter (Modern Tech)', value: 'Inter' },
  { label: 'Plus Jakarta Sans (Clean Clean)', value: 'Plus Jakarta Sans' },
  { label: 'Outfit (Friendly Rounded)', value: 'Outfit' },
  { label: 'Poppins (Geometric)', value: 'Poppins' },
  { label: 'Roboto (Enterprise Standard)', value: 'Roboto' },
  { label: 'System Default', value: 'System' },
]

export const BrandingStudioClient: React.FC<BrandingStudioClientProps> = ({
  initialBranding,
}) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'theme' | 'payslip' | 'domain'>('identity')
  const [previewTab, setPreviewTab] = useState<'dashboard' | 'login' | 'payslip'>('dashboard')

  // Form State
  const [appTitle, setAppTitle] = useState(initialBranding.appTitle || 'Workforce')
  const [legalName, setLegalName] = useState(initialBranding.legalName || 'Workforce Solutions')
  const [tagline, setTagline] = useState(initialBranding.tagline || '')
  const [customDomain, setCustomDomain] = useState(initialBranding.slug === 'default' ? '' : initialBranding.slug || '')
  const [supportEmail, setSupportEmail] = useState(initialBranding.supportEmail || '')
  const [supportPhone, setSupportPhone] = useState(initialBranding.supportPhone || '')

  // Logos & Assets
  const [logoLightUrl, setLogoLightUrl] = useState(initialBranding.logoLightUrl || '')
  const [logoDarkUrl, setLogoDarkUrl] = useState(initialBranding.logoDarkUrl || '')
  const [iconUrl, setIconUrl] = useState(initialBranding.iconUrl || '')
  const [faviconUrl, setFaviconUrl] = useState(initialBranding.faviconUrl || '')

  // Colors & Theme
  const [primaryColor, setPrimaryColor] = useState(initialBranding.primaryColor || '#0B57D0')
  const [secondaryColor, setSecondaryColor] = useState(initialBranding.secondaryColor || '#4F46E5')
  const [accentColor, setAccentColor] = useState(initialBranding.accentColor || '#0284C7')
  const [fontFamily, setFontFamily] = useState(initialBranding.fontFamily || 'Google Sans')
  const [borderRadiusStyle, setBorderRadiusStyle] = useState<'sharp' | 'compact' | 'medium' | 'modern' | 'pill'>(
    initialBranding.borderRadiusStyle || 'medium'
  )

  // Payslip & Legal
  const [cinNumber, setCinNumber] = useState(initialBranding.payslip?.cinNumber || '')
  const [taxId, setTaxId] = useState(initialBranding.payslip?.taxId || '')
  const [addressLine1, setAddressLine1] = useState(initialBranding.payslip?.addressLine1 || '')
  const [addressLine2, setAddressLine2] = useState(initialBranding.payslip?.addressLine2 || '')
  const [signatoryName, setSignatoryName] = useState(initialBranding.payslip?.signatoryName || '')
  const [signatoryTitle, setSignatoryTitle] = useState(initialBranding.payslip?.signatoryTitle || '')
  const [signatureUrl, setSignatureUrl] = useState(initialBranding.payslip?.signatureUrl || '')
  const [stampUrl, setStampUrl] = useState(initialBranding.payslip?.stampUrl || '')
  const [disclaimer, setDisclaimer] = useState(initialBranding.payslip?.disclaimer || '')

  // Security
  const [mfaIssuerName, setMfaIssuerName] = useState(initialBranding.mfaIssuerName || initialBranding.appTitle || 'Workforce')

  // Notification state
  const [isPending, startTransition] = useTransition()
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; variant: 'success' | 'error' } | null>(null)
  const [copiedDns, setCopiedDns] = useState(false)

  // Computed Theme Tokens for Live Preview
  const { lightTokens, darkTokens } = generateBrandThemeTokens(
    primaryColor,
    secondaryColor,
    accentColor,
    borderRadiusStyle
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setFeedbackMessage({ text: 'Image file must be less than 5MB.', variant: 'error' })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result)
        setFeedbackMessage({ text: 'Asset uploaded to preview. Click "Save & Publish Changes" to commit.', variant: 'success' })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData()
      formData.set('organizationId', initialBranding.organizationId)
      formData.set('appTitle', appTitle)
      formData.set('legalName', legalName)
      formData.set('tagline', tagline)
      formData.set('customDomain', customDomain)
      formData.set('supportEmail', supportEmail)
      formData.set('supportPhone', supportPhone)

      formData.set('logoLightUrl', logoLightUrl)
      formData.set('logoDarkUrl', logoDarkUrl)
      formData.set('iconUrl', iconUrl)
      formData.set('faviconUrl', faviconUrl)

      formData.set('primaryColor', primaryColor)
      formData.set('secondaryColor', secondaryColor)
      formData.set('accentColor', accentColor)
      formData.set('fontFamily', fontFamily)
      formData.set('borderRadiusStyle', borderRadiusStyle)

      formData.set('cinNumber', cinNumber)
      formData.set('taxId', taxId)
      formData.set('addressLine1', addressLine1)
      formData.set('addressLine2', addressLine2)
      formData.set('signatoryName', signatoryName)
      formData.set('signatoryTitle', signatoryTitle)
      formData.set('signatureUrl', signatureUrl)
      formData.set('stampUrl', stampUrl)
      formData.set('disclaimer', disclaimer)
      formData.set('mfaIssuerName', mfaIssuerName)

      const result = await updateBrandingAction(null, formData)
      if (result?.error) {
        setFeedbackMessage({ text: result.error, variant: 'error' })
      } else {
        setFeedbackMessage({ text: 'Branding and White-Label configuration successfully published!', variant: 'success' })
        // Apply instantly to current session root styles
        const root = document.documentElement
        Object.entries(lightTokens).forEach(([k, v]) => root.style.setProperty(k, v))
      }
    })
  }

  const handleCopyCname = () => {
    navigator.clipboard.writeText(`cname.workforce.app`)
    setCopiedDns(true)
    setTimeout(() => setCopiedDns(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--md-sys-color-outline-variant)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
              <Paintbrush className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--md-sys-color-on-surface)] tracking-tight">
              Enterprise White-Label Studio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--md-sys-color-on-surface-variant)]">
            Tailor your company workspace with custom logos, Material Design 3 color palettes, payslip templates, and custom domains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="filled"
            size="md"
            onClick={handleSave}
            isLoading={isPending}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Save & Publish Changes
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Customizer Tabs | Right Live Interactive Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Configuration Forms */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Tabs Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--md-sys-color-surface-container-high)] rounded-2xl overflow-x-auto no-scrollbar border border-[var(--md-sys-color-outline-variant)]">
            <button
              onClick={() => setActiveTab('identity')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'identity'
                  ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-xs'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Identity & Logos
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'theme'
                  ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-xs'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              Theme & Colors
            </button>
            <button
              onClick={() => setActiveTab('payslip')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'payslip'
                  ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-xs'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Payslip & Legal
            </button>
            <button
              onClick={() => setActiveTab('domain')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'domain'
                  ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] shadow-xs'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Domain & 2FA
            </button>
          </div>

          {/* TAB 1: IDENTITY & LOGOS */}
          {activeTab === 'identity' && (
            <Card variant="elevated" className="flex flex-col gap-5 p-5 sm:p-6 border border-[var(--md-sys-color-outline-variant)]">
              <div>
                <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">Brand Identity</h2>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Basic enterprise name and contact information displayed across dashboards and emails.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="App / Workspace Name"
                  value={appTitle}
                  onChange={(e) => setAppTitle(e.target.value)}
                  placeholder="e.g. Acme Workforce"
                  required
                />
                <TextField
                  label="Legal Entity Name"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. Acme Technologies Pvt Ltd"
                />
              </div>

              <TextField
                label="Workspace Tagline / Motto"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Enterprise Workforce & Shift Management"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Support / Payroll Email"
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="payroll@yourcompany.com"
                />
                <TextField
                  label="Support Phone / Hotline"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+1 (800) 123-4567"
                />
              </div>

              <div className="pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
                <h3 className="text-sm font-bold text-[var(--md-sys-color-on-surface)] mb-1">Brand Assets & Logos</h3>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mb-4">Upload PNG, SVG, or WebP assets (recommended aspect ratio: 4:1 for horizontal logo, 1:1 for monogram).</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Logo (Light Backgrounds) */}
                  <div className="p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col gap-3">
                    <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Primary Logo (Light Canvas)</span>
                    <div className="h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-2">
                      {logoLightUrl ? (
                        <img src={logoLightUrl} alt="Light Logo Preview" className="max-h-full object-contain" />
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">No light logo uploaded</span>
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] text-xs font-semibold cursor-pointer hover:bg-[var(--md-sys-color-primary)]/10 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Light Logo</span>
                      <input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" onChange={(e) => handleFileUpload(e, setLogoLightUrl)} className="hidden" />
                    </label>
                  </div>

                  {/* App Icon / Monogram (Square) */}
                  <div className="p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col gap-3">
                    <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">App Monogram / Favicon (1:1)</span>
                    <div className="h-16 rounded-lg bg-slate-100 dark:bg-slate-900 border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center p-2">
                      {iconUrl ? (
                        <img src={iconUrl} alt="App Icon" className="h-12 w-12 rounded-lg object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold text-lg">
                          {appTitle.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] text-xs font-semibold cursor-pointer hover:bg-[var(--md-sys-color-primary)]/10 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Icon (512x512)</span>
                      <input type="file" accept="image/png,image/svg+xml,image/webp,image/x-icon" onChange={(e) => handleFileUpload(e, setIconUrl)} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 2: THEME & COLORS */}
          {activeTab === 'theme' && (
            <Card variant="elevated" className="flex flex-col gap-5 p-5 sm:p-6 border border-[var(--md-sys-color-outline-variant)]">
              <div>
                <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">Material Design 3 Theme Engine</h2>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Select a curated enterprise palette or input your organization's exact primary brand hex code.</p>
              </div>

              {/* Presets Grid */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">Curated Brand Palettes</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_PALETTES.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setPrimaryColor(preset.primary)
                        setSecondaryColor(preset.secondary)
                        setAccentColor(preset.accent)
                      }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        primaryColor === preset.primary
                          ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/30 ring-2 ring-[var(--md-sys-color-primary)]/20'
                          : 'border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full shrink-0 shadow-2xs border border-white/20"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <span className="text-xs font-semibold truncate text-[var(--md-sys-color-on-surface)]">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Primary Brand Hex</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-[var(--md-sys-color-outline-variant)] cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] uppercase"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Secondary Hex</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-[var(--md-sys-color-outline-variant)] cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] uppercase"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Accent Hex</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-[var(--md-sys-color-outline-variant)] cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Typography & Shapes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs font-medium rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Corner Radius Style</label>
                  <select
                    value={borderRadiusStyle}
                    onChange={(e) => setBorderRadiusStyle(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-xs font-medium rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
                  >
                    <option value="sharp">Sharp (2px - 6px)</option>
                    <option value="compact">Compact (4px - 12px)</option>
                    <option value="medium">Medium MD3 (8px - 16px)</option>
                    <option value="modern">Modern Extra Rounded (10px - 24px)</option>
                    <option value="pill">Pill & Organic (12px - 9999px)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Swatches Preview */}
              <div className="p-3.5 rounded-xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)]">
                <span className="text-[11px] font-bold text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider block mb-2">
                  Generated Material Design 3 Tokens
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                  <div className="p-2 rounded-lg text-white" style={{ backgroundColor: lightTokens['--md-sys-color-primary'] }}>
                    Primary
                  </div>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: lightTokens['--md-sys-color-primary-container'], color: lightTokens['--md-sys-color-on-primary-container'] }}>
                    Container
                  </div>
                  <div className="p-2 rounded-lg text-white" style={{ backgroundColor: lightTokens['--md-sys-color-secondary'] }}>
                    Secondary
                  </div>
                  <div className="p-2 rounded-lg text-white" style={{ backgroundColor: lightTokens['--md-sys-color-tertiary'] }}>
                    Accent
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: PAYSLIP & LEGAL DETAILS */}
          {activeTab === 'payslip' && (
            <Card variant="elevated" className="flex flex-col gap-5 p-5 sm:p-6 border border-[var(--md-sys-color-outline-variant)]">
              <div>
                <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">Official Document & Payslip Credentials</h2>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">These official tax IDs, corporate addresses, and digital stamps will automatically appear on candidate salary slips and export PDFs.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Company Reg / CIN Number"
                  value={cinNumber}
                  onChange={(e) => setCinNumber(e.target.value)}
                  placeholder="e.g. U74999DL2024PTC123456"
                />
                <TextField
                  label="Tax ID / GSTIN / VAT"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="e.g. GSTIN27AABCT1234F1Z5"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Corporate Address Line 1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="e.g. Tower B, Sector 62, Cyber City"
                />
                <TextField
                  label="Address Line 2 (City / Postal Code)"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="e.g. Gurugram, Haryana 122002"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Authorized Signatory Name"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
                <TextField
                  label="Signatory Title"
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                  placeholder="e.g. Head of Human Resources & Payroll"
                />
              </div>

              {/* Digital Signature & Seal Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                <div className="p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col gap-3">
                  <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Official Company Seal / Stamp</span>
                  <div className="h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-2">
                    {stampUrl ? (
                      <img src={stampUrl} alt="Seal" className="max-h-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">No seal uploaded</span>
                    )}
                  </div>
                  <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] text-xs font-semibold cursor-pointer hover:bg-[var(--md-sys-color-primary)]/10 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Seal (PNG)</span>
                    <input type="file" accept="image/png,image/svg+xml" onChange={(e) => handleFileUpload(e, setStampUrl)} className="hidden" />
                  </label>
                </div>

                <div className="p-4 rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] flex flex-col gap-3">
                  <span className="text-xs font-bold text-[var(--md-sys-color-on-surface)]">Digital Signature</span>
                  <div className="h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-2">
                    {signatureUrl ? (
                      <img src={signatureUrl} alt="Signature" className="max-h-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">No signature uploaded</span>
                    )}
                  </div>
                  <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] text-xs font-semibold cursor-pointer hover:bg-[var(--md-sys-color-primary)]/10 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Signature</span>
                    <input type="file" accept="image/png,image/svg+xml" onChange={(e) => handleFileUpload(e, setSignatureUrl)} className="hidden" />
                  </label>
                </div>
              </div>

              <TextField
                label="Payslip Disclaimer / Legal Footer Note"
                value={disclaimer}
                onChange={(e) => setDisclaimer(e.target.value)}
                placeholder="This is a computer-generated official payroll slip..."
              />
            </Card>
          )}

          {/* TAB 4: DOMAIN & 2FA SECURITY */}
          {activeTab === 'domain' && (
            <Card variant="elevated" className="flex flex-col gap-5 p-5 sm:p-6 border border-[var(--md-sys-color-outline-variant)]">
              <div>
                <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)]">Custom Domain & 2FA Security</h2>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Configure custom domain routing and Authenticator App issuer branding.</p>
              </div>

              <TextField
                label="Custom Domain Hostname"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g. attendance.yourcompany.com"
              />

              {/* DNS Instructions Box */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold">
                  <Globe className="w-4 h-4" />
                  <span>DNS Setup Instructions for Custom Domain</span>
                </div>
                <p className="text-blue-950 dark:text-blue-200 leading-relaxed">
                  To map <span className="font-mono font-bold">{customDomain || 'attendance.yourcompany.com'}</span> to this application, create a <span className="font-bold">CNAME</span> DNS record in your DNS provider (Cloudflare, GoDaddy, Route53, Namecheap):
                </p>
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-300 dark:border-blue-800 font-mono text-xs">
                  <span>CNAME <span className="text-blue-600 font-bold">@ / attendance</span> &rarr; cname.workforce.app</span>
                  <button
                    onClick={handleCopyCname}
                    className="p-1 rounded text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 cursor-pointer"
                  >
                    {copiedDns ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                <TextField
                  label="2FA / TOTP Authenticator Issuer Name"
                  value={mfaIssuerName}
                  onChange={(e) => setMfaIssuerName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  helperText="Displayed in Google Authenticator, 1Password, and Apple Passwords when candidates scan their 2FA QR code."
                />
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (5 cols): Live Interactive Mockup */}
        <div className="lg:col-span-5 flex flex-col gap-3 sticky top-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Live Real-Time Preview
            </span>
            <div className="flex items-center gap-1 bg-[var(--md-sys-color-surface-container-high)] p-0.5 rounded-lg border border-[var(--md-sys-color-outline-variant)]">
              <button
                onClick={() => setPreviewTab('dashboard')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  previewTab === 'dashboard' ? 'bg-[var(--md-sys-color-surface)] shadow-2xs font-bold text-[var(--md-sys-color-primary)]' : 'text-slate-500'
                }`}
              >
                Candidate View
              </button>
              <button
                onClick={() => setPreviewTab('login')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  previewTab === 'login' ? 'bg-[var(--md-sys-color-surface)] shadow-2xs font-bold text-[var(--md-sys-color-primary)]' : 'text-slate-500'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setPreviewTab('payslip')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  previewTab === 'payslip' ? 'bg-[var(--md-sys-color-surface)] shadow-2xs font-bold text-[var(--md-sys-color-primary)]' : 'text-slate-500'
                }`}
              >
                Payslip
              </button>
            </div>
          </div>

          {/* Mockup Frame */}
          <div
            className="w-full rounded-3xl border-4 border-slate-800 bg-[var(--md-sys-color-surface)] shadow-2xl overflow-hidden min-h-[520px] flex flex-col transition-all"
            style={{
              fontFamily: fontFamily !== 'System' ? `'${fontFamily}', sans-serif` : 'inherit',
            }}
          >
            {/* Top Device Bar */}
            <div className="h-6 bg-slate-800 flex items-center justify-between px-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="text-[10px] text-slate-400 font-mono font-medium truncate max-w-[200px]">
                {customDomain || `${appTitle.toLowerCase().replace(/\s+/g, '-')}.workforce.app`}
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>

            {/* PREVIEW: CANDIDATE DASHBOARD */}
            {previewTab === 'dashboard' && (
              <div className="flex-1 flex flex-col bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-2">
                    {logoLightUrl ? (
                      <img src={logoLightUrl} alt="Logo" className="h-6 max-w-[90px] object-contain" />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {appTitle.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-bold text-xs truncate max-w-[120px]">{appTitle}</span>
                  </div>
                  <div
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: lightTokens['--md-sys-color-primary-container'], color: lightTokens['--md-sys-color-on-primary-container'] }}
                  >
                    Candidate
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex flex-col gap-3">
                  {/* Status Banner */}
                  <div
                    className="p-4 rounded-2xl text-white shadow-md flex items-center justify-between"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold opacity-80 block">Current Shift Session</span>
                      <span className="text-xl font-extrabold font-mono">03h 45m 12s</span>
                      <p className="text-[10px] opacity-80 mt-0.5">Active &bull; Shift 09:00 - 18:00</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Quick Action Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Today's Earnings</span>
                      <span className="font-extrabold text-sm text-emerald-600">₹1,850.00</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Daily Task Logs</span>
                      <span className="font-extrabold text-sm text-blue-600">2 Submitted</span>
                    </div>
                  </div>

                  {/* Active Primary Button Demo */}
                  <button
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-sm flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <span>Log Daily Work Tasks</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* PREVIEW: LOGIN SCREEN */}
            {previewTab === 'login' && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100">
                <div className="w-full max-w-[280px] flex flex-col items-center gap-4 text-center">
                  {logoLightUrl ? (
                    <img src={logoLightUrl} alt="Logo" className="h-9 max-w-[160px] object-contain mb-1" />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {appTitle.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 className="font-extrabold text-base tracking-tight">{appTitle}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                      {tagline || 'Sign in to access your enterprise workspace'}
                    </p>
                  </div>

                  <div className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2.5 text-left text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Work Email</span>
                      <div className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-400">
                        employee@{customDomain || 'company.com'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Password</span>
                      <div className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-400">
                        ••••••••••••
                      </div>
                    </div>

                    <button
                      className="w-full py-2 mt-1 rounded-lg text-white font-bold text-xs shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PREVIEW: PAYSLIP */}
            {previewTab === 'payslip' && (
              <div className="flex-1 p-4 bg-white text-slate-900 text-[10px] overflow-y-auto">
                {/* Payslip Header */}
                <div className="flex items-start justify-between border-b pb-3 mb-3" style={{ borderColor: primaryColor }}>
                  <div className="flex items-center gap-2">
                    {logoLightUrl ? (
                      <img src={logoLightUrl} alt="Logo" className="h-7 max-w-[80px] object-contain" />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold uppercase text-[11px]" style={{ color: primaryColor }}>
                        {legalName || appTitle}
                      </h4>
                      <p className="text-[9px] text-slate-500 leading-tight">{addressLine1 || 'Corporate Headquarters'}</p>
                      <p className="text-[8px] text-slate-400 font-mono mt-0.5">
                        {cinNumber ? `CIN: ${cinNumber}` : ''} {taxId ? `• Tax: ${taxId}` : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full font-bold text-[9px]"
                    style={{ backgroundColor: lightTokens['--md-sys-color-primary-container'], color: lightTokens['--md-sys-color-on-primary-container'] }}
                  >
                    OFFICIAL PAYSLIP
                  </span>
                </div>

                {/* Candidate Meta */}
                <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 mb-3 text-[9px]">
                  <div>
                    <span className="text-slate-400 block uppercase">Employee</span>
                    <span className="font-bold">John Candidate</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase">Rate</span>
                    <span className="font-bold font-mono">₹450.00/hr</span>
                  </div>
                </div>

                {/* Total */}
                <div
                  className="p-2 rounded-lg font-bold flex items-center justify-between mb-3"
                  style={{ backgroundColor: lightTokens['--md-sys-color-primary-container'], color: lightTokens['--md-sys-color-on-primary-container'] }}
                >
                  <span>NET PAYABLE</span>
                  <span className="font-mono text-xs">₹38,250.00</span>
                </div>

                {/* Stamp & Signature Footer */}
                <div className="flex items-end justify-between pt-2 border-t text-[8px] text-slate-400">
                  <div className="max-w-[140px] leading-tight">
                    {disclaimer || 'Official salary statement generated by Workforce system.'}
                  </div>
                  <div className="text-center flex flex-col items-center">
                    {stampUrl && <img src={stampUrl} alt="Seal" className="h-6 object-contain mb-0.5" />}
                    {signatureUrl ? (
                      <img src={signatureUrl} alt="Sign" className="h-5 object-contain" />
                    ) : (
                      <span className="font-bold text-[9px] text-slate-700">{signatoryName || 'Authorized Signatory'}</span>
                    )}
                    <span className="text-[7px] uppercase">{signatoryTitle || 'Payroll'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Snackbar
        message={feedbackMessage?.text || null}
        variant={feedbackMessage?.variant || 'success'}
        onClose={() => setFeedbackMessage(null)}
      />
    </div>
  )
}
