'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useOnboardingStore } from '@/stores/onboarding-store'
import {
  Copy, Check, ArrowLeft, Terminal,
  Key, ChevronDown, ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'cdn'

const installCommands: Record<PackageManager, string> = {
  npm: 'npm install bugradar',
  yarn: 'yarn add bugradar',
  pnpm: 'pnpm add bugradar',
  cdn: '<!-- CDN not available for self-hosted. Use npm install instead -->',
}

export function StepApiKey() {
  const { nextStep, prevStep, data } = useOnboardingStore()
  const [packageManager, setPackageManager] = useState<PackageManager>('npm')
  const [copied, setCopied] = useState<string | null>(null)
  const [showProdKey, setShowProdKey] = useState(false)

  const devKey = data.apiKeys?.development || 'br_test_xxxxxxxxxxxxx'
  const prodKey = data.apiKeys?.production || 'br_live_xxxxxxxxxxxxx'

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const initCode = `import { BugRadar } from 'bugradar';

BugRadar.init('${devKey}');`

  // For self-hosted, always use npm package
  const cdnInitCode = `// CDN not available for self-hosted. Use npm:
// npm install bugradar

import { BugRadar } from 'bugradar';
BugRadar.init({
  apiKey: '${devKey}',
  apiUrl: window.location.origin + '/api/v1'
});`

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Install the BugRadar SDK
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add these few lines to start catching bugs automatically
        </p>
      </div>

      {/* Package Manager Tabs */}
      <div className="space-y-3">
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
          {(['npm', 'yarn', 'pnpm', 'cdn'] as PackageManager[]).map((pm) => (
            <button
              key={pm}
              onClick={() => setPackageManager(pm)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                packageManager === pm
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              {pm.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Install Command */}
        <div className="relative">
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-slate-400 text-xs ml-2">Terminal</span>
            </div>
            <div className="p-4 font-mono text-sm text-slate-100">
              <span className="text-green-400">$</span> {installCommands[packageManager]}
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(installCommands[packageManager], 'install')}
            className="absolute top-12 right-3 p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            {copied === 'install' ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* API Key Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Your API Key (Development)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-3 font-mono text-sm text-slate-700 dark:text-slate-300 truncate">
            {devKey}
          </div>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => copyToClipboard(devKey, 'devKey')}
          >
            {copied === 'devKey' ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Production Key (Collapsed) */}
        <button
          onClick={() => setShowProdKey(!showProdKey)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {showProdKey ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Show Production Key
        </button>

        {showProdKey && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 font-mono text-sm text-amber-700 dark:text-amber-300 truncate">
              {prodKey}
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => copyToClipboard(prodKey, 'prodKey')}
            >
              {copied === 'prodKey' ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Init Code */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Initialize in your app
        </span>

        <div className="relative">
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-xs">
                {packageManager === 'cdn' ? 'index.html' : 'app.tsx'}
              </span>
            </div>
            <pre className="p-4 font-mono text-sm text-slate-100 overflow-x-auto">
              {packageManager === 'cdn' ? cdnInitCode : initCode}
            </pre>
          </div>
          <button
            onClick={() => copyToClipboard(packageManager === 'cdn' ? cdnInitCode : initCode, 'initCode')}
            className="absolute top-12 right-3 p-2 rounded-md bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            {copied === 'initCode' ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button type="button" variant="ghost" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={nextStep}>
          Continue
        </Button>
      </div>
    </div>
  )
}
