# Troubleshooting Guide - Spark M365 Copilot Integration

## Problem: Floating ⚡ Button Not Appearing

If you don't see the purple ⚡ button in the bottom-right corner of M365 Copilot, follow these steps:

### Step 1: Check Tampermonkey is Installed and Enabled

1. Look for the **Tampermonkey icon** in your browser toolbar (usually top-right)
2. Click the Tampermonkey icon
3. Verify it shows a number (e.g., "1") indicating active scripts
4. Make sure Tampermonkey itself is enabled (should not say "disabled")

### Step 2: Verify the Script is Installed

1. Click the **Tampermonkey icon** in browser toolbar
2. Click **"Dashboard"**
3. Look for script named: **"Spark AI Prompt Library - M365 Copilot Integration"**
4. Check the **"Enabled"** column has a green checkmark
5. If not enabled, click the toggle to enable it

### Step 3: Check the Script Matches the URL

1. In Tampermonkey Dashboard, click on the script name
2. Verify the header includes these lines:
   ```javascript
   // @match        https://m365.cloud.microsoft/chat/*
   // @match        https://m365.cloud.microsoft/*
   ```
3. Make sure there are no typos or extra characters

### Step 4: Check Browser Console for Errors

1. On the M365 Copilot page, press **F12** to open DevTools
2. Click the **"Console"** tab
3. Look for messages starting with `[Spark]`
4. Expected messages:
   ```
   [Spark] Initializing M365 Copilot integration...
   [Spark] Floating button added
   [Spark] Sidecar panel created
   [Spark] Message listener setup complete
   [Spark] Integration complete! ⚡
   ```
5. If you see **no `[Spark]` messages**, the script is not running

### Step 5: Refresh and Retry

1. **Hard refresh** the M365 Copilot page:
   - Windows/Linux: **Ctrl + Shift + R**
   - Mac: **Cmd + Shift + R**
2. Wait 2-3 seconds for the button to appear
3. Check console again for `[Spark]` messages

### Step 6: Reinstall the Script

If still not working, completely reinstall:

1. **Delete the old script:**
   - Tampermonkey Dashboard → Click trash icon next to script

2. **Create new script:**
   - Click Tampermonkey icon → "Create a new script..."

3. **Copy the entire userscript:**
   - Open: `C:\Users\Nick\OneDrive - Serrala Group GmbH\Spark_AI_Prompt_Library_FINAL\copilot-integration\spark-m365-copilot.user.js`
   - Select ALL (Ctrl+A)
   - Copy (Ctrl+C)

4. **Paste into Tampermonkey:**
   - Delete default template
   - Paste userscript (Ctrl+V)
   - Save (Ctrl+S or File → Save)

5. **Verify it saved:**
   - Check version number in dashboard: **v1.1.0**
   - Check enabled toggle is ON

6. **Refresh M365 Copilot page**

### Step 7: Check for URL Mismatch

Your current M365 Copilot URL should be one of:
- `https://m365.cloud.microsoft/chat/`
- `https://m365.cloud.microsoft/chat/?auth=2`
- `https://m365.cloud.microsoft/chat/[any-path]`

If your URL is different (e.g., different domain), the script won't match. Let me know the exact URL.

### Step 8: Test Script Manually

If still not working, test if JavaScript is blocked:

1. Press **F12** to open console
2. Paste this test code:
   ```javascript
   const testBtn = document.createElement('button');
   testBtn.innerHTML = 'TEST';
   testBtn.style.position = 'fixed';
   testBtn.style.bottom = '24px';
   testBtn.style.right = '24px';
   testBtn.style.zIndex = '99999';
   testBtn.style.padding = '20px';
   testBtn.style.background = 'red';
   testBtn.style.color = 'white';
   document.body.appendChild(testBtn);
   ```
3. Press **Enter**
4. Do you see a red "TEST" button in bottom-right?
   - **YES**: JavaScript works, Tampermonkey issue
   - **NO**: Content Security Policy or browser restrictions

### Common Issues

#### Issue: "Scripts are disabled globally"
**Solution**:
- Click Tampermonkey icon
- Click the toggle at top to enable Tampermonkey globally

#### Issue: "Script shows 0 matches"
**Solution**:
- Script URL pattern doesn't match current page
- Verify you're on `https://m365.cloud.microsoft/chat/`
- Check for typos in `@match` lines

#### Issue: "Tampermonkey icon shows 0"
**Solution**:
- No scripts are active on this page
- Check `@match` patterns in script header
- Verify domain is exactly: `m365.cloud.microsoft`

#### Issue: Console shows "[Spark] Input element not found"
**Solution**:
- Script is running but can't find input field
- Microsoft may have changed their HTML structure
- DOM selector may need updating

#### Issue: CSP (Content Security Policy) Errors
**Solution**:
- Corporate security may block userscripts
- Try in personal browser without restrictions
- Contact IT if corporate restrictions apply

## Quick Diagnostic Checklist

Copy this checklist and check each item:

```
[ ] Tampermonkey extension is installed
[ ] Tampermonkey icon is visible in toolbar
[ ] Tampermonkey is enabled (not disabled)
[ ] Script "Spark AI Prompt Library..." appears in dashboard
[ ] Script has green checkmark (enabled)
[ ] Script version shows 1.1.0
[ ] URL is https://m365.cloud.microsoft/chat/
[ ] Page has been hard refreshed (Ctrl+Shift+R)
[ ] Console shows [Spark] messages
[ ] No red errors in console
[ ] ⚡ button appears in bottom-right
```

## Still Not Working?

If you've completed all steps and still no button, please provide:

1. **Screenshot of Tampermonkey Dashboard** showing the script
2. **Screenshot of browser console** (F12 → Console tab)
3. **Exact URL** you're on (copy from address bar)
4. **Browser name and version** (e.g., Chrome 120, Edge 119)
5. **Any error messages** you see

## Contact

If you continue having issues, provide the above information and we'll debug together.

---

**Last Updated**: October 14, 2025 (v1.1.0)
