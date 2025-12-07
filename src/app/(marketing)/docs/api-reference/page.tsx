import { Metadata } from 'next'
import { Code2, Play, XCircle, MessageSquare, User, Settings as SettingsIcon, Trash2 } from 'lucide-react'
import { CodeBlock } from '@/components/docs/code-block'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'API Reference | BugRadar SDK',
  description: 'Complete API reference for BugRadar SDK methods',
}

export default function ApiReferencePage() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-sm font-medium mb-4">
          <Code2 className="w-4 h-4" />
          <span>API Reference</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          API Reference
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Complete reference for all BugRadar SDK methods and their usage.
        </p>
      </div>

      {/* API Methods */}
      <div className="not-prose space-y-12">
        {/* BugRadar.init() */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-coral-500" />
            BugRadar.init()
          </h2>

          <Card className="p-6 border-slate-200 dark:border-slate-700 mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Initialize the BugRadar SDK with your API key or configuration object.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Parameters</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">config</code>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">string | BugRadarConfig</code> - Your API key or full configuration object
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Returns</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">void</code>
                </p>
              </div>
            </div>

            <CodeBlock
              code={`// Simple initialization with API key
BugRadar.init('br_live_your_api_key');

// Full configuration
BugRadar.init({
  apiKey: 'br_live_your_api_key',
  enableScreenshot: true,
  enableConsoleLogs: true,
  position: 'bottom-right',
  theme: 'auto',
  userIdentifier: 'user@example.com',
});`}
              language="typescript"
              filename="example.ts"
            />
          </Card>
        </section>

        {/* BugRadar.open() */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Play className="w-6 h-6 text-coral-500" />
            BugRadar.open()
          </h2>

          <Card className="p-6 border-slate-200 dark:border-slate-700 mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Programmatically open the bug reporter widget.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Parameters</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">None</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Returns</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">void</code>
                </p>
              </div>
            </div>

            <CodeBlock
              code={`// Open from a custom button
document.getElementById('report-bug').addEventListener('click', () => {
  BugRadar.open();
});

// Open programmatically after an action
function handleCheckout() {
  if (paymentFailed) {
    BugRadar.open();
  }
}`}
              language="typescript"
              filename="example.ts"
            />
          </Card>
        </section>

        {/* BugRadar.close() */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-coral-500" />
            BugRadar.close()
          </h2>

          <Card className="p-6 border-slate-200 dark:border-slate-700 mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Close the bug reporter widget.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Parameters</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">None</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Returns</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">void</code>
                </p>
              </div>
            </div>

            <CodeBlock
              code={`// Close the widget programmatically
BugRadar.close();`}
              language="typescript"
              filename="example.ts"
            />
          </Card>
        </section>

        {/* BugRadar.captureError() */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-coral-500" />
            BugRadar.captureError()
          </h2>

          <Card className="p-6 border-slate-200 dark:border-slate-700 mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Manually capture and report an error with optional additional data.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Parameters</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">error</code>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Error | string</code> - The error to capture
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">data</code>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Record&lt;string, any&gt;</code> (optional) - Additional context
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Returns</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Promise&lt;string&gt;</code> - Bug ID
                </p>
              </div>
            </div>

            <CodeBlock
              code={`// Capture error in try-catch
try {
  await riskyOperation();
} catch (error) {
  BugRadar.captureError(error, {
    operation: 'riskyOperation',
    userId: currentUser.id,
  });
}

// Capture with custom context
BugRadar.captureError(
  new Error('Payment processing failed'),
  { amount: 99.99, currency: 'USD' }
);`}
              language="typescript"
              filename="example.ts"
            />
          </Card>
        </section>

        {/* BugRadar.captureMessage() */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-coral-500" />
            BugRadar.captureMessage()
          </h2>

          <Card className="p-6 border-slate-200 dark:border-slate-700 mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Capture a message or feedback (not necessarily an error).
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Parameters</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">title</code>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">string</code> - Message title
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">description</code>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">string</code> (optional) - Detailed description
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">priority</code>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">'low' | 'medium' | 'high'</code> (optional) - Priority level
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Returns</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Promise&lt;string&gt;</code> - Bug ID
                </p>
              </div>
            </div>

            <CodeBlock
              code={`// Capture feature request
BugRadar.captureMessage(
  'Feature Request',
  'Would love to see dark mode support',
  'low'
);

// Capture user feedback
BugRadar.captureMessage(
  'User Feedback',
  'The checkout flow is confusing',
  'medium'
);

// Simple message
BugRadar.captureMessage('Performance issue on dashboard');`}
              language="typescript"
              filename="example.ts"
            />
          </Card>
        </section>

        {/* BugRadar.setUser() */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <User className="w-6 h-6 text-coral-500" />
            BugRadar.setUser()
          </h2>

          <Card className="p-6 border-slate-200 dark:border-slate-700 mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Set the current user identifier. Useful when users log in after SDK initialization.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Parameters</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">identifier</code>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">string</code> - User identifier (email, ID, etc.)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Returns</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">void</code>
                </p>
              </div>
            </div>

            <CodeBlock
              code={`// Set user after login
function handleLogin(user) {
  BugRadar.setUser(user.email);
}

// Update user identifier
BugRadar.setUser('user-123');`}
              language="typescript"
              filename="example.ts"
            />
          </Card>
        </section>

        {/* BugRadar.setMetadata() */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-coral-500" />
            BugRadar.setMetadata()
          </h2>

          <Card className="p-6 border-slate-200 dark:border-slate-700 mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Add or update custom metadata. Merges with existing metadata.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Parameters</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start gap-3">
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">metadata</code>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Record&lt;string, any&gt;</code> - Metadata to add/update
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Returns</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">void</code>
                </p>
              </div>
            </div>

            <CodeBlock
              code={`// Set metadata during app lifecycle
BugRadar.setMetadata({
  plan: 'pro',
  company: 'Acme Inc',
  environment: 'production',
});

// Update when user changes plan
function handlePlanUpgrade(newPlan) {
  BugRadar.setMetadata({ plan: newPlan });
}`}
              language="typescript"
              filename="example.ts"
            />
          </Card>
        </section>

        {/* BugRadar.destroy() */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-coral-500" />
            BugRadar.destroy()
          </h2>

          <Card className="p-6 border-slate-200 dark:border-slate-700 mb-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Clean up and remove the SDK. Removes event listeners, UI elements, and clears stored data.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Parameters</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">None</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Returns</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">void</code>
                </p>
              </div>
            </div>

            <CodeBlock
              code={`// Cleanup when component unmounts
useEffect(() => {
  BugRadar.init('br_live_your_api_key');

  return () => {
    BugRadar.destroy();
  };
}, []);`}
              language="typescript"
              filename="example.ts"
            />
          </Card>
        </section>
      </div>
    </div>
  )
}
