'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
}

export function CodeBlock({ code, language = 'typescript', filename, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split('\n')

  return (
    <div className="group relative my-6 rounded-2xl overflow-hidden shadow-xl bg-slate-900 border border-slate-800">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          {/* Traffic Light Dots */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer" />
          </div>
          {filename && (
            <span className="ml-2 text-slate-400 text-sm font-mono">{filename}</span>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto">
        <div className="p-6 font-mono text-sm md:text-base">
          <div className="space-y-1">
            {lines.map((line, index) => (
              <div key={index} className="flex items-center gap-4">
                {showLineNumbers && (
                  <span className="text-slate-600 select-none w-6 text-right flex-shrink-0">
                    {index + 1}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <code className="text-slate-100" dangerouslySetInnerHTML={{ __html: highlightCode(line, language) }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple syntax highlighting
function highlightCode(line: string, language: string): string {
  if (language === 'bash' || language === 'shell') {
    return line
      .replace(/^(\$|&gt;)/g, '<span class="text-green-400">$1</span>')
      .replace(/npm|npx|yarn|pnpm/g, '<span class="text-coral-400">$&</span>')
      .replace(/install|init|run|build|dev/g, '<span class="text-blue-400">$&</span>')
  }

  // JavaScript/TypeScript
  return line
    .replace(/\b(import|from|export|const|let|var|function|return|if|else|try|catch|async|await|new|class|interface|type)\b/g, '<span class="text-coral-400">$1</span>')
    .replace(/\b(BugRadar|React|useState|useEffect)\b/g, '<span class="text-amber-300">$1</span>')
    .replace(/\b(init|open|close|captureError|captureMessage|setUser|setMetadata|destroy)\b/g, '<span class="text-blue-400">$1</span>')
    .replace(/'([^']*)'/g, '<span class="text-green-400">\'$1\'</span>')
    .replace(/"([^"]*)"/g, '<span class="text-green-400">"$1"</span>')
    .replace(/`([^`]*)`/g, '<span class="text-green-400">`$1`</span>')
    .replace(/\/\/(.*)/g, '<span class="text-slate-500">//$1</span>')
    .replace(/\/\*(.*?)\*\//g, '<span class="text-slate-500">/*$1*/</span>')
    .replace(/\{|\}/g, '<span class="text-white">$&</span>')
    .replace(/\[|\]/g, '<span class="text-white">$&</span>')
    .replace(/\(|\)/g, '<span class="text-white">$&</span>')
}
