# BugRadar 🐛

**Bug tracking that doesn't suck.** Self-hosted, AI-powered bug capture for modern development teams.

[![npm version](https://img.shields.io/npm/v/bugradar.svg)](https://www.npmjs.com/package/bugradar)
[![License: MIT](https://img.shields.io/badge/License-MIT-coral.svg)](https://opensource.org/licenses/MIT)

> **Self-Hosted** — Run BugRadar on your own infrastructure. Your data stays yours.

---

## The Problem

Traditional bug tracking is broken:
- Users can't describe bugs properly
- Screenshots miss critical context
- Console errors get lost
- Developers play detective instead of fixing

## The Solution

BugRadar captures **everything** automatically. Self-hosted platform + lightweight SDK. Full context. AI-enhanced reports.

```javascript
import { BugRadar } from 'bugradar'

BugRadar.init({
  apiKey: 'your-api-key',
  endpoint: 'http://localhost:3000/api/v1'  // Your self-hosted instance
})
```

That's it. Your users get a beautiful bug reporter. You get actionable reports. **On your own servers.**

---

## ✨ Features

### For Users
- **Visual Bug Capture** — Native screen capture with area selection
- **Annotation Tools** — Draw, highlight, add arrows and text
- **One-Click Reporting** — No forms, no friction

### For Developers
- **Full Context** — Console logs, network requests, browser info
- **AI Enhancement** — Claude automatically improves bug descriptions
- **Claude Code Integration** — One-click AI bug fixes directly in your codebase

### For Teams
- **Real-time Dashboard** — Track, prioritize, and resolve bugs
- **Email Notifications** — Get notified when bugs are reported
- **Project Management** — Organize by project, assign to team members

---

## 🚀 Quick Start

### 1. Install the SDK

```bash
npm install bugradar
```

### 2. Initialize in Your App

```javascript
import { BugRadar } from 'bugradar'

BugRadar.init({
  apiKey: 'br_live_xxxxxxxxxx',
  // Optional configuration
  position: 'bottom-right',
  theme: 'auto',
  showButton: true,
})
```

### 3. Start Catching Bugs

A floating bug button appears in your app. Users click it to report issues with full context captured automatically.

---

## 🎯 How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR APP                                │
│                                                                 │
│    ┌──────────────┐                                            │
│    │  🐛 Report   │  ← User clicks                             │
│    └──────────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│    ┌──────────────────────────────────────────┐                │
│    │  BugRadar Widget                         │                │
│    │  • Select bug type                       │                │
│    │  • Capture screenshot                    │                │
│    │  • Add annotations                       │                │
│    │  • AI enhances description               │                │
│    └──────────────────────────────────────────┘                │
│           │                                                     │
└───────────│─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│  BugRadar Dashboard                                             │
│  • View all bugs with full context                              │
│  • Assign to team members                                       │
│  • Launch Claude Code for AI fixes                              │
│  • Track resolution status                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠 SDK Configuration

```javascript
BugRadar.init({
  // Required
  apiKey: 'br_live_xxxxxxxxxx',

  // Widget Position
  position: 'bottom-right', // 'bottom-left' | 'top-right' | 'top-left'

  // Appearance
  theme: 'auto',           // 'light' | 'dark' | 'auto'
  showButton: true,        // Show floating button

  // User Context (optional)
  user: {
    id: 'user_123',
    email: 'user@example.com',
    name: 'Jane Doe',
  },

  // Custom Metadata
  metadata: {
    version: '1.2.3',
    environment: 'production',
  },
})
```

---

## 🤖 Claude Code Integration

BugRadar integrates with [Claude Code](https://claude.ai/claude-code) for AI-powered bug fixes:

1. **View Bug** — Open a bug in the dashboard
2. **Launch Claude** — Click "Fix with Claude Code"
3. **AI Analyzes** — Claude reviews the bug context
4. **Get Fixed** — Receive code changes with full explanation

```
Bug: "Login button unresponsive on Safari"
     ↓
Claude Code analyzes context, console errors, and page state
     ↓
Generates fix: "Added webkit-specific touch event handler"
     ↓
Summary pushed back to BugRadar dashboard
```

---

## 📊 Dashboard Features

| Feature | Description |
|---------|-------------|
| **Bug List** | Filter by status, priority, project |
| **Bug Detail** | Full context, screenshots, console logs |
| **AI Summary** | Claude-enhanced descriptions |
| **Team Management** | Invite members, assign bugs |
| **API Keys** | Manage per-project keys |
| **Email Alerts** | Get notified on new bugs |

---

## 🏗 Tech Stack

- **Frontend**: Next.js 14, React 19, TailwindCSS
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: Anthropic Claude (Enhancement, Fixes)
- **Email**: Resend
- **SDK**: TypeScript, html2canvas

---

## 📦 Project Structure

```
bugradar/
├── packages/
│   └── sdk/                 # npm package (bugradar)
│       ├── src/
│       │   ├── widget/      # Bug reporter UI
│       │   └── utils/       # Capture utilities
│       └── dist/            # Built package
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── (auth)/          # Login, signup, etc.
│   │   ├── (dashboard)/     # Main dashboard
│   │   ├── (marketing)/     # Landing, docs, pricing
│   │   └── api/             # API routes
│   ├── components/          # React components
│   └── lib/                 # Utilities, Supabase, email
└── supabase/
    └── migrations/          # Database schema
```

---

## 🔧 Self-Hosting

### Prerequisites
- Node.js 18+
- Supabase project
- Anthropic API key (for AI features)
- Resend API key (for email)

### Setup

1. **Clone the repo**
```bash
git clone https://github.com/postgigg/bugradar.git
cd bugradar
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

4. **Run migrations**
```bash
npx supabase db push
```

5. **Start development**
```bash
npm run dev
```

---

## 🗺 Roadmap

- [x] Visual bug capture with annotations
- [x] AI-enhanced descriptions
- [x] Claude Code integration
- [x] Email notifications
- [x] Team management
- [ ] Slack integration
- [ ] GitHub issue sync
- [ ] Browser extension
- [ ] Mobile SDK (React Native)
- [ ] Self-hosted Docker image

---

## 💼 Why Self-Hosted?

- **Data Ownership** — Your bug reports stay on your servers
- **No Vendor Lock-in** — MIT licensed, fork it, modify it, own it
- **Full Control** — Customize everything to your workflow
- **Privacy First** — Screenshots and logs never leave your infrastructure
- **Cost Effective** — No per-seat pricing, run it forever

---

## 📄 License

MIT © [BugRadar](https://bugradar.io)

---

<p align="center">
  <strong>Stop playing bug detective. Start shipping.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/bugradar">NPM</a> •
  <a href="https://github.com/postgigg/bugradar">GitHub</a>
</p>
