import { Metadata } from 'next'
import { FileCode, Zap } from 'lucide-react'
import { CodeBlock } from '@/components/docs/code-block'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Examples | BugRadar SDK',
  description: 'Code examples for integrating BugRadar SDK',
}

export default function ExamplesPage() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-sm font-medium mb-4">
          <FileCode className="w-4 h-4" />
          <span>Examples</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Code Examples
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Real-world examples for integrating BugRadar into your application.
        </p>
      </div>

      {/* React Example */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          React + Vite
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Basic React application with BugRadar integration:
        </p>

        <CodeBlock
          code={`import { useEffect } from 'react';
import { BugRadar } from 'bugradar';

function App() {
  useEffect(() => {
    // Initialize BugRadar
    BugRadar.init({
      apiKey: 'br_live_your_api_key',
      enableScreenshot: true,
      enableConsoleLogs: true,
      position: 'bottom-right',
      theme: 'auto',
    });

    // Set user after authentication
    const user = getCurrentUser();
    if (user) {
      BugRadar.setUser(user.email);
      BugRadar.setMetadata({
        plan: user.plan,
        environment: import.meta.env.MODE,
      });
    }

    // Cleanup on unmount
    return () => BugRadar.destroy();
  }, []);

  return (
    <div className="App">
      <h1>My App</h1>
      <button onClick={() => BugRadar.open()}>
        Report a Bug
      </button>
    </div>
  );
}

export default App;`}
          language="typescript"
          filename="src/App.tsx"
        />
      </div>

      {/* Next.js App Router Example */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          Next.js (App Router)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Next.js App Router integration with client component:
        </p>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              1. Create a BugRadar provider component:
            </p>
            <CodeBlock
              code={`'use client'

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BugRadar } from 'bugradar';

export function BugRadarProvider({ user }: { user?: any }) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize on mount
    BugRadar.init({
      apiKey: process.env.NEXT_PUBLIC_BUGRADAR_API_KEY!,
      enableScreenshot: true,
      enableConsoleLogs: true,
      enableNetworkLogs: true,
      theme: 'auto',
      position: 'bottom-right',
      metadata: {
        environment: process.env.NODE_ENV,
        version: process.env.NEXT_PUBLIC_APP_VERSION,
      },
    });

    // Set user if authenticated
    if (user) {
      BugRadar.setUser(user.email);
      BugRadar.setMetadata({
        userId: user.id,
        plan: user.plan,
      });
    }

    return () => BugRadar.destroy();
  }, [user]);

  // Update metadata on route changes
  useEffect(() => {
    BugRadar.setMetadata({ currentPath: pathname });
  }, [pathname]);

  return null;
}`}
              language="typescript"
              filename="components/BugRadarProvider.tsx"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              2. Add to your root layout:
            </p>
            <CodeBlock
              code={`import { BugRadarProvider } from '@/components/BugRadarProvider';
import { getCurrentUser } from '@/lib/auth';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <BugRadarProvider user={user} />
        {children}
      </body>
    </html>
  );
}`}
              language="typescript"
              filename="app/layout.tsx"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              3. Add environment variables:
            </p>
            <CodeBlock
              code={`NEXT_PUBLIC_BUGRADAR_API_KEY=br_live_your_api_key
NEXT_PUBLIC_APP_VERSION=1.0.0`}
              language="bash"
              filename=".env.local"
              showLineNumbers={false}
            />
          </div>
        </div>
      </div>

      {/* Vue 3 Example */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          Vue 3 + Vite
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Vue 3 Composition API with BugRadar:
        </p>

        <CodeBlock
          code={`import { createApp } from 'vue';
import { BugRadar } from 'bugradar';
import App from './App.vue';

// Initialize BugRadar
BugRadar.init({
  apiKey: import.meta.env.VITE_BUGRADAR_API_KEY,
  enableScreenshot: true,
  enableConsoleLogs: true,
  position: 'bottom-right',
  metadata: {
    environment: import.meta.env.MODE,
  },
});

const app = createApp(App);
app.mount('#app');`}
          language="typescript"
          filename="src/main.ts"
        />

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Using in components:
          </p>
          <CodeBlock
            code={`<script setup lang="ts">
import { onMounted } from 'vue';
import { BugRadar } from 'bugradar';

onMounted(() => {
  // Set user after login
  const user = getUserFromStore();
  if (user) {
    BugRadar.setUser(user.email);
  }
});

const reportBug = () => {
  BugRadar.open();
};
</script>

<template>
  <div>
    <button @click="reportBug">Report Bug</button>
  </div>
</template>`}
            language="typescript"
            filename="src/components/Header.vue"
          />
        </div>
      </div>

      {/* Error Boundary Example */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          Error Boundary Integration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Capture React errors with an error boundary:
        </p>

        <CodeBlock
          code={`import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BugRadar } from 'bugradar';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // Capture error with BugRadar
    BugRadar.captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h1>Oops! Something went wrong</h1>
          <p>We've been notified and are working on a fix.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;`}
          language="typescript"
          filename="components/ErrorBoundary.tsx"
        />
      </div>

      {/* API Error Handling */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          API Error Handling
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Automatically capture API errors:
        </p>

        <CodeBlock
          code={`import { BugRadar } from 'bugradar';

// Axios interceptor
import axios from 'axios';

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Capture failed API calls
    if (error.response) {
      BugRadar.captureError(error, {
        endpoint: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
      });
    }
    return Promise.reject(error);
  }
);

// Fetch wrapper
async function fetchWithErrorCapture(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      BugRadar.captureError(error, {
        url,
        method: options?.method || 'GET',
        status: response.status,
      });
      throw error;
    }

    return response.json();
  } catch (error) {
    BugRadar.captureError(error as Error, {
      url,
      method: options?.method || 'GET',
    });
    throw error;
  }
}`}
          language="typescript"
          filename="lib/api.ts"
        />
      </div>

      {/* Custom Trigger Example */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          Custom Trigger Button
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Hide the default button and use your own:
        </p>

        <CodeBlock
          code={`import { BugRadar } from 'bugradar';
import { Bug } from 'lucide-react';

// Initialize with hidden button
BugRadar.init({
  apiKey: 'br_live_your_api_key',
  showButton: false, // Hide default button
});

// Custom button component
export function CustomBugButton() {
  return (
    <button
      onClick={() => BugRadar.open()}
      className="fixed bottom-4 right-4 bg-coral-500 hover:bg-coral-600 text-white p-4 rounded-full shadow-lg transition-all"
    >
      <Bug className="w-6 h-6" />
    </button>
  );
}`}
          language="typescript"
          filename="components/CustomBugButton.tsx"
        />
      </div>

      {/* Environment-Specific Config */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          Environment-Specific Configuration
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Different settings for development and production:
        </p>

        <CodeBlock
          code={`import { BugRadar } from 'bugradar';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

BugRadar.init({
  apiKey: process.env.NEXT_PUBLIC_BUGRADAR_API_KEY!,

  // Enable everything in development
  enableScreenshot: true,
  enableConsoleLogs: true,
  enableNetworkLogs: true,

  // Only auto-capture in production
  enableAutoCapture: isProd,

  // More logs in development
  maxConsoleLogs: isDev ? 100 : 50,
  maxNetworkLogs: isDev ? 50 : 20,

  metadata: {
    environment: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION,
    buildId: process.env.NEXT_PUBLIC_BUILD_ID,
  },

  // Custom callbacks
  onBeforeSubmit: (report) => {
    // Don't report in development
    if (isDev) {
      console.log('Bug report (dev mode):', report);
      return false;
    }
    return report;
  },

  onSubmitSuccess: (response) => {
    console.log('Bug reported:', response.bugId);
    if (isProd) {
      // Track in analytics
      analytics.track('Bug Reported', { bugId: response.bugId });
    }
  },
});`}
          language="typescript"
          filename="lib/bugradar.ts"
        />
      </div>

      {/* User Feedback Example */}
      <div className="not-prose">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
          User Feedback Widget
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Create a custom feedback form:
        </p>

        <CodeBlock
          code={`import { useState } from 'react';
import { BugRadar } from 'bugradar';

export function FeedbackWidget() {
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await BugRadar.captureMessage(
        'User Feedback',
        feedback,
        'low'
      );

      alert('Thanks for your feedback!');
      setFeedback('');
    } catch (error) {
      alert('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <label className="block mb-2 font-medium">
        Send us your feedback
      </label>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full p-3 border rounded-lg mb-3"
        rows={4}
        placeholder="Tell us what you think..."
        required
      />
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 disabled:opacity-50"
      >
        {submitting ? 'Sending...' : 'Send Feedback'}
      </button>
    </form>
  );
}`}
          language="typescript"
          filename="components/FeedbackWidget.tsx"
        />
      </div>
    </div>
  )
}
