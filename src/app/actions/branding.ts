'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { canManageBranding } from '@/lib/auth/permissions'

export async function updateBrandingAction(
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  try {
    const supabase = await createClient()

    // 1. Verify user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Authentication required. Please sign in.' }
    }

    let role = user.user_metadata?.role || user.app_metadata?.role
    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      role = profile?.role
    }

    if (!canManageBranding(role)) {
      return { error: 'Unauthorized: Only system administrators can customize organization branding.' }
    }

    const appTitle = (formData.get('appTitle') as string) || 'Workforce'
    const legalName = (formData.get('legalName') as string) || appTitle
    const tagline = (formData.get('tagline') as string) || ''
    const customDomain = (formData.get('customDomain') as string) || null

    const logoLightUrl = (formData.get('logoLightUrl') as string) || null
    const logoDarkUrl = (formData.get('logoDarkUrl') as string) || null
    const iconUrl = (formData.get('iconUrl') as string) || null
    const faviconUrl = (formData.get('faviconUrl') as string) || null
    const loginBannerUrl = (formData.get('loginBannerUrl') as string) || null

    const primaryColor = (formData.get('primaryColor') as string) || '#0B57D0'
    const secondaryColor = (formData.get('secondaryColor') as string) || '#4F46E5'
    const accentColor = (formData.get('accentColor') as string) || '#0284C7'
    const fontFamily = (formData.get('fontFamily') as string) || 'Google Sans'
    const borderRadiusStyle = (formData.get('borderRadiusStyle') as string) || 'medium'

    const supportEmail = (formData.get('supportEmail') as string) || null
    const supportPhone = (formData.get('supportPhone') as string) || null
    const taxId = (formData.get('taxId') as string) || null
    const cinNumber = (formData.get('cinNumber') as string) || null
    const addressLine1 = (formData.get('addressLine1') as string) || null
    const addressLine2 = (formData.get('addressLine2') as string) || null
    const signatoryName = (formData.get('signatoryName') as string) || null
    const signatoryTitle = (formData.get('signatoryTitle') as string) || null
    const signatureUrl = (formData.get('signatureUrl') as string) || null
    const stampUrl = (formData.get('stampUrl') as string) || null
    const disclaimer = (formData.get('disclaimer') as string) || null
    const mfaIssuerName = (formData.get('mfaIssuerName') as string) || appTitle

    // Find or create default organization
    let orgId: string | null = null
    try {
      const { data: defaultOrg } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .maybeSingle()

      if (defaultOrg) {
        orgId = defaultOrg.id
        await supabase
          .from('organizations')
          .update({
            name: appTitle,
            legal_name: legalName,
            custom_domain: customDomain ? customDomain.toLowerCase().trim() : null,
          })
          .eq('id', orgId)
      } else {
        const { data: newOrg } = await supabase
          .from('organizations')
          .insert({
            name: appTitle,
            legal_name: legalName,
            slug: 'default',
            is_active: true
          })
          .select('id')
          .maybeSingle()

        if (newOrg) {
          orgId = newOrg.id
        }
      }
    } catch {
      // Organizations table not ready
    }

    if (orgId) {
      const brandingPayload = {
        organization_id: orgId,
        app_title: appTitle,
        tagline,
        logo_light_url: logoLightUrl,
        logo_dark_url: logoDarkUrl,
        icon_url: iconUrl,
        favicon_url: faviconUrl,
        login_banner_url: loginBannerUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        font_family: fontFamily,
        border_radius_style: borderRadiusStyle,
        support_email: supportEmail,
        support_phone: supportPhone,
        tax_id: taxId,
        cin_number: cinNumber,
        address_line1: addressLine1,
        address_line2: addressLine2,
        signatory_name: signatoryName,
        signatory_title: signatoryTitle,
        signature_url: signatureUrl,
        stamp_url: stampUrl,
        payslip_footer_disclaimer: disclaimer,
        mfa_issuer_name: mfaIssuerName,
      }

      await supabase
        .from('organization_branding')
        .upsert(brandingPayload, { onConflict: 'organization_id' })
    }

    // Invalidate Next.js cache across layouts
    revalidatePath('/', 'layout')
    revalidatePath('/admin', 'layout')
    revalidatePath('/candidate', 'layout')
    revalidatePath('/login')

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred while saving branding.' }
  }
}

export async function uploadBrandingAssetAction(
  prevState: { error?: string; url?: string; type?: string } | null,
  formData: FormData
) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Unauthorized.' }
    }

    const file = formData.get('file') as File
    const assetType = (formData.get('assetType') as string) || 'asset'

    if (!file || file.size === 0) {
      return { error: 'No file provided.' }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { error: 'File size exceeds 5MB limit.' }
    }

    const fileExt = file.name.split('.').pop() || 'png'
    const fileName = `${assetType}-${Date.now()}.${fileExt}`
    const filePath = `branding/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('organization-assets')
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
      })

    if (uploadError) {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const mimeType = file.type || 'image/png'
      const dataUrl = `data:${mimeType};base64,${base64}`
      return { url: dataUrl, type: assetType }
    }

    const { data: publicUrlData } = supabase.storage
      .from('organization-assets')
      .getPublicUrl(filePath)

    return { url: publicUrlData.publicUrl, type: assetType }
  } catch (err: any) {
    return { error: err.message || 'Failed to upload asset.' }
  }
}
