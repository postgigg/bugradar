-- BugRadar Database Schema
-- Multi-tenant SaaS for AI-powered bug tracking

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE bug_status AS ENUM ('new', 'open', 'in_progress', 'resolved', 'closed', 'wont_fix');
CREATE TYPE bug_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE bug_source AS ENUM ('sdk', 'manual', 'api', 'import');
CREATE TYPE api_key_environment AS ENUM ('live', 'test');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
CREATE TYPE plan_tier AS ENUM ('free', 'pro', 'team', 'enterprise');
CREATE TYPE activity_type AS ENUM (
  'created', 'status_changed', 'priority_changed', 'assigned', 'unassigned',
  'commented', 'attachment_added', 'resolved', 'reopened', 'closed'
);

-- ============================================
-- TABLE 1: users (extends auth.users)
-- ============================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{"email": true, "in_app": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_email ON public.users(email);

-- ============================================
-- TABLE 2: organizations
-- ============================================

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  billing_email TEXT,
  stripe_customer_id TEXT UNIQUE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organizations_stripe ON public.organizations(stripe_customer_id);

-- ============================================
-- TABLE 3: organization_members
-- ============================================

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES public.users(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_org_member UNIQUE (organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);

-- ============================================
-- TABLE 4: projects
-- ============================================

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  platform TEXT DEFAULT 'web', -- web, mobile, desktop
  framework TEXT,
  domain TEXT,
  settings JSONB DEFAULT '{
    "ai_enhance_enabled": true,
    "screenshot_enabled": true,
    "console_logs_enabled": true,
    "max_bugs_per_day": 100
  }'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_project_slug UNIQUE (organization_id, slug)
);

CREATE INDEX idx_projects_org ON public.projects(organization_id);
CREATE INDEX idx_projects_active ON public.projects(is_active) WHERE is_active = TRUE;

-- ============================================
-- TABLE 5: api_keys
-- ============================================

CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default Key',
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  key_hint TEXT NOT NULL,
  environment api_key_environment NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  rate_limit_per_minute INTEGER DEFAULT 60,
  allowed_domains TEXT[],
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_api_keys_project ON public.api_keys(project_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = TRUE;

-- ============================================
-- TABLE 6: bugs
-- ============================================

CREATE TABLE public.bugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Core info
  title TEXT NOT NULL,
  description TEXT,
  ai_enhanced_description TEXT,

  -- Status
  status bug_status DEFAULT 'new' NOT NULL,
  priority bug_priority DEFAULT 'medium',
  source bug_source DEFAULT 'sdk' NOT NULL,

  -- Assignment
  assigned_to UUID REFERENCES public.users(id),
  reported_by UUID REFERENCES public.users(id),

  -- Browser/environment
  user_agent TEXT,
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  os_version TEXT,
  device_type TEXT,
  screen_resolution TEXT,
  page_url TEXT,

  -- Technical data
  console_logs JSONB DEFAULT '[]'::jsonb,
  network_logs JSONB DEFAULT '[]'::jsonb,
  custom_metadata JSONB DEFAULT '{}'::jsonb,

  -- Screenshot
  screenshot_url TEXT,
  screenshot_storage_path TEXT,

  -- Session
  session_id TEXT,
  user_identifier TEXT,

  -- Tags
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_bugs_project ON public.bugs(project_id);
CREATE INDEX idx_bugs_status ON public.bugs(status);
CREATE INDEX idx_bugs_priority ON public.bugs(priority);
CREATE INDEX idx_bugs_assigned ON public.bugs(assigned_to);
CREATE INDEX idx_bugs_created ON public.bugs(created_at DESC);
CREATE INDEX idx_bugs_project_status ON public.bugs(project_id, status, created_at DESC);

-- Full text search
CREATE INDEX idx_bugs_search ON public.bugs
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- ============================================
-- TABLE 7: bug_elements
-- ============================================

CREATE TABLE public.bug_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bug_id UUID NOT NULL REFERENCES public.bugs(id) ON DELETE CASCADE,
  element_selector TEXT,
  element_xpath TEXT,
  element_tag TEXT,
  element_text TEXT,
  element_html TEXT,
  bounding_box JSONB,
  annotation_type TEXT DEFAULT 'highlight',
  annotation_color TEXT DEFAULT '#EF4444',
  annotation_note TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bug_elements_bug ON public.bug_elements(bug_id);

-- ============================================
-- TABLE 8: bug_comments
-- ============================================

CREATE TABLE public.bug_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bug_id UUID NOT NULL REFERENCES public.bugs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.bug_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bug_comments_bug ON public.bug_comments(bug_id);
CREATE INDEX idx_bug_comments_user ON public.bug_comments(user_id);

-- ============================================
-- TABLE 9: bug_activities
-- ============================================

CREATE TABLE public.bug_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bug_id UUID NOT NULL REFERENCES public.bugs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  activity_type activity_type NOT NULL,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bug_activities_bug ON public.bug_activities(bug_id);
CREATE INDEX idx_bug_activities_created ON public.bug_activities(created_at DESC);

-- ============================================
-- TABLE 10: subscriptions
-- ============================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan_tier plan_tier DEFAULT 'free' NOT NULL,
  status subscription_status DEFAULT 'active' NOT NULL,

  -- Limits
  max_projects INTEGER DEFAULT 2,
  max_bugs_per_month INTEGER DEFAULT 50,
  max_team_members INTEGER DEFAULT 3,
  ai_credits_limit INTEGER DEFAULT 10,
  ai_credits_used INTEGER DEFAULT 0,

  features JSONB DEFAULT '{
    "ai_enhance": true,
    "screenshot": true,
    "api_access": false,
    "priority_support": false
  }'::jsonb,

  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_subscriptions_org ON public.subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- ============================================
-- TABLE 11: usage_tracking
-- ============================================

CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  bugs_created INTEGER DEFAULT 0,
  bugs_resolved INTEGER DEFAULT 0,
  ai_enhancements_used INTEGER DEFAULT 0,
  screenshots_uploaded INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,

  daily_breakdown JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT unique_usage_period UNIQUE (organization_id, project_id, period_start, period_end)
);

CREATE INDEX idx_usage_org ON public.usage_tracking(organization_id);
CREATE INDEX idx_usage_project ON public.usage_tracking(project_id);
CREATE INDEX idx_usage_period ON public.usage_tracking(period_start, period_end);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bugs_updated_at BEFORE UPDATE ON public.bugs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bug_comments_updated_at BEFORE UPDATE ON public.bug_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_updated_at BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-set resolved_at/closed_at on bug status change
CREATE OR REPLACE FUNCTION handle_bug_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND (OLD.status IS NULL OR OLD.status != 'resolved') THEN
    NEW.resolved_at = NOW();
  END IF;

  IF NEW.status IN ('closed', 'wont_fix') AND (OLD.status IS NULL OR OLD.status NOT IN ('closed', 'wont_fix')) THEN
    NEW.closed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bug_status_change
  BEFORE UPDATE ON public.bugs
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_bug_status_change();

-- Log bug activities automatically
CREATE OR REPLACE FUNCTION log_bug_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.bug_activities (bug_id, activity_type, new_value)
    VALUES (NEW.id, 'created', to_jsonb(NEW));
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.bug_activities (bug_id, user_id, activity_type, old_value, new_value)
      VALUES (NEW.id, auth.uid(), 'status_changed', to_jsonb(OLD.status), to_jsonb(NEW.status));
    END IF;

    IF OLD.priority IS DISTINCT FROM NEW.priority THEN
      INSERT INTO public.bug_activities (bug_id, user_id, activity_type, old_value, new_value)
      VALUES (NEW.id, auth.uid(), 'priority_changed', to_jsonb(OLD.priority), to_jsonb(NEW.priority));
    END IF;

    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      INSERT INTO public.bug_activities (bug_id, user_id, activity_type, old_value, new_value)
      VALUES (NEW.id, auth.uid(),
        CASE WHEN NEW.assigned_to IS NULL THEN 'unassigned' ELSE 'assigned' END,
        to_jsonb(OLD.assigned_to), to_jsonb(NEW.assigned_to));
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER bug_activity_logger
  AFTER INSERT OR UPDATE ON public.bugs
  FOR EACH ROW EXECUTE FUNCTION log_bug_activity();

-- Generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Increment usage tracking
CREATE OR REPLACE FUNCTION increment_usage(
  p_org_id UUID,
  p_project_id UUID,
  p_metric TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
  period_start_date DATE;
  period_end_date DATE;
BEGIN
  period_start_date := date_trunc('month', CURRENT_DATE)::DATE;
  period_end_date := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  INSERT INTO public.usage_tracking (
    organization_id, project_id, period_start, period_end
  ) VALUES (
    p_org_id, p_project_id, period_start_date, period_end_date
  )
  ON CONFLICT (organization_id, project_id, period_start, period_end)
  DO UPDATE SET
    bugs_created = CASE WHEN p_metric = 'bugs_created'
      THEN usage_tracking.bugs_created + p_increment ELSE usage_tracking.bugs_created END,
    bugs_resolved = CASE WHEN p_metric = 'bugs_resolved'
      THEN usage_tracking.bugs_resolved + p_increment ELSE usage_tracking.bugs_resolved END,
    ai_enhancements_used = CASE WHEN p_metric = 'ai_enhancements'
      THEN usage_tracking.ai_enhancements_used + p_increment ELSE usage_tracking.ai_enhancements_used END,
    screenshots_uploaded = CASE WHEN p_metric = 'screenshots'
      THEN usage_tracking.screenshots_uploaded + p_increment ELSE usage_tracking.screenshots_uploaded END,
    api_calls = CASE WHEN p_metric = 'api_calls'
      THEN usage_tracking.api_calls + p_increment ELSE usage_tracking.api_calls END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Organizations policies
CREATE POLICY "Members can view organizations" ON public.organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update organizations" ON public.organizations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Organization members policies
CREATE POLICY "Members can view org members" ON public.organization_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = organization_id AND om.user_id = auth.uid())
  );
CREATE POLICY "Admins can manage members" ON public.organization_members
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.organization_members om WHERE om.organization_id = organization_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin'))
  );

-- Projects policies
CREATE POLICY "Members can view projects" ON public.projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = projects.organization_id AND user_id = auth.uid())
  );
CREATE POLICY "Admins can manage projects" ON public.projects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = projects.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- API keys policies
CREATE POLICY "Members can view keys" ON public.api_keys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON p.organization_id = om.organization_id
      WHERE p.id = api_keys.project_id AND om.user_id = auth.uid()
    )
  );
CREATE POLICY "Admins can manage keys" ON public.api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON p.organization_id = om.organization_id
      WHERE p.id = api_keys.project_id AND om.user_id = auth.uid() AND om.role IN ('owner', 'admin')
    )
  );

-- Bugs policies
CREATE POLICY "Members can view bugs" ON public.bugs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON p.organization_id = om.organization_id
      WHERE p.id = bugs.project_id AND om.user_id = auth.uid()
    )
  );
CREATE POLICY "Members can manage bugs" ON public.bugs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      JOIN public.organization_members om ON p.organization_id = om.organization_id
      WHERE p.id = bugs.project_id AND om.user_id = auth.uid()
    )
  );

-- Bug elements policies (inherit from bugs)
CREATE POLICY "Bug access for elements" ON public.bug_elements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bugs b
      JOIN public.projects p ON b.project_id = p.id
      JOIN public.organization_members om ON p.organization_id = om.organization_id
      WHERE b.id = bug_elements.bug_id AND om.user_id = auth.uid()
    )
  );

-- Bug comments policies
CREATE POLICY "Bug access for comments" ON public.bug_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bugs b
      JOIN public.projects p ON b.project_id = p.id
      JOIN public.organization_members om ON p.organization_id = om.organization_id
      WHERE b.id = bug_comments.bug_id AND om.user_id = auth.uid()
    )
  );

-- Bug activities policies
CREATE POLICY "Bug access for activities" ON public.bug_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bugs b
      JOIN public.projects p ON b.project_id = p.id
      JOIN public.organization_members om ON p.organization_id = om.organization_id
      WHERE b.id = bug_activities.bug_id AND om.user_id = auth.uid()
    )
  );

-- Subscriptions policies
CREATE POLICY "Members can view subscription" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = subscriptions.organization_id AND user_id = auth.uid())
  );
CREATE POLICY "Admins can manage subscription" ON public.subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = subscriptions.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );

-- Usage tracking policies
CREATE POLICY "Members can view usage" ON public.usage_tracking
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = usage_tracking.organization_id AND user_id = auth.uid())
  );

-- ============================================
-- STORAGE BUCKET
-- ============================================

-- Create bucket for bug screenshots (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('bug-screenshots', 'bug-screenshots', true);
