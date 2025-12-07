import { baseEmailTemplate, emailButton, emailBadge, emailInfoRow, emailStyles } from './base'

interface BugCreatedEmailProps {
  bugId: string
  bugTitle: string
  bugDescription?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  projectName: string
  pageUrl?: string
  reporterName?: string
  reporterEmail?: string
  screenshotUrl?: string
  dashboardUrl: string
}

export function bugCreatedEmail({
  bugId,
  bugTitle,
  bugDescription,
  priority,
  projectName,
  pageUrl,
  reporterName,
  reporterEmail,
  screenshotUrl,
  dashboardUrl,
}: BugCreatedEmailProps): { subject: string; html: string } {
  const priorityLabels = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  }

  const priorityEmoji = {
    critical: '🚨',
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  }

  const bugUrl = `${dashboardUrl}/dashboard/bugs/${bugId}`

  const subject = `${priorityEmoji[priority]} New ${priorityLabels[priority]} Bug: ${bugTitle}`

  const content = `
    <!-- Header section -->
    <td style="padding: 32px 32px 24px 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td>
            <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: ${emailStyles.colors.primary}; text-transform: uppercase; letter-spacing: 0.5px;">
              New Bug Report
            </p>
            <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: ${emailStyles.colors.text}; line-height: 1.3;">
              ${bugTitle}
            </h1>
            <p style="margin: 0; font-size: 14px; color: ${emailStyles.colors.textMuted};">
              A new bug has been reported in <strong style="color: ${emailStyles.colors.text};">${projectName}</strong>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Priority badge -->
  <tr>
    <td style="padding: 0 32px 24px 32px;">
      ${emailBadge(priorityLabels[priority], 'severity', priority)}
    </td>
  </tr>

  ${bugDescription ? `
  <!-- Description -->
  <tr>
    <td style="padding: 0 32px 24px 32px;">
      <div style="padding: 16px; background-color: ${emailStyles.colors.background}; border-radius: 8px; border-left: 4px solid ${emailStyles.colors.primary};">
        <p style="margin: 0; font-size: 14px; color: ${emailStyles.colors.text}; line-height: 1.6;">
          ${bugDescription}
        </p>
      </div>
    </td>
  </tr>
  ` : ''}

  ${screenshotUrl ? `
  <!-- Screenshot -->
  <tr>
    <td style="padding: 0 32px 24px 32px;">
      <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: ${emailStyles.colors.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">
        Screenshot
      </p>
      <img src="${screenshotUrl}" alt="Bug screenshot" style="max-width: 100%; border-radius: 8px; border: 1px solid ${emailStyles.colors.border};" />
    </td>
  </tr>
  ` : ''}

  <!-- Bug details -->
  <tr>
    <td style="padding: 0 32px 24px 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        ${emailInfoRow('Bug ID', `#${bugId.slice(0, 8)}`)}
        ${pageUrl ? emailInfoRow('Page URL', `<a href="${pageUrl}" style="color: ${emailStyles.colors.primary}; word-break: break-all;">${pageUrl}</a>`) : ''}
        ${reporterName || reporterEmail ? emailInfoRow('Reporter', reporterName || reporterEmail || 'Anonymous') : ''}
        ${emailInfoRow('Reported', new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }))}
      </table>
    </td>
  </tr>

  <!-- CTA button -->
  <tr>
    <td style="padding: 0 32px 32px 32px;">
      ${emailButton('View Bug Details', bugUrl, 'primary')}
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="padding: 0 32px;">
      <div style="height: 1px; background-color: ${emailStyles.colors.border};"></div>
    </td>
  </tr>

  <!-- Quick actions -->
  <tr>
    <td style="padding: 24px 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="font-size: 13px; color: ${emailStyles.colors.textMuted};">
            Quick actions:
            <a href="${bugUrl}?action=assign" style="color: ${emailStyles.colors.primary}; margin-left: 8px;">Assign</a>
            <span style="color: ${emailStyles.colors.border}; margin: 0 8px;">|</span>
            <a href="${bugUrl}?action=comment" style="color: ${emailStyles.colors.primary};">Comment</a>
            <span style="color: ${emailStyles.colors.border}; margin: 0 8px;">|</span>
            <a href="${bugUrl}?action=resolve" style="color: ${emailStyles.colors.primary};">Mark Resolved</a>
          </td>
        </tr>
      </table>
    </td>
  `

  const html = baseEmailTemplate({
    previewText: `New ${priorityLabels[priority]} bug in ${projectName}: ${bugTitle}`,
    children: content,
  })

  return { subject, html }
}
