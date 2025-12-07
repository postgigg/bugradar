# BugRadar SDK

AI-powered bug tracking SDK - capture bugs visually with 2 lines of code.

## Installation

```bash
npm install bugradar
```

## Quick Start

```javascript
import { BugRadar } from 'bugradar';

BugRadar.init('br_live_your_api_key');
```

That's it! Users can now click the bug button to report issues visually.

## Features

- **Visual bug reporting** - Users click elements, capture screenshots, and describe issues
- **Auto error capture** - JavaScript errors automatically become bug reports
- **Screenshot capture** - Captures the current page state with annotations
- **Console logs** - Captures recent console output for debugging
- **Network logs** - Tracks recent API calls and responses
- **Browser context** - Device info, OS, browser version, viewport size

## Configuration

```javascript
import { BugRadar } from 'bugradar';

BugRadar.init({
  apiKey: 'br_live_your_api_key',

  // Optional settings
  enableScreenshot: true,      // Capture screenshots (default: true)
  enableConsoleLogs: true,     // Capture console logs (default: true)
  enableNetworkLogs: true,     // Capture network requests (default: true)
  enableAutoCapture: true,     // Auto-capture unhandled errors (default: true)

  maxConsoleLogs: 50,          // Max console entries to keep (default: 50)
  maxNetworkLogs: 20,          // Max network entries to keep (default: 20)

  position: 'bottom-right',    // Widget position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme: 'auto',               // 'light' | 'dark' | 'auto'
  showButton: true,            // Show floating bug button (default: true)
  triggerKey: 'b',             // Keyboard shortcut: Ctrl/Cmd + Shift + B

  userIdentifier: 'user@example.com',  // Track which user reported
  metadata: { plan: 'pro' },           // Custom data to include

  // Callbacks
  onBeforeSubmit: (report) => {
    // Modify report or return false to cancel
    return report;
  },
  onSubmitSuccess: (response) => {
    console.log('Bug reported:', response.bugId);
  },
  onSubmitError: (error) => {
    console.error('Failed to report bug:', error);
  },
});
```

## API

### `BugRadar.init(config)`

Initialize the SDK with your API key or configuration object.

### `BugRadar.open()`

Programmatically open the bug reporter widget.

```javascript
document.getElementById('report-bug').addEventListener('click', () => {
  BugRadar.open();
});
```

### `BugRadar.close()`

Close the bug reporter widget.

### `BugRadar.captureError(error, additionalData?)`

Manually capture and report an error.

```javascript
try {
  riskyOperation();
} catch (error) {
  BugRadar.captureError(error, { operation: 'riskyOperation' });
}
```

### `BugRadar.captureMessage(title, description?, priority?)`

Capture a message or feedback (not necessarily an error).

```javascript
BugRadar.captureMessage(
  'Feature Request',
  'Would love to see dark mode',
  'low'
);
```

### `BugRadar.setUser(identifier)`

Set the current user identifier.

```javascript
BugRadar.setUser('user@example.com');
```

### `BugRadar.setMetadata(metadata)`

Add or update custom metadata.

```javascript
BugRadar.setMetadata({
  plan: 'pro',
  company: 'Acme Inc',
});
```

### `BugRadar.destroy()`

Clean up and remove the SDK.

```javascript
BugRadar.destroy();
```

## Script Tag Usage

You can also include BugRadar via a script tag:

```html
<script
  src="https://cdn.bugradar.io/sdk.js"
  data-api-key="br_live_your_api_key"
></script>
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
