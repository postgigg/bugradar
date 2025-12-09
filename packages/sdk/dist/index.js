"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/console-capture.ts
var ConsoleCapture;
var init_console_capture = __esm({
  "src/utils/console-capture.ts"() {
    "use strict";
    ConsoleCapture = class {
      constructor(maxLogs = 50) {
        this.logs = [];
        this.maxLogs = maxLogs;
        this.originalConsole = {
          log: console.log.bind(console),
          warn: console.warn.bind(console),
          error: console.error.bind(console),
          info: console.info.bind(console),
          debug: console.debug.bind(console)
        };
      }
      start() {
        const methods = [
          "log",
          "warn",
          "error",
          "info",
          "debug"
        ];
        methods.forEach((method) => {
          console[method] = (...args) => {
            this.capture(method, args);
            this.originalConsole[method](...args);
          };
        });
        window.addEventListener("error", (event) => {
          this.capture("error", [event.message], event.error?.stack);
        });
        window.addEventListener("unhandledrejection", (event) => {
          this.capture("error", [`Unhandled Promise Rejection: ${event.reason}`]);
        });
      }
      stop() {
        console.log = this.originalConsole.log;
        console.warn = this.originalConsole.warn;
        console.error = this.originalConsole.error;
        console.info = this.originalConsole.info;
        console.debug = this.originalConsole.debug;
      }
      capture(type, args, stack) {
        const message = args.map((arg) => {
          if (typeof arg === "object") {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        }).join(" ");
        const log = {
          type,
          message: message.slice(0, 1e3),
          // Limit message size
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          ...stack && { stack: stack.slice(0, 2e3) }
        };
        this.logs.push(log);
        if (this.logs.length > this.maxLogs) {
          this.logs.shift();
        }
      }
      getLogs() {
        return [...this.logs];
      }
      clear() {
        this.logs = [];
      }
    };
  }
});

// src/utils/network-capture.ts
var NetworkCapture;
var init_network_capture = __esm({
  "src/utils/network-capture.ts"() {
    "use strict";
    NetworkCapture = class {
      constructor(maxLogs = 20) {
        this.logs = [];
        this.maxLogs = maxLogs;
        this.originalFetch = window.fetch.bind(window);
        this.originalXHROpen = XMLHttpRequest.prototype.open;
        this.originalXHRSend = XMLHttpRequest.prototype.send;
      }
      start() {
        this.interceptFetch();
        this.interceptXHR();
      }
      stop() {
        window.fetch = this.originalFetch;
        XMLHttpRequest.prototype.open = this.originalXHROpen;
        XMLHttpRequest.prototype.send = this.originalXHRSend;
      }
      interceptFetch() {
        const self = this;
        window.fetch = async function(input, init) {
          const startTime = Date.now();
          const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
          const method = init?.method || "GET";
          const log = {
            method: method.toUpperCase(),
            url,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          };
          try {
            const response = await self.originalFetch(input, init);
            const duration = Date.now() - startTime;
            log.status = response.status;
            log.statusText = response.statusText;
            log.duration = duration;
            self.addLog(log);
            return response;
          } catch (error) {
            log.error = error instanceof Error ? error.message : "Network error";
            log.duration = Date.now() - startTime;
            self.addLog(log);
            throw error;
          }
        };
      }
      interceptXHR() {
        const self = this;
        XMLHttpRequest.prototype.open = function(method, url, async = true, username, password) {
          this._bugradar = {
            method: method.toUpperCase(),
            url: url.toString(),
            startTime: 0
          };
          return self.originalXHROpen.call(
            this,
            method,
            url,
            async,
            username ?? void 0,
            password ?? void 0
          );
        };
        XMLHttpRequest.prototype.send = function(body) {
          const xhr = this;
          const meta = xhr._bugradar;
          if (meta) {
            meta.startTime = Date.now();
            xhr.addEventListener("loadend", function() {
              const log = {
                method: meta.method,
                url: meta.url,
                status: xhr.status,
                statusText: xhr.statusText,
                duration: Date.now() - meta.startTime,
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              };
              if (xhr.status === 0) {
                log.error = "Request failed or was aborted";
              }
              self.addLog(log);
            });
          }
          return self.originalXHRSend.call(this, body);
        };
      }
      addLog(log) {
        if (log.url.includes("bugradar")) {
          return;
        }
        this.logs.push(log);
        if (this.logs.length > this.maxLogs) {
          this.logs.shift();
        }
      }
      getLogs() {
        return [...this.logs];
      }
      clear() {
        this.logs = [];
      }
    };
  }
});

// src/utils/browser.ts
function getBrowserContext() {
  const ua = navigator.userAgent;
  const browserInfo = parseBrowserInfo(ua);
  const osInfo = parseOSInfo(ua);
  return {
    url: window.location.href,
    title: document.title,
    userAgent: ua,
    browserName: browserInfo.name,
    browserVersion: browserInfo.version,
    osName: osInfo.name,
    osVersion: osInfo.version,
    deviceType: getDeviceType(),
    screenResolution: `${screen.width}x${screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === "1"
  };
}
function parseBrowserInfo(ua) {
  const browsers = [
    { name: "Chrome", regex: /Chrome\/(\d+\.\d+)/ },
    { name: "Firefox", regex: /Firefox\/(\d+\.\d+)/ },
    { name: "Safari", regex: /Version\/(\d+\.\d+).*Safari/ },
    { name: "Edge", regex: /Edg\/(\d+\.\d+)/ },
    { name: "Opera", regex: /OPR\/(\d+\.\d+)/ },
    { name: "IE", regex: /MSIE (\d+\.\d+)/ }
  ];
  for (const browser of browsers) {
    const match = ua.match(browser.regex);
    if (match) {
      return { name: browser.name, version: match[1] };
    }
  }
  return { name: "Unknown", version: "Unknown" };
}
function parseOSInfo(ua) {
  const osPatterns = [
    { name: "Windows", regex: /Windows NT (\d+\.\d+)/ },
    { name: "macOS", regex: /Mac OS X (\d+[._]\d+)/ },
    { name: "iOS", regex: /iPhone OS (\d+_\d+)/ },
    { name: "Android", regex: /Android (\d+\.\d+)/ },
    { name: "Linux", regex: /Linux/ }
  ];
  for (const os of osPatterns) {
    const match = ua.match(os.regex);
    if (match) {
      return {
        name: os.name,
        version: match[1]?.replace(/_/g, ".") || "Unknown"
      };
    }
  }
  return { name: "Unknown", version: "Unknown" };
}
function getDeviceType() {
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}
function generateSessionId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
function getXPath(element) {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  const parts = [];
  let current = element;
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let index = 1;
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (sibling.nodeName === current.nodeName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }
    const tagName = current.nodeName.toLowerCase();
    const part = index > 1 ? `${tagName}[${index}]` : tagName;
    parts.unshift(part);
    current = current.parentElement;
  }
  return "/" + parts.join("/");
}
function getSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  const path = [];
  let current = element;
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.className && typeof current.className === "string") {
      const classes = current.className.trim().split(/\s+/).slice(0, 2);
      if (classes.length > 0 && classes[0]) {
        selector += "." + classes.join(".");
      }
    }
    const siblings = current.parentElement?.children;
    if (siblings && siblings.length > 1) {
      const sameTagSiblings = Array.from(siblings).filter(
        (s) => s.tagName === current.tagName
      );
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }
    path.unshift(selector);
    current = current.parentElement;
  }
  return path.join(" > ");
}
var init_browser = __esm({
  "src/utils/browser.ts"() {
    "use strict";
  }
});

// src/widget/styles.ts
function injectStyles() {
  if (document.getElementById("bugradar-styles")) return;
  const style = document.createElement("style");
  style.id = "bugradar-styles";
  style.textContent = WIDGET_STYLES;
  document.head.appendChild(style);
}
var WIDGET_STYLES;
var init_styles = __esm({
  "src/widget/styles.ts"() {
    "use strict";
    WIDGET_STYLES = `
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
  }
});

// src/widget/icons.ts
var ICONS;
var init_icons = __esm({
  "src/widget/icons.ts"() {
    "use strict";
    ICONS = {
      bug: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>`,
      close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
      camera: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
      mousePointer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 4 7.07 17 2.51-7.39L21 11.07z"/></svg>`,
      check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
      send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`,
      image: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
      sparkles: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>`,
      lightbulb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`,
      // Navigation arrows
      arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
      arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 5 7 7-7 7"/><path d="M5 12h14"/></svg>`,
      // Annotation tools
      highlight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
      arrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
      rectangle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4 2"/></svg>`,
      text: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>`,
      undo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
      trash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
      crop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>`
    };
  }
});

// src/widget/widget.ts
var BugReporterWidget;
var init_widget = __esm({
  "src/widget/widget.ts"() {
    "use strict";
    init_styles();
    init_icons();
    init_browser();
    BugReporterWidget = class {
      constructor(config, sessionId, getConsoleLogs, getNetworkLogs, onSubmit) {
        this.container = null;
        this.step = "closed";
        this.reportType = "bug";
        this.title = "";
        this.description = "";
        this.severity = "medium";
        this.selectedElements = [];
        this.screenshot = null;
        this.annotations = [];
        this.currentTool = null;
        this.currentColor = "#ef4444";
        this.isDrawing = false;
        this.drawStart = { x: 0, y: 0 };
        this.consoleErrors = [];
        this.highlightEl = null;
        this.selectedOverlays = [];
        this.selectorTooltip = null;
        this.isSelectingElements = false;
        this.canvas = null;
        this.canvasCtx = null;
        this.autoCloseTimer = null;
        this.autoCloseSeconds = 30;
        this.isSelectingArea = false;
        this.areaSelectionOverlay = null;
        this.areaSelectionBox = null;
        this.areaStart = { x: 0, y: 0 };
        this.areaEnd = { x: 0, y: 0 };
        this.handleAreaMouseDown = (e) => {
          if (!this.isSelectingArea) return;
          this.areaStart = { x: e.clientX, y: e.clientY };
          this.areaEnd = { x: e.clientX, y: e.clientY };
          if (this.areaSelectionBox) {
            this.areaSelectionBox.style.display = "block";
            this.areaSelectionBox.style.left = `${e.clientX}px`;
            this.areaSelectionBox.style.top = `${e.clientY}px`;
            this.areaSelectionBox.style.width = "0";
            this.areaSelectionBox.style.height = "0";
          }
        };
        this.handleAreaMouseMove = (e) => {
          if (!this.isSelectingArea || !this.areaSelectionBox) return;
          if (this.areaSelectionBox.style.display === "none") return;
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
        this.handleAreaMouseUp = async (e) => {
          if (!this.isSelectingArea) return;
          const width = Math.abs(this.areaEnd.x - this.areaStart.x);
          const height = Math.abs(this.areaEnd.y - this.areaStart.y);
          if (width > 20 && height > 20) {
            await this.captureSelectedArea();
          }
          this.cancelAreaSelection();
        };
        this.config = config;
        this.sessionId = sessionId;
        this.getConsoleLogs = getConsoleLogs;
        this.getNetworkLogs = getNetworkLogs;
        this.onSubmit = onSubmit;
      }
      mount() {
        if (this.container) return;
        injectStyles();
        this.createWidget();
      }
      unmount() {
        this.container?.remove();
        this.container = null;
        this.cleanup();
      }
      open() {
        this.step = "type";
        this.loadConsoleErrors();
        this.render();
      }
      close() {
        this.step = "closed";
        this.clearAutoCloseTimer();
        this.reset();
        this.cleanup();
        this.render();
      }
      clearAutoCloseTimer() {
        if (this.autoCloseTimer) {
          clearInterval(this.autoCloseTimer);
          this.autoCloseTimer = null;
        }
        this.autoCloseSeconds = 30;
      }
      startAutoCloseTimer() {
        this.autoCloseSeconds = 30;
        this.autoCloseTimer = setInterval(() => {
          this.autoCloseSeconds--;
          const timerEl = document.querySelector(".br-auto-close-timer");
          if (timerEl) {
            timerEl.textContent = `Auto-closing in ${this.autoCloseSeconds}s`;
          }
          if (this.autoCloseSeconds <= 0) {
            this.close();
          }
        }, 1e3);
      }
      reset() {
        this.reportType = "bug";
        this.title = "";
        this.description = "";
        this.severity = "medium";
        this.selectedElements = [];
        this.screenshot = null;
        this.annotations = [];
        this.currentTool = null;
        this.consoleErrors.forEach((e) => e.selected = false);
      }
      cleanup() {
        this.highlightEl?.remove();
        this.highlightEl = null;
        this.selectedOverlays.forEach((o) => o.remove());
        this.selectedOverlays = [];
        this.selectorTooltip?.remove();
        this.selectorTooltip = null;
        document.body.classList.remove("br-selecting-mode");
        this.isSelectingElements = false;
      }
      loadConsoleErrors() {
        const logs = this.getConsoleLogs();
        this.consoleErrors = logs.filter((log) => log.type === "error").slice(-10).map((log, i) => ({
          id: `err_${i}`,
          time: new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          message: log.message || "Unknown error",
          selected: false
        }));
      }
      createWidget() {
        this.container = document.createElement("div");
        this.container.id = "bugradar-widget";
        if (this.config.theme === "dark" || this.config.theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
          this.container.classList.add("dark");
        }
        document.body.appendChild(this.container);
        this.highlightEl = document.createElement("div");
        this.highlightEl.className = "br-element-highlight";
        this.highlightEl.style.display = "none";
        document.body.appendChild(this.highlightEl);
        this.bindEvents();
        this.render();
      }
      render() {
        if (!this.container) return;
        console.log("[BugRadar] Rendering step:", this.step, "has screenshot:", !!this.screenshot);
        const pos = this.config.position || "bottom-right";
        const posStyle = {
          "bottom-right": "bottom:24px;right:24px",
          "bottom-left": "bottom:24px;left:24px",
          "top-right": "top:24px;right:24px",
          "top-left": "top:24px;left:24px"
        }[pos];
        this.container.innerHTML = `
      ${this.config.showButton !== false ? `
        <button class="br-fab" style="${posStyle}" data-action="open">${ICONS.bug}</button>
      ` : ""}
      <div class="br-overlay${this.step !== "closed" ? " open" : ""}" data-action="close-overlay">
        <div class="br-sidebar" data-sidebar>
          ${this.renderSidebar()}
        </div>
      </div>
    `;
        if (this.step === "annotate" && this.screenshot) {
          this.setupCanvas();
        }
      }
      renderSidebar() {
        switch (this.step) {
          case "type":
            return this.renderTypeStep();
          case "capture":
            return this.renderCaptureStep();
          case "annotate":
            return this.renderAnnotateStep();
          case "details":
            return this.renderDetailsStep();
          case "review":
            return this.renderReviewStep();
          case "success":
            return this.renderSuccessStep();
          default:
            return "";
        }
      }
      getStepIndicator(current) {
        const steps = ["type", "capture", "details", "review"];
        return `
      <div class="br-steps">
        ${steps.map((_, i) => `<div class="br-step${i < current ? " done" : i === current ? " active" : ""}"></div>`).join("")}
      </div>
    `;
      }
      renderTypeStep() {
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
          <button class="br-type-btn${this.reportType === "bug" ? " active" : ""}" data-type="bug" style="display:flex !important;align-items:center !important;gap:24px !important;padding:28px 32px !important;margin:0;">
            <div class="br-type-icon br-type-icon-bug" style="width:72px !important;height:72px !important;min-width:72px;font-size:36px;display:flex;align-items:center;justify-content:center;border-radius:18px;">\u{1F41B}</div>
            <div class="br-type-content" style="flex:1;">
              <span class="br-type-label" style="display:block;font-size:20px;font-weight:600;margin-bottom:8px;">Bug Report</span>
              <span class="br-type-desc" style="display:block;font-size:15px;opacity:0.6;">Something isn't working as expected</span>
            </div>
            <div class="br-type-radio" style="width:32px;height:32px;min-width:32px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;">
              <div class="br-type-radio-inner"></div>
            </div>
          </button>

          <button class="br-type-btn${this.reportType === "feedback" ? " active" : ""}" data-type="feedback" style="display:flex !important;align-items:center !important;gap:24px !important;padding:28px 32px !important;margin:0;">
            <div class="br-type-icon br-type-icon-feedback" style="width:72px !important;height:72px !important;min-width:72px;font-size:36px;display:flex;align-items:center;justify-content:center;border-radius:18px;">\u{1F4A1}</div>
            <div class="br-type-content" style="flex:1;">
              <span class="br-type-label" style="display:block;font-size:20px;font-weight:600;margin-bottom:8px;">Feedback</span>
              <span class="br-type-desc" style="display:block;font-size:15px;opacity:0.6;">Share an idea or suggestion</span>
            </div>
            <div class="br-type-radio" style="width:32px;height:32px;min-width:32px;border-radius:50%;border:2px solid currentColor;display:flex;align-items:center;justify-content:center;">
              <div class="br-type-radio-inner"></div>
            </div>
          </button>

          <button class="br-type-btn${this.reportType === "change" ? " active" : ""}" data-type="change" style="display:flex !important;align-items:center !important;gap:24px !important;padding:28px 32px !important;margin:0;">
            <div class="br-type-icon br-type-icon-change" style="width:72px !important;height:72px !important;min-width:72px;font-size:36px;display:flex;align-items:center;justify-content:center;border-radius:18px;">\u270F\uFE0F</div>
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
      renderCaptureStep() {
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
            <p class="br-elements-title" style="font-size:13px;font-weight:600;margin-bottom:12px;opacity:0.7;">${this.selectedElements.length} element${this.selectedElements.length > 1 ? "s" : ""} selected</p>
            <div class="br-element-list" style="display:flex;flex-wrap:wrap;gap:8px;">
              ${this.selectedElements.map((el, i) => `
                <span class="br-element-tag" style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(255,255,255,0.06);border-radius:8px;font-size:13px;">
                  <span class="br-element-num" style="width:20px;height:20px;background:#EF4444;color:white;border-radius:50%;font-size:11px;font-weight:600;display:flex;align-items:center;justify-content:center;">${i + 1}</span>
                  ${el.tagName}
                </span>
              `).join("")}
            </div>
          </div>
        ` : ""}

        <div class="br-keyboard-hint" style="margin-top:48px !important;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);display:flex;justify-content:center;gap:24px;">
          <span class="br-hint"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> select</span>
          <span class="br-hint"><kbd>\u2190</kbd> back</span>
        </div>
      </div>
      <div class="br-footer" style="padding:24px 32px !important;">
        <div class="br-footer-inner" style="display:flex;gap:16px;width:100%;">
          <button class="br-btn br-btn-secondary" data-action="back">Back</button>
          <button class="br-btn br-btn-primary" data-action="next"${!this.screenshot && this.selectedElements.length === 0 ? " disabled" : ""}>Continue</button>
        </div>
      </div>
    `;
      }
      renderAnnotateStep() {
        const tools = [
          { id: "arrow", icon: ICONS.arrow },
          { id: "rectangle", icon: ICONS.rectangle },
          { id: "text", icon: ICONS.text },
          { id: "draw", icon: ICONS.highlight }
        ];
        const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];
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
          ${tools.map((t) => `
            <button class="br-tool-btn${this.currentTool === t.id ? " active" : ""}" data-tool="${t.id}">${t.icon}</button>
          `).join("")}
          <div class="br-tool-sep"></div>
          ${colors.map((c) => `
            <button class="br-color-btn${this.currentColor === c ? " active" : ""}" data-color="${c}" style="background:${c}"></button>
          `).join("")}
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
      renderDetailsStep() {
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
            <button class="br-ai-btn" data-action="ai-enhance">\u2728 Enhance</button>
          </div>
          <textarea class="br-textarea" data-field="description" placeholder="What happened? What did you expect to happen?" style="width:100%;padding:18px 20px;font-size:15px;border-radius:12px;border:2px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);min-height:140px;resize:vertical;">${this.esc(this.description)}</textarea>
        </div>

        <div class="br-field" style="margin-bottom:0 !important;">
          <label class="br-label" style="display:block;font-size:14px;font-weight:600;margin-bottom:14px !important;">Severity</label>
          <div class="br-severity-options" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;">
            ${["low", "medium", "high", "critical"].map((s) => `
              <button class="br-sev-btn ${s}${this.severity === s ? " active" : ""}" data-severity="${s}" style="padding:16px 14px;font-size:13px;font-weight:600;border-radius:10px;text-transform:capitalize;">${s}</button>
            `).join("")}
          </div>
        </div>

        ${errorCount > 0 ? `
          <div class="br-field" style="margin-top:36px !important;margin-bottom:0;">
            <label class="br-label" style="display:block;font-size:14px;font-weight:600;margin-bottom:14px !important;">Console Errors<span class="br-optional" style="font-size:12px;opacity:0.6;margin-left:8px;">(${errorCount} detected)</span></label>
            <div class="br-errors-list" style="border:2px solid rgba(255,255,255,0.1);border-radius:12px;overflow:hidden;">
              ${this.consoleErrors.slice(0, 5).map((err) => `
                <div class="br-error-item${err.selected ? " selected" : ""}" data-error="${err.id}" style="display:flex;align-items:flex-start;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <div class="br-error-check">${ICONS.check}</div>
                  <div class="br-error-content">
                    <span class="br-error-time" style="font-size:11px;opacity:0.5;">${err.time}</span>
                    <span class="br-error-msg" style="display:block;font-size:13px;margin-top:4px;color:#EF4444;">${this.esc(err.message.slice(0, 80))}${err.message.length > 80 ? "..." : ""}</span>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}
      </div>
      <div class="br-footer" style="padding:24px 32px !important;">
        <div class="br-footer-inner" style="display:flex;gap:16px;width:100%;">
          <button class="br-btn br-btn-secondary" data-action="back">Back</button>
          <button class="br-btn br-btn-primary" data-action="next"${!this.title.trim() ? " disabled" : ""}>Review</button>
        </div>
      </div>
    `;
      }
      renderReviewStep() {
        const selectedErrors = this.consoleErrors.filter((e) => e.selected);
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
            <span class="br-badge br-badge-${this.reportType}" style="padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;">${this.reportType === "bug" ? "\u{1F41B} Bug" : this.reportType === "feedback" ? "\u{1F4A1} Feedback" : "\u270F\uFE0F Change"}</span>
          </div>

          <div class="br-review-row" style="display:flex;justify-content:space-between;align-items:flex-start;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span class="br-review-label" style="font-size:14px;opacity:0.6;">Title</span>
            <span class="br-review-value" style="font-size:14px;font-weight:500;text-align:right;max-width:60%;">${this.esc(this.title)}</span>
          </div>

          <div class="br-review-row" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;${this.description || finalScreenshot || this.selectedElements.length > 0 || selectedErrors.length > 0 ? "border-bottom:1px solid rgba(255,255,255,0.06);" : ""}">
            <span class="br-review-label" style="font-size:14px;opacity:0.6;">Severity</span>
            <span class="br-badge br-badge-${this.severity}" style="padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;text-transform:capitalize;">${this.severity}</span>
          </div>

          ${this.description ? `
            <div class="br-review-row" style="display:flex;justify-content:space-between;align-items:flex-start;padding:16px 0;${finalScreenshot || this.selectedElements.length > 0 || selectedErrors.length > 0 ? "border-bottom:1px solid rgba(255,255,255,0.06);" : ""}">
              <span class="br-review-label" style="font-size:14px;opacity:0.6;">Description</span>
              <span class="br-review-value" style="font-size:14px;text-align:right;max-width:60%;opacity:0.8;">${this.esc(this.description.slice(0, 100))}${this.description.length > 100 ? "..." : ""}</span>
            </div>
          ` : ""}

          ${finalScreenshot ? `
            <div style="padding:16px 0;${this.selectedElements.length > 0 || selectedErrors.length > 0 ? "border-bottom:1px solid rgba(255,255,255,0.06);" : ""}">
              <span class="br-review-label" style="display:block;font-size:14px;opacity:0.6;margin-bottom:12px;">Screenshot</span>
              <img src="${finalScreenshot}" style="width:100%;border-radius:12px;border:1px solid rgba(255,255,255,0.1);" />
            </div>
          ` : ""}

          ${this.selectedElements.length > 0 ? `
            <div class="br-review-row" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;${selectedErrors.length > 0 ? "border-bottom:1px solid rgba(255,255,255,0.06);" : ""}">
              <span class="br-review-label" style="font-size:14px;opacity:0.6;">Elements</span>
              <span class="br-review-value" style="font-size:14px;font-weight:500;">${this.selectedElements.length} selected</span>
            </div>
          ` : ""}

          ${selectedErrors.length > 0 ? `
            <div class="br-review-row" style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;">
              <span class="br-review-label" style="font-size:14px;opacity:0.6;">Console Errors</span>
              <span class="br-review-value" style="font-size:14px;font-weight:500;color:#EF4444;">${selectedErrors.length} included</span>
            </div>
          ` : ""}
        </div>

        <div class="br-keyboard-hint" style="margin-top:40px !important;padding-top:24px;border-top:1px solid rgba(255,255,255,0.1);display:flex;justify-content:center;gap:24px;">
          <span class="br-hint"><kbd>Enter</kbd> submit</span>
          <span class="br-hint"><kbd>\u2190</kbd> edit</span>
        </div>
      </div>
      <div class="br-footer br-footer-full" style="padding:24px 32px !important;">
        <div class="br-footer-inner" style="display:flex;flex-direction:column;gap:14px;width:100%;">
          <button class="br-btn br-btn-success" data-action="submit" style="padding:18px 28px;font-size:16px;min-height:56px;">
            ${ICONS.send} Submit Report
          </button>
          <button class="br-btn br-btn-secondary" data-action="back" style="padding:14px 24px;">\u2190 Edit</button>
        </div>
      </div>
    `;
      }
      renderSuccessStep() {
        const colors = ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F43F5E"];
        const confetti = Array.from({ length: 100 }, (_, i) => {
          const color = colors[i % colors.length];
          const left = Math.random() * 100;
          const delay = Math.random() * 1.5;
          const size = 6 + Math.random() * 12;
          const duration = 3 + Math.random() * 2;
          const shape = Math.random() > 0.5 ? "border-radius: 50%;" : "border-radius: 2px;";
          const rotate = Math.random() * 360;
          return `<div class="br-confetti-piece" style="left:${left}%;background:${color};width:${size}px;height:${size}px;${shape}animation-delay:${delay}s;animation-duration:${duration}s;transform:rotate(${rotate}deg);"></div>`;
        }).join("");
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
      setupCanvas() {
        setTimeout(() => {
          const img = document.getElementById("br-screenshot-img");
          const canvas = document.getElementById("br-screenshot-canvas");
          if (!img || !canvas) return;
          this.canvas = canvas;
          this.canvasCtx = canvas.getContext("2d");
          const setup = () => {
            canvas.width = img.offsetWidth;
            canvas.height = img.offsetHeight;
            this.redrawCanvas();
          };
          if (img.complete) setup();
          else img.onload = setup;
        }, 50);
      }
      redrawCanvas() {
        if (!this.canvas || !this.canvasCtx) return;
        const ctx = this.canvasCtx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.annotations.forEach((ann) => {
          ctx.strokeStyle = ann.color;
          ctx.fillStyle = ann.color;
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          switch (ann.type) {
            case "arrow":
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
            case "rectangle":
              if (ann.points.length >= 2) {
                ctx.strokeRect(ann.points[0].x, ann.points[0].y, ann.points[1].x - ann.points[0].x, ann.points[1].y - ann.points[0].y);
              }
              break;
            case "text":
              if (ann.text && ann.points.length > 0) {
                ctx.font = "bold 14px sans-serif";
                ctx.fillText(ann.text, ann.points[0].x, ann.points[0].y);
              }
              break;
            case "draw":
              if (ann.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(ann.points[0].x, ann.points[0].y);
                ann.points.forEach((p) => ctx.lineTo(p.x, p.y));
                ctx.stroke();
              }
              break;
          }
        });
      }
      getAnnotatedScreenshot() {
        if (!this.screenshot) return null;
        if (this.annotations.length === 0) return this.screenshot;
        const exportCanvas = document.createElement("canvas");
        const ctx = exportCanvas.getContext("2d");
        const img = new Image();
        img.src = this.screenshot;
        exportCanvas.width = img.naturalWidth || 800;
        exportCanvas.height = img.naturalHeight || 600;
        ctx.drawImage(img, 0, 0);
        const scaleX = exportCanvas.width / (this.canvas?.width || exportCanvas.width);
        const scaleY = exportCanvas.height / (this.canvas?.height || exportCanvas.height);
        this.annotations.forEach((ann) => {
          ctx.strokeStyle = ann.color;
          ctx.fillStyle = ann.color;
          ctx.lineWidth = 3 * Math.max(scaleX, scaleY);
          ctx.lineCap = "round";
          const scaled = ann.points.map((p) => ({ x: p.x * scaleX, y: p.y * scaleY }));
          switch (ann.type) {
            case "arrow":
              if (scaled.length >= 2) {
                ctx.beginPath();
                ctx.moveTo(scaled[0].x, scaled[0].y);
                ctx.lineTo(scaled[1].x, scaled[1].y);
                ctx.stroke();
              }
              break;
            case "rectangle":
              if (scaled.length >= 2) {
                ctx.strokeRect(scaled[0].x, scaled[0].y, scaled[1].x - scaled[0].x, scaled[1].y - scaled[0].y);
              }
              break;
            case "draw":
              if (scaled.length > 1) {
                ctx.beginPath();
                ctx.moveTo(scaled[0].x, scaled[0].y);
                scaled.forEach((p) => ctx.lineTo(p.x, p.y));
                ctx.stroke();
              }
              break;
          }
        });
        return exportCanvas.toDataURL("image/jpeg", 0.9);
      }
      bindEvents() {
        document.addEventListener("click", this.handleClick.bind(this), true);
        document.addEventListener("input", this.handleInput.bind(this));
        document.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.addEventListener("mousemove", this.handleMouseMove.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));
        document.addEventListener("keydown", this.handleKeydown.bind(this));
        document.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener("touchend", this.handleTouchEnd.bind(this), { passive: false });
      }
      handleTouchStart(e) {
        if (!this.isSelectingElements) return;
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && !target.closest("#bugradar-widget") && !target.closest(".br-selector-tooltip")) {
          e.preventDefault();
          this.showHighlight(target);
        }
      }
      handleTouchMove(e) {
        if (!this.isSelectingElements) return;
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && !target.closest("#bugradar-widget") && !target.closest(".br-selector-tooltip")) {
          this.showHighlight(target);
        }
      }
      handleTouchEnd(e) {
        if (!this.isSelectingElements) return;
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && !target.closest("#bugradar-widget") && !target.closest(".br-selector-tooltip")) {
          e.preventDefault();
          this.addSelectedElement(target);
        }
      }
      handleClick(e) {
        const target = e.target;
        if (this.isSelectingElements) {
          if (!target.closest("#bugradar-widget") && !target.closest(".br-selector-tooltip")) {
            e.preventDefault();
            e.stopPropagation();
            this.addSelectedElement(target);
            return;
          }
        }
        const sidebar = target.closest("[data-sidebar]");
        const action = target.closest("[data-action]")?.getAttribute("data-action");
        const typeBtn = target.closest("[data-type]");
        if (typeBtn) {
          e.preventDefault();
          e.stopPropagation();
          this.reportType = typeBtn.getAttribute("data-type");
          this.render();
          return;
        }
        const toolBtn = target.closest("[data-tool]");
        if (toolBtn) {
          this.currentTool = toolBtn.getAttribute("data-tool");
          this.render();
          return;
        }
        const colorBtn = target.closest("[data-color]");
        if (colorBtn) {
          this.currentColor = colorBtn.getAttribute("data-color") || "#ef4444";
          this.render();
          return;
        }
        const sevBtn = target.closest("[data-severity]");
        if (sevBtn) {
          this.severity = sevBtn.getAttribute("data-severity");
          this.render();
          return;
        }
        const errorItem = target.closest("[data-error]");
        if (errorItem) {
          const id = errorItem.getAttribute("data-error");
          const err = this.consoleErrors.find((e2) => e2.id === id);
          if (err) err.selected = !err.selected;
          this.render();
          return;
        }
        if (!action) return;
        switch (action) {
          case "open":
            this.open();
            break;
          case "close":
            this.close();
            break;
          case "close-overlay":
            if (target.classList.contains("br-overlay")) this.close();
            break;
          case "next":
            this.nextStep();
            break;
          case "back":
            this.prevStep();
            break;
          case "select-elements":
            this.startElementSelection();
            break;
          case "take-screenshot":
            this.takeScreenshot();
            break;
          case "select-area-screenshot":
            this.startAreaSelection();
            break;
          case "skip-capture":
            this.step = "details";
            this.render();
            break;
          case "undo":
            this.annotations.pop();
            this.redrawCanvas();
            break;
          case "clear":
            this.annotations = [];
            this.redrawCanvas();
            break;
          case "ai-enhance":
            this.enhanceWithAI();
            break;
          case "submit":
            this.submit();
            break;
        }
      }
      nextStep() {
        this.saveFields();
        if (this.step === "annotate") {
          this.step = "details";
          this.render();
          return;
        }
        const steps = ["type", "capture", "details", "review"];
        const idx = steps.indexOf(this.step);
        if (idx >= 0 && idx < steps.length - 1) {
          if (this.step === "capture" && !this.screenshot) {
            this.step = "details";
          } else if (this.step === "capture" && this.screenshot) {
            this.step = "annotate";
          } else {
            this.step = steps[idx + 1];
          }
          this.render();
        }
      }
      prevStep() {
        this.saveFields();
        if (this.step === "annotate") {
          this.step = "capture";
        } else if (this.step === "capture") {
          this.step = "type";
        } else if (this.step === "details") {
          this.step = this.screenshot ? "annotate" : "capture";
        } else if (this.step === "review") {
          this.step = "details";
        }
        this.render();
      }
      handleInput(e) {
        const target = e.target;
        const field = target.dataset.field;
        if (field === "title") this.title = target.value;
        if (field === "description") this.description = target.value;
      }
      handleMouseDown(e) {
        if (this.step !== "annotate" || !this.currentTool || !this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (this.currentTool === "text") {
          const text = prompt("Enter text:");
          if (text) {
            this.annotations.push({ id: `a_${Date.now()}`, type: "text", points: [{ x, y }], color: this.currentColor, text });
            this.redrawCanvas();
          }
          return;
        }
        this.isDrawing = true;
        this.drawStart = { x, y };
        if (this.currentTool === "draw") {
          this.annotations.push({ id: `a_${Date.now()}`, type: "draw", points: [{ x, y }], color: this.currentColor });
        }
      }
      handleMouseMove(e) {
        if (this.isSelectingElements) {
          const target = e.target;
          if (!target.closest("#bugradar-widget") && !target.closest(".br-selector-tooltip")) {
            this.showHighlight(target);
          }
          return;
        }
        if (!this.isDrawing || !this.canvas || !this.canvasCtx) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (this.currentTool === "draw") {
          const last = this.annotations[this.annotations.length - 1];
          if (last?.type === "draw") {
            last.points.push({ x, y });
            this.redrawCanvas();
          }
        }
      }
      handleMouseUp(e) {
        if (!this.isDrawing || !this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (this.currentTool === "arrow" || this.currentTool === "rectangle") {
          this.annotations.push({ id: `a_${Date.now()}`, type: this.currentTool, points: [this.drawStart, { x, y }], color: this.currentColor });
          this.redrawCanvas();
        }
        this.isDrawing = false;
      }
      handleKeydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "b") {
          e.preventDefault();
          if (this.step === "closed") {
            this.open();
          } else {
            this.close();
          }
          return;
        }
        if (e.key === "Escape") {
          if (this.isSelectingArea) {
            this.cancelAreaSelection();
          } else if (this.isSelectingElements) {
            this.finishElementSelection();
          } else if (this.step !== "closed") {
            this.close();
          }
        }
        if (e.key === "Enter" && this.isSelectingElements) {
          this.finishElementSelection();
          return;
        }
        const active = document.activeElement;
        if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA") return;
        if (this.step === "type") {
          if (e.key === "1") {
            this.reportType = "bug";
            this.render();
          } else if (e.key === "2") {
            this.reportType = "feedback";
            this.render();
          } else if (e.key === "3") {
            this.reportType = "change";
            this.render();
          } else if (e.key === "Enter" || e.key === "n") {
            this.nextStep();
          }
        }
        if (this.step === "capture") {
          if (e.key === "1") {
            this.startElementSelection();
          } else if (e.key === "2") {
            this.takeScreenshot();
          } else if (e.key === "3" || e.key === "s") {
            this.step = "details";
            this.render();
          } else if (e.key === "Enter" || e.key === "n") {
            this.nextStep();
          } else if (e.key === "Backspace" || e.key === "b") {
            this.prevStep();
          }
        }
        if (this.step === "details") {
          if (e.key === "Enter" && e.metaKey) {
            this.nextStep();
          } else if (e.key === "Backspace" && e.metaKey) {
            this.prevStep();
          }
        }
        if (this.step === "review") {
          if (e.key === "Enter" || e.key === "s") {
            this.submit();
          } else if (e.key === "Backspace" || e.key === "b") {
            this.prevStep();
          }
        }
        if (e.key === "Tab" && this.step !== "closed") {
        }
      }
      saveFields() {
        const title = this.container?.querySelector('[data-field="title"]');
        const desc = this.container?.querySelector('[data-field="description"]');
        if (title) this.title = title.value;
        if (desc) this.description = desc.value;
      }
      startElementSelection() {
        this.step = "closed";
        this.render();
        this.isSelectingElements = true;
        document.body.classList.add("br-selecting-mode");
        const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        this.selectorTooltip = document.createElement("div");
        this.selectorTooltip.className = "br-selector-tooltip";
        this.selectorTooltip.innerHTML = `
      <span>\u{1F3AF} Tap to select (${this.selectedElements.length}/10)</span>
      <div style="display:flex;gap:8px;align-items:center;margin-top:8px;">
        <button data-action="finish-selection" style="background:#ef4444;color:white;border:none;padding:8px 16px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;touch-action:manipulation;">
          \u2713 Done
        </button>
        <button data-action="cancel-selection" style="background:rgba(255,255,255,0.1);color:white;border:none;padding:8px 16px;border-radius:8px;font-size:14px;cursor:pointer;touch-action:manipulation;">
          Cancel
        </button>
      </div>
      ${!isTouchDevice ? '<span style="margin-top:8px;opacity:0.6;font-size:12px;"><kbd>Enter</kbd> done \xB7 <kbd>Esc</kbd> cancel</span>' : ""}
    `;
        document.body.appendChild(this.selectorTooltip);
        this.selectorTooltip.querySelector('[data-action="finish-selection"]')?.addEventListener("click", (e) => {
          e.stopPropagation();
          this.finishElementSelection();
        });
        this.selectorTooltip.querySelector('[data-action="cancel-selection"]')?.addEventListener("click", (e) => {
          e.stopPropagation();
          this.cancelElementSelection();
        });
      }
      cancelElementSelection() {
        this.isSelectingElements = false;
        document.body.classList.remove("br-selecting-mode");
        this.selectorTooltip?.remove();
        this.selectorTooltip = null;
        if (this.highlightEl) this.highlightEl.style.display = "none";
        this.selectedElements = [];
        this.selectedOverlays.forEach((o) => o.remove());
        this.selectedOverlays = [];
        this.step = "capture";
        this.render();
      }
      finishElementSelection() {
        this.isSelectingElements = false;
        document.body.classList.remove("br-selecting-mode");
        this.selectorTooltip?.remove();
        this.selectorTooltip = null;
        if (this.highlightEl) this.highlightEl.style.display = "none";
        this.step = "capture";
        this.render();
      }
      showHighlight(el) {
        if (!this.highlightEl) return;
        const rect = el.getBoundingClientRect();
        Object.assign(this.highlightEl.style, {
          display: "block",
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`
        });
      }
      addSelectedElement(el) {
        if (this.selectedElements.length >= 10) return;
        const rect = el.getBoundingClientRect();
        this.selectedElements.push({
          selector: getSelector(el),
          xpath: getXPath(el),
          tagName: el.tagName.toLowerCase(),
          text: el.textContent?.trim().slice(0, 50) || "",
          html: el.outerHTML.slice(0, 300),
          boundingBox: rect,
          annotationType: "highlight",
          annotationColor: this.currentColor
        });
        const overlay = document.createElement("div");
        overlay.className = "br-element-selected";
        overlay.style.cssText = `top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px`;
        overlay.innerHTML = `<span class="br-element-selected-num">${this.selectedElements.length}</span>`;
        document.body.appendChild(overlay);
        this.selectedOverlays.push(overlay);
        if (this.selectorTooltip) {
          const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
          this.selectorTooltip.innerHTML = `
        <span>\u{1F3AF} Tap to select (${this.selectedElements.length}/10)</span>
        <div style="display:flex;gap:8px;align-items:center;margin-top:8px;">
          <button data-action="finish-selection" style="background:#ef4444;color:white;border:none;padding:8px 16px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;touch-action:manipulation;">
            \u2713 Done
          </button>
          <button data-action="cancel-selection" style="background:rgba(255,255,255,0.1);color:white;border:none;padding:8px 16px;border-radius:8px;font-size:14px;cursor:pointer;touch-action:manipulation;">
            Cancel
          </button>
        </div>
        ${!isTouchDevice ? '<span style="margin-top:8px;opacity:0.6;font-size:12px;"><kbd>Enter</kbd> done \xB7 <kbd>Esc</kbd> cancel</span>' : ""}
      `;
          this.selectorTooltip.querySelector('[data-action="finish-selection"]')?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.finishElementSelection();
          });
          this.selectorTooltip.querySelector('[data-action="cancel-selection"]')?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.cancelElementSelection();
          });
        }
      }
      async takeScreenshot() {
        console.log("[BugRadar] takeScreenshot called");
        this.step = "closed";
        this.render();
        await new Promise((r) => setTimeout(r, 200));
        try {
          console.log("[BugRadar] Starting screenshot capture with native API...");
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: "browser" },
            preferCurrentTab: true
          });
          const video = document.createElement("video");
          video.srcObject = stream;
          await video.play();
          await new Promise((r) => requestAnimationFrame(r));
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            this.screenshot = canvas.toDataURL("image/jpeg", 0.8);
            console.log("[BugRadar] Native screenshot captured, length:", this.screenshot.length);
          }
          stream.getTracks().forEach((track) => track.stop());
          this.step = "annotate";
          this.render();
        } catch (err) {
          console.warn("[BugRadar] Native capture failed, trying html2canvas:", err);
          try {
            const html2canvas = (await import("html2canvas")).default;
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
              ignoreElements: (element) => {
                return element.id === "bugradar-widget" || element.classList.contains("bugradar-ignore");
              }
            });
            this.screenshot = screenshotCanvas.toDataURL("image/jpeg", 0.8);
            console.log("[BugRadar] html2canvas screenshot captured");
            this.step = "annotate";
            this.render();
          } catch (html2canvasErr) {
            console.error("[BugRadar] html2canvas also failed:", html2canvasErr);
            this.step = "details";
            this.render();
          }
        }
      }
      startAreaSelection() {
        this.step = "closed";
        this.render();
        this.isSelectingArea = true;
        this.areaSelectionOverlay = document.createElement("div");
        this.areaSelectionOverlay.className = "br-area-overlay";
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
        this.areaSelectionBox = document.createElement("div");
        this.areaSelectionBox.className = "br-area-box";
        this.areaSelectionBox.style.cssText = `
      position: fixed;
      border: 3px solid #EF4444;
      background: rgba(239, 68, 68, 0.1);
      pointer-events: none;
      z-index: 999999;
      display: none;
    `;
        const tooltip = document.createElement("div");
        tooltip.className = "br-area-tooltip bugradar-ignore";
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
      <span style="font-size:20px;">\u2702\uFE0F</span>
      <span>Click and drag to select area</span>
      <span style="opacity:0.5;margin-left:8px;"><kbd style="background:rgba(255,255,255,0.1);padding:4px 8px;border-radius:4px;font-size:12px;">Esc</kbd> cancel</span>
    `;
        document.body.appendChild(this.areaSelectionOverlay);
        document.body.appendChild(this.areaSelectionBox);
        document.body.appendChild(tooltip);
        this.areaSelectionOverlay.addEventListener("mousedown", this.handleAreaMouseDown.bind(this));
        document.addEventListener("mousemove", this.handleAreaMouseMove.bind(this));
        document.addEventListener("mouseup", this.handleAreaMouseUp.bind(this));
      }
      cancelAreaSelection() {
        this.isSelectingArea = false;
        document.removeEventListener("mousemove", this.handleAreaMouseMove);
        document.removeEventListener("mouseup", this.handleAreaMouseUp);
        this.areaSelectionOverlay?.remove();
        this.areaSelectionOverlay = null;
        this.areaSelectionBox?.remove();
        this.areaSelectionBox = null;
        document.querySelector(".br-area-tooltip")?.remove();
        if (!this.screenshot) {
          this.step = "capture";
          this.render();
        }
      }
      async captureSelectedArea() {
        const left = Math.min(this.areaStart.x, this.areaEnd.x);
        const top = Math.min(this.areaStart.y, this.areaEnd.y);
        const width = Math.abs(this.areaEnd.x - this.areaStart.x);
        const height = Math.abs(this.areaEnd.y - this.areaStart.y);
        if (this.areaSelectionOverlay) this.areaSelectionOverlay.style.display = "none";
        if (this.areaSelectionBox) this.areaSelectionBox.style.display = "none";
        document.querySelector(".br-area-tooltip")?.remove();
        await new Promise((r) => setTimeout(r, 100));
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: "browser" },
            preferCurrentTab: true
          });
          const video = document.createElement("video");
          video.srcObject = stream;
          await video.play();
          await new Promise((r) => requestAnimationFrame(r));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const scaleX = video.videoWidth / window.innerWidth;
            const scaleY = video.videoHeight / window.innerHeight;
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
            this.screenshot = canvas.toDataURL("image/jpeg", 0.9);
          }
          stream.getTracks().forEach((track) => track.stop());
          this.step = "annotate";
          this.render();
        } catch (err) {
          console.warn("[BugRadar] Native screen capture failed, trying html2canvas:", err);
          try {
            const html2canvas = (await import("html2canvas")).default;
            const screenshotCanvas = await html2canvas(document.body, {
              logging: false,
              useCORS: true,
              allowTaint: true,
              scale: window.devicePixelRatio || 1,
              x: window.scrollX + left,
              y: window.scrollY + top,
              width,
              height,
              backgroundColor: null,
              ignoreElements: (element) => {
                return element.id === "bugradar-widget" || element.classList.contains("bugradar-ignore") || element.classList.contains("br-area-overlay") || element.classList.contains("br-area-box") || element.classList.contains("br-area-tooltip");
              }
            });
            this.screenshot = screenshotCanvas.toDataURL("image/jpeg", 0.9);
            this.step = "annotate";
            this.render();
          } catch (html2canvasErr) {
            console.warn("[BugRadar] html2canvas also failed:", html2canvasErr);
            this.step = "details";
            this.render();
          }
        }
      }
      async enhanceWithAI() {
        const btn = this.container?.querySelector('[data-action="ai-enhance"]');
        if (btn) {
          btn.innerHTML = "\u23F3 Enhancing...";
          btn.disabled = true;
        }
        await new Promise((r) => setTimeout(r, 800));
        const orig = this.description || this.title;
        this.description = `## Summary
${this.title || "Issue description"}

## Steps to Reproduce
1. Navigate to ${window.location.pathname}
2. [User action]
3. [Observed behavior]

## Expected Behavior
[What should have happened]

## Actual Behavior
${orig || "[What actually happened]"}

## Environment
- URL: ${window.location.href}
- Browser: ${navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : "Browser"}`;
        this.render();
      }
      async submit() {
        const btn = this.container?.querySelector('[data-action="submit"]');
        if (btn) {
          btn.innerHTML = "\u23F3 Submitting...";
          btn.disabled = true;
        }
        const selectedErrors = this.consoleErrors.filter((e) => e.selected);
        const finalScreenshot = this.getAnnotatedScreenshot();
        const report = {
          title: this.title,
          description: this.description,
          priority: this.severity,
          screenshot: finalScreenshot || void 0,
          elements: this.selectedElements,
          context: getBrowserContext(),
          consoleLogs: selectedErrors.length > 0 ? selectedErrors.map((e) => ({ type: "error", timestamp: e.time, message: e.message })) : this.getConsoleLogs(),
          networkLogs: this.getNetworkLogs(),
          metadata: { ...this.config.metadata, reportType: this.reportType },
          userIdentifier: this.config.userIdentifier,
          sessionId: this.sessionId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        try {
          await this.onSubmit(report);
          this.step = "success";
          this.render();
          this.startAutoCloseTimer();
        } catch {
          if (btn) {
            btn.innerHTML = `${ICONS.send} Submit Report`;
            btn.disabled = false;
          }
          alert("Failed to submit. Please try again.");
        }
      }
      esc(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      }
    };
  }
});

// src/widget/bug-overlay.ts
var BugOverlay;
var init_bug_overlay = __esm({
  "src/widget/bug-overlay.ts"() {
    "use strict";
    init_icons();
    BugOverlay = class {
      constructor(config) {
        this.bugs = [];
        this.overlays = /* @__PURE__ */ new Map();
        this.elementHighlights = /* @__PURE__ */ new Map();
        this.activePopup = null;
        this.activeBugId = null;
        this.styleInjected = false;
        this.pollInterval = null;
        this.lastBugIds = "";
        this.isFixing = false;
        this.config = config;
      }
      async init() {
        this.injectStyles();
        await this.fetchBugs();
        this.renderOverlays();
        window.addEventListener("scroll", () => this.updateOverlayPositions());
        window.addEventListener("resize", () => this.updateOverlayPositions());
        document.addEventListener("click", (e) => {
          if (this.activePopup && !this.activePopup.contains(e.target)) {
            const clickedOnBadge = Array.from(this.overlays.values()).some(
              (overlay) => overlay.contains(e.target)
            );
            if (!clickedOnBadge) {
              this.closePopup();
            }
          }
        });
        this.startPolling();
      }
      startPolling() {
        this.pollInterval = setInterval(async () => {
          await this.fetchBugs();
          const currentBugIds = this.bugs.map((b) => `${b.id}:${b.status}`).sort().join(",");
          if (currentBugIds !== this.lastBugIds) {
            console.log("[BugRadar] Bugs changed, re-rendering overlays");
            this.lastBugIds = currentBugIds;
            this.renderOverlays();
          }
        }, 5e3);
      }
      stopPolling() {
        if (this.pollInterval) {
          clearInterval(this.pollInterval);
          this.pollInterval = null;
        }
      }
      injectStyles() {
        if (this.styleInjected) return;
        this.styleInjected = true;
        const style = document.createElement("style");
        style.id = "bugradar-overlay-styles";
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
        border: 3px solid #EF4444;
        background: rgba(239, 68, 68, 0.15);
        pointer-events: none;
        z-index: 9999;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(239, 68, 68, 0.1);
        animation: br-highlight-pulse 1.5s ease-in-out infinite;
      }
      @keyframes br-highlight-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 20px rgba(239, 68, 68, 0.1); }
        50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 30px rgba(239, 68, 68, 0.15); }
      }

      .br-popup-btn-fixing {
        background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%) !important;
        cursor: wait !important;
      }
      .br-popup-btn-fixing:hover {
        transform: none !important;
      }

      .br-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: br-spin 0.8s linear infinite;
      }
      @keyframes br-spin {
        to { transform: rotate(360deg); }
      }
    `;
        document.head.appendChild(style);
      }
      async fetchBugs() {
        try {
          const pageUrl = window.location.origin + window.location.pathname;
          const apiUrl = `${this.config.apiUrl}/bugs?page_url=${encodeURIComponent(pageUrl)}`;
          console.log("[BugRadar] Fetching bugs...");
          console.log("[BugRadar] API URL:", apiUrl);
          console.log("[BugRadar] Page URL:", pageUrl);
          console.log("[BugRadar] API Key:", this.config.apiKey?.substring(0, 10) + "...");
          const response = await fetch(apiUrl, {
            headers: {
              "Authorization": `Bearer ${this.config.apiKey}`,
              "Content-Type": "application/json"
            }
          });
          console.log("[BugRadar] Response status:", response.status);
          if (response.ok) {
            const data = await response.json();
            this.bugs = data.bugs || [];
            console.log("[BugRadar] Fetched bugs:", this.bugs);
            console.log("[BugRadar] Total bugs:", this.bugs.length);
            this.bugs.forEach((bug) => {
              console.log("[BugRadar] Bug:", bug.id, "| Selector:", bug.selector, "| Status:", bug.status);
            });
          } else {
            const errorText = await response.text();
            console.error("[BugRadar] API error:", response.status, errorText);
          }
        } catch (error) {
          console.error("[BugRadar] Failed to fetch bugs:", error);
        }
      }
      setBugs(bugs) {
        console.log("[BugRadar BugOverlay] setBugs called with", bugs.length, "bugs");
        this.bugs = bugs;
        this.injectStyles();
        this.renderOverlays();
      }
      renderOverlays() {
        this.overlays.forEach((overlay) => overlay.remove());
        this.overlays.clear();
        this.elementHighlights.forEach((highlight) => highlight.remove());
        this.elementHighlights.clear();
        console.log("[BugRadar] Rendering overlays for", this.bugs.length, "bugs");
        const currentPageUrl = window.location.origin + window.location.pathname;
        const currentPageWithHash = window.location.href.split("?")[0];
        this.bugs.forEach((bug) => {
          console.log("[BugRadar] Processing bug:", bug.id, "selector:", bug.selector, "status:", bug.status, "pageUrl:", bug.pageUrl);
          if (bug.selector && bug.status !== "resolved" && bug.status !== "closed") {
            if (!this.isPageUrlMatch(bug.pageUrl, currentPageUrl, currentPageWithHash)) {
              console.log("[BugRadar] Skipping bug - page URL mismatch:", bug.pageUrl, "vs", currentPageWithHash);
              return;
            }
            const element = document.querySelector(bug.selector);
            console.log("[BugRadar] Found element:", !!element, "for selector:", bug.selector);
            if (element && this.isElementVisible(element)) {
              this.createBugBadge(bug, element);
            } else {
              console.warn("[BugRadar] Element not found or not visible for selector:", bug.selector);
            }
          }
        });
        console.log("[BugRadar] Created", this.overlays.size, "badge overlays");
      }
      isPageUrlMatch(bugPageUrl, currentUrl, currentUrlWithHash) {
        if (!bugPageUrl) return false;
        const normalizedBugUrl = bugPageUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
        const normalizedCurrentUrl = currentUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
        const normalizedCurrentUrlWithHash = currentUrlWithHash.replace(/^https?:\/\//, "").replace(/\/$/, "");
        const bugPath = normalizedBugUrl.split("/").slice(1).join("/").split("#")[0];
        const currentPath = normalizedCurrentUrl.split("/").slice(1).join("/");
        const bugPathWithHash = normalizedBugUrl.split("/").slice(1).join("/");
        const currentPathWithHash = normalizedCurrentUrlWithHash.split("/").slice(1).join("/");
        console.log("[BugRadar] URL match check:", {
          bugPath,
          currentPath,
          bugPathWithHash,
          currentPathWithHash
        });
        return bugPath === currentPath || bugPathWithHash === currentPathWithHash;
      }
      isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        if (rect.width === 0 || rect.height === 0) return false;
        if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
        if (rect.bottom < 0 || rect.top > document.documentElement.scrollHeight) return false;
        return true;
      }
      createBugBadge(bug, element) {
        const rect = element.getBoundingClientRect();
        this.showElementHighlight(bug.id, element);
        const badge = document.createElement("div");
        badge.className = "br-bug-badge";
        badge.innerHTML = ICONS.bug;
        badge.style.left = `${rect.right + window.scrollX - 14}px`;
        badge.style.top = `${rect.top + window.scrollY - 14}px`;
        badge.addEventListener("click", (e) => {
          e.stopPropagation();
          this.showBugPopup(bug, badge);
        });
        document.body.appendChild(badge);
        this.overlays.set(bug.id, badge);
      }
      updateOverlayPositions() {
        this.bugs.forEach((bug) => {
          if (bug.selector) {
            const element = document.querySelector(bug.selector);
            const badge = this.overlays.get(bug.id);
            const highlight = this.elementHighlights.get(bug.id);
            if (element) {
              const rect = element.getBoundingClientRect();
              if (badge) {
                badge.style.left = `${rect.right + window.scrollX - 14}px`;
                badge.style.top = `${rect.top + window.scrollY - 14}px`;
              }
              if (highlight) {
                highlight.style.left = `${rect.left + window.scrollX - 4}px`;
                highlight.style.top = `${rect.top + window.scrollY - 4}px`;
                highlight.style.width = `${rect.width + 8}px`;
                highlight.style.height = `${rect.height + 8}px`;
              }
            }
          }
        });
      }
      showBugPopup(bug, badge) {
        this.closePopup();
        this.activeBugId = bug.id;
        const popup = document.createElement("div");
        popup.className = "br-bug-popup";
        const badgeRect = badge.getBoundingClientRect();
        let left = badgeRect.right + 12;
        let top = badgeRect.top - 20;
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
          ${bug.status.replace("_", " ")}
        </div>
      </div>
      <div class="br-popup-body">
        ${bug.description ? `<p class="br-popup-description">${this.escapeHtml(bug.description)}</p>` : ""}
        <div class="br-popup-actions">
          <button class="br-popup-btn br-popup-btn-primary" data-action="quick-fix">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M8 12l2 2 4-4"/>
            </svg>
            Fix Bug
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
        popup.querySelector('[data-action="close"]')?.addEventListener("click", () => {
          this.closePopup();
        });
        popup.querySelector('[data-action="quick-fix"]')?.addEventListener("click", () => {
          this.triggerQuickFix(bug);
        });
        popup.querySelector('[data-action="view-details"]')?.addEventListener("click", () => {
          const dashboardUrl = this.config.apiUrl.replace("/api/v1", "").replace("/api", "");
          window.open(`${dashboardUrl}/dashboard/bugs/${bug.id}`, "_blank");
        });
        document.body.appendChild(popup);
        this.activePopup = popup;
      }
      closePopup() {
        if (this.activePopup) {
          this.activePopup.remove();
          this.activePopup = null;
        }
        this.activeBugId = null;
      }
      showElementHighlight(bugId, element) {
        this.hideElementHighlight(bugId);
        const rect = element.getBoundingClientRect();
        const highlight = document.createElement("div");
        highlight.className = "br-element-highlight";
        highlight.style.left = `${rect.left + window.scrollX - 4}px`;
        highlight.style.top = `${rect.top + window.scrollY - 4}px`;
        highlight.style.width = `${rect.width + 8}px`;
        highlight.style.height = `${rect.height + 8}px`;
        document.body.appendChild(highlight);
        this.elementHighlights.set(bugId, highlight);
      }
      hideElementHighlight(bugId) {
        const highlight = this.elementHighlights.get(bugId);
        if (highlight) {
          highlight.remove();
          this.elementHighlights.delete(bugId);
        }
      }
      async triggerQuickFix(bug) {
        if (this.config.onQuickFix) {
          this.closePopup();
          this.config.onQuickFix(bug);
          return;
        }
        if (this.isFixing) return;
        this.isFixing = true;
        const btn = this.activePopup?.querySelector('[data-action="quick-fix"]');
        if (btn) {
          btn.classList.add("br-popup-btn-fixing");
          btn.innerHTML = `<div class="br-spinner"></div> Launching Claude...`;
        }
        fetch(`${this.config.apiUrl}/bugs/${bug.id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": this.config.apiKey
          },
          body: JSON.stringify({ status: "in_progress" })
        }).catch(() => {
        });
        const prompt2 = this.buildFixPrompt(bug);
        const promptB64 = btoa(unescape(encodeURIComponent(prompt2)));
        const projectPath = bug.projectPath || "";
        const dashboardUrl = this.config.apiUrl.replace("/api/v1", "").replace("/api", "");
        const bugUrl = `${dashboardUrl}/dashboard/bugs/${bug.id}`;
        window.open(bugUrl, "_blank");
        if (btn) {
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Launched!`;
        }
        const toast = document.createElement("div");
        toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 14px;
      z-index: 10003;
      box-shadow: 0 10px 40px rgba(16, 185, 129, 0.4);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: br-slide-in 0.3s ease-out;
    `;
        toast.innerHTML = `
      <style>@keyframes br-slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }</style>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
      <span>Terminal launched with Claude!</span>
    `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4e3);
        setTimeout(() => this.closePopup(), 1500);
        this.isFixing = false;
      }
      showQuickFixModal(bug) {
        const modal = document.createElement("div");
        modal.id = "br-quickfix-modal";
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
              <input type="text" id="br-project-path" placeholder="/Users/you/Projects/your-project" style="width:100%;padding:14px 16px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-size:14px;outline:none;" value="${bug.projectPath || ""}"/>
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
              Open Terminal \u2192 Paste command \u2192 Paste prompt in Claude \u2192 Shift+Tab \u2192 Enter
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
        const pathInput = modal.querySelector("#br-project-path");
        const cmdDisplay = modal.querySelector("#br-terminal-cmd");
        pathInput.addEventListener("input", () => {
          cmdDisplay.textContent = `cd "${pathInput.value}" && claude`;
        });
        const fixPrompt = this.buildFixPrompt(bug);
        modal.querySelector("#br-copy-cmd")?.addEventListener("click", async () => {
          const cmd = `cd "${pathInput.value}" && claude`;
          await navigator.clipboard.writeText(cmd);
          const btn = modal.querySelector("#br-copy-cmd");
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied!`;
          setTimeout(() => {
            btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy Command`;
          }, 2e3);
        });
        modal.querySelector("#br-copy-prompt")?.addEventListener("click", async () => {
          await navigator.clipboard.writeText(fixPrompt);
          const btn = modal.querySelector("#br-copy-prompt");
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg> Copied!`;
          setTimeout(() => {
            btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg> Copy Prompt`;
          }, 2e3);
        });
        modal.querySelector("#br-close-modal")?.addEventListener("click", () => {
          modal.remove();
        });
        modal.addEventListener("click", (e) => {
          if (e.target === modal.firstElementChild) {
            modal.remove();
          }
        });
      }
      buildFixPrompt(bug) {
        return `# BugRadar Fix Request

## Bug Details
- **ID:** ${bug.id}
- **Title:** ${bug.title}
- **Priority:** ${bug.priority.toUpperCase()}
- **Status:** ${bug.status}
${bug.pageUrl ? `- **Page URL:** ${bug.pageUrl}` : ""}
${bug.selector ? `- **Element:** ${bug.selector}` : ""}

## Description
${bug.description || "No description provided."}

${bug.consoleErrors?.length ? `## Console Errors
\`\`\`
${bug.consoleErrors.slice(0, 10).join("\n")}
\`\`\`
` : ""}

## Your Task
1. Analyze the bug based on the information above
2. Find the root cause in the codebase
3. Implement a fix
4. Test the fix works

Please analyze this bug and implement a fix.
`;
      }
      escapeHtml(text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      }
      destroy() {
        this.stopPolling();
        this.overlays.forEach((overlay) => overlay.remove());
        this.overlays.clear();
        this.elementHighlights.forEach((highlight) => highlight.remove());
        this.elementHighlights.clear();
        this.closePopup();
        document.getElementById("bugradar-overlay-styles")?.remove();
        document.getElementById("br-quickfix-modal")?.remove();
      }
    };
  }
});

// src/utils/screenshot.ts
async function captureScreenshot() {
  try {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(document.body, {
      logging: false,
      useCORS: true,
      allowTaint: true,
      scale: window.devicePixelRatio || 1,
      width: window.innerWidth,
      height: window.innerHeight,
      x: window.scrollX,
      y: window.scrollY,
      ignoreElements: (element) => {
        return element.id === "bugradar-widget" || element.classList.contains("bugradar-ignore");
      }
    });
    return canvas.toDataURL("image/jpeg", 0.8);
  } catch (error) {
    console.warn("[BugRadar] Screenshot capture failed:", error);
    return null;
  }
}
var init_screenshot = __esm({
  "src/utils/screenshot.ts"() {
    "use strict";
  }
});

// src/client.ts
var client_exports = {};
__export(client_exports, {
  BugRadar: () => BugRadar
});
var DEFAULT_API_URL, BugRadarClient, BugRadar;
var init_client = __esm({
  "src/client.ts"() {
    "use strict";
    init_console_capture();
    init_network_capture();
    init_browser();
    init_widget();
    init_bug_overlay();
    init_screenshot();
    DEFAULT_API_URL = "";
    BugRadarClient = class {
      constructor() {
        this.config = null;
        this.initialized = false;
        this.consoleCapture = null;
        this.networkCapture = null;
        this.widget = null;
        this.bugOverlay = null;
        this.sessionId = generateSessionId();
      }
      /**
       * Initialize BugRadar with your API key
       */
      init(apiKeyOrConfig) {
        if (this.initialized) {
          console.warn("[BugRadar] Already initialized");
          return;
        }
        if (typeof apiKeyOrConfig === "string") {
          console.error('[BugRadar] For self-hosted, you must pass a config object with apiUrl. Example: BugRadar.init({ apiKey: "...", apiUrl: "https://your-dashboard.com/api/v1" })');
          return;
        } else {
          this.config = apiKeyOrConfig;
        }
        if (!this.config.apiUrl) {
          console.error('[BugRadar] apiUrl is required for self-hosted. Example: BugRadar.init({ apiKey: "...", apiUrl: "https://your-dashboard.com/api/v1" })');
          return;
        }
        this.config = {
          apiUrl: DEFAULT_API_URL,
          enableScreenshot: true,
          enableConsoleLogs: true,
          enableNetworkLogs: true,
          enableAutoCapture: true,
          maxConsoleLogs: 50,
          maxNetworkLogs: 20,
          position: "bottom-right",
          theme: "auto",
          showButton: true,
          ...this.config
        };
        if (this.config.enableConsoleLogs) {
          this.consoleCapture = new ConsoleCapture(this.config.maxConsoleLogs);
          this.consoleCapture.start();
        }
        if (this.config.enableNetworkLogs) {
          this.networkCapture = new NetworkCapture(this.config.maxNetworkLogs);
          this.networkCapture.start();
        }
        if (this.config.enableAutoCapture) {
          this.setupAutoCapture();
        }
        if (typeof window !== "undefined") {
          this.widget = new BugReporterWidget(
            this.config,
            this.sessionId,
            () => this.consoleCapture?.getLogs() || [],
            () => this.networkCapture?.getLogs() || [],
            (report) => this.submitReport(report)
          );
          if (document.readyState === "loading") {
            console.log("[BugRadar] DOM loading, waiting for DOMContentLoaded...");
            document.addEventListener("DOMContentLoaded", () => {
              console.log("[BugRadar] DOMContentLoaded fired, mounting widget...");
              this.widget?.mount();
              console.log("[BugRadar] Calling autoInitBugOverlays...");
              this.autoInitBugOverlays();
            });
          } else {
            console.log("[BugRadar] DOM ready, mounting widget...");
            this.widget.mount();
            console.log("[BugRadar] Calling autoInitBugOverlays...");
            this.autoInitBugOverlays();
          }
        }
        this.initialized = true;
        console.log("[BugRadar] Initialized successfully");
      }
      /**
       * Auto-initialize bug overlays - fetches and displays existing bugs for current page
       */
      async autoInitBugOverlays() {
        console.log("[BugRadar] autoInitBugOverlays called");
        console.log("[BugRadar] Config:", this.config ? "exists" : "null");
        console.log("[BugRadar] API URL:", this.config?.apiUrl);
        console.log("[BugRadar] API Key:", this.config?.apiKey?.substring(0, 10) + "...");
        if (!this.config) {
          console.warn("[BugRadar] No config, skipping bug overlays");
          return;
        }
        try {
          console.log("[BugRadar] Creating BugOverlay instance...");
          this.bugOverlay = new BugOverlay({
            apiUrl: this.config.apiUrl || DEFAULT_API_URL,
            apiKey: this.config.apiKey
          });
          console.log("[BugRadar] Calling bugOverlay.init()...");
          await this.bugOverlay.init();
          console.log("[BugRadar] Bug overlays auto-initialized successfully");
        } catch (error) {
          console.error("[BugRadar] Failed to auto-init bug overlays:", error);
        }
      }
      /**
       * Manually capture and report an error
       */
      async captureError(error, additionalData) {
        if (!this.initialized || !this.config) {
          console.warn("[BugRadar] Not initialized");
          return;
        }
        const screenshot = this.config.enableScreenshot ? await captureScreenshot() : null;
        const report = {
          title: error.message || "Unknown Error",
          description: error.stack || "",
          priority: "high",
          screenshot: screenshot || void 0,
          elements: [],
          context: getBrowserContext(),
          consoleLogs: this.consoleCapture?.getLogs() || [],
          networkLogs: this.networkCapture?.getLogs() || [],
          metadata: { ...this.config.metadata, ...additionalData, autoCapture: true },
          userIdentifier: this.config.userIdentifier,
          sessionId: this.sessionId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        await this.submitReport(report);
      }
      /**
       * Manually capture a message/feedback
       */
      async captureMessage(title, description, priority = "medium") {
        if (!this.initialized || !this.config) {
          console.warn("[BugRadar] Not initialized");
          return;
        }
        const screenshot = this.config.enableScreenshot ? await captureScreenshot() : null;
        const report = {
          title,
          description: description || "",
          priority,
          screenshot: screenshot || void 0,
          elements: [],
          context: getBrowserContext(),
          consoleLogs: this.consoleCapture?.getLogs() || [],
          networkLogs: this.networkCapture?.getLogs() || [],
          metadata: this.config.metadata,
          userIdentifier: this.config.userIdentifier,
          sessionId: this.sessionId,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        await this.submitReport(report);
      }
      /**
       * Open the bug reporter widget
       */
      open() {
        this.widget?.open();
      }
      /**
       * Close the bug reporter widget
       */
      close() {
        this.widget?.close();
      }
      /**
       * Set user identifier for tracking
       */
      setUser(identifier) {
        if (this.config) {
          this.config.userIdentifier = identifier;
        }
      }
      /**
       * Set additional metadata
       */
      setMetadata(metadata) {
        if (this.config) {
          this.config.metadata = { ...this.config.metadata, ...metadata };
        }
      }
      /**
       * Show bug overlay badges on elements with existing bugs
       * @param bugs - Array of existing bugs to display
       */
      showBugOverlays(bugs) {
        console.log("[BugRadar] showBugOverlays called with", bugs.length, "bugs");
        if (!this.initialized || !this.config) {
          console.warn("[BugRadar] Not initialized");
          return;
        }
        console.log("[BugRadar] Creating BugOverlay instance...");
        if (!this.bugOverlay) {
          this.bugOverlay = new BugOverlay({
            apiUrl: this.config.apiUrl || DEFAULT_API_URL,
            apiKey: this.config.apiKey
          });
        }
        console.log("[BugRadar] Setting bugs on overlay...");
        this.bugOverlay.setBugs(bugs);
        console.log("[BugRadar] setBugs complete");
      }
      /**
       * Initialize bug overlays - fetches bugs from API for current page
       */
      async initBugOverlays() {
        if (!this.initialized || !this.config) {
          console.warn("[BugRadar] Not initialized");
          return;
        }
        this.bugOverlay = new BugOverlay({
          apiUrl: this.config.apiUrl || DEFAULT_API_URL,
          apiKey: this.config.apiKey
        });
        await this.bugOverlay.init();
      }
      /**
       * Hide all bug overlay badges
       */
      hideBugOverlays() {
        this.bugOverlay?.destroy();
        this.bugOverlay = null;
      }
      /**
       * Destroy the SDK instance
       */
      destroy() {
        this.consoleCapture?.stop();
        this.networkCapture?.stop();
        this.widget?.unmount();
        this.bugOverlay?.destroy();
        this.initialized = false;
        this.config = null;
      }
      setupAutoCapture() {
        window.addEventListener("error", (event) => {
          if (event.error) {
            this.captureError(event.error);
          }
        });
        window.addEventListener("unhandledrejection", (event) => {
          const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
          this.captureError(error);
        });
      }
      async submitReport(report) {
        if (!this.config) {
          throw new Error("BugRadar not initialized");
        }
        if (this.config.onBeforeSubmit) {
          const modified = this.config.onBeforeSubmit(report);
          if (modified === false) {
            throw new Error("Submission cancelled by onBeforeSubmit");
          }
          report = modified;
        }
        const response = await fetch(`${this.config.apiUrl}/bugs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": this.config.apiKey
          },
          body: JSON.stringify(report)
        });
        if (!response.ok) {
          const error = new Error(`Failed to submit bug report: ${response.status}`);
          this.config.onSubmitError?.(error);
          throw error;
        }
        const result = await response.json();
        this.config.onSubmitSuccess?.(result);
        return result;
      }
    };
    BugRadar = new BugRadarClient();
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  BugRadar: () => BugRadar
});
module.exports = __toCommonJS(index_exports);
init_client();
if (typeof window !== "undefined") {
  const script = document.currentScript;
  const apiKey = script?.getAttribute("data-api-key");
  if (apiKey) {
    Promise.resolve().then(() => (init_client(), client_exports)).then(({ BugRadar: BugRadar2 }) => {
      BugRadar2.init(apiKey);
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BugRadar
});
