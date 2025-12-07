export const WIDGET_STYLES = `
/* BugRadar Widget - Modern Sidebar Design */
#bugradar-widget {
  --br-coral: #EF4444;
  --br-coral-hover: #DC2626;
  --br-coral-light: #FEF2F2;
  --br-success: #10B981;
  --br-success-light: #D1FAE5;
  --br-warning: #F59E0B;
  --br-warning-light: #FEF3C7;
  --br-danger: #EF4444;
  --br-violet: #8B5CF6;
  --br-bg: #FFFFFF;
  --br-bg-subtle: #FAFAFA;
  --br-bg-muted: #F4F4F5;
  --br-border: #E4E4E7;
  --br-border-subtle: #F4F4F5;
  --br-text: #18181B;
  --br-text-secondary: #52525B;
  --br-text-muted: #A1A1AA;
  --br-radius-sm: 8px;
  --br-radius: 12px;
  --br-radius-lg: 16px;
  --br-radius-xl: 20px;
  --br-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --br-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
  --br-shadow-lg: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
  --br-shadow-xl: 0 25px 50px -12px rgba(0,0,0,0.25);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  font-size: 15px;
  line-height: 1.6;
  color: var(--br-text);
  position: fixed;
  z-index: 2147483647;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#bugradar-widget.dark {
  --br-bg: #18181B;
  --br-bg-subtle: #1F1F23;
  --br-bg-muted: #27272A;
  --br-border: #3F3F46;
  --br-border-subtle: #27272A;
  --br-text: #FAFAFA;
  --br-text-secondary: #A1A1AA;
  --br-text-muted: #71717A;
  --br-coral-light: rgba(239, 68, 68, 0.12);
  --br-success-light: rgba(16, 185, 129, 0.12);
  --br-warning-light: rgba(245, 158, 11, 0.12);
}

#bugradar-widget * { box-sizing: border-box; margin: 0; padding: 0; }

/* ===== FAB BUTTON ===== */
.br-fab {
  position: fixed;
  width: 60px;
  height: 60px;
  border-radius: var(--br-radius-lg);
  background: linear-gradient(135deg, var(--br-coral) 0%, var(--br-coral-hover) 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.35), 0 2px 8px rgba(239, 68, 68, 0.2);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.br-fab:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 40px rgba(239, 68, 68, 0.4), 0 4px 12px rgba(239, 68, 68, 0.25);
}
.br-fab:active { transform: translateY(-1px) scale(0.98); }
.br-fab svg { width: 26px; height: 26px; color: white; }

/* ===== SIDEBAR OVERLAY ===== */
.br-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.br-overlay.open { opacity: 1; visibility: visible; }

/* ===== SIDEBAR PANEL ===== */
.br-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  max-width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: var(--br-bg);
  box-shadow: var(--br-shadow-xl);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
  border-left: 1px solid var(--br-border);
}
.br-overlay.open .br-sidebar { transform: translateX(0); }

@media (max-width: 520px) {
  .br-sidebar { width: 100%; }
}

/* ===== SIDEBAR HEADER ===== */
.br-header {
  border-bottom: 1px solid var(--br-border-subtle);
  background: var(--br-bg);
  flex-shrink: 0;
}
.br-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  max-width: 100%;
}
.br-header-left { display: flex; align-items: center; gap: 14px; }
.br-logo {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, var(--br-coral) 0%, var(--br-coral-hover) 100%);
  border-radius: var(--br-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}
.br-logo svg { width: 22px; height: 22px; color: white; }
.br-header-text { display: flex; flex-direction: column; gap: 2px; }
.br-header-title { font-size: 17px; font-weight: 600; color: var(--br-text); letter-spacing: -0.01em; }
.br-header-subtitle { font-size: 13px; color: var(--br-text-muted); }
.br-close {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--br-bg-muted);
  border-radius: var(--br-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--br-text-muted);
  transition: all 0.2s ease;
}
.br-close:hover { background: var(--br-coral-light); color: var(--br-coral); }
.br-close svg { width: 20px; height: 20px; }

/* ===== SIDEBAR BODY ===== */
.br-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}
.br-body-inner {
  padding: 32px;
  min-height: 100%;
}

/* ===== SIDEBAR FOOTER ===== */
.br-footer {
  border-top: 1px solid var(--br-border-subtle);
  background: var(--br-bg-subtle);
  flex-shrink: 0;
}
.br-footer-inner {
  display: flex;
  gap: 16px;
  padding: 24px 32px;
}
.br-footer-full .br-footer-inner { flex-direction: column; gap: 14px; }

/* ===== STEP INDICATOR ===== */
.br-steps {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}
.br-step {
  flex: 1;
  height: 6px;
  background: var(--br-bg-muted);
  border-radius: 3px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.br-step.active { background: var(--br-coral); }
.br-step.done { background: var(--br-success); }

/* ===== SECTION TITLE ===== */
.br-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--br-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 32px;
}

/* ===== TYPE SELECTION ===== */
.br-type-options { display: flex; flex-direction: column; gap: 24px; }
.br-type-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding: 28px 32px;
  background: var(--br-bg);
  border: 2px solid var(--br-border);
  border-radius: var(--br-radius-xl);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}
.br-type-btn:hover {
  border-color: var(--br-coral);
  background: var(--br-coral-light);
  transform: translateY(-2px);
  box-shadow: var(--br-shadow-lg);
}
.br-type-btn:focus {
  outline: none;
  border-color: var(--br-coral);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
}
.br-type-btn.active {
  border-color: var(--br-coral);
  background: var(--br-coral-light);
  box-shadow: var(--br-shadow);
}
.br-type-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--br-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  flex-shrink: 0;
}
.br-type-icon-bug { background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); }
.br-type-icon-feedback { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); }
.br-type-icon-change { background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); }
.br-type-content { flex: 1; min-width: 0; }
.br-type-label {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--br-text);
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}
.br-type-desc {
  display: block;
  font-size: 15px;
  color: var(--br-text-muted);
  line-height: 1.5;
}
.br-type-radio {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--br-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.br-type-radio-inner {
  width: 0;
  height: 0;
  border-radius: 50%;
  background: var(--br-coral);
  transition: all 0.2s ease;
}
.br-type-btn.active .br-type-radio {
  border-color: var(--br-coral);
}
.br-type-btn.active .br-type-radio-inner {
  width: 14px;
  height: 14px;
}

/* ===== CAPTURE OPTIONS ===== */
.br-capture-options { display: flex; flex-direction: column; gap: 12px; }
.br-capture-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 20px 22px;
  background: var(--br-bg);
  border: 2px solid var(--br-border);
  border-radius: var(--br-radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}
.br-capture-btn:hover {
  border-color: var(--br-coral);
  background: var(--br-coral-light);
  transform: translateY(-1px);
  box-shadow: var(--br-shadow);
}
.br-capture-btn:focus {
  outline: none;
  border-color: var(--br-coral);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
}
.br-capture-icon {
  width: 48px;
  height: 48px;
  background: var(--br-bg-muted);
  border-radius: var(--br-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}
.br-capture-icon svg { width: 22px; height: 22px; color: var(--br-text-secondary); transition: color 0.2s ease; }
.br-capture-btn:hover .br-capture-icon { background: var(--br-coral); }
.br-capture-btn:hover .br-capture-icon svg { color: white; }
.br-capture-content { flex: 1; min-width: 0; }
.br-capture-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--br-text);
  margin-bottom: 3px;
  letter-spacing: -0.01em;
}
.br-capture-desc {
  display: block;
  font-size: 13px;
  color: var(--br-text-muted);
  line-height: 1.4;
}
.br-capture-shortcut {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 11px;
  padding: 4px 8px;
  background: var(--br-bg-muted);
  border-radius: 6px;
  color: var(--br-text-muted);
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
}
.br-capture-arrow { color: var(--br-text-muted); }
.br-capture-arrow svg { width: 18px; height: 18px; }

/* ===== SELECTED ELEMENTS ===== */
.br-elements { margin-top: 24px; }
.br-elements-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--br-text-muted);
  margin-bottom: 12px;
}
.br-element-list { display: flex; flex-wrap: wrap; gap: 8px; }
.br-element-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--br-bg-muted);
  border-radius: var(--br-radius-sm);
  font-size: 13px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  color: var(--br-text-secondary);
}
.br-element-num {
  width: 20px;
  height: 20px;
  background: var(--br-coral);
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== FORM FIELDS ===== */
.br-field { margin-bottom: 32px; }
.br-field:last-child { margin-bottom: 0; }
.br-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--br-text);
  margin-bottom: 12px;
  letter-spacing: -0.01em;
}
.br-label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.br-label-row .br-label { margin-bottom: 0; }
.br-required { color: var(--br-coral); margin-left: 4px; }
.br-optional {
  font-size: 12px;
  color: var(--br-text-muted);
  font-weight: 400;
  margin-left: 8px;
}
.br-input, .br-textarea {
  width: 100%;
  padding: 16px 18px;
  background: var(--br-bg);
  border: 2px solid var(--br-border);
  border-radius: var(--br-radius);
  font-size: 15px;
  color: var(--br-text);
  font-family: inherit;
  transition: all 0.2s ease;
}
.br-input:hover, .br-textarea:hover {
  border-color: var(--br-text-muted);
}
.br-input:focus, .br-textarea:focus {
  outline: none;
  border-color: var(--br-coral);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.08);
}
.br-input::placeholder, .br-textarea::placeholder { color: var(--br-text-muted); }
.br-textarea {
  min-height: 160px;
  resize: vertical;
  line-height: 1.6;
}

/* ===== AI BUTTON ===== */
.br-ai-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, var(--br-violet) 0%, #7C3AED 100%);
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}
.br-ai-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}
.br-ai-btn svg { width: 16px; height: 16px; }

/* ===== SEVERITY ===== */
.br-severity-options { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.br-sev-btn {
  padding: 14px 12px;
  background: var(--br-bg);
  border: 2px solid var(--br-border);
  border-radius: var(--br-radius);
  font-size: 13px;
  font-weight: 600;
  color: var(--br-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: capitalize;
}
.br-sev-btn:hover { border-color: var(--br-text-muted); }
.br-sev-btn.active.low { background: var(--br-success-light); border-color: var(--br-success); color: var(--br-success); }
.br-sev-btn.active.medium { background: var(--br-warning-light); border-color: var(--br-warning); color: #B45309; }
.br-sev-btn.active.high { background: rgba(249, 115, 22, 0.1); border-color: #F97316; color: #EA580C; }
.br-sev-btn.active.critical { background: var(--br-coral-light); border-color: var(--br-danger); color: var(--br-danger); }

/* ===== CONSOLE ERRORS ===== */
.br-errors-list {
  border: 2px solid var(--br-border);
  border-radius: var(--br-radius);
  overflow: hidden;
  max-height: 200px;
  overflow-y: auto;
}
.br-error-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--br-border-subtle);
  transition: background 0.15s ease;
}
.br-error-item:last-child { border-bottom: none; }
.br-error-item:hover { background: var(--br-bg-subtle); }
.br-error-item.selected { background: var(--br-coral-light); }
.br-error-check {
  width: 20px;
  height: 20px;
  border: 2px solid var(--br-border);
  border-radius: 5px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
  transition: all 0.15s ease;
}
.br-error-item.selected .br-error-check { background: var(--br-coral); border-color: var(--br-coral); }
.br-error-check svg { width: 12px; height: 12px; color: white; opacity: 0; }
.br-error-item.selected .br-error-check svg { opacity: 1; }
.br-error-content { flex: 1; min-width: 0; }
.br-error-time {
  font-size: 11px;
  color: var(--br-text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
}
.br-error-msg {
  font-size: 13px;
  color: var(--br-danger);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  margin-top: 4px;
  word-break: break-word;
  line-height: 1.5;
}

/* ===== SCREENSHOT PREVIEW ===== */
.br-screenshot-wrap {
  border: 2px solid var(--br-border);
  border-radius: var(--br-radius);
  overflow: hidden;
  background: var(--br-bg-muted);
  position: relative;
}
.br-screenshot-img { width: 100%; display: block; }
.br-screenshot-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}
.br-screenshot-empty {
  padding: 48px 24px;
  text-align: center;
  color: var(--br-text-muted);
}
.br-screenshot-empty svg { width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.4; }
.br-screenshot-empty-text { font-size: 14px; }

/* ===== ANNOTATION TOOLBAR ===== */
.br-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 14px;
  background: var(--br-bg-muted);
  border-radius: var(--br-radius);
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.br-tool-btn {
  width: 38px;
  height: 38px;
  border: none;
  background: transparent;
  border-radius: var(--br-radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--br-text-muted);
  transition: all 0.15s ease;
}
.br-tool-btn:hover { background: var(--br-bg); color: var(--br-text); }
.br-tool-btn.active { background: var(--br-coral); color: white; }
.br-tool-btn svg { width: 18px; height: 18px; }
.br-tool-sep { width: 1px; height: 28px; background: var(--br-border); margin: 0 6px; }
.br-color-btn {
  width: 26px;
  height: 26px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.15s ease;
}
.br-color-btn:hover { transform: scale(1.15); }
.br-color-btn.active { border-color: var(--br-text); box-shadow: 0 0 0 2px var(--br-bg); }

/* ===== REVIEW ===== */
.br-review-card {
  background: var(--br-bg-subtle);
  border-radius: var(--br-radius-lg);
  padding: 20px;
  border: 1px solid var(--br-border-subtle);
}
.br-review-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 0;
  border-bottom: 1px solid var(--br-border-subtle);
}
.br-review-row:last-child { border-bottom: none; padding-bottom: 0; }
.br-review-row:first-child { padding-top: 0; }
.br-review-label { font-size: 13px; color: var(--br-text-muted); }
.br-review-value {
  font-size: 14px;
  color: var(--br-text);
  font-weight: 500;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}
.br-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.br-badge-bug { background: var(--br-coral-light); color: var(--br-danger); }
.br-badge-feedback { background: var(--br-warning-light); color: #B45309; }
.br-badge-change { background: #DBEAFE; color: #1D4ED8; }
.br-badge-low { background: var(--br-success-light); color: var(--br-success); }
.br-badge-medium { background: var(--br-warning-light); color: #B45309; }
.br-badge-high { background: rgba(249, 115, 22, 0.1); color: #EA580C; }
.br-badge-critical { background: var(--br-coral-light); color: var(--br-danger); }
.br-review-img {
  width: 100%;
  border-radius: var(--br-radius-sm);
  margin-top: 12px;
  border: 1px solid var(--br-border-subtle);
}

/* ===== BUTTONS ===== */
.br-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: var(--br-radius-lg);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  letter-spacing: -0.01em;
  min-height: 56px;
}
.br-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.br-btn-secondary {
  background: var(--br-bg-muted);
  color: var(--br-text-secondary);
}
.br-btn-secondary:hover:not(:disabled) {
  background: var(--br-border);
}
.br-btn-primary {
  background: linear-gradient(135deg, var(--br-coral) 0%, var(--br-coral-hover) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
.br-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}
.br-btn-success {
  background: linear-gradient(135deg, var(--br-success) 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}
.br-btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}
.br-btn svg { width: 20px; height: 20px; }

/* ===== SUCCESS STATE ===== */
.br-success-state {
  text-align: center;
  padding: 48px 32px;
  position: relative;
  overflow: hidden;
}
.br-success-icon {
  width: 88px;
  height: 88px;
  background: var(--br-success-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  color: var(--br-success);
  animation: br-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.br-success-icon svg { width: 44px; height: 44px; }
.br-success-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--br-text);
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}
.br-success-text {
  font-size: 15px;
  color: var(--br-text-muted);
  margin-bottom: 36px;
  line-height: 1.6;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

@keyframes br-pop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* ===== CONFETTI ===== */
.br-confetti {
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  height: 100vh;
  pointer-events: none;
  overflow: hidden;
  z-index: 999;
}
.br-confetti-piece {
  position: absolute;
  top: -20px;
  opacity: 0;
  animation: br-confetti-fall 4s ease-out forwards;
}
@keyframes br-confetti-fall {
  0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
  50% { opacity: 1; }
  100% { transform: translateY(100vh) rotate(1080deg) scale(0.5); opacity: 0; }
}

/* ===== ELEMENT SELECTION MODE ===== */
.br-selecting-mode { cursor: crosshair !important; }
.br-selecting-mode * { cursor: crosshair !important; }

.br-selector-tooltip {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #18181B;
  color: white;
  padding: 14px 24px;
  border-radius: var(--br-radius);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--br-shadow-xl);
  z-index: 2147483647;
}
.br-selector-tooltip kbd {
  background: rgba(255,255,255,0.15);
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
}

.br-element-highlight {
  position: fixed;
  pointer-events: none;
  border: 3px solid #06B6D4;
  background: rgba(6, 182, 212, 0.12);
  border-radius: 4px;
  z-index: 2147483646;
  transition: all 0.1s ease;
}

.br-element-selected {
  position: fixed;
  pointer-events: none;
  border: 3px solid var(--br-coral);
  background: rgba(239, 68, 68, 0.08);
  border-radius: 4px;
  z-index: 2147483645;
}
.br-element-selected-num {
  position: absolute;
  top: -12px;
  left: -12px;
  width: 24px;
  height: 24px;
  background: var(--br-coral);
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--br-shadow);
}

/* ===== KEYBOARD HINTS ===== */
.br-keyboard-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-top: 48px;
  padding-top: 28px;
  border-top: 1px solid var(--br-border-subtle);
}
.br-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--br-text-muted);
}
.br-hint kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 7px;
  background: var(--br-bg-muted);
  border: 1px solid var(--br-border);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
  color: var(--br-text-secondary);
}

/* ===== SCROLLBAR ===== */
.br-body::-webkit-scrollbar, .br-errors-list::-webkit-scrollbar { width: 6px; }
.br-body::-webkit-scrollbar-track { background: transparent; }
.br-body::-webkit-scrollbar-thumb { background: var(--br-border); border-radius: 3px; }
.br-body::-webkit-scrollbar-thumb:hover { background: var(--br-text-muted); }

/* ===== LOADING SPINNER ===== */
.br-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: br-spin 0.8s linear infinite;
}
@keyframes br-spin {
  to { transform: rotate(360deg); }
}

/* ===== EMPTY STATE ===== */
.br-empty {
  text-align: center;
  padding: 32px 24px;
  color: var(--br-text-muted);
}
.br-empty svg {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  opacity: 0.4;
}
.br-empty-text {
  font-size: 14px;
  line-height: 1.5;
}
`;

export function injectStyles(): void {
  if (document.getElementById('bugradar-styles')) return;
  const style = document.createElement('style');
  style.id = 'bugradar-styles';
  style.textContent = WIDGET_STYLES;
  document.head.appendChild(style);
}
