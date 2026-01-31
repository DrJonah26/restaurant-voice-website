import { TrialExpiredScreen } from "@/components/trial-expired-screen"

export default function TrialExpiredPreviewPage() {
  return (
    <TrialExpiredScreen
      trialEndsAt={new Date()}
      ctaHref="/dashboard/billing"
    />
  )
}
