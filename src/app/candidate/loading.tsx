import { LoadingIndicator } from '@/components/ui/LoadingIndicator'
import { CandidateNav } from '@/components/candidate/CandidateNav'

export default function CandidateLoading() {
  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface-container-lowest)] text-[var(--md-sys-color-on-surface)] transition-colors duration-300">
      <CandidateNav />
      <div className="flex h-[60vh] w-full items-center justify-center">
        <LoadingIndicator size="lg" label="Loading Candidate Dashboard..." />
      </div>
    </div>
  )
}
