export { BugRadar } from './client';
export type {
  BugRadarConfig,
  BugReport,
  SelectedElement,
  BrowserContext,
  ConsoleLog,
  NetworkLog,
  SubmitResponse,
  ExistingBug,
} from './types';

// Auto-initialize if API key is in script tag
if (typeof window !== 'undefined') {
  const script = document.currentScript as HTMLScriptElement | null;
  const apiKey = script?.getAttribute('data-api-key');

  if (apiKey) {
    import('./client').then(({ BugRadar }) => {
      BugRadar.init(apiKey);
    });
  }
}
