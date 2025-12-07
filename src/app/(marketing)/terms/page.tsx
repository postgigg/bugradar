import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | BugRadar',
  description: 'BugRadar Terms of Service',
}

export default function TermsPage() {
  return (
    <div className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using BugRadar, you agree to be bound by these Terms of Service.</p>

          <h2>2. Description of Service</h2>
          <p>BugRadar provides AI-powered bug tracking services including visual bug reporting, AI description enhancement, and developer dashboards.</p>

          <h2>3. Account Registration</h2>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account.</p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access</li>
            <li>Interfere with the service operation</li>
            <li>Upload malicious content</li>
          </ul>

          <h2>5. Payment Terms</h2>
          <p>Paid plans are billed monthly or annually. Refunds are available within 30 days of purchase.</p>

          <h2>6. Intellectual Property</h2>
          <p>BugRadar and its original content are protected by copyright and other intellectual property laws.</p>

          <h2>7. Limitation of Liability</h2>
          <p>BugRadar is provided &quot;as is&quot; without warranties. We are not liable for any indirect damages arising from use of the service.</p>

          <h2>8. Termination</h2>
          <p>We may terminate or suspend your account for violations of these terms.</p>

          <h2>9. Changes to Terms</h2>
          <p>We may update these terms at any time. Continued use constitutes acceptance of changes.</p>

          <h2>10. Contact</h2>
          <p>Questions about these terms? Contact us at legal@bugradar.io.</p>
        </div>
      </div>
    </div>
  )
}
