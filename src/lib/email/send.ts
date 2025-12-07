import { getResend, emailConfig } from './resend'
import { bugCreatedEmail } from './templates/bug-created'

interface SendBugCreatedEmailParams {
  to: string | string[]
  bugId: string
  bugTitle: string
  bugDescription?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  projectName: string
  pageUrl?: string
  reporterName?: string
  reporterEmail?: string
  screenshotUrl?: string
}

export async function sendBugCreatedEmail(params: SendBugCreatedEmailParams) {
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bugradar.io'

  const { subject, html } = bugCreatedEmail({
    ...params,
    dashboardUrl,
  })

  try {
    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject,
      html,
      replyTo: emailConfig.replyTo,
      tags: [
        { name: 'type', value: 'bug_created' },
        { name: 'priority', value: params.priority },
        { name: 'project', value: params.projectName.replace(/[^a-zA-Z0-9_-]/g, '_') },
      ],
    })

    if (error) {
      console.error('[Email] Failed to send bug created email:', error)
      return { success: false, error }
    }

    console.log('[Email] Bug created email sent:', data?.id)
    return { success: true, emailId: data?.id }
  } catch (err) {
    console.error('[Email] Error sending bug created email:', err)
    return { success: false, error: err }
  }
}

// Generic email send function for future use
interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  tags?: Array<{ name: string; value: string }>
}

export async function sendEmail({ to, subject, html, tags }: SendEmailParams) {
  try {
    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo: emailConfig.replyTo,
      tags,
    })

    if (error) {
      console.error('[Email] Failed to send email:', error)
      return { success: false, error }
    }

    return { success: true, emailId: data?.id }
  } catch (err) {
    console.error('[Email] Error sending email:', err)
    return { success: false, error: err }
  }
}
