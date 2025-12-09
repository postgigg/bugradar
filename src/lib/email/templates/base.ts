// Base email template with global styles
// All email templates extend from this base layout

export const emailStyles = {
  // Colors (matching brand.ts)
  colors: {
    primary: '#EF4444',
    primaryDark: '#DC2626',
    text: '#1e293b',
    textMuted: '#64748b',
    background: '#f8fafc',
    cardBackground: '#ffffff',
    border: '#e2e8f0',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },

  // Severity colors
  severity: {
    critical: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    high: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
    medium: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    low: { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
  },

  // Status colors
  status: {
    new: { bg: '#fef2f2', text: '#dc2626' },
    open: { bg: '#eff6ff', text: '#2563eb' },
    in_progress: { bg: '#fffbeb', text: '#d97706' },
    resolved: { bg: '#f0fdf4', text: '#16a34a' },
    closed: { bg: '#f8fafc', text: '#64748b' },
  },
}

interface BaseEmailProps {
  previewText: string
  children: string
}

export function baseEmailTemplate({ previewText, children }: BaseEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>BugRadar</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    a {
      color: ${emailStyles.colors.primary};
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }

    /* Responsive styles */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .mobile-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      .mobile-stack {
        display: block !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${emailStyles.colors.background};">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <!-- Email wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${emailStyles.colors.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Email container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="email-container" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="padding: 0 0 24px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="left">
                    <img src="${process.env.NEXT_PUBLIC_APP_URL || ''}/logo.svg" alt="BugRadar" width="140" style="display: block;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main content card -->
          <tr>
            <td style="background-color: ${emailStyles.colors.cardBackground}; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              ${children}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: ${emailStyles.colors.textMuted};">
                You're receiving this because you have notifications enabled for this project.
              </p>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: ${emailStyles.colors.textMuted};">
                <a href="{{unsubscribe_url}}" style="color: ${emailStyles.colors.textMuted}; text-decoration: underline;">Unsubscribe</a>
                &nbsp;&bull;&nbsp;
                <a href="{{settings_url}}" style="color: ${emailStyles.colors.textMuted}; text-decoration: underline;">Notification settings</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: ${emailStyles.colors.textMuted};">
                &copy; ${new Date().getFullYear()} BugRadar. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Helper to create a button
export function emailButton(text: string, url: string, variant: 'primary' | 'secondary' = 'primary'): string {
  const bgColor = variant === 'primary' ? emailStyles.colors.primary : emailStyles.colors.cardBackground
  const textColor = variant === 'primary' ? '#ffffff' : emailStyles.colors.text
  const border = variant === 'secondary' ? `2px solid ${emailStyles.colors.border}` : 'none'

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="background-color: ${bgColor}; border-radius: 8px; border: ${border};">
          <a href="${url}" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: ${textColor}; text-decoration: none;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `
}

// Helper to create a badge
export function emailBadge(text: string, type: 'severity' | 'status', value: string): string {
  const styles = type === 'severity'
    ? emailStyles.severity[value as keyof typeof emailStyles.severity] || emailStyles.severity.medium
    : emailStyles.status[value as keyof typeof emailStyles.status] || emailStyles.status.open

  return `
    <span style="display: inline-block; padding: 4px 10px; font-size: 12px; font-weight: 600; color: ${styles.text}; background-color: ${styles.bg}; border-radius: 9999px; text-transform: capitalize;">
      ${text}
    </span>
  `
}

// Helper for info rows
export function emailInfoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px solid ${emailStyles.colors.border};">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="width: 120px; font-size: 13px; color: ${emailStyles.colors.textMuted}; vertical-align: top;">
              ${label}
            </td>
            <td style="font-size: 14px; color: ${emailStyles.colors.text};">
              ${value}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `
}
