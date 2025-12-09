import type { ConsoleLog } from '../types';

export class ConsoleCapture {
  private logs: ConsoleLog[] = [];
  private maxLogs: number;
  private originalConsole: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    info: typeof console.info;
    debug: typeof console.debug;
  };

  constructor(maxLogs: number = 50) {
    this.maxLogs = maxLogs;
    this.originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    };
  }

  start(): void {
    const methods: Array<'log' | 'warn' | 'error' | 'info' | 'debug'> = [
      'log', 'warn', 'error', 'info', 'debug'
    ];

    methods.forEach((method) => {
      console[method] = (...args: unknown[]) => {
        this.capture(method, args);
        this.originalConsole[method](...args);
      };
    });

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.capture('error', [event.message], event.error?.stack);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.capture('error', [`Unhandled Promise Rejection: ${event.reason}`]);
    });
  }

  stop(): void {
    console.log = this.originalConsole.log;
    console.warn = this.originalConsole.warn;
    console.error = this.originalConsole.error;
    console.info = this.originalConsole.info;
    console.debug = this.originalConsole.debug;
  }

  private capture(
    type: ConsoleLog['type'],
    args: unknown[],
    stack?: string
  ): void {
    const message = args
      .map((arg) => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');

    const log: ConsoleLog = {
      type,
      message: message.slice(0, 1000), // Limit message size
      timestamp: new Date().toISOString(),
      ...(stack && { stack: stack.slice(0, 2000) }),
    };

    this.logs.push(log);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs(): ConsoleLog[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}
