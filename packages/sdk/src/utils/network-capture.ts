import type { NetworkLog } from '../types';

export class NetworkCapture {
  private logs: NetworkLog[] = [];
  private maxLogs: number;
  private originalFetch: typeof fetch;
  private originalXHROpen: typeof XMLHttpRequest.prototype.open;
  private originalXHRSend: typeof XMLHttpRequest.prototype.send;

  constructor(maxLogs: number = 20) {
    this.maxLogs = maxLogs;
    this.originalFetch = window.fetch.bind(window);
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    this.originalXHRSend = XMLHttpRequest.prototype.send;
  }

  start(): void {
    this.interceptFetch();
    this.interceptXHR();
  }

  stop(): void {
    window.fetch = this.originalFetch;
    XMLHttpRequest.prototype.open = this.originalXHROpen;
    XMLHttpRequest.prototype.send = this.originalXHRSend;
  }

  private interceptFetch(): void {
    const self = this;

    window.fetch = async function (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> {
      const startTime = Date.now();
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || 'GET';

      const log: NetworkLog = {
        method: method.toUpperCase(),
        url,
        timestamp: new Date().toISOString(),
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
        log.error = error instanceof Error ? error.message : 'Network error';
        log.duration = Date.now() - startTime;
        self.addLog(log);
        throw error;
      }
    };
  }

  private interceptXHR(): void {
    const self = this;

    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      async: boolean = true,
      username?: string | null,
      password?: string | null
    ): void {
      (this as any)._bugradar = {
        method: method.toUpperCase(),
        url: url.toString(),
        startTime: 0,
      };

      return self.originalXHROpen.call(
        this,
        method,
        url,
        async,
        username ?? undefined,
        password ?? undefined
      );
    };

    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null): void {
      const xhr = this;
      const meta = (xhr as any)._bugradar;

      if (meta) {
        meta.startTime = Date.now();

        xhr.addEventListener('loadend', function () {
          const log: NetworkLog = {
            method: meta.method,
            url: meta.url,
            status: xhr.status,
            statusText: xhr.statusText,
            duration: Date.now() - meta.startTime,
            timestamp: new Date().toISOString(),
          };

          if (xhr.status === 0) {
            log.error = 'Request failed or was aborted';
          }

          self.addLog(log);
        });
      }

      return self.originalXHRSend.call(this, body);
    };
  }

  private addLog(log: NetworkLog): void {
    // Skip BugRadar API calls
    if (log.url.includes('bugradar')) {
      return;
    }

    this.logs.push(log);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(): NetworkLog[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}
