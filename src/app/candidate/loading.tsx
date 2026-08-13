import { LoadingIndicator } from '@/components/ui/LoadingIndicator'
import { CandidateLayout } from '@/components/candidate/CandidateLayout'

export default function CandidateLoading() {
  return (
    <CandidateLayout candidateName="Loading...">
      <div className="flex h-[60vh] w-full items-center justify-center">
        <LoadingIndicator size="lg" label="Loading Candidate Dashboard..." />
      </div>
    </CandidateLayout>
  )
}
