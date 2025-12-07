interface BugRadarConfig {
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
interface BugReport {
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
interface SelectedElement {
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
interface BrowserContext {
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
interface ConsoleLog {
    type: 'log' | 'warn' | 'error' | 'info' | 'debug';
    message: string;
    timestamp: string;
    stack?: string;
}
interface NetworkLog {
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
interface SubmitResponse {
    success: boolean;
    bugId: string;
    message: string;
}
interface ExistingBug {
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

declare class BugRadarClient {
    private config;
    private initialized;
    private sessionId;
    private consoleCapture;
    private networkCapture;
    private widget;
    private bugOverlay;
    constructor();
    /**
     * Initialize BugRadar with your API key
     */
    init(apiKeyOrConfig: string | BugRadarConfig): void;
    /**
     * Manually capture and report an error
     */
    captureError(error: Error, additionalData?: Record<string, unknown>): Promise<void>;
    /**
     * Manually capture a message/feedback
     */
    captureMessage(title: string, description?: string, priority?: BugReport['priority']): Promise<void>;
    /**
     * Open the bug reporter widget
     */
    open(): void;
    /**
     * Close the bug reporter widget
     */
    close(): void;
    /**
     * Set user identifier for tracking
     */
    setUser(identifier: string): void;
    /**
     * Set additional metadata
     */
    setMetadata(metadata: Record<string, unknown>): void;
    /**
     * Show bug overlay badges on elements with existing bugs
     * @param bugs - Array of existing bugs to display
     */
    showBugOverlays(bugs: ExistingBug[]): void;
    /**
     * Initialize bug overlays - fetches bugs from API for current page
     */
    initBugOverlays(): Promise<void>;
    /**
     * Hide all bug overlay badges
     */
    hideBugOverlays(): void;
    /**
     * Destroy the SDK instance
     */
    destroy(): void;
    private setupAutoCapture;
    private submitReport;
}
declare const BugRadar: BugRadarClient;

export { type BrowserContext, BugRadar, type BugRadarConfig, type BugReport, type ConsoleLog, type ExistingBug, type NetworkLog, type SelectedElement, type SubmitResponse };
