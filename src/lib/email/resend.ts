import { Resend } from 'resend'

// Lazy initialization to prevent build errors when API key is not set
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    _resend = new Resend(apiKey)
  }
  return _resend
}

// Email configuration
export const emailConfig = {
  from: 'BugRadar <notifications@bugradar.io>',
  replyTo: 'support@bugradar.io',
}
