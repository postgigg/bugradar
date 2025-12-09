/**
 * BugRadar Terminal Launch Helper
 *
 * === Next.js App Router ===
 * // app/api/bugradar/launch-claude/route.ts
 * export { POST } from 'bugradar/server'
 *
 * === Next.js Pages Router ===
 * // pages/api/bugradar/launch-claude.ts
 * export { default } from 'bugradar/server'
 *
 * === Express / Vite / Node.js ===
 * // server.js or routes/bugradar.js
 * import { launchClaude } from 'bugradar/server'
 * app.post('/api/bugradar/launch-claude', async (req, res) => {
 *   const result = await launchClaude(req.body)
 *   res.json(result)
 * })
 */
interface LaunchRequest {
    bugId: string;
    bugTitle?: string;
    description?: string;
    pageUrl?: string;
    consoleErrors?: string[];
    projectPath?: string;
    prompt?: string;
}
declare function POST(request: Request): Promise<Response>;
declare function handler(req: any, res: any): Promise<any>;
declare function launchClaude(body: LaunchRequest): Promise<{
    success: boolean;
    platform: NodeJS.Platform;
    projectPath: string;
}>;

export { POST, handler as default, launchClaude };
