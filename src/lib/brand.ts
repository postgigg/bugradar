// Brand configuration and style utilities

export const brand = {
  name: 'BugRadar',
  tagline: 'Bug tracking that doesn\'t suck',
  description: 'AI-powered bug tracking for vibe coders',

  colors: {
    primary: '#EF4444',
    primaryHover: '#DC2626',
    primaryLight: '#FEE2E2',
  },

  links: {
    docs: '/docs',
    pricing: '/pricing',
    github: 'https://github.com/bugradar',
    twitter: 'https://twitter.com/bugradar',
    discord: 'https://discord.gg/bugradar',
  },
}

// Button style variants
export const buttonStyles = {
  primary: 'bg-coral-500 hover:bg-coral-600 text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-lg px-4 py-2 transition-colors duration-150 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white',
  ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium rounded-lg px-4 py-2 transition-colors duration-150 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800',
  destructive: 'bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-4 py-2 transition-colors duration-150',
  outline: 'border-2 border-coral-500 text-coral-600 hover:bg-coral-50 font-medium rounded-lg px-4 py-2 transition-colors duration-150 dark:hover:bg-coral-500/10',
}

// Card style variants
export const cardStyles = {
  default: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm',
  elevated: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg',
  interactive: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md hover:border-coral-300 dark:hover:border-coral-700 transition-all duration-150 cursor-pointer',
}

// Input style
export const inputStyles = {
  default: 'w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors duration-150',
  error: 'w-full bg-white dark:bg-slate-900 border border-red-500 rounded-lg px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-150',
}

// Badge style variants
export const badgeStyles = {
  default: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  primary: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-coral-100 text-coral-800 dark:bg-coral-900/30 dark:text-coral-400',
  success: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

// Priority colors for bugs
export const priorityColors = {
  critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  medium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  low: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-700 dark:text-slate-300', dot: 'bg-slate-400' },
}

// Status colors for bugs
export const statusColors = {
  new: { bg: 'bg-coral-100 dark:bg-coral-900/30', text: 'text-coral-700 dark:text-coral-400' },
  open: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  in_progress: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  resolved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  closed: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400' },
  wont_fix: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400' },
}
