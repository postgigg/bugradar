import type { ExistingBug } from '../types';
import { ICONS } from './icons';

interface BugOverlayConfig {
  apiUrl: string;
  apiKey: string;
  projectId?: string;
  onQuickFix?: (bug: ExistingBug) => void;
}

export class BugOverlay {
  private config: BugOverlayConfig;
  private bugs: ExistingBug[] = [];
  private overlays: Map<string, HTMLDivElement> = new Map();
  private activePopup: HTMLDivElement | null = null;
  private activeBugId: string | null = null;
  private styleInjected = false;

  constructor(config: BugOverlayConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    this.injectStyles();
    await this.fetchBugs();
    this.renderOverlays();

    // Re-render on scroll/resize
    window.addEventListener('scroll', () => this.updateOverlayPositions());
    window.addEventListener('resize', () => this.updateOverlayPositions());

    // Close popup on outside click
    document.addEventListener('click', (e) => {
      if (this.activePopup && !this.activePopup.contains(e.target as Node)) {
        const clickedOnBadge = Array.from(this.overlays.values()).some(
          overlay => overlay.contains(e.target as Node)
        );
        if (!clickedOnBadge) {
          this.closePopup();
        }
      }
    });
  }

  private injectStyles(): void {
    if (this.styleInjected) return;
    this.styleInjected = true;

    const style = document.createElement('style');
    style.id = 'bugradar-overlay-styles';
    style.textContent = `
      .br-bug-badge {
        position: absolute;
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        transition: transform 0.2s, box-shadow 0.2s;
        animation: br-badge-pulse 2s infinite;
      }
      .br-bug-badge:hover {
        transform: scale(1.15);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
      }
      .br-bug-badge svg {
        width: 16px;
        height: 16px;
        color: white;
      }
      .br-bug-badge-count {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 16px;
        height: 16px;
        background: #1E293B;
        border: 2px solid #EF4444;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 700;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
      }
      @keyframes br-badge-pulse {
        0%, 100% { box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4); }
        50% { box-shadow: 0 2px 16px rgba(239, 68, 68, 0.6); }
      }

      .br-bug-popup {
        position: fixed;
        width: 360px;
        background: #1E293B;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        z-index: 10001;
        overflow: hidden;
        animation: br-popup-in 0.2s ease-out;
      }
      @keyframes br-popup-in {
        from { opacity: 0; transform: translateY(8px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .br-popup-header {
        padding: 20px;
        background: linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.05) 100%);
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }
      .br-popup-priority {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 12px;
      }
      .br-popup-priority.critical { background: rgba(239,68,68,0.2); color: #FCA5A5; }
      .br-popup-priority.high { background: rgba(249,115,22,0.2); color: #FDBA74; }
      .br-popup-priority.medium { background: rgba(234,179,8,0.2); color: #FDE047; }
      .br-popup-priority.low { background: rgba(34,197,94,0.2); color: #86EFAC; }
      .br-popup-title {
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        margin: 0;
        line-height: 1.4;
      }
      .br-popup-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-top: 8px;
        font-size: 12px;
        color: rgba(255,255,255,0.6);
      }
      .br-popup-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .br-popup-status-dot.open { background: #EF4444; }
      .br-popup-status-dot.in_progress { background: #F59E0B; }
      .br-popup-status-dot.resolved { background: #22C55E; }
      .br-popup-body {
        padding: 20px;
      }
      .br-popup-description {
        font-size: 14px;
        color: rgba(255,255,255,0.7);
        line-height: 1.6;
        margin: 0 0 20px;
      }
      .br-popup-actions {
        display: flex;
        gap: 12px;
      }
      .br-popup-btn {
        flex: 1;
        padding: 14px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
        border: none;
      }
      .br-popup-btn-primary {
        background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
        color: white;
      }
      .br-popup-btn-primary:hover {
        background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
        transform: translateY(-1px);
      }
      .br-popup-btn-secondary {
        background: rgba(255,255,255,0.1);
        color: rgba(255,255,255,0.8);
        border: 1px solid rgba(255,255,255,0.1);
      }
      .br-popup-btn-secondary:hover {
        background: rgba(255,255,255,0.15);
      }
      .br-popup-btn svg {
        width: 18px;
        height: 18px;
      }
      .br-popup-close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 28px;
        height: 28px;
        background: rgba(255,255,255,0.1);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255,255,255,0.5);
        transition: all 0.2s;
      }
      .br-popup-close:hover {
        background: rgba(255,255,255,0.2);
        color: white;
      }
      .br-popup-close svg {
        width: 16px;
        height: 16px;
      }

      .br-element-highlight {
        position: absolute;
        border: 2px dashed #EF4444;
        background: rgba(239, 68, 68, 0.1);
        pointer-events: none;
        z-index: 9999;
        border-radius: 4px;
      }
    `;
    document.head.appendChild(style);
  }

  private async fetchBugs(): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/bugs?page_url=${encodeURIComponent(window.location.href)}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.bugs = data.bugs || [];
      }
    } catch (error) {
      console.warn('[BugRadar] Failed to fetch bugs:', error);
    }
  }

  setBugs(bugs: ExistingBug[]): void {
    console.log('[BugRadar BugOverlay] setBugs called with', bugs.length, 'bugs');
    this.bugs = bugs;
    this.injectStyles();
    this.renderOverlays();
  }

  private renderOverlays(): void {
    // Clear existing overlays
    this.overlays.forEach(overlay => overlay.remove());
    this.overlays.clear();

    console.log('[BugRadar] Rendering overlays for', this.bugs.length, 'bugs');

    // Create overlays for bugs with selectors
    this.bugs.forEach(bug => {
      console.log('[BugRadar] Processing bug:', bug.id, 'selector:', bug.selector, 'status:', bug.status);

      if (bug.selector && bug.status !== 'resolved' && bug.status !== 'closed') {
        const element = document.querySelector(bug.selector);
        console.log('[BugRadar] Found element:', !!element, 'for selector:', bug.selector);

        if (element) {
          this.createBugBadge(bug, element as HTMLElement);
        } else {
          console.warn('[BugRadar] Element not found for selector:', bug.selector);
        }
      }
    });

    console.log('[BugRadar] Created', this.overlays.size, 'badge overlays');
  }

  private createBugBadge(bug: ExistingBug, element: HTMLElement): void {
    const rect = element.getBoundingClientRect();

    const badge = document.createElement('div');
    badge.className = 'br-bug-badge';
    badge.innerHTML = ICONS.bug;
    badge.style.left = `${rect.right + window.scrollX - 14}px`;
    badge.style.top = `${rect.top + window.scrollY - 14}px`;

    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      this.showBugPopup(bug, badge);
    });

    document.body.appendChild(badge);
    this.overlays.set(bug.id, badge);
  }

  private updateOverlayPositions(): void {
    this.bugs.forEach(bug => {
      if (bug.selector) {
        const element = document.querySelector(bug.selector);
        const badge = this.overlays.get(bug.id);
        if (element && badge) {
          const rect = element.getBoundingClientRect();
          badge.style.left = `${rect.right + window.scrollX - 14}px`;
          badge.style.top = `${rect.top + window.scrollY - 14}px`;
        }
      }
    });
  }

  private showBugPopup(bug: ExistingBug, badge: HTMLDivElement): void {
    this.closePopup();
    this.activeBugId = bug.id;

    const popup = document.createElement('div');
    popup.className = 'br-bug-popup';

    const badgeRect = badge.getBoundingClientRect();

    // Position popup
    let left = badgeRect.right + 12;
    let top = badgeRect.top - 20;

    // Adjust if would go off screen
    if (left + 360 > window.innerWidth) {
      left = badgeRect.left - 372;
    }
    if (top + 300 > window.innerHeight) {
      top = window.innerHeight - 320;
    }
    if (top < 20) top = 20;

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;

    popup.innerHTML = `
      <button class="br-popup-close" data-action="close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <div class="br-popup-header">
        <div class="br-popup-priority ${bug.priority}">${bug.priority}</div>
        <h3 class="br-popup-title">${this.escapeHtml(bug.title)}</h3>
        <div class="br-popup-status">
          <span class="br-popup-status-dot ${bug.status}"></span>
          ${bug.status.replace('_', ' ')}
        </div>
      </div>
      <div class="br-popup-body">
        ${bug.description ? `<p class="br-popup-description">${this.escapeHtml(bug.description)}</p>` : ''}
        <div class="br-popup-actions">
          <button class="br-popup-btn br-popup-btn-primary" data-action="quick-fix">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M8 12l2 2 4-4"/>
            </svg>
            Quick Fix
          </button>
          <button class="br-popup-btn br-popup-btn-secondary" data-action="view-details">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            Details
          </button>
        </div>
      </div>
    `;

    // Event handlers
    popup.querySelector('[data-action="close"]')?.addEventListener('click', () => {
      this.closePopup();
    });

    popup.querySelector('[data-action="quick-fix"]')?.addEventListener('click', () => {
      this.triggerQuickFix(bug);
    });

    popup.querySelector('[data-action="view-details"]')?.addEventListener('click', () => {
      // Open bug details in dashboard
      window.open(`${this.config.apiUrl.replace('/api', '')}/dashboard/bugs/${bug.id}`, '_blank');
    });

    document.body.appendChild(popup);
    this.activePopup = popup;
  }

  private closePopup(): void {
    if (this.activePopup) {
      this.activePopup.remove();
      this.activePopup = null;
      this.activeBugId = null;
    }
  }

  private triggerQuickFix(bug: ExistingBug): void {
    this.closePopup();

    if (this.config.onQuickFix) {
      this.config.onQuickFix(bug);
    } else {
      // Default: Copy fix prompt to clipboard and show instructions
      this.showQuickFixModal(bug);
    }
  }

  private showQuickFixModal(bug: ExistingBug): void {
    const modal = document.createElement('div');
    modal.id = 'br-quickfix-modal';
    modal.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:10002;display:flex;align-items:center;justify-content:center;padding:20px;">
        <div style="width:100%;max-width:500px;background:#1E293B;border-radius:20px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;">
          <div style="padding:24px;background:linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(124,58,237,0.05) 100%);border-bottom:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex;align-items:center;gap:16px;">
              <div style="width:48px;height:48px;background:linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);border-radius:12px;display:flex;align-items:center;justify-content:center;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M7 12l3 3 7-7"/>
                </svg>
              </div>
              <div>
                <h2 style="margin:0;font-size:20px;font-weight:700;color:#fff;">Quick Fix with Claude</h2>
                <p style="margin:4px 0 0;font-size:14px;color:rgba(255,255,255,0.6);">AI-powered bug fixing</p>
              </div>
            </div>
          </div>
          <div style="padding:24px;">
            <div style="margin-bottom:20px;">
              <label style="display:block;font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);margin-bottom:8px;">Project Directory</label>
              <input type="text" id="br-project-path" placeholder="/Users/you/Projects/your-project" style="width:100%;padding:14px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-size:14px;outline:none;" value="${bug.projectPath || ''}"/>
            </div>
            <div style="background:#0F172A;border-radius:10px;padding:16px;margin-bottom:20px;">
              <div style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px;">Terminal Command</div>
              <code id="br-terminal-cmd" style="font-family:monospace;font-size:13px;color:#10B981;">cd "" && claude</code>
            </div>
            <div style="display:flex;gap:12px;">
              <button id="br-copy-cmd" style="flex:1;padding:14px;background:linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);border:none;border-radius:10px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy Command
              </button>
              <button id="br-copy-prompt" style="flex:1;padding:14px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
                Copy Prompt
              </button>
            </div>
            <p style="margin:16px 0 0;font-size:12px;color:rgba(255,255,255,0.4);text-align:center;">
              Open Terminal → Paste command → Paste prompt in Claude → Shift+Tab → Enter
            </p>
          </div>
          <button id="br-close-modal" style="position:absolute;top:20px;right:20px;width:32px;height:32px;background:rgba(255,255,255,0.1);border:none;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.5);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const pathInput = modal.querySelector('#br-project-path') as HTMLInputElement;
    const cmdDisplay = modal.querySelector('#br-terminal-cmd') as HTMLElement;

    // Update command when path changes
    pathInput.addEventListener('input', () => {
      cmdDisplay.textContent = `cd "${pathInput.value}" && claude`;
    });

    // Build fix prompt
    const fixPrompt = this.buildFixPrompt(bug);

    // Copy command button
    modal.querySelector('#br-copy-cmd')?.addEventListener('click', async () => {
      const cmd = `cd "${pathInput.value}" && claude`;
      await navigator.clipboard.writeText(cmd);
      const btn = modal.querySelector('#br-copy-cmd') as HTMLElement;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied!`;
      setTimeout(() => {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy Command`;
      }, 2000);
    });

    // Copy prompt button
    modal.querySelector('#br-copy-prompt')?.addEventListener('click', async () => {
      await navigator.clipboard.writeText(fixPrompt);
      const btn = modal.querySelector('#br-copy-prompt') as HTMLElement;
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied!`;
      setTimeout(() => {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg> Copy Prompt`;
      }, 2000);
    });

    // Close modal
    modal.querySelector('#br-close-modal')?.addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal.firstElementChild) {
        modal.remove();
      }
    });
  }

  private buildFixPrompt(bug: ExistingBug): string {
    return `# BugRadar Fix Request

## Bug Details
- **ID:** ${bug.id}
- **Title:** ${bug.title}
- **Priority:** ${bug.priority.toUpperCase()}
- **Status:** ${bug.status}
${bug.pageUrl ? `- **Page URL:** ${bug.pageUrl}` : ''}
${bug.selector ? `- **Element:** ${bug.selector}` : ''}

## Description
${bug.description || 'No description provided.'}

${bug.consoleErrors?.length ? `## Console Errors
\`\`\`
${bug.consoleErrors.slice(0, 10).join('\n')}
\`\`\`
` : ''}

## Your Task
1. Analyze the bug based on the information above
2. Find the root cause in the codebase
3. Implement a fix
4. Test the fix works

Please analyze this bug and implement a fix.
`;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  destroy(): void {
    this.overlays.forEach(overlay => overlay.remove());
    this.overlays.clear();
    this.closePopup();
    document.getElementById('bugradar-overlay-styles')?.remove();
    document.getElementById('br-quickfix-modal')?.remove();
  }
}
