import type { BugRadarConfig, BugReport, SubmitResponse, ExistingBug } from './types';
import { ConsoleCapture } from './utils/console-capture';
import { NetworkCapture } from './utils/network-capture';
import { generateSessionId, getBrowserContext } from './utils/browser';
import { BugReporterWidget } from './widget/widget';
import { BugOverlay } from './widget/bug-overlay';
import { captureScreenshot } from './utils/screenshot';

const DEFAULT_API_URL = 'https://bugradar.io/api/v1';

class BugRadarClient {
  private config: BugRadarConfig | null = null;
  private initialized = false;
  private sessionId: string;
  private consoleCapture: ConsoleCapture | null = null;
  private networkCapture: NetworkCapture | null = null;
  private widget: BugReporterWidget | null = null;
  private bugOverlay: BugOverlay | null = null;

  constructor() {
    this.sessionId = generateSessionId();
  }

  /**
   * Initialize BugRadar with your API key
   */
  init(apiKeyOrConfig: string | BugRadarConfig): void {
    if (this.initialized) {
      console.warn('[BugRadar] Already initialized');
      return;
    }

    // Handle string API key or full config
    if (typeof apiKeyOrConfig === 'string') {
      this.config = { apiKey: apiKeyOrConfig };
    } else {
      this.config = apiKeyOrConfig;
    }

    // Set defaults
    this.config = {
      apiUrl: DEFAULT_API_URL,
      enableScreenshot: true,
      enableConsoleLogs: true,
      enableNetworkLogs: true,
      enableAutoCapture: true,
      maxConsoleLogs: 50,
      maxNetworkLogs: 20,
      position: 'bottom-right',
      theme: 'auto',
      showButton: true,
      ...this.config,
    };

    // Start capturing
    if (this.config.enableConsoleLogs) {
      this.consoleCapture = new ConsoleCapture(this.config.maxConsoleLogs);
      this.consoleCapture.start();
    }

    if (this.config.enableNetworkLogs) {
      this.networkCapture = new NetworkCapture(this.config.maxNetworkLogs);
      this.networkCapture.start();
    }

    // Setup auto error capture
    if (this.config.enableAutoCapture) {
      this.setupAutoCapture();
    }

    // Mount widget (only in browser)
    if (typeof window !== 'undefined') {
      this.widget = new BugReporterWidget(
        this.config,
        this.sessionId,
        () => this.consoleCapture?.getLogs() || [],
        () => this.networkCapture?.getLogs() || [],
        (report) => this.submitReport(report)
      );

      // Wait for DOM ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.widget?.mount());
      } else {
        this.widget.mount();
      }
    }

    this.initialized = true;
    console.log('[BugRadar] Initialized successfully');
  }

  /**
   * Manually capture and report an error
   */
  async captureError(error: Error, additionalData?: Record<string, unknown>): Promise<void> {
    if (!this.initialized || !this.config) {
      console.warn('[BugRadar] Not initialized');
      return;
    }

    const screenshot = this.config.enableScreenshot ? await captureScreenshot() : null;

    const report: BugReport = {
      title: error.message || 'Unknown Error',
      description: error.stack || '',
      priority: 'high',
      screenshot: screenshot || undefined,
      elements: [],
      context: getBrowserContext(),
      consoleLogs: this.consoleCapture?.getLogs() || [],
      networkLogs: this.networkCapture?.getLogs() || [],
      metadata: { ...this.config.metadata, ...additionalData, autoCapture: true },
      userIdentifier: this.config.userIdentifier,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    await this.submitReport(report);
  }

  /**
   * Manually capture a message/feedback
   */
  async captureMessage(
    title: string,
    description?: string,
    priority: BugReport['priority'] = 'medium'
  ): Promise<void> {
    if (!this.initialized || !this.config) {
      console.warn('[BugRadar] Not initialized');
      return;
    }

    const screenshot = this.config.enableScreenshot ? await captureScreenshot() : null;

    const report: BugReport = {
      title,
      description: description || '',
      priority,
      screenshot: screenshot || undefined,
      elements: [],
      context: getBrowserContext(),
      consoleLogs: this.consoleCapture?.getLogs() || [],
      networkLogs: this.networkCapture?.getLogs() || [],
      metadata: this.config.metadata,
      userIdentifier: this.config.userIdentifier,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    };

    await this.submitReport(report);
  }

  /**
   * Open the bug reporter widget
   */
  open(): void {
    this.widget?.open();
  }

  /**
   * Close the bug reporter widget
   */
  close(): void {
    this.widget?.close();
  }

  /**
   * Set user identifier for tracking
   */
  setUser(identifier: string): void {
    if (this.config) {
      this.config.userIdentifier = identifier;
    }
  }

  /**
   * Set additional metadata
   */
  setMetadata(metadata: Record<string, unknown>): void {
    if (this.config) {
      this.config.metadata = { ...this.config.metadata, ...metadata };
    }
  }

  /**
   * Show bug overlay badges on elements with existing bugs
   * @param bugs - Array of existing bugs to display
   */
  showBugOverlays(bugs: ExistingBug[]): void {
    console.log('[BugRadar] showBugOverlays called with', bugs.length, 'bugs');

    if (!this.initialized || !this.config) {
      console.warn('[BugRadar] Not initialized');
      return;
    }

    console.log('[BugRadar] Creating BugOverlay instance...');

    if (!this.bugOverlay) {
      this.bugOverlay = new BugOverlay({
        apiUrl: this.config.apiUrl || DEFAULT_API_URL,
        apiKey: this.config.apiKey,
      });
    }

    console.log('[BugRadar] Setting bugs on overlay...');
    this.bugOverlay.setBugs(bugs);
    console.log('[BugRadar] setBugs complete');
  }

  /**
   * Initialize bug overlays - fetches bugs from API for current page
   */
  async initBugOverlays(): Promise<void> {
    if (!this.initialized || !this.config) {
      console.warn('[BugRadar] Not initialized');
      return;
    }

    this.bugOverlay = new BugOverlay({
      apiUrl: this.config.apiUrl || DEFAULT_API_URL,
      apiKey: this.config.apiKey,
    });

    await this.bugOverlay.init();
  }

  /**
   * Hide all bug overlay badges
   */
  hideBugOverlays(): void {
    this.bugOverlay?.destroy();
    this.bugOverlay = null;
  }

  /**
   * Destroy the SDK instance
   */
  destroy(): void {
    this.consoleCapture?.stop();
    this.networkCapture?.stop();
    this.widget?.unmount();
    this.bugOverlay?.destroy();
    this.initialized = false;
    this.config = null;
  }

  private setupAutoCapture(): void {
    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      if (event.error) {
        this.captureError(event.error);
      }
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));
      this.captureError(error);
    });
  }

  private async submitReport(report: BugReport): Promise<SubmitResponse> {
    if (!this.config) {
      throw new Error('BugRadar not initialized');
    }

    // Allow modification before submit
    if (this.config.onBeforeSubmit) {
      const modified = this.config.onBeforeSubmit(report);
      if (modified === false) {
        throw new Error('Submission cancelled by onBeforeSubmit');
      }
      report = modified;
    }

    const response = await fetch(`${this.config.apiUrl}/bugs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify(report),
    });

    if (!response.ok) {
      const error = new Error(`Failed to submit bug report: ${response.status}`);
      this.config.onSubmitError?.(error);
      throw error;
    }

    const result: SubmitResponse = await response.json();
    this.config.onSubmitSuccess?.(result);
    return result;
  }
}

// Export singleton instance
export const BugRadar = new BugRadarClient();
