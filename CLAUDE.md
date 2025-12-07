# BugRadar - Development Guidelines

## 🚨 CRITICAL INSTRUCTIONS FOR AI ASSISTANT

### ⛔ ABSOLUTE RULE #1: NEVER RENAME VARIABLES OR DATABASE FIELDS ⛔

**THIS IS THE MOST IMPORTANT RULE - VIOLATING IT WILL CRASH THE APPLICATION**

#### BEFORE CHANGING ANY VARIABLE OR FIELD NAME:

1. **STOP** - Check what the ACTUAL field name is in the database
2. **VERIFY** - Search the codebase for ALL uses of this variable/field
3. **COUNT IMPACT** - How many files use this name?
4. **DO NOT CHANGE IT** - Even if the name seems wrong or inconsistent

#### DATABASE IS THE SOURCE OF TRUTH:
- If database has field `type`, code MUST use `type` (NOT `service_type`)
- If database has field `company_name`, code MUST use `company_name` (NOT `name` or `customerName`)
- NEVER create new variable names for existing database fields
- NEVER rename database columns without explicit approval

#### FORBIDDEN ACTIONS - THESE WILL BREAK THE APP:
- ❌ Renaming database columns (e.g., `type` → `service_type`)
- ❌ Creating new variable names for existing fields (e.g., `customer.name` → `customer.customerName`)
- ❌ "Improving" variable names that are already in use
- ❌ Refactoring field names for "consistency"
- ❌ Assuming a field should be named differently
- ❌ Creating aliases or mappings to "fix" naming

#### VERIFICATION COMMANDS (RUN THESE FIRST):
```bash
# Check database schema for ACTUAL field names
npx supabase db diff

# Search codebase for field usage
grep -r "field_name" src/ | wc -l

# If result shows 50+ files use this name: DO NOT CHANGE IT
```

#### IMPACT ANALYSIS:
- If changing 1 file would break 50+ files: **DON'T DO IT**
- If database + queries use name A, but 1-2 files use name B: **FIX the 1-2 files to use name A**
- Always choose the path with LEAST total changes

---

### MANDATORY: Read Files First

**YOU MUST READ THE FILES BEFORE MAKING ANY CHANGES:**

1. **ALWAYS use the Read tool to read files before editing them**
2. **NEVER create duplicate files** - check if files already exist first
3. **NEVER guess at file contents** - always read the actual code
4. **Use Glob tool** to find existing files before creating new ones
5. **Check git status** to see what files already exist

### Code Quality Rules

1. **NO DUPLICATES**: Before creating any file, search for existing implementations
2. **READ FIRST**: Use Read tool on every file you plan to modify
3. **UNDERSTAND CONTEXT**: Read related files to understand the codebase structure
4. **FOLLOW PATTERNS**: Match existing code style and patterns in the codebase
5. **CHECK IMPORTS**: Verify import paths are correct by reading the files
6. **NEVER RENAME VARIABLES**: Use existing variable/field names exactly as they are

### Example Workflow

```bash
# 1. Find related files FIRST
glob "**/*component*.tsx"

# 2. Read the main file
# Use Read tool on the file found above

# 3. Check for duplicates
grep -r "function ComponentName" src/

# 4. Only THEN make changes - never before reading!
```

---

## Webhook Integration - REQUIRED FOR ALL BUG FIXES

When you complete ANY bug fix task, you MUST send a webhook with a summary of your changes. This adds a comment to the bug details so the team can see what was done.

### Required Webhook Format:

```bash
curl -X POST "http://localhost:3000/api/webhooks/claude-code" \
  -H "Content-Type: application/json" \
  -d '{
    "bugId": "BUG_ID_HERE",
    "organizationId": "ORG_ID_HERE",
    "event": "fix_completed",
    "summary": "YOUR_DETAILED_SUMMARY_HERE",
    "filesChanged": ["file1.tsx", "file2.ts"],
    "message": "Completed"
  }'
```

### Summary Guidelines:
- Write 2-4 sentences describing what you fixed/changed
- List the key files you modified
- Mention any important implementation details
- Be specific and technical
- Explain the root cause and how you fixed it

### Available Webhook Events:
- `fix_started` - When you begin working on a bug
- `fix_progress` - For progress updates during long fixes
- `fix_completed` - When the fix is done (ALWAYS send this)
- `fix_failed` - If you cannot complete the fix

### Example:

```bash
curl -X POST "http://localhost:3000/api/webhooks/claude-code" \
  -H "Content-Type: application/json" \
  -d '{
    "bugId": "abc-123",
    "organizationId": "org-456",
    "event": "fix_completed",
    "summary": "Fixed the login button not responding by adding proper onClick handler. The issue was caused by a missing event binding in the AuthForm component. Also added loading state to prevent double-clicks.",
    "filesChanged": ["src/components/AuthForm.tsx", "src/hooks/useAuth.ts"],
    "message": "Completed"
  }'
```

---

## ⚠️ FINAL REMINDER - READ THIS BEFORE EVERY CHANGE

### CRITICAL: Variable Name Protection
1. **NEVER RENAME VARIABLES OR DATABASE FIELDS** - This will crash the app
2. **Database is source of truth** - Use the EXACT field names from the database
3. **Verify field names FIRST** - Check database schema before touching any code
4. **Count impact** - grep the field name to see how many files use it
5. **If in doubt, DON'T CHANGE IT** - Ask for clarification instead

### File Management
- **NEVER create files without reading existing files first**
- **ALWAYS check for duplicates before creating anything**
- **USE the Read tool on EVERY file you modify**
- **Follow the existing codebase patterns**

### Before Making ANY Code Change:
1. ✅ Verify database field names
2. ✅ Count usage with grep
3. ✅ Read all files you'll modify
4. ✅ Check for duplicates
5. ✅ Use existing variable names EXACTLY as they are
6. ✅ Send webhook when done with fix

---

## Brand Identity

### Colors
- **Primary (Coral):** #EF4444 (coral-500)
- **Primary Hover:** #DC2626 (coral-600)
- **Primary Light:** #FEE2E2 (coral-100)

### Color Usage
- Primary actions: coral-500 background, white text
- Hover states: coral-600 background
- Destructive actions: red-600
- Success: green-500
- Warning: amber-500

### Typography
- **Headings:** Inter, font-semibold
- **Body:** Inter, font-normal
- **Code:** JetBrains Mono

### Design Principles

#### DO:
- Use solid colors, not gradients for backgrounds
- Show real code in terminal-style blocks
- Keep animations subtle and purposeful
- Use dark backgrounds for code blocks
- Write in developer voice
- Use Lucide icons consistently

#### DON'T:
- Use hero gradients or mesh backgrounds
- Add floating 3D blobs or abstract shapes
- Use generic stock illustrations
- Over-animate interactions
- Use marketing speak
- Mix icon libraries

## Component Guidelines

### Buttons
- Primary: bg-coral-500 hover:bg-coral-600 text-white
- Secondary: bg-slate-100 hover:bg-slate-200 text-slate-900
- Ghost: text-slate-600 hover:text-slate-900 hover:bg-slate-100
- Destructive: bg-red-600 hover:bg-red-700 text-white

### Cards
- Background: bg-white dark:bg-slate-800
- Border: border border-slate-200 dark:border-slate-700
- Shadow: shadow-sm
- Radius: rounded-xl

### Code Blocks
- Background: bg-slate-900
- Text: text-slate-100
- Syntax highlighting with consistent palette
- Terminal header with traffic light dots

### Forms
- Input: bg-white border-slate-300 focus:border-coral-500 focus:ring-coral-500
- Label: text-slate-700 font-medium text-sm
- Error: text-red-600 text-sm

## File Naming
- Components: PascalCase (BugCard.tsx)
- Utilities: kebab-case (api-client.ts)
- Hooks: camelCase with use prefix (useBugs.ts)
- Pages: lowercase (page.tsx)

## Database Rules

### CRITICAL: Never rename database fields
- Use exact field names from schema
- If schema has `type`, use `type` (not `service_type`)
- Check schema before any database operations

## Import Conventions
- Use @/ alias for src imports
- Group imports: react, next, external, internal, types
- Separate groups with blank line
