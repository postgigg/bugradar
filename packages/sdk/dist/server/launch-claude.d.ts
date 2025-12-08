/**
 * BugRadar Terminal Launch Helper
 *
 * Add this to your Next.js project to enable auto-launch from SDK overlays:
 *
 * // app/api/bugradar/launch-claude/route.ts
 * export { POST } from 'bugradar/server'
 *
 * Or for Pages Router:
 * // pages/api/bugradar/launch-claude.ts
 * export { default } from 'bugradar/server'
 */
declare function POST(request: Request): Promise<Response>;
declare function handler(req: any, res: any): Promise<any>;

export { POST, handler as default };
