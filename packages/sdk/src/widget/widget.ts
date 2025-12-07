import type { BugRadarConfig, BugReport, SelectedElement } from '../types';
import { injectStyles } from './styles';
import { ICONS } from './icons';
import { getBrowserContext, getSelector, getXPath } from '../utils/browser';

type Step = 'closed' | 'type' | 'capture' | 'annotate' | 'details' | 'review' | 'success';
type ReportType = 'bug' | 'feedback' | 'change';
type Severity = 'low' | 'medium' | 'high' | 'critical';
type Tool = 'arrow' | 'rectangle' | 'text' | 'draw' | null;

interface Annotation {
  id: string;
  type: 'arrow' | 'rectangle' | 'text' | 'draw';
  points: { x: number; y: number }[];
  color: string;
  text?: string;
}

interface ConsoleError {
  id: string;
  time: string;
  message: string;
  selected: boolean;
}

export class BugReporterWidget {
  private config: BugRadarConfig;
  private container: HTMLDivElement | null = null;
  private step: Step = 'closed';
  private reportType: ReportType = 'bug';
  private title = '';
  private description = '';
  private severity: Severity = 'medium';
  private selectedElements: SelectedElement[] = [];
  private screenshot: string | null = null;
  private annotations: Annotation[] = [];
  private currentTool: Tool = null;
  private currentColor = '#ef4444';
  private isDrawing = false;
  private drawStart = { x: 0, y: 0 };
  private consoleErrors: ConsoleError[] = [];
  private highlightEl: HTMLDivElement | null = null;
  private selectedOverlays: HTMLDivElement[] = [];
  private selectorTooltip: HTMLDivElement | null = null;
  private isSelectingElements = false;
  private canvas: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private getConsoleLogs: () => any[];
  private getNetworkLogs: () => any[];
  private sessionId: string;
  private onSubmit: (report: BugReport) => Promise<unknown>;
  private autoCloseTimer: ReturnType<typeof setInterval> | null = null;
  private autoCloseSeconds = 30;
  private isSelectingArea = false;
  private areaSelectionOverlay: HTMLDivElement | null = null;
  private areaSelectionBox: HTMLDivElement | null = null;
  private areaStart = { x: 0, y: 0 };
  private areaEnd = { x: 0, y: 0 };

  constructor(
    config: BugRadarConfig,
    sessionId: string,
    getConsoleLogs: () => any[],
    getNetworkLogs: () => any[],
    onSubmit: (report: BugReport) => Promise<unknown>
  ) {
    this.config = config;
    this.sessionId = sessionId;
    this.getConsoleLogs = getConsoleLogs;
    this.getNetworkLogs = getNetworkLogs;
    this.onSubmit = onSubmit;
  }

  mount(): void {
    if (this.container) return;
    injectStyles();
    this.createWidget();
  }

  unmount(): void {
    this.container?.remove();
    this.container = null;
    this.cleanup();
  }

  open(): void {
    this.step = 'type';
    this.loadConsoleErrors();
    this.render();
  }

  close(): void {
    this.step = 'closed';
    this.clearAutoCloseTimer();
    this.reset();
    this.cleanup();
    this.render();
  }

  private clearAutoCloseTimer(): void {
    if (this.autoCloseTimer) {
      clearInterval(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
    this.autoCloseSeconds = 30;
  }

  private startAutoCloseTimer(): void {
    this.autoCloseSeconds = 30;
    this.autoCloseTimer = setInterval(() => {
      this.autoCloseSeconds--;
      const timerEl = document.querySelector('.br-auto-close-timer');
      if (timerEl) {
        timerEl.textContent = `Auto-closing in ${this.autoCloseSeconds}s`;
      }
      if (this.autoCloseSeconds <= 0) {
        this.close();
      }
    }, 1000);
  }

  private reset(): void {
    this.reportType = 'bug';
    this.title = '';
    this.description = '';
    this.severity = 'medium';
    this.selectedElements = [];
    this.screenshot = null;
    this.annotations = [];
    this.currentTool = null;
    this.consoleErrors.forEach(e => e.selected = false);
  }

  private cleanup(): void {
    this.highlightEl?.remove();
    this.highlightEl = null;
    this.selectedOverlays.forEach(o => o.remove());
    this.selectedOverlays = [];
    this.selectorTooltip?.remove();
    this.selectorTooltip = null;
    document.body.classList.remove('br-selecting-mode');
    this.isSelectingElements = false;
  }

  private loadConsoleErrors(): void {
    const logs = this.getConsoleLogs();
    this.consoleErrors = logs
      .filter(log => log.type === 'error')
      .slice(-10)
      .map((log, i) => ({
        id: `err_${i}`,
        time: new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: typeof log.args[0] === 'string' ? log.args[0] : JSON.stringify(log.args[0]),
        selected: false,
      }));
  }

  private createWidget(): void {
    this.container = document.createElement('div');
    this.container.id = 'bugradar-widget';
    if (this.config.theme === 'dark' || (this.config.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.container.classList.add('dark');
    }
    document.body.appendChild(this.container);

    this.highlightEl = document.createElement('div');
    this.highlightEl.className = 'br-element-highlight';
    this.highlightEl.style.display = 'none';
    document.body.appendChild(this.highlightEl);

    this.bindEvents();
    this.render();
  }

  private render(): void {
    if (!this.container) return;
    console.log('[BugRadar] Rendering step:', this.step, 'has screenshot:', !!this.screenshot);

    const pos = this.config.position || 'bottom-right';
    const posStyle = {
      'bottom-right': 'bottom:24px;right:24px',
      'bottom-left': 'bottom:24px;left:24px',
      'top-right': 'top:24px;right:24px',
      'top-left': 'top:24px;left:24px',
    }[pos];

    this.container.innerHTML = `
      ${this.config.showButton !== false ? `
        <button class="br-fab" style="${posStyle}" data-action="open">${ICONS.bug}</button>
      ` : ''}
      <div class="br-overlay${this.step !== 'closed' ? ' open' : ''}" data-action="close-overlay">
        <div class="br-sidebar" data-sidebar>
          ${this.renderSidebar()}
        </div>
      </div>
    `;

    if (this.step === 'annotate' && this.screenshot) {
      this.setupCanvas();
    }
  }

  private renderSidebar(): string {
    switch (this.step) {
      case 'type': return this.renderTypeStep();
      case 'capture': return this.renderCaptureStep();
      case 'annotate': return this.renderAnnotateStep();
      case 'details': return this.renderDetailsStep();
      case 'review': return this.renderReviewStep();
      case 'success': return this.renderSuccessStep();
      default: return '';
    }
  }

  private getStepIndicator(current: number): string {
    const steps = ['type', 'capture', 'details', 'review'];
    return `
      <div class="br-steps">
        ${steps.map((_, i) => `<div class="br-step${i < current ? ' done' : i === current ? ' active' : ''}"></div>`).join('')}
      </div>
    `;
  }

  private renderTypeStep(): string {
    return `
      <div class="br-header" style="padding:24px 32px !important;">
        <div class="br-header-inner" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          <div class="br-header-left" style="display:flex;align-items:center;gap:14px;">
            <div class="br-logo">${ICONS.bug}</div>
            <div class="br-header-text">
              <span class="br-header-title">Report an Issue</span>
              <span class="br-header-subtitle">Step 1 of 4</span>
            </div>
          </div>
          <button class="br-close" data-action="close">${ICONS.close}</button>
        </div>
      </div>
      <div class="br-body" style="padding:32px !important;">
        <div style="margin-bottom:48px !important;padding-bottom:0;">${this.getStepIndicator(0)}</div>

        <p class="br-section-title" style="margin-top:0 !important;margin-bottom:32px !important;padding-top:0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.6;">What would you like to report?</p>

        <div class="br-type-options" style="display:flex !important;flex-direction:column !important;gap:24px !important;margin-bottom:0;">
          <button class="br-type-btn${this.reportType === 'bug' ? ' active' : ''}" data-type="bug" style="display:flex !important;align-items:center !important;gap:24px !important;padding:28px 32px !important;margin:0;">
            <div class="br-type-icon br-type-icon-bug" style="width:72px !important;height:72px !important;min-width:72px;font-size:36px;display:flex;align-items:center;justify-content:center;border-radius:18px;">🐛</div>
            <div class="br-type-content" style="flex:1;">
              <span class="br-type-label" style="display:block;font-size:20px;font-weight:600;margin-bottom:8px;">Bug Report</span>
              <span class="br-type-desc" style="display:block;font-size:15px;opacity:0.6;">Something isn't working as expected</span>
            </div>
            <div class="br-type-radio" style="width:32px;height:32px;min-width:32px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;">
              <div class="br-type-radio-inner"></div>
            </div>
          </button>

          <button class="br-type-btn${this.reportType === 'feedback' ? ' active' : ''}" data-type="feedback" style="display:flex !important;align-items:center !important;gap:24px !important;padding:28px 32px !important;margin:0;">
            <div class="br-type-icon br-type-icon-feedback" style="width:72px !important;height:72px !important;min-width:72px;font-size:36px;display:flex;align-items:center;justify-content:center;border-radius:18px;">💡</div>
            <div class="br-type-content" style="flex:1;">
              <span class="br-type-label" style="display:block;font-size:20px;font-weight:600;margin-bottom:8px;">Feedback</span>
              <span class="br-type-desc" style="display:block;font-size:15px;opacity:0.6;">Share an idea or suggestion</span>
            </div>
            <div class="br-type-radio" style="width:32px;height:32px;min-width:32px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;">
              <div class="br-type-radio-inner"></div>
            </div>
          </button>

          <button class="br-type-btn${this.reportType === 'change' ? ' active' : ''}" data-type="change" style="display:flex !important;align-items:center !important;gap:24px !important;padding:28px 32px !important;margin:0;">
            <div class="br-type-icon br-type-icon-change" style="width:72px !important;height:72px !important;min-width:72px;font-size:36px;display:flex;align-items:center;justify-content:center;border-radius:18px;">✏️</div>
            <div class="br-type-content" style="flex:1;">
              <span class="br-type-label" style="display:block;font-size:20px;font-weight:600;margin-bottom:8px;">Edit / Change</span>
              <span class="br-type-desc" style="display:block;font-size:15px;opacity:0.6;">Request a modification or update</span>
            </div>
            <div class="br-type-radio" style="width:32px;height:32px;min-width:32px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;">
              <div class="br-type-radio-inner"></div>
            </div>
          </button>
        </div>

        <div class="br-keyboard-hint" style="margin-top:56px !important;padding-top:28px;border-top:1px solid rgba(255,255,255,0.1);display:flex;justify-content:center;gap:24px;">
          <span class="br-hint"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> select</span>
          <span class="br-hint"><kbd>Enter</kbd> continue</span>
          <span class="br-hint"><kbd>Esc</kbd> close</span>
        </div>
      </div>
      <div class="br-footer" style="padding:24px 32px !important;">
        <div class="br-footer-inner" style="display:flex;gap:16px;width:100%;">
          <button class="br-btn br-btn-secondary" data-action="close">Cancel</button>
          <button class="br-btn br-btn-primary" data-action="next">Continue</button>
        </div>
      </div>
    `;
  }

  private renderCaptureStep(): string {
    return `
      <div class="br-header" style="padding:24px 32px !important;">
        <div class="br-header-inner" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          <div class="br-header-left" style="display:flex;align-items:center;gap:14px;">
            <div class="br-logo">${ICONS.bug}</div>
            <div class="br-header-text">
              <span class="br-header-title">Capture an Action</span>
              <span class="br-header-subtitle">Step 2 of 4</span>
            </div>
          </div>
          <button class="br-close" data-action="close">${ICONS.close}</button>
        </div>
      </div>
      <div class="br-body" style="padding:32px !important;">
        <div style="margin-bottom:48px !important;">${this.getStepIndicator(1)}</div>

        <p class="br-section-title" style="margin-top:0 !important;margin-bottom:32px !important;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.6;">How would you like to capture the issue?</p>

        <div class="br-capture-options" style="display:flex !important;flex-direction:column !important;gap:16px !important;">
          <button class="br-capture-btn" data-action="select-elements" style="display:flex !important;align-items:center !important;gap:20px !important;padding:24px 28px !important;border-radius:16px;border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);">
            <div class="br-capture-icon" style="width:56px;height:56px;min-width:56px;background:rgba(255,255,255,0.08);border-radius:14px;display:flex;align-items:center;justify-content:center;">${ICONS.mousePointer}</div>
            <div class="br-capture-content" style="flex:1;text-align:left;">
              <span class="br-capture-label" style="display:block;font-size:17px;font-weight:600;margin-bottom:6px;">Select Elements</span>
              <span class="br-capture-desc" style="display:block;font-size:14px;opacity:0.6;">Click on page elements to highlight</span>
            </div>
          </button>

          <button class="br-capture-btn" data-action="select-area-screenshot" style="display:flex !important;align-items:center !important;gap:20px !important;padding:24px 28px !important;border-radius:16px;border:2px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">
            <div class="br-capture-icon" style="width:56px;height:56px;min-width:56px;background:rgba(239,68,68,0.15);border-radius:14px;display:flex;align-items:center;justify-content:center;">${ICONS.crop}</div>
            <div class="br-capture-content" style="flex:1;text-align:left;">
              <span class="br-capture-label" style="display:block;font-size:17px;font-weight:600;margin-bottom:6px;">Select Area Screenshot</span>
              <span class="br-capture-desc" style="display:block;font-size:14px;opacity:0.6;">Draw a box to capture a specific area</span>
            </div>
          </button>

          <button class="br-capture-btn" data-action="take-screenshot" style="display:flex !important;align-items:center !important;gap:20px !important;padding:24px 28px !important;border-radius:16px;border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);">
            <div class="br-capture-icon" style="width:56px;height:56px;min-width:56px;background:rgba(255,255,255,0.08);border-radius:14px;display:flex;align-items:center;justify-content:center;">${ICONS.camera}</div>
            <div class="br-capture-content" style="flex:1;text-align:left;">
              <span class="br-capture-label" style="display:block;font-size:17px;font-weight:600;margin-bottom:6px;">Full Page Screenshot</span>
              <span class="br-capture-desc" style="display:block;font-size:14px;opacity:0.6;">Capture the entire visible screen</span>
            </div>
          </button>

          <button class="br-capture-btn" data-action="skip-capture" style="display:flex !important;align-items:center !important;gap:20px !important;padding:24px 28px !important;border-radius:16px;border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);">
            <div class="br-capture-icon" style="width:56px;height:56px;min-width:56px;background:rgba(255,255,255,0.08);border-radius:14px;display:flex;align-items:center;justify-content:center;">${ICONS.send}</div>
            <div class="br-capture-content" style="flex:1;text-align:left;">
              <span class="br-capture-label" style="display:block;font-size:17px;font-weight:600;margin-bottom:6px;">Skip this step</span>
              <span class="br-capture-desc" style="display:block;font-size:14px;opacity:0.6;">Continue without visual capture</span>
            </div>
          </button>
        </div>

        ${this.selectedElements.length > 0 ? `
          <div class="br-elements" style="margin-top:32px;padding:20px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
            <p class="br-elements-title" style="font-size:13px;font-weight:600;margin-bottom:12px;opacity:0.7;">${this.selectedElements.length} element${this.selectedElements.length > 1 ? 's' : ''} selected</p>
            <div class="br-element-list" style="display:flex;flex-wrap:wrap;gap:8px;">
              ${this.selectedElements.map((el, i) => `
                <span class="br-element-tag" style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(255,255,255,0.06);border-radius:8px;font-size:13px;">
                  <span class="br-element-num" style="width:20px;height:20px;background:#EF4444;color:white;border-radius:50%;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;">${i + 1}</span>
                  ${el.tagName}
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="br-keyboard-hint" style="margin-top:48px !important;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);display:flex;justify-content:center;gap:24px;">
          <span class="br-hint"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> select</span>
          <span class="br-hint"><kbd>←</kbd> back</span>
        </div>
      </div>
      <div class="br-footer" style="padding:24px 32px !important;">
        <div class="br-footer-inner" style="display:flex;gap:16px;width:100%;">
          <button class="br-btn br-btn-secondary" data-action="back">Back</button>
          <button class="br-btn br-btn-primary" data-action="next"${!this.screenshot && this.selectedElements.length === 0 ? ' disabled' : ''}>Continue</button>
        </div>
      </div>
    `;
  }

  private renderAnnotateStep(): string {
    const tools = [
      { id: 'arrow', icon: ICONS.arrow },
      { id: 'rectangle', icon: ICONS.rectangle },
      { id: 'text', icon: ICONS.text },
      { id: 'draw', icon: ICONS.highlight },
    ];
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

    return `
      <div class="br-header" style="padding:24px 32px !important;">
        <div class="br-header-inner" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          <div class="br-header-left" style="display:flex;align-items:center;gap:14px;">
            <div class="br-logo">${ICONS.bug}</div>
            <div class="br-header-text">
              <span class="br-header-title">Annotate Screenshot</span>
              <span class="br-header-subtitle">Optional</span>
            </div>
          </div>
          <button class="br-close" data-action="close">${ICONS.close}</button>
        </div>
      </div>
      <div class="br-body" style="padding:32px !important;">
        <div class="br-toolbar">
          ${tools.map(t => `
            <button class="br-tool-btn${this.currentTool === t.id ? ' active' : ''}" data-tool="${t.id}">${t.icon}</button>
          `).join('')}
          <div class="br-tool-sep"></div>
          ${colors.map(c => `
            <button class="br-color-btn${this.currentColor === c ? ' active' : ''}" data-color="${c}" style="background:${c}"></button>
          `).join('')}
          <div class="br-tool-sep"></div>
          <button class="br-tool-btn" data-action="undo">${ICONS.undo}</button>
          <button class="br-tool-btn" data-action="clear">${ICONS.trash}</button>
        </div>
        <div class="br-screenshot-wrap" id="br-screenshot-wrap">
          ${this.screenshot ? `
            <img src="${this.screenshot}" class="br-screenshot-img" id="br-screenshot-img" />
            <canvas class="br-screenshot-canvas" id="br-screenshot-canvas"></canvas>
          ` : `
            <div class="br-screenshot-empty">
              ${ICONS.image}
              <p class="br-screenshot-empty-text">Screenshot failed to load</p>
            </div>
          `}
        </div>
      </div>
      <div class="br-footer" style="padding:24px 32px !important;">
        <div class="br-footer-inner" style="display:flex;gap:16px;width:100%;">
          <button class="br-btn br-btn-secondary" data-action="back">Back</button>
          <button class="br-btn br-btn-primary" data-action="next">Continue</button>
        </div>
      </div>
    `;
  }

  private renderDetailsStep(): string {
    const errorCount = this.consoleErrors.length;

    return `
      <div class="br-header" style="padding:24px 32px !important;">
        <div class="br-header-inner" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          <div class="br-header-left" style="display:flex;align-items:center;gap:14px;">
            <div class="br-logo">${ICONS.bug}</div>
            <div class="br-header-text">
              <span class="br-header-title">Describe Issue</span>
              <span class="br-header-subtitle">Step 3 of 4</span>
            </div>
          </div>
          <button class="br-close" data-action="close">${ICONS.close}</button>
        </div>
      </div>
      <div class="br-body" style="padding:32px !important;">
        <div style="margin-bottom:48px !important;">${this.getStepIndicator(2)}</div>

        <div class="br-field" style="margin-bottom:36px !important;">
          <label class="br-label" style="display:block;font-size:14px;font-weight:600;margin-bottom:14px !important;">Title<span class="br-required" style="color:#EF4444;margin-left:4px;">*</span></label>
          <input type="text" class="br-input" data-field="title" placeholder="Brief summary of the issue" value="${this.esc(this.title)}" style="width:100%;padding:18px 20px;font-size:15px;border-radius:12px;border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);" />
        </div>

        <div class="br-field" style="margin-bottom:36px !important;">
          <div class="br-label-row" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px !important;">
            <label class="br-label" style="font-size:14px;font-weight:600;">Description<span class="br-optional" style="font-size:12px;opacity:0.6;margin-left:8px;">(optional)</span></label>
            <button class="br-ai-btn" data-action="ai-enhance">✨ Enhance</button>
          </div>
          <textarea class="br-textarea" data-field="description" placeholder="What happened? What did you expect to happen?" style="width:100%;padding:18px 20px;font-size:15px;border-radius:12px;border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);min-height:140px;resize:vertical;">${this.esc(this.description)}</textarea>
        </div>

        <div class="br-field" style="margin-bottom:0 !important;">
          <label class="br-label" style="display:block;font-size:14px;font-weight:600;margin-bottom:14px !important;">Severity</label>
          <div class="br-severity-options" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;">
            ${(['low', 'medium', 'high', 'critical'] as const).map(s => `
              <button class="br-sev-btn ${s}${this.severity === s ? ' active' : ''}" data-severity="${s}" style="padding:16px 14px;font-size:13px;font-weight:600;border-radius:10px;text-transform:capitalize;">${s}</button>
            `).join('')}
          </div>
        </div>

        ${errorCount > 0 ? `
          <div class="br-field" style="margin-top:36px !important;margin-bottom:0;">
            <label class="br-label" style="display:block;font-size:14px;font-weight:600;margin-bottom:14px !important;">Console Errors<span class="br-optional" style="font-size:12px;opacity:0.6;margin-left:8px;">(${errorCount} detected)</span></label>
            <div class="br-errors-list" style="border:2px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
              ${this.consoleErrors.slice(0, 5).map(err => `
                <div class="br-error-item${err.selected ? ' selected' : ''}" data-error="${err.id}" style="display:flex;align-items:flex-start;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <div class="br-error-check">${ICONS.check}</div>
                  <div class="br-error-content">
                    <span class="br-error-time" style="font-size:11px;opacity:0.5;">${err.time}</span>
                    <span class="br-error-msg" style="display:block;font-size:13px;margin-top:4px;color:#EF4444;">${this.esc(err.message.slice(0, 80))}${err.message.length > 80 ? '...' : ''}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      <div class="br-footer" style="padding:24px 32px !important;">
        <div class="br-footer-inner" style="display:flex;gap:16px;width:100%;">
          <button class="br-btn br-btn-secondary" data-action="back">Back</button>
          <button class="br-btn br-btn-primary" data-action="next"${!this.title.trim() ? ' disabled' : ''}>Review</button>
        </div>
      </div>
    `;
  }

  private renderReviewStep(): string {
    const selectedErrors = this.consoleErrors.filter(e => e.selected);
    const finalScreenshot = this.getAnnotatedScreenshot();

    return `
      <div class="br-header" style="padding:24px 32px !important;">
        <div class="br-header-inner" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          <div class="br-header-left" style="display:flex;align-items:center;gap:14px;">
            <div class="br-logo">${ICONS.bug}</div>
            <div class="br-header-text">
              <span class="br-header-title">Review & Submit</span>
              <span class="br-header-subtitle">Step 4 of 4</span>
            </div>
          </div>
          <button class="br-close" data-action="close">${ICONS.close}</button>
        </div>
      </div>
      <div class="br-body" style="padding:32px !important;">
        <div style="margin-bottom:40px !important;">${this.getStepIndicator(3)}</div>

        <div class="br-review-card" style="background:rgba(255,255,255,0.03);border-radius:16px;padding:24px;border:1px solid rgba(255,255,255,0.08);">

          <div class="br-review-row" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span class="br-review-label" style="font-size:14px;opacity:0.6;">Type</span>
            <span class="br-badge br-badge-${this.reportType}" style="padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;">${this.reportType === 'bug' ? '🐛 Bug' : this.reportType === 'feedback' ? '💡 Feedback' : '✏️ Change'}</span>
          </div>

          <div class="br-review-row" style="display:flex;justify-content:space-between;align-items:flex-start;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span class="br-review-label" style="font-size:14px;opacity:0.6;">Title</span>
            <span class="br-review-value" style="font-size:14px;font-weight:500;text-align:right;max-width:60%;">${this.esc(this.title)}</span>
          </div>

          <div class="br-review-row" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;${this.description || finalScreenshot || this.selectedElements.length > 0 || selectedErrors.length > 0 ? 'border-bottom:1px solid rgba(255,255,255,0.06);' : ''}">
            <span class="br-review-label" style="font-size:14px;opacity:0.6;">Severity</span>
            <span class="br-badge br-badge-${this.severity}" style="padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;text-transform:capitalize;">${this.severity}</span>
          </div>

          ${this.description ? `
            <div class="br-review-row" style="display:flex;justify-content:space-between;align-items:flex-start;padding:16px 0;${finalScreenshot || this.selectedElements.length > 0 || selectedErrors.length > 0 ? 'border-bottom:1px solid rgba(255,255,255,0.06);' : ''}">
              <span class="br-review-label" style="font-size:14px;opacity:0.6;">Description</span>
              <span class="br-review-value" style="font-size:14px;text-align:right;max-width:60%;opacity:0.8;">${this.esc(this.description.slice(0, 100))}${this.description.length > 100 ? '...' : ''}</span>
            </div>
          ` : ''}

          ${finalScreenshot ? `
            <div style="padding:16px 0;${this.selectedElements.length > 0 || selectedErrors.length > 0 ? 'border-bottom:1px solid rgba(255,255,255,0.06);' : ''}">
              <span class="br-review-label" style="display:block;font-size:14px;opacity:0.6;margin-bottom:12px;">Screenshot</span>
              <img src="${finalScreenshot}" style="width:100%;border-radius:12px;border:1px solid rgba(255,255,255,0.1);" />
            </div>
          ` : ''}

          ${this.selectedElements.length > 0 ? `
            <div class="br-review-row" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;${selectedErrors.length > 0 ? 'border-bottom:1px solid rgba(255,255,255,0.06);' : ''}">
              <span class="br-review-label" style="font-size:14px;opacity:0.6;">Elements</span>
              <span class="br-review-value" style="font-size:14px;font-weight:500;">${this.selectedElements.length} selected</span>
            </div>
          ` : ''}

          ${selectedErrors.length > 0 ? `
            <div class="br-review-row" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;">
              <span class="br-review-label" style="font-size:14px;opacity:0.6;">Console Errors</span>
              <span class="br-review-value" style="font-size:14px;font-weight:500;color:#EF4444;">${selectedErrors.length} included</span>
            </div>
          ` : ''}
        </div>

        <div class="br-keyboard-hint" style="margin-top:40px !important;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);display:flex;justify-content:center;gap:24px;">
          <span class="br-hint"><kbd>Enter</kbd> submit</span>
          <span class="br-hint"><kbd>←</kbd> edit</span>
        </div>
      </div>
      <div class="br-footer br-footer-full" style="padding:24px 32px !important;">
        <div class="br-footer-inner" style="display:flex;flex-direction:column;gap:14px;width:100%;">
          <button class="br-btn br-btn-success" data-action="submit" style="padding:18px 28px;font-size:16px;min-height:56px;">
            ${ICONS.send} Submit Report
          </button>
          <button class="br-btn br-btn-secondary" data-action="back" style="padding:14px 24px;">← Edit</button>
        </div>
      </div>
    `;
  }

  private renderSuccessStep(): string {
    // Generate confetti pieces - more pieces, staggered delays for continuous effect
    const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E'];
    const confetti = Array.from({ length: 100 }, (_, i) => {
      const color = colors[i % colors.length];
      const left = Math.random() * 100;
      const delay = Math.random() * 1.5;
      const size = 6 + Math.random() * 12;
      const duration = 3 + Math.random() * 2;
      const shape = Math.random() > 0.5 ? 'border-radius: 50%;' : 'border-radius: 2px;';
      const rotate = Math.random() * 360;
      return `<div class="br-confetti-piece" style="left:${left}%;background:${color};width:${size}px;height:${size}px;${shape}animation-delay:${delay}s;animation-duration:${duration}s;transform:rotate(${rotate}deg);"></div>`;
    }).join('');

    return `
      <div class="br-confetti">${confetti}</div>
      <div class="br-header" style="padding:24px 32px !important;">
        <div class="br-header-inner" style="display:flex;align-items:center;justify-content:space-between;width:100%;">
          <div class="br-header-left" style="display:flex;align-items:center;gap:14px;">
            <div class="br-logo">${ICONS.bug}</div>
            <div class="br-header-text">
              <span class="br-header-title">BugRadar</span>
              <span class="br-header-subtitle">Success!</span>
            </div>
          </div>
          <button class="br-close" data-action="close">${ICONS.close}</button>
        </div>
      </div>
      <div class="br-body" style="padding:48px 40px !important;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:calc(100vh - 100px);">
        <div class="br-success-state" style="width:100%;max-width:360px;">
          <!-- Success Icon with animated ring -->
          <div style="position:relative;width:140px;height:140px;margin:0 auto 48px;">
            <div style="position:absolute;inset:0;border-radius:50%;background:linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.05) 100%);"></div>
            <div style="position:absolute;inset:12px;border-radius:50%;background:rgba(16,185,129,0.15);display:flex;align-items:center;justify-content:center;">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          <!-- Title -->
          <h3 style="font-size:32px;font-weight:700;margin:0 0 16px;color:#fff;letter-spacing:-0.02em;">Report Submitted!</h3>

          <!-- Subtitle -->
          <p style="font-size:17px;opacity:0.6;margin:0 0 48px;line-height:1.7;color:#fff;">Your report has been captured and is ready for review in the dashboard.</p>

          <!-- Close Button -->
          <button class="br-btn br-btn-primary" data-action="close" style="width:100%;padding:20px 32px;font-size:17px;font-weight:600;border-radius:14px;min-height:60px;">
            Close Window
          </button>

          <!-- Auto-close timer -->
          <p class="br-auto-close-timer" style="margin-top:24px;font-size:13px;opacity:0.4;color:#fff;">Auto-closing in ${this.autoCloseSeconds}s</p>
        </div>
      </div>
    `;
  }

  private setupCanvas(): void {
    setTimeout(() => {
      const img = document.getElementById('br-screenshot-img') as HTMLImageElement;
      const canvas = document.getElementById('br-screenshot-canvas') as HTMLCanvasElement;
      if (!img || !canvas) return;

      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');

      const setup = () => {
        canvas.width = img.offsetWidth;
        canvas.height = img.offsetHeight;
        this.redrawCanvas();
      };

      if (img.complete) setup();
      else img.onload = setup;
    }, 50);
  }

  private redrawCanvas(): void {
    if (!this.canvas || !this.canvasCtx) return;
    const ctx = this.canvasCtx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.annotations.forEach(ann => {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      switch (ann.type) {
        case 'arrow':
          if (ann.points.length >= 2) {
            const [start, end] = ann.points;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const len = 12;
            ctx.beginPath();
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(end.x - len * Math.cos(angle - Math.PI / 6), end.y - len * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(end.x, end.y);
            ctx.lineTo(end.x - len * Math.cos(angle + Math.PI / 6), end.y - len * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
          }
          break;
        case 'rectangle':
          if (ann.points.length >= 2) {
            ctx.strokeRect(ann.points[0].x, ann.points[0].y, ann.points[1].x - ann.points[0].x, ann.points[1].y - ann.points[0].y);
          }
          break;
        case 'text':
          if (ann.text && ann.points.length > 0) {
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(ann.text, ann.points[0].x, ann.points[0].y);
          }
          break;
        case 'draw':
          if (ann.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(ann.points[0].x, ann.points[0].y);
            ann.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
          }
          break;
      }
    });
  }

  private getAnnotatedScreenshot(): string | null {
    if (!this.screenshot) return null;
    if (this.annotations.length === 0) return this.screenshot;

    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d')!;
    const img = new Image();
    img.src = this.screenshot;

    exportCanvas.width = img.naturalWidth || 800;
    exportCanvas.height = img.naturalHeight || 600;
    ctx.drawImage(img, 0, 0);

    const scaleX = exportCanvas.width / (this.canvas?.width || exportCanvas.width);
    const scaleY = exportCanvas.height / (this.canvas?.height || exportCanvas.height);

    this.annotations.forEach(ann => {
      ctx.strokeStyle = ann.color;
      ctx.fillStyle = ann.color;
      ctx.lineWidth = 3 * Math.max(scaleX, scaleY);
      ctx.lineCap = 'round';

      const scaled = ann.points.map(p => ({ x: p.x * scaleX, y: p.y * scaleY }));

      switch (ann.type) {
        case 'arrow':
          if (scaled.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(scaled[0].x, scaled[0].y);
            ctx.lineTo(scaled[1].x, scaled[1].y);
            ctx.stroke();
          }
          break;
        case 'rectangle':
          if (scaled.length >= 2) {
            ctx.strokeRect(scaled[0].x, scaled[0].y, scaled[1].x - scaled[0].x, scaled[1].y - scaled[0].y);
          }
          break;
        case 'draw':
          if (scaled.length > 1) {
            ctx.beginPath();
            ctx.moveTo(scaled[0].x, scaled[0].y);
            scaled.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
          }
          break;
      }
    });

    return exportCanvas.toDataURL('image/jpeg', 0.9);
  }

  private bindEvents(): void {
    document.addEventListener('click', this.handleClick.bind(this), true);
    document.addEventListener('input', this.handleInput.bind(this));
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  private handleClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;

    // Element selection mode
    if (this.isSelectingElements) {
      if (!target.closest('#bugradar-widget') && !target.closest('.br-selector-tooltip')) {
        e.preventDefault();
        e.stopPropagation();
        this.addSelectedElement(target);
        return;
      }
    }

    // Don't process clicks outside widget when sidebar is open
    const sidebar = target.closest('[data-sidebar]');
    const action = target.closest('[data-action]')?.getAttribute('data-action');

    // Type selection
    const typeBtn = target.closest('[data-type]');
    if (typeBtn) {
      e.preventDefault();
      e.stopPropagation();
      this.reportType = typeBtn.getAttribute('data-type') as ReportType;
      this.render();
      return;
    }

    // Tool selection
    const toolBtn = target.closest('[data-tool]');
    if (toolBtn) {
      this.currentTool = toolBtn.getAttribute('data-tool') as Tool;
      this.render();
      return;
    }

    // Color selection
    const colorBtn = target.closest('[data-color]');
    if (colorBtn) {
      this.currentColor = colorBtn.getAttribute('data-color') || '#ef4444';
      this.render();
      return;
    }

    // Severity selection
    const sevBtn = target.closest('[data-severity]');
    if (sevBtn) {
      this.severity = sevBtn.getAttribute('data-severity') as Severity;
      this.render();
      return;
    }

    // Error toggle
    const errorItem = target.closest('[data-error]');
    if (errorItem) {
      const id = errorItem.getAttribute('data-error');
      const err = this.consoleErrors.find(e => e.id === id);
      if (err) err.selected = !err.selected;
      this.render();
      return;
    }

    if (!action) return;

    switch (action) {
      case 'open':
        this.open();
        break;
      case 'close':
        this.close();
        break;
      case 'close-overlay':
        if (target.classList.contains('br-overlay')) this.close();
        break;
      case 'next':
        this.nextStep();
        break;
      case 'back':
        this.prevStep();
        break;
      case 'select-elements':
        this.startElementSelection();
        break;
      case 'take-screenshot':
        this.takeScreenshot();
        break;
      case 'select-area-screenshot':
        this.startAreaSelection();
        break;
      case 'skip-capture':
        this.step = 'details';
        this.render();
        break;
      case 'undo':
        this.annotations.pop();
        this.redrawCanvas();
        break;
      case 'clear':
        this.annotations = [];
        this.redrawCanvas();
        break;
      case 'ai-enhance':
        this.enhanceWithAI();
        break;
      case 'submit':
        this.submit();
        break;
    }
  }

  private nextStep(): void {
    this.saveFields();

    // Handle annotate step -> go to details
    if (this.step === 'annotate') {
      this.step = 'details';
      this.render();
      return;
    }

    const steps: Step[] = ['type', 'capture', 'details', 'review'];
    const idx = steps.indexOf(this.step as Step);
    if (idx >= 0 && idx < steps.length - 1) {
      // Skip annotate if no screenshot
      if (this.step === 'capture' && !this.screenshot) {
        this.step = 'details';
      } else if (this.step === 'capture' && this.screenshot) {
        this.step = 'annotate';
      } else {
        this.step = steps[idx + 1];
      }
      this.render();
    }
  }

  private prevStep(): void {
    this.saveFields();
    if (this.step === 'annotate') {
      this.step = 'capture';
    } else if (this.step === 'capture') {
      this.step = 'type';
    } else if (this.step === 'details') {
      this.step = this.screenshot ? 'annotate' : 'capture';
    } else if (this.step === 'review') {
      this.step = 'details';
    }
    this.render();
  }

  private handleInput(e: Event): void {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const field = target.dataset.field;
    if (field === 'title') this.title = target.value;
    if (field === 'description') this.description = target.value;
  }

  private handleMouseDown(e: MouseEvent): void {
    if (this.step !== 'annotate' || !this.currentTool || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        this.annotations.push({ id: `a_${Date.now()}`, type: 'text', points: [{ x, y }], color: this.currentColor, text });
        this.redrawCanvas();
      }
      return;
    }

    this.isDrawing = true;
    this.drawStart = { x, y };

    if (this.currentTool === 'draw') {
      this.annotations.push({ id: `a_${Date.now()}`, type: 'draw', points: [{ x, y }], color: this.currentColor });
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.isSelectingElements) {
      const target = e.target as HTMLElement;
      if (!target.closest('#bugradar-widget') && !target.closest('.br-selector-tooltip')) {
        this.showHighlight(target);
      }
      return;
    }

    if (!this.isDrawing || !this.canvas || !this.canvasCtx) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.currentTool === 'draw') {
      const last = this.annotations[this.annotations.length - 1];
      if (last?.type === 'draw') {
        last.points.push({ x, y });
        this.redrawCanvas();
      }
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    if (!this.isDrawing || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.currentTool === 'arrow' || this.currentTool === 'rectangle') {
      this.annotations.push({ id: `a_${Date.now()}`, type: this.currentTool, points: [this.drawStart, { x, y }], color: this.currentColor });
      this.redrawCanvas();
    }

    this.isDrawing = false;
  }

  private handleKeydown(e: KeyboardEvent): void {
    // Ctrl+Shift+B to open bug reporter
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      if (this.step === 'closed') {
        this.open();
      } else {
        this.close();
      }
      return;
    }

    // Escape to close
    if (e.key === 'Escape') {
      if (this.isSelectingArea) {
        this.cancelAreaSelection();
      } else if (this.isSelectingElements) {
        this.finishElementSelection();
      } else if (this.step !== 'closed') {
        this.close();
      }
    }

    // Enter to finish element selection
    if (e.key === 'Enter' && this.isSelectingElements) {
      this.finishElementSelection();
      return;
    }

    // Don't capture shortcuts when typing in inputs
    const active = document.activeElement;
    if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') return;

    // Number keys for type selection (1 = bug, 2 = feedback, 3 = change)
    if (this.step === 'type') {
      if (e.key === '1') {
        this.reportType = 'bug';
        this.render();
      } else if (e.key === '2') {
        this.reportType = 'feedback';
        this.render();
      } else if (e.key === '3') {
        this.reportType = 'change';
        this.render();
      } else if (e.key === 'Enter' || e.key === 'n') {
        this.nextStep();
      }
    }

    // Capture step shortcuts (1 = select, 2 = screenshot, 3 = skip)
    if (this.step === 'capture') {
      if (e.key === '1') {
        this.startElementSelection();
      } else if (e.key === '2') {
        this.takeScreenshot();
      } else if (e.key === '3' || e.key === 's') {
        this.step = 'details';
        this.render();
      } else if (e.key === 'Enter' || e.key === 'n') {
        this.nextStep();
      } else if (e.key === 'Backspace' || e.key === 'b') {
        this.prevStep();
      }
    }

    // Details step shortcuts
    if (this.step === 'details') {
      if (e.key === 'Enter' && e.metaKey) {
        this.nextStep();
      } else if (e.key === 'Backspace' && e.metaKey) {
        this.prevStep();
      }
    }

    // Review step shortcuts
    if (this.step === 'review') {
      if (e.key === 'Enter' || e.key === 's') {
        this.submit();
      } else if (e.key === 'Backspace' || e.key === 'b') {
        this.prevStep();
      }
    }

    // Tab navigation (global)
    if (e.key === 'Tab' && this.step !== 'closed') {
      // Let default Tab behavior work for accessibility
    }
  }

  private saveFields(): void {
    const title = this.container?.querySelector('[data-field="title"]') as HTMLInputElement;
    const desc = this.container?.querySelector('[data-field="description"]') as HTMLTextAreaElement;
    if (title) this.title = title.value;
    if (desc) this.description = desc.value;
  }

  private startElementSelection(): void {
    this.step = 'closed';
    this.render();
    this.isSelectingElements = true;
    document.body.classList.add('br-selecting-mode');

    this.selectorTooltip = document.createElement('div');
    this.selectorTooltip.className = 'br-selector-tooltip';
    this.selectorTooltip.innerHTML = `
      <span>🎯 Click to select (${this.selectedElements.length}/10)</span>
      <span><kbd>Enter</kbd> done · <kbd>Esc</kbd> cancel</span>
    `;
    document.body.appendChild(this.selectorTooltip);
  }

  private finishElementSelection(): void {
    this.isSelectingElements = false;
    document.body.classList.remove('br-selecting-mode');
    this.selectorTooltip?.remove();
    this.selectorTooltip = null;
    if (this.highlightEl) this.highlightEl.style.display = 'none';
    this.step = 'capture';
    this.render();
  }

  private showHighlight(el: HTMLElement): void {
    if (!this.highlightEl) return;
    const rect = el.getBoundingClientRect();
    Object.assign(this.highlightEl.style, {
      display: 'block',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
  }

  private addSelectedElement(el: HTMLElement): void {
    if (this.selectedElements.length >= 10) return;

    const rect = el.getBoundingClientRect();
    this.selectedElements.push({
      selector: getSelector(el),
      xpath: getXPath(el),
      tagName: el.tagName.toLowerCase(),
      text: el.textContent?.trim().slice(0, 50) || '',
      html: el.outerHTML.slice(0, 300),
      boundingBox: rect,
      annotationType: 'highlight',
      annotationColor: this.currentColor,
    });

    const overlay = document.createElement('div');
    overlay.className = 'br-element-selected';
    overlay.style.cssText = `top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px`;
    overlay.innerHTML = `<span class="br-element-selected-num">${this.selectedElements.length}</span>`;
    document.body.appendChild(overlay);
    this.selectedOverlays.push(overlay);

    if (this.selectorTooltip) {
      this.selectorTooltip.innerHTML = `
        <span>🎯 Click to select (${this.selectedElements.length}/10)</span>
        <span><kbd>Enter</kbd> done · <kbd>Esc</kbd> cancel</span>
      `;
    }
  }

  private async takeScreenshot(): Promise<void> {
    console.log('[BugRadar] takeScreenshot called');
    // Hide widget before capturing
    this.step = 'closed';
    this.render();

    // Wait for widget to hide
    await new Promise(r => setTimeout(r, 200));

    try {
      console.log('[BugRadar] Starting screenshot capture with native API...');

      // Try native screen capture API first (captures actual rendered screen with styles)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' } as any,
        preferCurrentTab: true,
      } as any);

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Wait a frame for video to be ready
      await new Promise(r => requestAnimationFrame(r));

      // Create canvas and draw the video frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0);
        this.screenshot = canvas.toDataURL('image/jpeg', 0.8);
        console.log('[BugRadar] Native screenshot captured, length:', this.screenshot.length);
      }

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      this.step = 'annotate';
      this.render();
    } catch (err) {
      console.warn('[BugRadar] Native capture failed, trying html2canvas:', err);

      // Fallback to html2canvas
      try {
        const html2canvas = (await import('html2canvas')).default;

        const screenshotCanvas = await html2canvas(document.body, {
          logging: false,
          useCORS: true,
          allowTaint: true,
          scale: Math.min(window.devicePixelRatio || 1, 2),
          width: window.innerWidth,
          height: window.innerHeight,
          x: window.scrollX,
          y: window.scrollY,
          backgroundColor: null,
          removeContainer: true,
          ignoreElements: (element: Element) => {
            return element.id === 'bugradar-widget' ||
                   element.classList.contains('bugradar-ignore');
          },
        });

        this.screenshot = screenshotCanvas.toDataURL('image/jpeg', 0.8);
        console.log('[BugRadar] html2canvas screenshot captured');
        this.step = 'annotate';
        this.render();
      } catch (html2canvasErr) {
        console.error('[BugRadar] html2canvas also failed:', html2canvasErr);
        // Skip to details step
        this.step = 'details';
        this.render();
      }
    }
  }

  private startAreaSelection(): void {
    // Hide widget and show area selection overlay
    this.step = 'closed';
    this.render();
    this.isSelectingArea = true;

    // Create overlay for area selection
    this.areaSelectionOverlay = document.createElement('div');
    this.areaSelectionOverlay.className = 'br-area-overlay';
    this.areaSelectionOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      cursor: crosshair;
      z-index: 999998;
    `;

    // Create selection box
    this.areaSelectionBox = document.createElement('div');
    this.areaSelectionBox.className = 'br-area-box';
    this.areaSelectionBox.style.cssText = `
      position: fixed;
      border: 3px solid #EF4444;
      background: rgba(239, 68, 68, 0.1);
      pointer-events: none;
      z-index: 999999;
      display: none;
    `;

    // Create instruction tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'br-area-tooltip bugradar-ignore';
    tooltip.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 15px;
      z-index: 1000000;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    tooltip.innerHTML = `
      <span style="font-size:20px;">✂️</span>
      <span>Click and drag to select area</span>
      <span style="opacity:0.5;margin-left:8px;"><kbd style="background:rgba(255,255,255,0.1);padding:4px 8px;border-radius:4px;font-size:12px;">Esc</kbd> cancel</span>
    `;

    document.body.appendChild(this.areaSelectionOverlay);
    document.body.appendChild(this.areaSelectionBox);
    document.body.appendChild(tooltip);

    // Bind area selection events
    this.areaSelectionOverlay.addEventListener('mousedown', this.handleAreaMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleAreaMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleAreaMouseUp.bind(this));
  }

  private handleAreaMouseDown = (e: MouseEvent): void => {
    if (!this.isSelectingArea) return;
    this.areaStart = { x: e.clientX, y: e.clientY };
    this.areaEnd = { x: e.clientX, y: e.clientY };
    if (this.areaSelectionBox) {
      this.areaSelectionBox.style.display = 'block';
      this.areaSelectionBox.style.left = `${e.clientX}px`;
      this.areaSelectionBox.style.top = `${e.clientY}px`;
      this.areaSelectionBox.style.width = '0';
      this.areaSelectionBox.style.height = '0';
    }
  };

  private handleAreaMouseMove = (e: MouseEvent): void => {
    if (!this.isSelectingArea || !this.areaSelectionBox) return;
    if (this.areaSelectionBox.style.display === 'none') return;

    this.areaEnd = { x: e.clientX, y: e.clientY };

    const left = Math.min(this.areaStart.x, this.areaEnd.x);
    const top = Math.min(this.areaStart.y, this.areaEnd.y);
    const width = Math.abs(this.areaEnd.x - this.areaStart.x);
    const height = Math.abs(this.areaEnd.y - this.areaStart.y);

    this.areaSelectionBox.style.left = `${left}px`;
    this.areaSelectionBox.style.top = `${top}px`;
    this.areaSelectionBox.style.width = `${width}px`;
    this.areaSelectionBox.style.height = `${height}px`;
  };

  private handleAreaMouseUp = async (e: MouseEvent): Promise<void> => {
    if (!this.isSelectingArea) return;

    const width = Math.abs(this.areaEnd.x - this.areaStart.x);
    const height = Math.abs(this.areaEnd.y - this.areaStart.y);

    // Only capture if area is at least 20x20
    if (width > 20 && height > 20) {
      await this.captureSelectedArea();
    }

    this.cancelAreaSelection();
  };

  private cancelAreaSelection(): void {
    this.isSelectingArea = false;

    // Remove event listeners
    document.removeEventListener('mousemove', this.handleAreaMouseMove);
    document.removeEventListener('mouseup', this.handleAreaMouseUp);

    // Remove overlay elements
    this.areaSelectionOverlay?.remove();
    this.areaSelectionOverlay = null;
    this.areaSelectionBox?.remove();
    this.areaSelectionBox = null;

    // Remove tooltip
    document.querySelector('.br-area-tooltip')?.remove();

    // If no screenshot was taken, go back to capture step
    if (!this.screenshot) {
      this.step = 'capture';
      this.render();
    }
  }

  private async captureSelectedArea(): Promise<void> {
    // Calculate the area
    const left = Math.min(this.areaStart.x, this.areaEnd.x);
    const top = Math.min(this.areaStart.y, this.areaEnd.y);
    const width = Math.abs(this.areaEnd.x - this.areaStart.x);
    const height = Math.abs(this.areaEnd.y - this.areaStart.y);

    // Hide selection UI before capturing
    if (this.areaSelectionOverlay) this.areaSelectionOverlay.style.display = 'none';
    if (this.areaSelectionBox) this.areaSelectionBox.style.display = 'none';
    document.querySelector('.br-area-tooltip')?.remove();

    await new Promise(r => setTimeout(r, 100));

    try {
      // Try native screen capture API first (captures actual rendered screen with styles)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' } as any,
        preferCurrentTab: true,
      } as any);

      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Wait a frame for video to be ready
      await new Promise(r => requestAnimationFrame(r));

      // Create canvas and draw the video frame
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Calculate scale factor (video might be scaled)
        const scaleX = video.videoWidth / window.innerWidth;
        const scaleY = video.videoHeight / window.innerHeight;

        // Draw only the selected area
        ctx.drawImage(
          video,
          left * scaleX,
          top * scaleY,
          width * scaleX,
          height * scaleY,
          0,
          0,
          width,
          height
        );

        this.screenshot = canvas.toDataURL('image/jpeg', 0.9);
      }

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      this.step = 'annotate';
      this.render();
    } catch (err) {
      console.warn('[BugRadar] Native screen capture failed, trying html2canvas:', err);

      // Fallback to html2canvas without disabling styles
      try {
        const html2canvas = (await import('html2canvas')).default;

        const screenshotCanvas = await html2canvas(document.body, {
          logging: false,
          useCORS: true,
          allowTaint: true,
          scale: window.devicePixelRatio || 1,
          x: window.scrollX + left,
          y: window.scrollY + top,
          width: width,
          height: height,
          backgroundColor: null,
          ignoreElements: (element: Element) => {
            return element.id === 'bugradar-widget' ||
                   element.classList.contains('bugradar-ignore') ||
                   element.classList.contains('br-area-overlay') ||
                   element.classList.contains('br-area-box') ||
                   element.classList.contains('br-area-tooltip');
          },
        });

        this.screenshot = screenshotCanvas.toDataURL('image/jpeg', 0.9);
        this.step = 'annotate';
        this.render();
      } catch (html2canvasErr) {
        console.warn('[BugRadar] html2canvas also failed:', html2canvasErr);
        // Skip to details step
        this.step = 'details';
        this.render();
      }
    }
  }

  private async enhanceWithAI(): Promise<void> {
    const btn = this.container?.querySelector('[data-action="ai-enhance"]') as HTMLButtonElement;
    if (btn) {
      btn.innerHTML = '⏳ Enhancing...';
      btn.disabled = true;
    }

    await new Promise(r => setTimeout(r, 800));

    const orig = this.description || this.title;
    this.description = `## Summary
${this.title || 'Issue description'}

## Steps to Reproduce
1. Navigate to ${window.location.pathname}
2. [User action]
3. [Observed behavior]

## Expected Behavior
[What should have happened]

## Actual Behavior
${orig || '[What actually happened]'}

## Environment
- URL: ${window.location.href}
- Browser: ${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Browser'}`;

    this.render();
  }

  private async submit(): Promise<void> {
    const btn = this.container?.querySelector('[data-action="submit"]') as HTMLButtonElement;
    if (btn) {
      btn.innerHTML = '⏳ Submitting...';
      btn.disabled = true;
    }

    const selectedErrors = this.consoleErrors.filter(e => e.selected);
    const finalScreenshot = this.getAnnotatedScreenshot();

    const report: BugReport = {
      title: this.title,
      description: this.description,
      priority: this.severity,
      screenshot: finalScreenshot || undefined,
      elements: this.selectedElements,
      context: getBrowserContext(),
      consoleLogs: selectedErrors.length > 0
        ? selectedErrors.map(e => ({ type: 'error' as const, timestamp: e.time, message: e.message }))
        : this.getConsoleLogs(),
      networkLogs: this.getNetworkLogs(),
      metadata: { ...this.config.metadata, reportType: this.reportType },
      userIdentifier: this.config.userIdentifier,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.onSubmit(report);
      this.step = 'success';
      this.render();
      this.startAutoCloseTimer();
    } catch {
      if (btn) {
        btn.innerHTML = `${ICONS.send} Submit Report`;
        btn.disabled = false;
      }
      alert('Failed to submit. Please try again.');
    }
  }

  private esc(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
