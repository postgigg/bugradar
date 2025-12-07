import { Metadata } from 'next'
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react'
import { CodeBlock } from '@/components/docs/code-block'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Troubleshooting | BugRadar SDK',
  description: 'Common issues and solutions for BugRadar SDK',
}

export default function TroubleshootingPage() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-sm font-medium mb-4">
          <AlertCircle className="w-4 h-4" />
          <span>Troubleshooting</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Troubleshooting Guide
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Common issues and their solutions to help you get BugRadar working smoothly.
        </p>
      </div>

      {/* Common Issues */}
      <div className="not-prose space-y-8">
        {/* Bug button not appearing */}
        <section>
          <Card className="p-6 border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-coral-600 dark:text-coral-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Bug button not appearing
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  The floating bug button doesn't show up on your page.
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                      Solution 1: Check initialization
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Make sure you've called <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">BugRadar.init()</code> before the page fully loads:
                    </p>
                    <CodeBlock
                      code={`// ✅ Good - runs on component mount
useEffect(() => {
  BugRadar.init('br_live_your_api_key');
}, []);

// ❌ Bad - might not run
BugRadar.init('br_live_your_api_key'); // Outside component`}
                      language="typescript"
                      filename="example.tsx"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                      Solution 2: Check showButton setting
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Verify that <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">showButton</code> is not set to false:
                    </p>
                    <CodeBlock
                      code={`BugRadar.init({
  apiKey: 'br_live_your_api_key',
  showButton: true, // Make sure this is true
});`}
                      language="typescript"
                      filename="example.ts"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                      Solution 3: Check z-index conflicts
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      The button uses <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">z-index: 999999</code>. Make sure no other elements have higher z-index values.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Invalid API key */}
        <section>
          <Card className="p-6 border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-coral-600 dark:text-coral-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  "Invalid API key" error
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  You see an "Invalid API key" error in the console.
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                      Solution: Verify your API key
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Make sure you're using the correct API key from your dashboard:
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1 mb-3">
                      <li>API keys start with <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">br_live_</code> for production</li>
                      <li>Or <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">br_test_</code> for testing</li>
                      <li>Check for extra spaces or line breaks when copying</li>
                      <li>Regenerate the key in your dashboard if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Screenshots not capturing */}
        <section>
          <Card className="p-6 border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-coral-600 dark:text-coral-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Screenshots not capturing correctly
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Screenshots are blank, incomplete, or showing errors.
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                      Solution 1: CORS issues
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Images from external domains need CORS headers. Add <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">crossorigin="anonymous"</code> to image tags:
                    </p>
                    <CodeBlock
                      code={`<img
  src="https://example.com/image.jpg"
  crossorigin="anonymous"
  alt="Product"
/>`}
                      language="html"
                      filename="example.html"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                      Solution 2: Hide sensitive content
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Use the <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">bugradar-ignore</code> class to hide sensitive elements:
                    </p>
                    <CodeBlock
                      code={`<div class="bugradar-ignore">
  <!-- This content won't appear in screenshots -->
  <input type="password" />
  <div>Credit card: •••• 1234</div>
</div>`}
                      language="html"
                      filename="example.html"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                      Solution 3: Browser compatibility
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Screenshots use the HTML5 Canvas API. They work in all modern browsers but may have limitations in older browsers (IE11, old Safari versions).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Network logs not capturing */}
        <section>
          <Card className="p-6 border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-coral-600 dark:text-coral-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Network logs not capturing
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  API calls are not showing up in bug reports.
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                      Solution: Check enableNetworkLogs setting
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Make sure network logging is enabled:
                    </p>
                    <CodeBlock
                      code={`BugRadar.init({
  apiKey: 'br_live_your_api_key',
  enableNetworkLogs: true, // Make sure this is true
  maxNetworkLogs: 20, // Increase if needed
});`}
                      language="typescript"
                      filename="example.ts"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Note: Only fetch and XMLHttpRequest are captured
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      BugRadar captures requests made via <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">fetch()</code> and <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">XMLHttpRequest</code>. Other methods (like WebSocket) are not tracked.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* TypeScript errors */}
        <section>
          <Card className="p-6 border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-coral-600 dark:text-coral-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  TypeScript type errors
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Getting TypeScript errors when using the SDK.
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                      Solution: Update package and check types
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Make sure you're using the latest version:
                    </p>
                    <CodeBlock
                      code={`npm update bugradar`}
                      language="bash"
                      filename="terminal"
                      showLineNumbers={false}
                    />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                      The package includes TypeScript definitions. If you still see errors, try restarting your TypeScript server.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Performance issues */}
        <section>
          <Card className="p-6 border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-coral-600 dark:text-coral-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Performance impact
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  The SDK is slowing down your application.
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                      Solution: Reduce capture limits
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Lower the number of logs being captured:
                    </p>
                    <CodeBlock
                      code={`BugRadar.init({
  apiKey: 'br_live_your_api_key',
  maxConsoleLogs: 25,  // Reduced from 50
  maxNetworkLogs: 10,  // Reduced from 20
});`}
                      language="typescript"
                      filename="example.ts"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                      Disable features you don't need
                    </p>
                    <CodeBlock
                      code={`BugRadar.init({
  apiKey: 'br_live_your_api_key',
  enableConsoleLogs: false,  // Disable if not needed
  enableNetworkLogs: false,  // Disable if not needed
});`}
                      language="typescript"
                      filename="example.ts"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                      <strong>Note:</strong> BugRadar is designed to have minimal performance impact. The SDK is lazy-loaded and operations run asynchronously. If you're experiencing significant slowdowns, please contact support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Next.js hydration errors */}
        <section>
          <Card className="p-6 border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-coral-600 dark:text-coral-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Next.js hydration errors
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Getting hydration mismatch errors in Next.js.
                </p>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                      Solution: Use client component
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Initialize BugRadar in a client component with <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">'use client'</code>:
                    </p>
                    <CodeBlock
                      code={`'use client'

import { useEffect } from 'react';
import { BugRadar } from 'bugradar';

export function BugRadarProvider() {
  useEffect(() => {
    BugRadar.init('br_live_your_api_key');
  }, []);

  return null;
}`}
                      language="typescript"
                      filename="components/BugRadarProvider.tsx"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* Still need help */}
      <div className="not-prose mt-12">
        <Card className="p-8 bg-gradient-to-br from-coral-50 to-coral-100 dark:from-coral-950 dark:to-coral-900/50 border-coral-200 dark:border-coral-800">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
            Still need help?
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-6">
            Can't find a solution to your problem? We're here to help.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:support@bugradar.io"
              className="inline-flex items-center gap-2 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-medium transition-colors"
            >
              Email Support
            </a>
            <a
              href="https://github.com/bugradar/sdk/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors border border-slate-200 dark:border-slate-700"
            >
              GitHub Issues
            </a>
            <a
              href="https://discord.gg/bugradar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors border border-slate-200 dark:border-slate-700"
            >
              Join Discord
            </a>
          </div>
        </Card>
      </div>
    </div>
  )
}
