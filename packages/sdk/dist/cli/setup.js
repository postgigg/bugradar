#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/cli/setup.ts
var import_child_process = require("child_process");
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var os = __toESM(require("os"));
var APP_NAME = "BugRadar Launcher";
var APP_BUNDLE_ID = "io.bugradar.launcher";
var PROTOCOL = "bugradar";
function main() {
  const platform2 = os.platform();
  if (platform2 !== "darwin") {
    console.log("\u26A0\uFE0F  BugRadar auto-launch currently only supports macOS.");
    console.log('   On other platforms, use the "Copy Command" button instead.');
    process.exit(0);
  }
  console.log("\u{1F41B} BugRadar Setup");
  console.log("================\n");
  console.log('This will install a URL handler so "Quick Fix" can auto-open Terminal.\n');
  try {
    installMacOSApp();
    console.log("\n\u2705 Setup complete!");
    console.log('\nThe "Quick Fix" button in BugRadar overlays will now');
    console.log("automatically open Terminal with Claude Code.\n");
  } catch (error) {
    console.error("\n\u274C Setup failed:", error);
    process.exit(1);
  }
}
function installMacOSApp() {
  const appDir = path.join(os.homedir(), "Applications", `${APP_NAME}.app`);
  const contentsDir = path.join(appDir, "Contents");
  const macosDir = path.join(contentsDir, "MacOS");
  const resourcesDir = path.join(contentsDir, "Resources");
  console.log(`\u{1F4E6} Installing ${APP_NAME}...`);
  fs.mkdirSync(macosDir, { recursive: true });
  fs.mkdirSync(resourcesDir, { recursive: true });
  const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundleIdentifier</key>
    <string>${APP_BUNDLE_ID}</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>LSUIElement</key>
    <true/>
    <key>CFBundleURLTypes</key>
    <array>
        <dict>
            <key>CFBundleURLName</key>
            <string>BugRadar Protocol</string>
            <key>CFBundleURLSchemes</key>
            <array>
                <string>${PROTOCOL}</string>
            </array>
        </dict>
    </array>
</dict>
</plist>`;
  fs.writeFileSync(path.join(contentsDir, "Info.plist"), infoPlist);
  const launcherScript = `#!/bin/bash
# BugRadar Launcher - handles bugradar:// URLs

URL="$1"

# Parse URL: bugradar://launch?path=/path/to/project&bug=bugId&prompt=base64prompt
if [[ "$URL" =~ bugradar://launch\\?(.+) ]]; then
    PARAMS="\${BASH_REMATCH[1]}"

    # Extract parameters
    PROJECT_PATH=""
    BUG_ID=""
    PROMPT_B64=""

    IFS='&' read -ra PAIRS <<< "$PARAMS"
    for pair in "\${PAIRS[@]}"; do
        IFS='=' read -r key value <<< "$pair"
        value=$(python3 -c "import urllib.parse; print(urllib.parse.unquote('$value'))")
        case "$key" in
            path) PROJECT_PATH="$value" ;;
            bug) BUG_ID="$value" ;;
            prompt) PROMPT_B64="$value" ;;
        esac
    done

    if [ -n "$PROMPT_B64" ]; then
        # Decode prompt and write to temp file
        PROMPT_FILE="/tmp/bugradar-prompt-\${BUG_ID:0:8}.txt"
        echo "$PROMPT_B64" | base64 -d > "$PROMPT_FILE"

        # Copy to clipboard
        cat "$PROMPT_FILE" | pbcopy

        # Open Terminal with Claude
        osascript -e "
tell application \\"Terminal\\"
    activate
    do script \\"cd '$PROJECT_PATH' && clear && echo '\u{1F41B} BugRadar: Starting Claude Code...' && echo '' && claude\\"
    delay 5
end tell

tell application \\"System Events\\"
    tell process \\"Terminal\\"
        set frontmost to true
        delay 0.3
        key code 48 using {shift down}
        delay 0.8
        keystroke \\"v\\" using {command down}
        delay 0.8
        key code 36
    end tell
end tell
"
    fi
fi
`;
  const launcherPath = path.join(macosDir, "launcher");
  fs.writeFileSync(launcherPath, launcherScript);
  fs.chmodSync(launcherPath, "755");
  console.log(`   Created app at: ${appDir}`);
  console.log("\u{1F517} Registering URL protocol handler...");
  (0, import_child_process.execSync)(`/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "${appDir}"`);
  console.log("   Registered bugradar:// protocol");
}
main();
