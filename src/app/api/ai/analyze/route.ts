import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization and subscription
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 })
    }

    // Check AI credits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('ai_credits_used, ai_credits_limit')
      .eq('organization_id', membership.organization_id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 })
    }

    if (subscription.ai_credits_used >= subscription.ai_credits_limit) {
      return NextResponse.json({
        error: 'AI credits exhausted. Please upgrade your plan.',
        creditsUsed: subscription.ai_credits_used,
        creditsLimit: subscription.ai_credits_limit
      }, { status: 403 })
    }

    const { prompt, context, bugId } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Build system prompt
    const systemPrompt = `You are an expert software developer assistant helping to analyze and fix bugs. You are integrated into BugRadar, a bug tracking platform.

Your role is to:
1. Analyze bug reports and error messages
2. Identify root causes of issues
3. Suggest code fixes and solutions
4. Explain technical concepts in clear terms
5. Provide step-by-step debugging guidance

When providing code solutions:
- Use proper formatting with markdown code blocks
- Specify the programming language
- Include comments explaining the fix
- Consider edge cases

Be concise but thorough. Focus on actionable advice.`

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${context ? `Context:\n${context}\n\n` : ''}User question: ${prompt}`
        }
      ]
    })

    // Extract text response
    const response = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n')

    // Increment AI credits used
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ ai_credits_used: subscription.ai_credits_used + 1 })
      .eq('organization_id', membership.organization_id)

    if (updateError) {
      console.error('Failed to update AI credits:', updateError)
    }

    // Track usage
    if (bugId) {
      await supabase
        .from('bug_activities')
        .insert({
          bug_id: bugId,
          user_id: user.id,
          activity_type: 'commented',
          metadata: { type: 'ai_analysis', prompt }
        })
    }

    return NextResponse.json({
      response,
      creditsUsed: subscription.ai_credits_used + 1,
      creditsLimit: subscription.ai_credits_limit
    })
  } catch (error) {
    console.error('AI analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze. Please try again.' },
      { status: 500 }
    )
  }
}
