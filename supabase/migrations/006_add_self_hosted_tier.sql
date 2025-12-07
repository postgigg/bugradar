-- Add self-hosted tier and custom credentials support

-- Add 'self_hosted' to plan_tier enum
ALTER TYPE plan_tier ADD VALUE IF NOT EXISTS 'self_hosted';

-- Add custom credentials fields to organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS self_hosted_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS self_hosted_purchased_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS custom_supabase_url TEXT,
ADD COLUMN IF NOT EXISTS custom_supabase_anon_key TEXT,
ADD COLUMN IF NOT EXISTS custom_supabase_service_key TEXT,
ADD COLUMN IF NOT EXISTS custom_anthropic_key TEXT,
ADD COLUMN IF NOT EXISTS custom_resend_key TEXT,
ADD COLUMN IF NOT EXISTS custom_api_endpoint TEXT;

-- Create self_hosted_purchases table to track one-time purchases
CREATE TABLE IF NOT EXISTS public.self_hosted_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT,
  stripe_checkout_session_id TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 19900, -- $199 in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_self_hosted_purchases_org ON public.self_hosted_purchases(organization_id);
CREATE INDEX IF NOT EXISTS idx_self_hosted_purchases_stripe ON public.self_hosted_purchases(stripe_payment_id);

-- Add trigger for updated_at
CREATE TRIGGER update_self_hosted_purchases_updated_at BEFORE UPDATE ON public.self_hosted_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS for self_hosted_purchases
ALTER TABLE public.self_hosted_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org purchases" ON public.self_hosted_purchases
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = self_hosted_purchases.organization_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage purchases" ON public.self_hosted_purchases
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id = self_hosted_purchases.organization_id AND user_id = auth.uid() AND role IN ('owner', 'admin'))
  );
