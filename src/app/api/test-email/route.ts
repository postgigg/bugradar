import { NextResponse } from 'next/server'
import { sendBugCreatedEmail } from '@/lib/email'

export async function GET() {
  const result = await sendBugCreatedEmail({
    to: 'exontract@gmail.com',
    bugId: 'test-123-456-789',
    bugTitle: 'Test Bug: Button not working on checkout page',
    bugDescription: 'The "Complete Purchase" button on the checkout page is unresponsive when clicked. Users are unable to complete their orders. This appears to affect all browsers and devices.',
    priority: 'high',
    projectName: 'BugRadar Demo',
    pageUrl: 'https://demo.bugradar.io/checkout',
    reporterEmail: 'user@example.com',
  })

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Test email sent!',
      emailId: result.emailId
    })
  } else {
    return NextResponse.json({
      success: false,
      error: result.error
    }, { status: 500 })
  }
}
