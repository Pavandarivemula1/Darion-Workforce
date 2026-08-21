import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function CandidateMessagesPage() {
  redirect('https://chat.darion.in')
}
