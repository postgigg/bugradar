# BugRadar SDK

Self-hosted AI-powered bug tracking SDK. Capture bugs visually with screenshots, console logs, and network requests - then fix them with Claude Code.

## Installation

```bash
npm install bugradar
```

## Quick Start (Self-Hosted)

```javascript
import { BugRadar } from 'bugradar'

BugRadar.init({
  apiKey: 'br_live_xxx',  // from your dashboard Settings > API Keys
  apiUrl: 'https://your-dashboard.vercel.app/api/v1'  // your self-hosted dashboard URL
})
```

That's it! A floating bug button appears in the corner of your app. Users can click it to report bugs with annotated screenshots.

## Self-Hosted Setup

This SDK works with your own BugRadar dashboard. You need to:

1. **Clone the dashboard**: `git clone https://github.com/postgigg/bugradar`
2. **Configure services**: Add your Supabase, Anthropic, and Resend credentials
3. **Deploy**: Deploy to Vercel, Netlify, or your own server
4. **Get API key**: Create one in your dashboard's Settings > API Keys
5. **Install SDK**: Use this package in your apps, pointing to your dashboard URL

See the [main BugRadar repo](https://github.com/postgigg/bugradar) for full dashboard setup instructions.

## Features

- **Visual bug reporting** - Users click elements, capture screenshots, and describe issues
- **Screenshot annotations** - Draw, highlight, and add notes directly on screenshots
- **Auto error capture** - JavaScript errors automatically become bug reports
- **Console logs** - Captures recent console output for debugging
- **Network logs** - Tracks recent API calls and responses
- **Browser context** - Device info, OS, browser version, viewport size
- **Bug overlays** - Show existing bugs pinned to page elements
- **Claude Code integration** - Fix bugs with AI directly from your dashboard

## Configuration

```javascript
import { BugRadar } from 'bugradar'

BugRadar.init({
  // Required
  apiKey: 'br_live_xxx',
  apiUrl: 'https://your-dashboard.vercel.app/api/v1',

  // Optional
  enableScreenshot: true,      // Capture screenshots (default: true)
  enableConsoleLogs: true,     // Capture console logs (default: true)
  enableNetworkLogs: true,     // Capture network requests (default: true)
  enableAutoCapture: true,     // Auto-capture unhandled errors (default: true)
  maxConsoleLogs: 50,          // Max console entries to keep
  maxNetworkLogs: 20,          // Max network entries to keep
  position: 'bottom-right',    // Widget position
  theme: 'auto',               // 'light' | 'dark' | 'auto'
  showButton: true,            // Show floating bug button
  triggerKey: 'b',             // Keyboard shortcut: Ctrl/Cmd + Shift + B
  userIdentifier: 'user@example.com',  // Track which user reported
  metadata: { plan: 'pro' },           // Custom data to include

  // Callbacks
  onBeforeSubmit: (report) => report,
  onSubmitSuccess: (response) => {
    console.log('Bug reported:', response.bugId)
  },
  onSubmitError: (error) => {
    console.error('Failed:', error)
  },
})
```

## API

### `BugRadar.init(config)`
Initialize the SDK with your configuration.

### `BugRadar.open()`
Programmatically open the bug reporter widget.

```javascript
document.getElementById('report-bug').addEventListener('click', () => {
  BugRadar.open()
})
```

### `BugRadar.close()`
Close the bug reporter widget.

### `BugRadar.captureError(error, additionalData?)`
Manually capture and report an error.

```javascript
try {
  riskyOperation()
} catch (error) {
  BugRadar.captureError(error, { operation: 'riskyOperation' })
}
```

### `BugRadar.captureMessage(title, description?, priority?)`
Capture a message or feedback (not necessarily an error).

```javascript
BugRadar.captureMessage(
  'Feature Request',
  'Would love to see dark mode',
  'low'
)
```

### `BugRadar.setUser(identifier)`
Set the current user identifier.

```javascript
BugRadar.setUser('user@example.com')
```

### `BugRadar.setMetadata(metadata)`
Add or update custom metadata.

```javascript
BugRadar.setMetadata({
  plan: 'pro',
  company: 'Acme Inc',
})
```

### `BugRadar.destroy()`
Clean up and remove the SDK.

## Server-Side: Launch Claude Code

For fixing bugs with Claude Code from your server:

```javascript
import { launchClaudeCode } from 'bugradar/server'

await launchClaudeCode({
  projectPath: '/path/to/project',
  bugId: 'bug-123',
  prompt: 'Fix the login button not responding'
})
```

## Keyboard Shortcut

By default, users can press `Ctrl/Cmd + Shift + B` to open the bug reporter.

## Ignoring Elements

Add the `bugradar-ignore` class to elements you don't want captured in screenshots:

```html
<div class="bugradar-ignore">
  Sensitive content that won't appear in screenshots
</div>
```

## License

MIT
