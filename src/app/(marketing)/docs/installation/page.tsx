import { Metadata } from 'next'
import { Download, Package, Rocket, AlertCircle } from 'lucide-react'
import { CodeBlock } from '@/components/docs/code-block'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Installation | BugRadar SDK',
  description: 'How to install BugRadar SDK in your application',
}

export default function InstallationPage() {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {/* Header */}
      <div className="not-prose mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-coral-100 dark:bg-coral-900/30 text-coral-600 dark:text-coral-400 text-sm font-medium mb-4">
          <Download className="w-4 h-4" />
          <span>Installation</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Installation Guide
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Install BugRadar SDK in your application using your preferred package manager.
        </p>
      </div>

      {/* NPM Installation */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
          <Package className="w-6 h-6 text-coral-500" />
          NPM Installation
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Install the BugRadar SDK using npm, yarn, or pnpm:
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Using npm:</p>
            <CodeBlock
              code={`npm install @bugradar/sdk`}
              language="bash"
              filename="terminal"
              showLineNumbers={false}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Using yarn:</p>
            <CodeBlock
              code={`yarn add @bugradar/sdk`}
              language="bash"
              filename="terminal"
              showLineNumbers={false}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Using pnpm:</p>
            <CodeBlock
              code={`pnpm add @bugradar/sdk`}
              language="bash"
              filename="terminal"
              showLineNumbers={false}
            />
          </div>
        </div>
      </div>

      {/* Script Tag Installation */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
          Script Tag (CDN)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          If you're not using a bundler, you can include BugRadar via a script tag:
        </p>

        <CodeBlock
          code={`<script
  src="https://cdn.bugradar.io/sdk.js"
  data-api-key="br_live_your_api_key"
></script>`}
          language="html"
          filename="index.html"
        />

        <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">Replace API Key</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Don't forget to replace <code className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded text-xs">br_live_your_api_key</code> with your actual API key from the dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Framework-Specific Setup */}
      <div className="not-prose mb-12">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
          <Rocket className="w-6 h-6 text-coral-500" />
          Framework-Specific Setup
        </h2>

        <div className="space-y-8">
          {/* React */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              React
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Initialize BugRadar in your root component or index file:
            </p>
            <CodeBlock
              code={`import { useEffect } from 'react';
import { BugRadar } from '@bugradar/sdk';

function App() {
  useEffect(() => {
    BugRadar.init('br_live_your_api_key');
  }, []);

  return (
    <div className="App">
      {/* Your app content */}
    </div>
  );
}

export default App;`}
              language="typescript"
              filename="src/App.tsx"
            />
          </div>

          {/* Next.js */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Next.js (App Router)
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Create a client component to initialize BugRadar:
            </p>
            <CodeBlock
              code={`'use client'

import { useEffect } from 'react';
import { BugRadar } from '@bugradar/sdk';

export function BugRadarProvider() {
  useEffect(() => {
    BugRadar.init('br_live_your_api_key');
  }, []);

  return null;
}`}
              language="typescript"
              filename="components/BugRadarProvider.tsx"
            />
            <p className="text-slate-600 dark:text-slate-400 my-4">
              Then include it in your root layout:
            </p>
            <CodeBlock
              code={`import { BugRadarProvider } from '@/components/BugRadarProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BugRadarProvider />
        {children}
      </body>
    </html>
  );
}`}
              language="typescript"
              filename="app/layout.tsx"
            />
          </div>

          {/* Vue */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Vue
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Initialize BugRadar in your main.js or main.ts:
            </p>
            <CodeBlock
              code={`import { createApp } from 'vue';
import { BugRadar } from '@bugradar/sdk';
import App from './App.vue';

BugRadar.init('br_live_your_api_key');

createApp(App).mount('#app');`}
              language="typescript"
              filename="src/main.ts"
            />
          </div>

          {/* Svelte */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Svelte
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Initialize BugRadar in your root component:
            </p>
            <CodeBlock
              code={`<script>
  import { onMount } from 'svelte';
  import { BugRadar } from '@bugradar/sdk';

  onMount(() => {
    BugRadar.init('br_live_your_api_key');
  });
</script>

<main>
  <!-- Your app content -->
</main>`}
              language="typescript"
              filename="src/App.svelte"
            />
          </div>

          {/* Angular */}
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Angular
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Initialize BugRadar in your AppComponent:
            </p>
            <CodeBlock
              code={`import { Component, OnInit } from '@angular/core';
import { BugRadar } from '@bugradar/sdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  ngOnInit() {
    BugRadar.init('br_live_your_api_key');
  }
}`}
              language="typescript"
              filename="src/app/app.component.ts"
            />
          </div>
        </div>
      </div>

      {/* Get API Key */}
      <div className="not-prose">
        <Card className="p-6 bg-coral-50 dark:bg-coral-900/20 border-coral-200 dark:border-coral-800">
          <h3 className="font-semibold text-lg text-coral-900 dark:text-coral-100 mb-2">
            Get Your API Key
          </h3>
          <p className="text-sm text-coral-700 dark:text-coral-300 mb-4">
            To get your API key, sign up for a free account and create a new project in the BugRadar dashboard.
          </p>
          <a
            href="/signup"
            className="inline-flex items-center gap-2 px-4 py-2 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-medium transition-colors"
          >
            Get Started Free
            <Rocket className="w-4 h-4" />
          </a>
        </Card>
      </div>
    </div>
  )
}
