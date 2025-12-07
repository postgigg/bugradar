import { Resend } from 'resend'

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
export const emailConfig = {
  from: 'BugRadar <notifications@bugradar.io>',
  replyTo: 'support@bugradar.io',
}
