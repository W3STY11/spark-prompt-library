# Spark M365 Copilot Integration

## What This Is
A Tampermonkey userscript that seamlessly integrates the Spark AI Prompt Library with Microsoft 365 Copilot.

## Quick Start

### 1. Prerequisites
- Tampermonkey browser extension installed
- Spark library running on `http://localhost:3002`
- Access to M365 Copilot

### 2. Install
1. Open Tampermonkey → Create new script
2. Copy contents of `spark-m365-copilot.user.js`
3. Paste and save
4. Navigate to https://m365.cloud.microsoft/chat/

### 3. Use
1. Click the **⚡ button** (bottom-right corner)
2. Browse prompts in the library
3. Click **"🚀 Send to Copilot"** on any prompt
4. Prompt appears in Copilot + sidecar shows details

## Features

### 🔘 Floating Button
- Always visible in bottom-right corner
- Opens library in new window
- Gradient purple with pulse animation
- Hover effect and smooth transitions

### 📝 Prompt Insertion
- Automatically inserts prompt text into Copilot input
- Handles contenteditable elements correctly
- Triggers proper input events for React
- Auto-focuses with cursor at end

### 📑 Sidecar Panel
- **450px width** sliding panel from right
- Shows full prompt details:
  - Icon, title, department, complexity
  - Description
  - Tips (if available)
  - Tags (if available)
- Click overlay or X to close
- Smooth animations

### 🔐 Security
- Only runs on M365 Copilot domain
- Validates message origins
- No external requests
- Local-only communication

## Files

```
copilot-integration/
├── spark-m365-copilot.user.js  # Main userscript
├── INSTALLATION.md             # Detailed installation guide
└── README.md                   # This file
```

## Architecture

### Communication Flow
```
┌─────────────────────┐         ┌─────────────────────┐
│  M365 Copilot Page  │         │   Spark Library     │
│                     │         │  (localhost:3002)   │
│  [Userscript]       │         │                     │
│  - Floating Button  │────┐    │  [View Page]        │
│  - Message Listener │    │    │  - Send Button      │
│  - Sidecar Panel    │    │    │  - postMessage()    │
│  - Prompt Insertion │    │    │                     │
└─────────────────────┘    │    └─────────────────────┘
         ▲                 │              │
         │                 │              │
         │    window.open()│              │
         │    ─────────────┘              │
         │                                │
         │    postMessage()               │
         └────────────────────────────────┘
```

### Key Components

1. **Floating Button** (`createFloatingButton()`)
   - Injected into M365 page
   - Opens library via `window.open()`
   - Manages library window reference

2. **Message Listener** (`setupMessageListener()`)
   - Listens for `postMessage` events
   - Validates origin (localhost:3002)
   - Filters for message type: `SPARK_SEND_TO_COPILOT`

3. **Prompt Inserter** (`insertPromptText()`)
   - Finds input: `#m365-chat-editor-target-element`
   - Sets `textContent` (contenteditable SPAN)
   - Triggers input/change events
   - Manages focus and cursor position

4. **Sidecar Manager** (`createSidecar()`, `openSidecar()`, `closeSidecar()`)
   - Creates overlay + panel elements
   - Renders prompt details dynamically
   - Handles show/hide animations
   - Click-outside-to-close functionality

## Technical Details

### DOM Target
- **Element**: `<span id="m365-chat-editor-target-element">`
- **Type**: contenteditable
- **Role**: `combobox`
- **Label**: "Message Copilot"

### Message Format
```javascript
{
  type: 'SPARK_SEND_TO_COPILOT',
  promptText: 'Full prompt content...',
  promptDetails: {
    id: 'prompt-id',
    title: 'Prompt Title',
    icon: '🎯',
    department: 'Business',
    subcategory: 'Strategy',
    description: 'Brief description',
    complexity: 'intermediate',
    tips: ['Tip 1', 'Tip 2'],
    tags: ['tag1', 'tag2'],
    images: ['img1.png'],
    word_count: 150
  }
}
```

### Initialization Timing
- Waits for `document.readyState !== 'loading'`
- Additional 1.5s delay for M365 React app to render
- Prevents race conditions with dynamic content

### Error Handling
- Console logging for all major actions
- Graceful fallbacks for missing elements
- User alerts for critical failures
- Try-catch blocks around DOM manipulation

## Configuration

Located in userscript lines 17-22:

```javascript
const CONFIG = {
    libraryUrl: 'http://localhost:3002',
    inputSelector: '#m365-chat-editor-target-element',
    sidecarWidth: '450px',
    messageType: 'SPARK_SEND_TO_COPILOT'
};
```

## Browser Support
- ✅ Chrome/Chromium
- ✅ Microsoft Edge (recommended for M365)
- ✅ Firefox
- ✅ Brave
- ✅ Safari

## Troubleshooting

### Button Not Appearing
1. Check Tampermonkey is enabled
2. Verify script is active for m365.cloud.microsoft domain
3. Open console and look for: `[Spark] Integration complete! ⚡`

### Prompt Not Inserting
1. Check input selector in DOM: `#m365-chat-editor-target-element`
2. Verify console shows: `[Spark] Prompt text inserted successfully`
3. M365 interface may have changed - inspect element

### Sidecar Not Opening
1. Ensure `promptDetails` is included in message
2. Check console for: `[Spark] Sidecar opened with prompt:`
3. Look for JavaScript errors in console

See [INSTALLATION.md](./INSTALLATION.md) for detailed troubleshooting.

## Development

### Testing Locally
1. Start dev server: `npm run dev` in library folder
2. Navigate to M365 Copilot
3. Check console for `[Spark]` log messages
4. Test button → library → send → insert flow

### Modifying the Script
1. Edit `spark-m365-copilot.user.js`
2. Update version number in header (line 4)
3. Copy updated content to Tampermonkey
4. Refresh M365 page

### Debugging
Enable verbose logging in console:
```javascript
console.log('[Spark] Your debug message');
```

All major actions already have logging.

## Version
**Current**: v1.0.0 (2025-10-14)

## Author
Nicholas Westburg / Treasury FinOps

## Related Files
- Library source: `/home/aiwithnick/Spark_AI_Prompt_Library_FINAL/src/`
- View page: `src/view.html` (Send to Copilot button)
- View script: `src/js/view.js` (handleSendToCopilot function)

## Next Steps
1. Install Tampermonkey
2. Follow [INSTALLATION.md](./INSTALLATION.md)
3. Test the integration
4. Enjoy seamless prompt selection!
