# BugRadar Database

## Tables

1. **users** - User profiles (extends auth.users)
2. **organizations** - Multi-tenant companies/teams
3. **organization_members** - User ↔ Org relationships
4. **projects** - Bug tracking projects
5. **api_keys** - SDK API keys (br_live_*, br_test_*)
6. **bugs** - Bug reports
7. **bug_elements** - Selected UI elements per bug
8. **bug_comments** - Discussion threads
9. **bug_activities** - Audit trail
10. **subscriptions** - Stripe billing data
11. **usage_tracking** - Usage metrics for billing

## Running Migrations

```bash
# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push

# Or reset and apply all
npx supabase db reset
```

## Key Functions

- `increment_usage()` - Track usage metrics
- `generate_slug()` - Create URL-safe slugs
- `handle_new_user()` - Auto-create user profile on signup
- `log_bug_activity()` - Automatic activity logging
