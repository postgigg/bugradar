export interface BugRadarConfig {
  apiKey: string;
  apiUrl?: string;
  enableScreenshot?: boolean;
  enableConsoleLogs?: boolean;
  enableNetworkLogs?: boolean;
  enableAutoCapture?: boolean;
  maxConsoleLogs?: number;
  maxNetworkLogs?: number;
  userIdentifier?: string;
  metadata?: Record<string, unknown>;
  onBeforeSubmit?: (report: BugReport) => BugReport | false;
  onSubmitSuccess?: (response: SubmitResponse) => void;
  onSubmitError?: (error: Error) => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  triggerKey?: string;
  showButton?: boolean;
}

export interface BugReport {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  screenshot?: string;
  elements?: SelectedElement[];
  context: BrowserContext;
  consoleLogs: ConsoleLog[];
  networkLogs: NetworkLog[];
  metadata?: Record<string, unknown>;
  userIdentifier?: string;
  sessionId: string;
  timestamp: string;
}

export interface SelectedElement {
  selector: string;
  xpath: string;
  tagName: string;
  text: string;
  html: string;
  boundingBox: DOMRect;
  annotationType: 'highlight' | 'arrow' | 'text';
  annotationColor: string;
  annotationNote?: string;
}

export interface BrowserContext {
  url: string;
  title: string;
  userAgent: string;
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  screenResolution: string;
  viewportSize: string;
  language: string;
  timezone: string;
  cookiesEnabled: boolean;
  doNotTrack: boolean;
}

export interface ConsoleLog {
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  timestamp: string;
  stack?: string;
}

export interface NetworkLog {
  method: string;
  url: string;
  status?: number;
  statusText?: string;
  duration?: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  timestamp: string;
  error?: string;
}

export interface SubmitResponse {
  success: boolean;
  bugId: string;
  message: string;
}

export interface ExistingBug {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  selector?: string;
  boundingBox?: DOMRect;
  consoleErrors?: string[];
  pageUrl?: string;
  projectPath?: string;
}
