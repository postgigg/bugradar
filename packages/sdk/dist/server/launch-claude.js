"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/server/launch-claude.ts
var launch_claude_exports = {};
__export(launch_claude_exports, {
  POST: () => POST,
  default: () => handler,
  launchClaude: () => launchClaude
});
module.exports = __toCommonJS(launch_claude_exports);
var import_child_process = require("child_process");
var import_util = require("util");
var os = __toESM(require("os"));
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var execAsync = (0, import_util.promisify)(import_child_process.exec);
async function POST(request) {
  try {
    const body = await request.json();
    const result = await launchClaude(body);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: "Failed to launch terminal",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const result = await launchClaude(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to launch terminal",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
async function launchClaude(body) {
  const { bugId, bugTitle, description, pageUrl, consoleErrors, projectPath, prompt } = body;
  console.log("[BugRadar] Launching Claude for bug:", bugId);
  const targetPath = projectPath || process.cwd();
  const platform2 = os.platform();
  const fixPrompt = prompt || buildPrompt({ bugId, bugTitle, description, pageUrl, consoleErrors });
  const tempDir = os.tmpdir();
  const promptFile = path.join(tempDir, `bugradar-prompt-${bugId.slice(0, 8)}.txt`);
  fs.writeFileSync(promptFile, fixPrompt);
  if (platform2 === "darwin") {
    const appleScript = `
set promptText to read POSIX file "${promptFile}"
set the clipboard to promptText

tell application "Terminal"
    activate
    do script "cd '${targetPath}' && clear && echo '\u{1F41B} BugRadar: Starting Claude Code...' && echo '' && claude"
    delay 6
end tell

tell application "System Events"
    tell process "Terminal"
        set frontmost to true
        delay 0.3
        key code 48 using {shift down}
        delay 0.8
        keystroke "v" using {command down}
        delay 0.8
        key code 36
    end tell
end tell
`;
    await execAsync(`osascript -e '${appleScript.replace(/'/g, `'"'"'`)}'`);
  } else if (platform2 === "linux") {
    const script = `#!/bin/bash
cd "${targetPath}"
cat "${promptFile}" | xclip -selection clipboard 2>/dev/null || cat "${promptFile}" | xsel --clipboard 2>/dev/null
gnome-terminal -- bash -c 'cd "${targetPath}" && echo "\u{1F41B} BugRadar: Starting Claude Code..." && claude' &
sleep 4
xdotool key shift+Tab
sleep 0.5
xdotool key ctrl+v
sleep 0.5
xdotool key Return
`;
    const scriptPath = path.join(tempDir, `bugradar-launch-${bugId.slice(0, 8)}.sh`);
    fs.writeFileSync(scriptPath, script, { mode: 493 });
    (0, import_child_process.exec)(`bash ${scriptPath}`);
  } else if (platform2 === "win32") {
    const psScript = `
Get-Content "${promptFile.replace(/\\/g, "\\\\")}" | Set-Clipboard
Start-Process cmd -ArgumentList '/k', 'cd /d "${targetPath.replace(/\\/g, "\\\\")}" && claude'
Start-Sleep -Seconds 4
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.SendKeys]::SendWait("+{TAB}")
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait("^v")
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
`;
    const psPath = path.join(tempDir, `bugradar-launch-${bugId.slice(0, 8)}.ps1`);
    fs.writeFileSync(psPath, psScript);
    (0, import_child_process.exec)(`powershell -ExecutionPolicy Bypass -File "${psPath}"`);
  }
  return { success: true, platform: platform2, projectPath: targetPath };
}
function buildPrompt(data) {
  return `# \u{1F41B} BugRadar Bug Fix Request

## Bug Details
- **ID:** ${data.bugId}
${data.bugTitle ? `- **Title:** ${data.bugTitle}` : ""}
${data.pageUrl ? `- **Page URL:** ${data.pageUrl}` : ""}

## Description
${data.description || "No description provided."}

${data.consoleErrors?.length ? `## Console Errors
\`\`\`
${data.consoleErrors.slice(0, 10).join("\n")}
\`\`\`
` : ""}

## Your Task
1. Analyze the bug
2. Find the root cause
3. Implement a fix
4. Test it works

## Webhook (send when done)
\`\`\`bash
curl -X POST "https://bugradar.io/api/webhooks/claude-code" \\
  -H "Content-Type: application/json" \\
  -d '{"bugId":"${data.bugId}","event":"fix_completed","summary":"YOUR_SUMMARY","filesChanged":["file.tsx"]}'
\`\`\`
`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  POST,
  launchClaude
});
