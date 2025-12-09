# BugRadar

**Open source, self-hosted bug tracking with AI.** Your data stays on your infrastructure.

[![License: MIT](https://img.shields.io/badge/License-MIT-coral.svg)](https://opensource.org/licenses/MIT)

---

## What is BugRadar?

A self-hosted bug tracking dashboard with AI-powered reports. Built with Next.js, Supabase, and Claude AI.

- **Visual Bug Reports** — Screenshot capture with annotations
- **AI Enhancement** — Claude analyzes and enriches every report
- **Self-Hosted** — Your data stays on your servers
- **Free Forever** — Open source, no subscriptions

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/postgigg/bugradar.git
cd bugradar
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up services

You'll need accounts with (all have free tiers):

| Service | What For | Free Tier |
|---------|----------|-----------|
| [Supabase](https://supabase.com) | Database, auth, storage | 500MB DB, 1GB storage |
| [Anthropic](https://anthropic.com) | AI enhancement | Pay-as-you-go (~$0.01/report) |
| [Resend](https://resend.com) | Email notifications | 100 emails/day |

### 4. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your service credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Resend
RESEND_API_KEY=re_...
```

### 5. Run database migrations

```bash
npx supabase db push
```

### 6. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and go through onboarding.

---

## Features

### Bug Tracking
- Visual bug reports with screenshot capture
- Annotation tools (draw, highlight, arrows)
- Console log and network request capture
- CSS selector detection

### AI-Powered
- Claude AI enhances bug descriptions
- Automatic categorization
- Suggested fixes

### Team Features
- Invite team members
- Assign bugs
- Track resolution status
- Email notifications

### Dashboard
- Filter by status, priority, project
- Full context view (screenshots, console, network)
- Kanban board

---

## Tech Stack

- **Frontend**: Next.js 14, React 19, TailwindCSS
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: Anthropic Claude
- **Email**: Resend
- **Language**: TypeScript

---

## Project Structure

```
bugradar/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── (auth)/          # Login, signup
│   │   ├── (dashboard)/     # Main dashboard
│   │   ├── (marketing)/     # Landing pages
│   │   ├── (onboarding)/    # Setup wizard
│   │   └── api/             # API routes
│   ├── components/          # React components
│   └── lib/                 # Utilities
└── supabase/
    └── migrations/          # Database schema
```

---

## Deployment

### Vercel (Recommended)

1. Fork this repo
2. Import to Vercel
3. Add environment variables
4. Deploy

### Netlify

1. Fork this repo
2. Import to Netlify
3. Add environment variables
4. Deploy

### Self-Hosted

1. Build the app: `npm run build`
2. Start production server: `npm start`
3. Or use Docker (coming soon)

---

## Contributing

Pull requests welcome! Please read our contributing guidelines first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Support

- [GitHub Issues](https://github.com/postgigg/bugradar/issues) - Bug reports & feature requests
- [Discussions](https://github.com/postgigg/bugradar/discussions) - Questions & community

---

<p align="center">
  <strong>Free. Open Source. Self-Hosted.</strong>
</p>

<p align="center">
  <a href="https://github.com/postgigg/bugradar">GitHub</a>
</p>
