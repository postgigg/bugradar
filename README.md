<p align="center">
  <img src="https://raw.githubusercontent.com/postgigg/bugradar/main/public/logo.svg" alt="BugRadar" width="80" height="80" />
</p>

<h1 align="center">BugRadar</h1>

<p align="center">
  <strong>Open source, self-hosted bug tracking with AI.</strong><br />
  Your data. Your servers. Free forever.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/Self--Hosted-100%25-blue.svg" alt="Self-Hosted" />
</p>

---

## Why BugRadar?

Most bug tracking tools are either:
- **Too expensive** — Monthly subscriptions that add up
- **Privacy concerns** — Your data on someone else's servers
- **Missing AI** — No intelligent analysis or enhancement

**BugRadar is different:**

| Feature | BugRadar | Others |
|---------|----------|--------|
| Price | **Free forever** | $10-100/month |
| Data ownership | **100% yours** | On their servers |
| AI enhancement | **Claude AI built-in** | Usually extra cost |
| Self-hosted | **Yes** | Rarely |
| Open source | **MIT License** | Closed source |

---

## Quick Start

Get up and running in under 5 minutes.

### Prerequisites

You'll need free accounts with:

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| [Supabase](https://supabase.com) | Database, auth, storage | 500MB DB, 1GB storage, 50K MAU |
| [Anthropic](https://console.anthropic.com) | AI bug analysis | Pay-as-you-go (~$0.01/report) |
| [Resend](https://resend.com) | Email notifications | 100 emails/day |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/postgigg/bugradar.git
cd bugradar

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Start development server
npm run dev
```

### Configuration

Edit `.env.local` with your credentials:

```env
# Supabase (get from supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Anthropic (get from console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Resend (get from resend.com/api-keys)
RESEND_API_KEY=re_...
```

### Database Setup

```bash
# Push database schema to Supabase
npx supabase db push
```

Open [http://localhost:3000](http://localhost:3000) and complete the onboarding wizard.

---

## SDK Installation (Capture Bugs in Your Apps)

Once your dashboard is running, install the SDK in your apps to capture bugs:

```bash
npm install bugradar
```

```javascript
import { BugRadar } from 'bugradar'

BugRadar.init({
  apiKey: 'br_live_xxx',  // from Dashboard > Settings > API Keys
  apiUrl: 'https://your-dashboard.vercel.app/api/v1'  // your dashboard URL
})
```

That's it! A floating bug button appears. Users click it to:
- Capture annotated screenshots
- Add descriptions
- Submit bugs to your dashboard

See the full [SDK documentation](./packages/sdk/README.md) for all options.

---

## Features

### Visual Bug Capture
- **Screenshot capture** — Native screen capture with area selection
- **Annotation tools** — Draw, highlight, arrows, text
- **Element selection** — Click any element, CSS selector captured automatically

### AI-Powered Analysis
- **Smart descriptions** — Claude AI enhances bug reports
- **Auto-categorization** — Bugs automatically prioritized
- **Fix suggestions** — AI recommends potential solutions

### Team Collaboration
- **Multi-user** — Invite unlimited team members
- **Assignments** — Assign bugs to specific developers
- **Comments** — Discuss bugs in context
- **Email notifications** — Get alerted on new bugs

### Dashboard
- **Kanban board** — Drag-and-drop bug management
- **Filters** — By status, priority, assignee, project
- **Search** — Find any bug instantly
- **Full context** — Screenshots, console logs, network requests

### Developer Experience
- **Modern stack** — Next.js 14, React 19, TypeScript
- **Beautiful UI** — TailwindCSS with dark mode
- **API access** — RESTful API for integrations
- **Extensible** — Open source, modify as needed

---

## Screenshots

<details>
<summary>View screenshots</summary>

### Dashboard
The main bug tracking dashboard with kanban view.

### Bug Detail
Full context view with screenshots, console logs, and AI analysis.

### Onboarding
Simple setup wizard to connect your services.

</details>

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | TailwindCSS |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth |
| **Storage** | Supabase Storage |
| **AI** | Anthropic Claude |
| **Email** | Resend |

---

## Project Structure

```
bugradar/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (auth)/             # Authentication pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/        # Main application
│   │   │   ├── dashboard/
│   │   │   │   ├── bugs/       # Bug management
│   │   │   │   ├── projects/   # Project settings
│   │   │   │   ├── team/       # Team management
│   │   │   │   └── settings/   # User settings
│   │   ├── (marketing)/        # Public pages
│   │   │   ├── pricing/
│   │   │   └── docs/
│   │   ├── (onboarding)/       # Setup wizard
│   │   └── api/                # API routes
│   │       ├── bugs/
│   │       ├── ai/
│   │       └── webhooks/
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components
│   │   ├── bugs/               # Bug-specific components
│   │   └── dashboard/          # Dashboard components
│   ├── lib/                    # Utilities
│   │   ├── supabase/           # Supabase clients
│   │   ├── ai/                 # AI utilities
│   │   └── email/              # Email templates
│   └── stores/                 # Zustand stores
├── supabase/
│   └── migrations/             # Database migrations
└── public/                     # Static assets
```

---

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/postgigg/bugradar)

1. Click the button above
2. Add environment variables
3. Deploy

### Netlify

1. Fork this repository
2. Connect to Netlify
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `RESEND_API_KEY`
4. Deploy

### Docker (Coming Soon)

```bash
docker pull ghcr.io/postgigg/bugradar:latest
docker run -p 3000:3000 --env-file .env ghcr.io/postgigg/bugradar
```

### Manual

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude |
| `RESEND_API_KEY` | Yes | Resend API key for emails |
| `NEXT_PUBLIC_APP_URL` | No | Your app URL (for emails) |

---

## API Reference

### Bugs

```bash
# Create a bug
POST /api/bugs
{
  "title": "Login button broken",
  "description": "...",
  "priority": "high",
  "project_id": "uuid"
}

# Get all bugs
GET /api/bugs?project_id=uuid&status=open

# Update a bug
PATCH /api/bugs/:id
{
  "status": "resolved"
}
```

### Webhooks

BugRadar can send webhooks when bugs are created or updated:

```bash
POST /api/webhooks/claude-code
{
  "bugId": "uuid",
  "event": "fix_completed",
  "summary": "Fixed the login button..."
}
```

---

## Contributing

We love contributions! Here's how to get started:

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/bugradar.git
cd bugradar

# Install dependencies
npm install

# Create branch
git checkout -b feature/your-feature

# Start dev server
npm run dev
```

### Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use TypeScript
- Follow existing patterns
- Write meaningful commit messages
- Add tests for new features

---

## Roadmap

- [x] Visual bug capture with annotations
- [x] AI-enhanced descriptions (Claude)
- [x] Team management
- [x] Email notifications
- [x] Kanban dashboard
- [ ] Slack integration
- [ ] GitHub issue sync
- [ ] Browser extension
- [ ] Mobile app (React Native)
- [ ] Docker image
- [ ] Webhook integrations

---

## Support

- **GitHub Issues** — [Report bugs or request features](https://github.com/postgigg/bugradar/issues)
- **Discussions** — [Ask questions](https://github.com/postgigg/bugradar/discussions)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

You can use BugRadar for personal or commercial projects. No attribution required (but appreciated!).

---

## Acknowledgments

Built with amazing open source projects:

- [Next.js](https://nextjs.org) — React framework
- [Supabase](https://supabase.com) — Backend as a service
- [TailwindCSS](https://tailwindcss.com) — CSS framework
- [Anthropic Claude](https://anthropic.com) — AI
- [Resend](https://resend.com) — Email
- [Lucide](https://lucide.dev) — Icons

---

<p align="center">
  <strong>Free. Open Source. Self-Hosted.</strong>
</p>

<p align="center">
  <a href="https://github.com/postgigg/bugradar">Star on GitHub</a>
</p>
