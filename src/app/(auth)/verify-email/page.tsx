import { Metadata } from 'next'
import { Suspense } from 'react'
import { VerifyEmailContent } from './verify-email-content'

export const metadata: Metadata = {
  title: 'Verify Email | BugRadar',
  description: 'Verify your email address',
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
