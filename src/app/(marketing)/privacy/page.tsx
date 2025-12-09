import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | BugRadar',
  description: 'BugRadar Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <div className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly, including:</p>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Bug reports and associated data (screenshots, browser info, console logs)</li>
            <li>Usage data and analytics</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Process bug reports and AI enhancements</li>
            <li>Send service-related communications</li>
            <li>Analyze usage patterns to improve the product</li>
          </ul>

          <h2>3. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest.</p>

          <h2>4. Data Retention</h2>
          <p>We retain your data for as long as your account is active. You can request deletion at any time.</p>

          <h2>5. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>Supabase (database and authentication)</li>
            <li>Stripe (payment processing)</li>
            <li>Anthropic (AI features)</li>
          </ul>

          <h2>6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. Contact your instance administrator.</p>

          <h2>7. Contact Us</h2>
          <p>For privacy-related questions, contact your instance administrator.</p>
        </div>
      </div>
    </div>
  )
}
