#!/usr/bin/env node
/**
 * BugRadar Setup CLI
 *
 * Registers the bugradar:// URL protocol handler on macOS.
 * Run once with: npx bugradar-setup
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const APP_NAME = 'BugRadar Launcher';
const APP_BUNDLE_ID = 'io.bugradar.launcher';
const PROTOCOL = 'bugradar';

function main() {
  const platform = os.platform();

  if (platform !== 'darwin') {
    console.log('⚠️  BugRadar auto-launch currently only supports macOS.');
    console.log('   On other platforms, use the "Copy Command" button instead.');
    process.exit(0);
  }

  console.log('🐛 BugRadar Setup');
  console.log('================\n');
  console.log('This will install a URL handler so "Quick Fix" can auto-open Terminal.\n');

  try {
    installMacOSApp();
    console.log('\n✅ Setup complete!');
    console.log('\nThe "Quick Fix" button in BugRadar overlays will now');
    console.log('automatically open Terminal with Claude Code.\n');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

function installMacOSApp() {
  const appDir = path.join(os.homedir(), 'Applications', `${APP_NAME}.app`);
  const contentsDir = path.join(appDir, 'Contents');
  const macosDir = path.join(contentsDir, 'MacOS');
  const resourcesDir = path.join(contentsDir, 'Resources');

  console.log(`📦 Installing ${APP_NAME}...`);

  // Create app structure
  fs.mkdirSync(macosDir, { recursive: true });
  fs.mkdirSync(resourcesDir, { recursive: true });

  // Create Info.plist
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

  fs.writeFileSync(path.join(contentsDir, 'Info.plist'), infoPlist);

  // Create the launcher script
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
    do script \\"cd '$PROJECT_PATH' && clear && echo '🐛 BugRadar: Starting Claude Code...' && echo '' && claude\\"
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

  const launcherPath = path.join(macosDir, 'launcher');
  fs.writeFileSync(launcherPath, launcherScript);
  fs.chmodSync(launcherPath, '755');

  console.log(`   Created app at: ${appDir}`);

  // Register the URL scheme
  console.log('🔗 Registering URL protocol handler...');

  // Touch the app to update LaunchServices database
  execSync(`/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f "${appDir}"`);

  console.log('   Registered bugradar:// protocol');
}

main();
