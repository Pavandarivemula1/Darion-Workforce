import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function AdminMessagesPage() {
  redirect('https://chat.darion.in')
}
