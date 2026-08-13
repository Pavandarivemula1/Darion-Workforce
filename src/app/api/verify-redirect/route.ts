import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const idNumber = searchParams.get('idNumber')

  if (!idNumber) {
    return new NextResponse('Missing ID Number', { status: 400 })
  }

  const supabase = await createClient()

  // Query the employees table for the verification token
  const { data: employee, error } = await supabase
    .from('employees')
    .select('verification_token')
    .eq('employee_id', idNumber)
    .single()

  if (error || !employee?.verification_token) {
    return new NextResponse(`Verification record not found for ID: ${idNumber}. Please ensure this candidate is registered in the Darion-Verify system.`, { status: 404 })
  }

  const verifyAppUrl = process.env.NEXT_PUBLIC_VERIFY_APP_URL || 'https://darion-verify.vercel.app'

  const redirectUrl = `${verifyAppUrl}/verify/${employee.verification_token}`
  
  return NextResponse.redirect(redirectUrl)
}
