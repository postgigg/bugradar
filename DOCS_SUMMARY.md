# BugRadar SDK Documentation Site

A comprehensive documentation site has been created for the BugRadar SDK at `/src/app/(marketing)/docs/`

## Created Files

### Components (`/src/components/docs/`)
- **code-block.tsx** - Reusable code block component with syntax highlighting, line numbers, and copy functionality. Features terminal-style header with traffic light dots matching brand guidelines.
- **docs-sidebar.tsx** - Sidebar navigation for docs with active state highlighting, section grouping, and quick links.

### Documentation Pages (`/src/app/(marketing)/docs/`)
- **layout.tsx** - Shared layout for all docs pages with navigation, sidebar integration, and footer.
- **page.tsx** - Main docs landing page with quick start guide, features overview, and navigation cards.
- **installation/page.tsx** - Complete installation guide for npm, CDN, React, Next.js, Vue, Svelte, and Angular.
- **configuration/page.tsx** - Detailed reference for all configuration options organized by category.
- **api-reference/page.tsx** - Full API documentation for all SDK methods with examples and type signatures.
- **examples/page.tsx** - Real-world code examples including error boundaries, API handling, and framework integrations.
- **troubleshooting/page.tsx** - Common issues and solutions with actionable steps.

## Design Features

### Brand Consistency
- Primary color: #EF4444 (coral-500) used throughout
- Typography: Inter for headings/body, JetBrains Mono for code
- Dark mode support with proper color variants
- No gradients - solid colors only as per brand guidelines
- Lucide icons used consistently

### Code Blocks
- Terminal-style headers with traffic light dots (red, yellow, green)
- Syntax highlighting for JavaScript/TypeScript and Bash
- Line numbers (toggleable)
- Copy to clipboard functionality
- Dark background (bg-slate-900) with syntax-colored text
- Filename display in header

### Navigation
- Sticky sidebar with hierarchical navigation
- Active page highlighting with coral accent
- Quick links section for external resources
- Responsive layout with proper spacing

### Content Structure
Each documentation page includes:
- Coral-colored section badges
- Clear headings with icon indicators
- Card-based layouts for better scanability
- Code examples with context
- Help/support sections

## Pages Overview

### 1. Introduction (docs/page.tsx)
- Quick start guide (2-step setup)
- Feature cards showcasing key capabilities
- Next steps navigation grid
- Help section with support links

### 2. Installation (docs/installation/page.tsx)
- NPM/Yarn/PNPM installation
- CDN script tag method
- Framework-specific guides:
  - React + Vite
  - Next.js App Router
  - Vue 3
  - Svelte
  - Angular
- API key callout

### 3. Configuration (docs/configuration/page.tsx)
Organized by category:
- Capture Settings (screenshots, console, network, auto-capture)
- Limits (console logs, network logs)
- UI Settings (position, theme, button visibility, keyboard shortcut)
- User Context (identifier, metadata)
- Callbacks (onBeforeSubmit, onSubmitSuccess, onSubmitError)

### 4. API Reference (docs/api-reference/page.tsx)
Complete method documentation:
- BugRadar.init()
- BugRadar.open()
- BugRadar.close()
- BugRadar.captureError()
- BugRadar.captureMessage()
- BugRadar.setUser()
- BugRadar.setMetadata()
- BugRadar.destroy()

### 5. Examples (docs/examples/page.tsx)
Real-world implementations:
- React + Vite basic setup
- Next.js App Router with provider pattern
- Vue 3 Composition API
- Error boundary integration
- API error handling (Axios + Fetch)
- Custom trigger buttons
- Environment-specific config
- User feedback widget

### 6. Troubleshooting (docs/troubleshooting/page.tsx)
Solutions for common issues:
- Bug button not appearing
- Invalid API key errors
- Screenshot capture problems
- Network logs not working
- TypeScript type errors
- Performance concerns
- Next.js hydration errors

## Accessibility Features
- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance

## Developer Experience
- Clear, concise explanations
- "Developer voice" writing style (matches brand: "Bug tracking that doesn't suck")
- Extensive code examples
- Copy-paste ready snippets
- Framework-agnostic where possible
- TypeScript examples with proper typing

## Navigation Flow
Users can navigate:
1. From landing page → Installation guide
2. Installation → Configuration for customization
3. Configuration → API Reference for detailed method info
4. API Reference → Examples for implementation patterns
5. Any page → Troubleshooting when issues arise

## Next Steps
To view the documentation:
1. Start your Next.js dev server: `npm run dev`
2. Navigate to `/docs` in your browser
3. Explore all documentation pages via the sidebar

The documentation is production-ready and matches the BugRadar brand identity perfectly!
