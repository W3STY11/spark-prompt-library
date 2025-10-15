# Spark M365 Copilot Integration - Installation Guide

## Overview
This userscript adds a floating ⚡ button to your M365 Copilot interface that opens the Spark AI Prompt Library. When you select a prompt and click "Send to Copilot", it automatically inserts the prompt text and displays full details in a sidecar panel.

## Prerequisites
- **Tampermonkey** browser extension installed
  - Chrome: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
  - Edge: https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd
- **Development server** running on `http://localhost:3002`
- Access to **M365 Copilot** at `https://m365.cloud.microsoft/chat/`

## Installation Steps

### 1. Install Tampermonkey
If you haven't already:
1. Open your browser (Chrome, Edge, etc.)
2. Go to your browser's extension store
3. Search for "Tampermonkey"
4. Click "Add to browser" / "Install"
5. Accept the permissions

### 2. Start the Development Server
Make sure your Spark library is running:
```bash
cd "/home/aiwithnick/AI Prompts v5_BACKUP/prompt-library-site-v3"
npm run dev
```

Verify it's accessible at: http://localhost:3002

### 3. Install the Userscript
1. Click the **Tampermonkey icon** in your browser toolbar
2. Click **"Create a new script..."** or **"Dashboard"** → **"+"** button
3. **Delete all default content** in the editor
4. **Copy the entire contents** of `spark-m365-copilot.user.js`
5. **Paste** into the Tampermonkey editor
6. Click **File → Save** or press `Ctrl+S`
7. Close the tab

### 4. Enable the Script
1. Click the Tampermonkey icon
2. You should see "Spark AI Prompt Library - M365 Copilot Integration"
3. Make sure it's **toggled ON** (enabled)

### 5. Test It Out!
1. Navigate to **M365 Copilot**: https://m365.cloud.microsoft/chat/
2. You should see a **purple ⚡ button** in the bottom-right corner
3. Click it to open the Spark library
4. Browse prompts and click **"🚀 Send to Copilot"**
5. The prompt text should appear in the Copilot input
6. A **sidecar panel** should slide in from the right with full details

## How It Works

### User Flow
```
M365 Copilot Page
    ↓
Click ⚡ Button (bottom-right)
    ↓
Library Opens (localhost:3002)
    ↓
Browse & Select Prompt
    ↓
Click "🚀 Send to Copilot"
    ↓
Prompt Inserted + Sidecar Opens
```

### Technical Flow
1. **Floating Button**: Injected by userscript on M365 page
2. **Library Opens**: Uses `window.open()` to create child window
3. **Message Sending**: Library uses `window.opener.postMessage()` to send data
4. **Message Receiving**: Userscript listens for messages from library origin
5. **Prompt Insertion**: Sets text in `#m365-chat-editor-target-element` (contenteditable SPAN)
6. **Sidecar Display**: Shows tips, tags, and full prompt details

## Features

### Floating ⚡ Button
- **Location**: Bottom-right corner, 24px from edges
- **Size**: 60px circular
- **Style**: Gradient purple with pulse animation
- **Behavior**: Opens library in new window, focuses existing window if already open

### Sidecar Panel
- **Width**: 450px
- **Position**: Slides in from right side
- **Content**:
  - Prompt icon, title, department, complexity
  - Full description
  - Tips section (if available)
  - Tags section (if available)
- **Close**: Click overlay or X button

### Prompt Insertion
- **Target**: M365 Copilot input field
- **Method**: Sets `textContent` on contenteditable element
- **Events**: Triggers input/change events for React reactivity
- **Cursor**: Auto-focuses and moves cursor to end

## Troubleshooting

### Button Doesn't Appear
- Check Tampermonkey is installed and enabled
- Verify script is enabled in Tampermonkey dashboard
- Check console for errors: F12 → Console tab
- Look for: `[Spark] Integration complete! ⚡`

### Library Doesn't Open
- Verify dev server is running: http://localhost:3002
- Check for popup blockers
- Make sure script has correct URL in CONFIG

### Prompt Doesn't Insert
- Check console for: `[Spark] Prompt text inserted successfully`
- Verify input selector: `#m365-chat-editor-target-element`
- M365 Copilot interface may have changed (check DOM)

### Sidecar Doesn't Open
- Check console for: `[Spark] Sidecar opened with prompt: [title]`
- Verify message includes `promptDetails` object
- Check browser console for JavaScript errors

### Message Not Received
- Check console for: `[Spark] Received message from library:`
- Verify library URL matches origin check
- Check `window.opener` exists (library opened from button)

## Console Debugging
The userscript logs all major actions to the console. Open DevTools (F12) and look for `[Spark]` prefixed messages:

```
[Spark] Initializing M365 Copilot integration...
[Spark] Floating button added
[Spark] Sidecar panel created
[Spark] Message listener setup complete
[Spark] Integration complete! ⚡
[Spark] Opening library...
[Spark] Received message from library: {type, promptText, promptDetails}
[Spark] Prompt text inserted successfully
[Spark] Sidecar opened with prompt: [title]
```

## Configuration
Edit these values in the userscript if needed (lines 17-22):

```javascript
const CONFIG = {
    libraryUrl: 'http://localhost:3002',        // Change if using different port
    inputSelector: '#m365-chat-editor-target-element',  // M365 input field ID
    sidecarWidth: '450px',                      // Sidecar panel width
    messageType: 'SPARK_SEND_TO_COPILOT'       // Message type identifier
};
```

## Updating the Script
1. Edit `spark-m365-copilot.user.js` in your editor
2. Copy updated content
3. Open Tampermonkey dashboard
4. Click on the script name
5. Replace content and save
6. Refresh M365 Copilot page

## Security Notes
- Script only runs on M365 Copilot domain
- Messages only accepted from library origin (localhost:3002)
- No external requests or data collection
- All communication stays local

## Browser Compatibility
- ✅ Chrome/Chromium
- ✅ Microsoft Edge
- ✅ Firefox (with Tampermonkey)
- ✅ Safari (with Tampermonkey)
- ✅ Brave

## Support
If issues persist:
1. Check browser console for errors
2. Verify all prerequisites are met
3. Try disabling/re-enabling the script
4. Restart browser
5. Check if M365 Copilot interface has changed

## Version History
- **v1.0.0** (2025-10-14): Initial release
  - Floating button injection
  - Library window management
  - Cross-tab messaging
  - Prompt insertion
  - Sidecar panel with full details
