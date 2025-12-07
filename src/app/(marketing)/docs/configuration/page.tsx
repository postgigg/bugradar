import { Metadata } from 'next'
import { Settings, Eye, Terminal, Network, Palette, Keyboard, User, Bell } from 'lucide-react'
import { CodeBlock } from '@/components/docs/code-block'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Configuration | BugRadar SDK',
  description: 'All configuration options for BugRadar SDK',
}

export default function ConfigurationPage() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-sm font-medium mb-4">
          <Settings className="w-4 h-4" />
          <span>Configuration</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Configuration Options
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Customize BugRadar to fit your needs with these configuration options.
        </p>
      </div>

      {/* Full Configuration Example */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Full Configuration Example
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Here's a complete example with all available configuration options:
        </p>

        <CodeBlock
          code={`import { BugRadar } from '@bugradar/sdk';

BugRadar.init({
  apiKey: 'br_live_your_api_key',

  // Capture Settings
  enableScreenshot: true,      // Capture screenshots (default: true)
  enableConsoleLogs: true,     // Capture console logs (default: true)
  enableNetworkLogs: true,     // Capture network requests (default: true)
  enableAutoCapture: true,     // Auto-capture unhandled errors (default: true)

  // Limits
  maxConsoleLogs: 50,          // Max console entries to keep (default: 50)
  maxNetworkLogs: 20,          // Max network entries to keep (default: 20)

  // UI Settings
  position: 'bottom-right',    // Widget position (default: 'bottom-right')
  theme: 'auto',               // 'light' | 'dark' | 'auto' (default: 'auto')
  showButton: true,            // Show floating bug button (default: true)
  triggerKey: 'b',             // Keyboard shortcut key (default: 'b')

  // User Context
  userIdentifier: 'user@example.com',  // Track which user reported
  metadata: {                          // Custom data to include
    plan: 'pro',
    version: '1.2.3',
  },

  // Callbacks
  onBeforeSubmit: (report) => {
    // Modify report or return false to cancel
    console.log('About to submit:', report);
    return report;
  },
  onSubmitSuccess: (response) => {
    console.log('Bug reported:', response.bugId);
  },
  onSubmitError: (error) => {
    console.error('Failed to report bug:', error);
  },
});`}
          language="typescript"
          filename="src/index.tsx"
        />
      </div>

      {/* Configuration Sections */}
      <div className="not-prose space-y-12">
        {/* Capture Settings */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Eye className="w-6 h-6 text-coral-500" />
            Capture Settings
          </h2>

          <div className="space-y-6">
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">enableScreenshot</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">boolean</code> | <strong>Default:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">true</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enable or disable automatic screenshot capture when users report bugs. Screenshots include the current page state with user annotations.
              </p>
            </Card>

            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">enableConsoleLogs</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">boolean</code> | <strong>Default:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">true</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Capture recent console output (logs, warnings, errors) to help debug issues. Useful for understanding what happened before the bug occurred.
              </p>
            </Card>

            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">enableNetworkLogs</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">boolean</code> | <strong>Default:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">true</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Track recent API calls and network requests. Includes request/response data, status codes, and timing information.
              </p>
            </Card>

            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">enableAutoCapture</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">boolean</code> | <strong>Default:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">true</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Automatically capture unhandled JavaScript errors and create bug reports. Perfect for catching errors your users encounter.
              </p>
            </Card>
          </div>
        </section>

        {/* Limits */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Terminal className="w-6 h-6 text-coral-500" />
            Limits
          </h2>

          <div className="space-y-6">
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">maxConsoleLogs</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">number</code> | <strong>Default:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">50</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Maximum number of console log entries to keep in memory. Older entries are automatically removed to prevent memory issues.
              </p>
            </Card>

            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">maxNetworkLogs</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">number</code> | <strong>Default:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">20</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Maximum number of network request logs to keep. Tracks the most recent API calls for debugging.
              </p>
            </Card>
          </div>
        </section>

        {/* UI Settings */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Palette className="w-6 h-6 text-coral-500" />
            UI Settings
          </h2>

          <div className="space-y-6">
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">position</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Default:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">'bottom-right'</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Position of the floating bug button on the screen.
              </p>
            </Card>

            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">theme</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">'light' | 'dark' | 'auto'</code> | <strong>Default:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">'auto'</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Color theme for the bug reporter widget. 'auto' matches the user's system preference.
              </p>
            </Card>

            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">showButton</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">boolean</code> | <strong>Default:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">true</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Show or hide the floating bug button. Set to false if you want to trigger the widget programmatically.
              </p>
            </Card>

            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">triggerKey</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">string</code> | <strong>Default:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">'b'</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Keyboard shortcut key. Users can press Ctrl/Cmd + Shift + [key] to open the bug reporter.
              </p>
            </Card>
          </div>
        </section>

        {/* User Context */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <User className="w-6 h-6 text-coral-500" />
            User Context
          </h2>

          <div className="space-y-6">
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">userIdentifier</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">string</code> | <strong>Default:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">undefined</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Identify which user reported the bug. Can be an email, user ID, or any identifier. Helps you reach out to users for more context.
              </p>
            </Card>

            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">metadata</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Record&lt;string, any&gt;</code> | <strong>Default:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{}</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Custom data to include with every bug report. Useful for tracking app version, user plan, feature flags, etc.
              </p>
              <CodeBlock
                code={`BugRadar.init({
  apiKey: 'br_live_your_api_key',
  metadata: {
    version: '1.2.3',
    plan: 'pro',
    environment: 'production',
  },
});`}
                language="typescript"
                filename="example.ts"
              />
            </Card>
          </div>
        </section>

        {/* Callbacks */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Bell className="w-6 h-6 text-coral-500" />
            Callbacks
          </h2>

          <div className="space-y-6">
            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">onBeforeSubmit</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">(report) =&gt; report | false</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Called before submitting a bug report. Modify the report or return false to cancel submission.
              </p>
              <CodeBlock
                code={`BugRadar.init({
  apiKey: 'br_live_your_api_key',
  onBeforeSubmit: (report) => {
    // Add custom data
    report.metadata.customField = 'value';

    // Or cancel submission
    if (shouldBlock) {
      return false;
    }

    return report;
  },
});`}
                language="typescript"
                filename="example.ts"
              />
            </Card>

            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">onSubmitSuccess</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">(response) =&gt; void</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Called when a bug report is successfully submitted.
              </p>
              <CodeBlock
                code={`BugRadar.init({
  apiKey: 'br_live_your_api_key',
  onSubmitSuccess: (response) => {
    console.log('Bug reported!', response.bugId);
    // Show success message to user
    showToast('Bug report submitted. Thanks!');
  },
});`}
                language="typescript"
                filename="example.ts"
              />
            </Card>

            <Card className="p-6 border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                <code className="text-base text-coral-600 dark:text-coral-400">onSubmitError</code>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                <strong>Type:</strong> <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">(error) =&gt; void</code>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Called when bug report submission fails.
              </p>
              <CodeBlock
                code={`BugRadar.init({
  apiKey: 'br_live_your_api_key',
  onSubmitError: (error) => {
    console.error('Failed to submit bug:', error);
    // Show error message to user
    showToast('Failed to submit bug. Please try again.');
  },
});`}
                language="typescript"
                filename="example.ts"
              />
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
