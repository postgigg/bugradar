import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { sendBugCreatedEmail } from '@/lib/email';

// Create admin client for API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic();

interface BugReportPayload {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  screenshot?: string;
  elements?: Array<{
    selector: string;
    xpath: string;
    tagName: string;
    text: string;
    html: string;
    boundingBox: DOMRect;
    annotationType: string;
    annotationColor: string;
    annotationNote?: string;
  }>;
  context: {
    url: string;
    title: string;
    userAgent: string;
    browserName: string;
    browserVersion: string;
    osName: string;
    osVersion: string;
    deviceType: string;
    screenResolution: string;
    viewportSize?: string;
    language?: string;
    timezone?: string;
  };
  consoleLogs?: Array<{
    type: string;
    message: string;
    timestamp: string;
    stack?: string;
  }>;
  networkLogs?: Array<{
    method: string;
    url: string;
    status?: number;
    statusText?: string;
    duration?: number;
    timestamp: string;
    error?: string;
  }>;
  metadata?: Record<string, unknown>;
  userIdentifier?: string;
  sessionId: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get('X-API-Key');

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Missing API key' },
        { status: 401 }
      );
    }

    // Validate API key and get project
    const keyPrefix = apiKey.substring(0, 7);
    const keyHash = await hashApiKey(apiKey);

    const { data: apiKeyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, project_id, is_active, environment, projects(id, organization_id, is_active)')
      .eq('key_prefix', keyPrefix)
      .eq('key_hash', keyHash)
      .single();

    if (keyError || !apiKeyData) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    if (!apiKeyData.is_active) {
      return NextResponse.json(
        { success: false, error: 'API key is disabled' },
        { status: 403 }
      );
    }

    const project = apiKeyData.projects as any;
    if (!project?.is_active) {
      return NextResponse.json(
        { success: false, error: 'Project is inactive' },
        { status: 403 }
      );
    }

    // Parse request body
    const body: BugReportPayload = await request.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // Upload screenshot if present
    let screenshotUrl: string | null = null;
    let screenshotPath: string | null = null;

    if (body.screenshot && body.screenshot.startsWith('data:image')) {
      const uploadResult = await uploadScreenshot(
        body.screenshot,
        apiKeyData.project_id
      );
      screenshotUrl = uploadResult.url;
      screenshotPath = uploadResult.path;
    }

    // Generate AI-enhanced description
    let aiEnhancedDescription: string | null = null;
    try {
      const reportType = (body.metadata as any)?.reportType || 'bug';
      const elementsInfo = body.elements?.map((el, i) =>
        `${i + 1}. <${el.tagName}> element: "${el.text?.slice(0, 100) || 'no text'}" (selector: ${el.selector})`
      ).join('\n') || 'No elements selected';

      const consoleErrors = body.consoleLogs
        ?.filter(log => log.type === 'error')
        ?.slice(0, 5)
        ?.map(log => log.message)
        ?.join('\n') || 'No console errors';

      const typePrompts = {
        bug: 'This is a BUG REPORT. Analyze what is broken and describe the issue professionally.',
        feedback: 'This is FEEDBACK/SUGGESTION. Analyze what improvement is being requested.',
        change: 'This is an EDIT/CHANGE REQUEST. Analyze what modification is being requested.'
      };

      const enhancePrompt = `You are analyzing a ${reportType} report for a web application. Generate a clear, professional, technical description.

Report Type: ${reportType.toUpperCase()}
Title: ${body.title}
User Description: ${body.description || 'No description provided'}
Page URL: ${body.context.url}

Selected Elements:
${elementsInfo}

Console Errors:
${consoleErrors}

${typePrompts[reportType as keyof typeof typePrompts] || typePrompts.bug}

Write a concise, professional 2-4 sentence technical summary that:
1. Clearly states what the issue/request is
2. References the specific element(s) involved
3. Includes relevant technical context (URL, errors if any)
4. Is suitable for a developer to understand and act upon

Do NOT include any preamble like "Here's the description" - just write the description directly.`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{ role: 'user', content: enhancePrompt }]
      });

      aiEnhancedDescription = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('\n')
        .trim();

    } catch (aiError) {
      console.warn('AI enhancement failed, using original description:', aiError);
    }

    // Create bug record
    const { data: bug, error: bugError } = await supabase
      .from('bugs')
      .insert({
        project_id: apiKeyData.project_id,
        title: body.title.slice(0, 255),
        description: body.description?.slice(0, 5000),
        ai_enhanced_description: aiEnhancedDescription,
        priority: body.priority || 'medium',
        status: 'new',
        source: 'sdk',
        user_agent: body.context.userAgent,
        browser_name: body.context.browserName,
        browser_version: body.context.browserVersion,
        os_name: body.context.osName,
        os_version: body.context.osVersion,
        device_type: body.context.deviceType,
        screen_resolution: body.context.screenResolution,
        page_url: body.context.url,
        console_logs: body.consoleLogs || [],
        network_logs: body.networkLogs || [],
        custom_metadata: body.metadata || {},
        screenshot_url: screenshotUrl,
        screenshot_storage_path: screenshotPath,
        session_id: body.sessionId,
        user_identifier: body.userIdentifier,
      })
      .select('id')
      .single();

    if (bugError) {
      console.error('Bug creation error:', bugError);
      return NextResponse.json(
        { success: false, error: 'Failed to create bug' },
        { status: 500 }
      );
    }

    // Create bug elements if present
    if (body.elements && body.elements.length > 0) {
      const elements = body.elements.map((el, index) => ({
        bug_id: bug.id,
        element_selector: el.selector,
        element_xpath: el.xpath,
        element_tag: el.tagName,
        element_text: el.text?.slice(0, 500),
        element_html: el.html?.slice(0, 2000),
        bounding_box: el.boundingBox,
        annotation_type: el.annotationType,
        annotation_color: el.annotationColor,
        annotation_note: el.annotationNote,
        display_order: index,
      }));

      await supabase.from('bug_elements').insert(elements);
    }

    // Update API key last used
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id);

    // Track usage
    await supabase.rpc('increment_usage', {
      p_org_id: project.organization_id,
      p_project_id: apiKeyData.project_id,
      p_metric: 'bugs_created',
      p_increment: 1,
    });

    // Send email notifications to org members with email notifications enabled
    try {
      // Get project details
      const { data: projectData } = await supabase
        .from('projects')
        .select('name, organization_id')
        .eq('id', apiKeyData.project_id)
        .single();

      if (projectData) {
        // Get org members who have email notifications enabled
        const { data: members } = await supabase
          .from('organization_members')
          .select(`
            user_id,
            users!inner (
              email,
              full_name,
              notification_preferences
            )
          `)
          .eq('organization_id', projectData.organization_id);

        if (members && members.length > 0) {
          // Filter members with email notifications enabled
          const emailRecipients = members
            .filter((member: any) => {
              const prefs = member.users?.notification_preferences;
              return prefs?.email !== false; // Default to true if not set
            })
            .map((member: any) => member.users?.email)
            .filter(Boolean);

          if (emailRecipients.length > 0) {
            // Send email notification (async, don't wait)
            sendBugCreatedEmail({
              to: emailRecipients,
              bugId: bug.id,
              bugTitle: body.title,
              bugDescription: aiEnhancedDescription || body.description,
              priority: body.priority || 'medium',
              projectName: projectData.name,
              pageUrl: body.context.url,
              reporterEmail: body.userIdentifier,
              screenshotUrl: screenshotUrl || undefined,
            }).catch(err => {
              console.error('[Bug API] Failed to send email notification:', err);
            });
          }
        }
      }
    } catch (emailErr) {
      // Don't fail bug creation if email fails
      console.error('[Bug API] Email notification error:', emailErr);
    }

    return NextResponse.json({
      success: true,
      bugId: bug.id,
      message: 'Bug reported successfully',
    });
  } catch (error) {
    console.error('Bug report error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function uploadScreenshot(
  base64Data: string,
  projectId: string
): Promise<{ url: string; path: string }> {
  // Extract base64 content
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 image data');
  }

  const [, extension, base64Content] = matches;
  const buffer = Buffer.from(base64Content, 'base64');

  // Generate unique filename
  const filename = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from('bug-screenshots')
    .upload(filename, buffer, {
      contentType: `image/${extension}`,
      upsert: false,
    });

  if (error) {
    console.error('Screenshot upload error:', error);
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('bug-screenshots')
    .getPublicUrl(filename);

  return {
    url: urlData.publicUrl,
    path: filename,
  };
}

// GET handler - fetch bugs for a page (used by bug overlay)
export async function GET(request: NextRequest) {
  try {
    // Get API key from header or query
    const apiKey = request.headers.get('X-API-Key') ||
                   request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Missing API key' },
        { status: 401 }
      );
    }

    // Validate API key and get project
    const keyPrefix = apiKey.substring(0, 7);
    const keyHash = await hashApiKey(apiKey);

    const { data: apiKeyData, error: keyError } = await supabase
      .from('api_keys')
      .select('id, project_id, is_active')
      .eq('key_prefix', keyPrefix)
      .eq('key_hash', keyHash)
      .single();

    if (keyError || !apiKeyData || !apiKeyData.is_active) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const pageUrl = searchParams.get('page_url');

    // Build query - fetch bugs with their elements
    let query = supabase
      .from('bugs')
      .select(`
        id,
        title,
        description,
        priority,
        status,
        page_url,
        bug_elements (
          element_selector,
          element_xpath,
          bounding_box
        )
      `)
      .eq('project_id', apiKeyData.project_id)
      .in('status', ['new', 'open', 'in_progress']) // Only active bugs
      .order('created_at', { ascending: false })
      .limit(50);

    // Filter by page URL if provided
    if (pageUrl) {
      query = query.eq('page_url', pageUrl);
    }

    const { data: bugs, error: bugsError } = await query;

    if (bugsError) {
      console.error('Bugs fetch error:', bugsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bugs' },
        { status: 500 }
      );
    }

    // Transform bugs to include selector from first element
    const transformedBugs = bugs?.map(bug => {
      const elements = bug.bug_elements as any[];
      const firstElement = elements?.[0];

      return {
        id: bug.id,
        title: bug.title,
        description: bug.description,
        priority: bug.priority,
        status: bug.status,
        pageUrl: bug.page_url,
        selector: firstElement?.element_selector || null,
        boundingBox: firstElement?.bounding_box || null,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      bugs: transformedBugs,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Bugs fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization',
    },
  });
}
