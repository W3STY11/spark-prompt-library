// ==UserScript==
// @name         Spark AI Prompt Library - M365 Copilot Integration
// @namespace    https://localhost:3002/
// @version      1.2.1
// @description  Adds draggable floating button and beautiful sidecar to M365 Copilot (v1.2.1: FIXED drag-to-open bug, formatted prompts, opens in Chrome tab)
// @author       Nicholas Westburg / Treasury FinOps
// @match        https://m365.cloud.microsoft/chat/*
// @match        https://m365.cloud.microsoft/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('[Spark] Initializing M365 Copilot integration v1.2.1...');

    // ==========================================
    // CONFIGURATION
    // ==========================================
    const CONFIG = {
        libraryUrl: 'http://localhost:3000',
        inputSelector: '#m365-chat-editor-target-element',
        sidecarWidth: '500px',
        messageType: 'SPARK_SEND_TO_COPILOT'
    };

    // ==========================================
    // STATE MANAGEMENT
    // ==========================================
    let libraryWindow = null;
    let sidecarOpen = false;
    let currentPromptDetails = null;
    let isDragging = false;
    let hasDragged = false; // Track if actual dragging occurred (vs just a click)
    let dragOffset = { x: 0, y: 0 };
    let dragStartPos = { x: 0, y: 0 }; // Store starting position to detect drag distance

    // ==========================================
    // FLOATING BUTTON (DRAGGABLE)
    // ==========================================
    function createFloatingButton() {
        const button = document.createElement('button');
        button.id = 'spark-floating-btn';
        button.innerHTML = '⚡';
        button.title = 'Drag to move | Click to open Spark AI Prompt Library';

        // Styles
        Object.assign(button.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '32px',
            cursor: 'grab',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            zIndex: '10000',
            transition: 'box-shadow 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            userSelect: 'none'
        });

        // Hover effect
        button.addEventListener('mouseenter', () => {
            if (!isDragging) {
                button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }
        });

        button.addEventListener('mouseleave', () => {
            if (!isDragging) {
                button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }
        });

        // Draggable functionality
        button.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Only left mouse button

            isDragging = true;
            hasDragged = false; // Reset - we don't know if this will be a drag or click yet
            button.style.cursor = 'grabbing';
            button.style.transition = 'none'; // Disable transitions while dragging

            // Calculate offset from mouse to button position
            const rect = button.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;

            // Store starting position to detect movement distance
            dragStartPos.x = e.clientX;
            dragStartPos.y = e.clientY;

            e.preventDefault();
            e.stopPropagation();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // Calculate distance moved from starting position
            const distanceMoved = Math.sqrt(
                Math.pow(e.clientX - dragStartPos.x, 2) +
                Math.pow(e.clientY - dragStartPos.y, 2)
            );

            // If moved more than 5px, consider it a drag (not just a click)
            if (distanceMoved > 5) {
                hasDragged = true;
            }

            // Calculate new position
            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;

            // Keep button within viewport bounds
            const maxX = window.innerWidth - button.offsetWidth;
            const maxY = window.innerHeight - button.offsetHeight;

            const constrainedX = Math.max(0, Math.min(x, maxX));
            const constrainedY = Math.max(0, Math.min(y, maxY));

            button.style.left = constrainedX + 'px';
            button.style.top = constrainedY + 'px';
            button.style.right = 'auto';
            button.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                button.style.cursor = 'grab';
                button.style.transition = 'box-shadow 0.3s ease';
            }
        });

        // Click handler - opens library (only if not dragging)
        button.addEventListener('click', (e) => {
            // If we just dragged the button (moved > 5px), don't open the library
            if (hasDragged) {
                console.log('[Spark] Drag detected - preventing library open');
                e.preventDefault();
                e.stopPropagation();
                hasDragged = false; // Reset for next interaction
                return;
            }

            console.log('[Spark] Opening library in new Chrome tab...');

            // Open in new tab in current browser (Chrome, not Chromium)
            libraryWindow = window.open(CONFIG.libraryUrl, '_blank');

            // Focus the new tab
            if (libraryWindow) {
                libraryWindow.focus();
            }
        });

        // Pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spark-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            #spark-floating-btn {
                animation: spark-pulse 2s ease-in-out infinite;
            }
            #spark-floating-btn:active,
            #spark-floating-btn:hover {
                animation: none;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(button);
        console.log('[Spark] Draggable floating button added');
    }

    // ==========================================
    // SIDECAR PANEL (BEAUTIFUL DESIGN)
    // ==========================================
    function createSidecar() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.id = 'spark-sidecar-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: '9998',
            display: 'none',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });

        overlay.addEventListener('click', closeSidecar);

        // Sidecar panel
        const sidecar = document.createElement('div');
        sidecar.id = 'spark-sidecar';
        Object.assign(sidecar.style, {
            position: 'fixed',
            top: '0',
            right: `-${CONFIG.sidecarWidth}`,
            width: CONFIG.sidecarWidth,
            height: '100vh',
            background: 'white',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
            zIndex: '9999',
            transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
        });

        // Header
        const header = document.createElement('div');
        Object.assign(header.style, {
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        });

        const headerTitle = document.createElement('div');
        headerTitle.innerHTML = '<strong style="font-size: 20px; font-weight: 700;">⚡ Spark Prompt</strong>';

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.title = 'Close (Esc)';
        Object.assign(closeBtn.style, {
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'background 0.2s ease'
        });
        closeBtn.addEventListener('click', closeSidecar);
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.25)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.15)';
        });

        header.appendChild(headerTitle);
        header.appendChild(closeBtn);

        // Content area
        const content = document.createElement('div');
        content.id = 'spark-sidecar-content';
        Object.assign(content.style, {
            flex: '1',
            padding: '24px',
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: '1.7',
            color: '#374151'
        });

        sidecar.appendChild(header);
        sidecar.appendChild(content);

        document.body.appendChild(overlay);
        document.body.appendChild(sidecar);

        // Add ESC key listener to close sidecar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidecarOpen) {
                closeSidecar();
            }
        });

        console.log('[Spark] Beautiful sidecar panel created');
    }

    function openSidecar(promptDetails) {
        currentPromptDetails = promptDetails;
        const overlay = document.getElementById('spark-sidecar-overlay');
        const sidecar = document.getElementById('spark-sidecar');
        const content = document.getElementById('spark-sidecar-content');

        if (!overlay || !sidecar || !content) {
            console.error('[Spark] Sidecar elements not found');
            return;
        }

        // Build beautiful content HTML
        let html = `
            <div style="margin-bottom: 24px;">
                <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
                    <span style="font-size: 48px; line-height: 1;">${promptDetails.icon}</span>
                    <div style="flex: 1;">
                        <h2 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 700; color: #111827; line-height: 1.3;">${promptDetails.title}</h2>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);">${promptDetails.department}</span>
                            ${promptDetails.complexity ? `<span style="background: #f3f4f6; color: #6b7280; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;">${promptDetails.complexity}</span>` : ''}
                        </div>
                    </div>
                </div>
                ${promptDetails.subcategory ? `
                    <div style="background: #f9fafb; padding: 12px 16px; border-radius: 8px; border-left: 3px solid #667eea; margin-bottom: 16px;">
                        <span style="color: #667eea; font-weight: 600; font-size: 13px;">📂 ${promptDetails.subcategory}</span>
                    </div>
                ` : ''}
                <p style="color: #4b5563; margin: 0; font-size: 15px; line-height: 1.6;">${promptDetails.description}</p>
            </div>
        `;

        // Word count badge
        if (promptDetails.word_count) {
            html += `
                <div style="margin-bottom: 24px;">
                    <span style="background: #eff6ff; color: #1e40af; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;">
                        📝 ${promptDetails.word_count} words
                    </span>
                </div>
            `;
        }

        // Tips section (beautiful cards)
        if (promptDetails.tips && promptDetails.tips.length > 0) {
            html += `
                <div style="margin-bottom: 24px; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border: 1px solid #fbbf24;">
                    <h3 style="margin: 0 0 14px 0; font-size: 16px; font-weight: 700; color: #92400e; display: flex; align-items: center; gap: 8px;">
                        💡 <span>Pro Tips</span>
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; list-style: none;">
                        ${promptDetails.tips.map(tip => `
                            <li style="margin-bottom: 10px; color: #78350f; position: relative; padding-left: 8px;">
                                <span style="position: absolute; left: -12px; color: #f59e0b;">•</span>
                                ${tip}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        // Tags section (pill style)
        if (promptDetails.tags && promptDetails.tags.length > 0) {
            html += `
                <div style="margin-bottom: 24px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #111827; display: flex; align-items: center; gap: 8px;">
                        🏷️ <span>Tags</span>
                    </h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${promptDetails.tags.map(tag => `
                            <span style="background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); color: #3730a3; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1px solid #a5b4fc;">
                                ${tag}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Success message
        html += `
            <div style="margin-top: 24px; padding: 16px; background: #d1fae5; border-radius: 10px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 500;">
                    ✓ Prompt successfully inserted into Copilot! Customize the placeholders and send.
                </p>
            </div>
        `;

        content.innerHTML = html;

        // Show sidecar with animation
        overlay.style.display = 'block';
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            sidecar.style.right = '0';
        });

        sidecarOpen = true;
        console.log('[Spark] Beautiful sidecar opened with prompt:', promptDetails.title);
    }

    function closeSidecar() {
        const overlay = document.getElementById('spark-sidecar-overlay');
        const sidecar = document.getElementById('spark-sidecar');

        if (overlay && sidecar) {
            sidecar.style.right = `-${CONFIG.sidecarWidth}`;
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }

        sidecarOpen = false;
        currentPromptDetails = null;
        console.log('[Spark] Sidecar closed');
    }

    // ==========================================
    // PROMPT FORMATTING & INSERTION
    // ==========================================
    function formatPromptText(promptText) {
        // Format the prompt with proper line breaks for readability
        let formatted = promptText;

        // Major sections get double line break before, single after (content on new line)
        formatted = formatted.replace(/#CONTEXT:/g, '\n\n#CONTEXT:\n');
        formatted = formatted.replace(/#GOAL:/g, '\n\n#GOAL:\n');
        formatted = formatted.replace(/#RESPONSE GUIDELINES:/g, '\n\n#RESPONSE GUIDELINES:\n');
        formatted = formatted.replace(/#INFORMATION ABOUT ME:/g, '\n\n#INFORMATION ABOUT ME:\n');
        formatted = formatted.replace(/#OUTPUT:/g, '\n\n#OUTPUT:\n');

        // Also handle common variations
        formatted = formatted.replace(/#CONTEXT #/g, '\n\n#CONTEXT\n');
        formatted = formatted.replace(/#GOAL #/g, '\n\n#GOAL\n');

        // Add line breaks before numbered items (1. 2. 3. etc.)
        // But not if they're already on a new line
        formatted = formatted.replace(/([^\n])(\d+\.\s)/g, '$1\n$2');

        // Add blank line before bullet points if they follow text
        formatted = formatted.replace(/([^\n])([\-\*]\s)/g, '$1\n$2');

        // Clean up excessive newlines (max 3 = 2 blank lines)
        formatted = formatted.replace(/\n{4,}/g, '\n\n\n');

        // Trim leading/trailing whitespace
        formatted = formatted.trim();

        console.log('[Spark] Formatted prompt with proper line breaks');
        return formatted;
    }

    function insertPromptText(promptText) {
        const inputElement = document.querySelector(CONFIG.inputSelector);

        if (!inputElement) {
            console.error('[Spark] Input element not found:', CONFIG.inputSelector);
            alert('Could not find Copilot input field. Please refresh the page and try again.');
            return false;
        }

        try {
            // Format the prompt for better readability
            const formattedPrompt = formatPromptText(promptText);

            // Focus the input element
            inputElement.focus();

            // Clear existing content first
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(inputElement);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('delete', false);

            // Simulate typing using execCommand (React-compatible)
            const success = document.execCommand('insertText', false, formattedPrompt);

            if (!success) {
                // Fallback: Try setting textContent and triggering events
                console.warn('[Spark] execCommand failed, trying fallback method');
                inputElement.textContent = formattedPrompt;

                // Dispatch comprehensive set of events for React
                const events = [
                    new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: formattedPrompt }),
                    new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: formattedPrompt }),
                    new Event('change', { bubbles: true, cancelable: true }),
                    new KeyboardEvent('keyup', { bubbles: true, cancelable: true })
                ];

                events.forEach(event => inputElement.dispatchEvent(event));
            }

            // Set cursor to end of text
            setTimeout(() => {
                const range = document.createRange();
                const sel = window.getSelection();

                const textNode = inputElement.childNodes[0] || inputElement;
                const textLength = inputElement.textContent.length;

                if (textLength > 0 && textNode.nodeType === Node.TEXT_NODE) {
                    range.setStart(textNode, textLength);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }

                inputElement.focus();
            }, 10);

            console.log('[Spark] Formatted prompt inserted successfully');
            return true;
        } catch (error) {
            console.error('[Spark] Error inserting prompt:', error);

            // Ultimate fallback: Copy to clipboard
            try {
                const formattedPrompt = formatPromptText(promptText);
                navigator.clipboard.writeText(formattedPrompt).then(() => {
                    alert('Could not insert text automatically. Prompt copied to clipboard - please paste (Ctrl+V) into Copilot.');
                    console.log('[Spark] Fallback: Formatted text copied to clipboard');
                });
            } catch (clipboardError) {
                alert('Error inserting prompt. Please copy manually from the sidecar.');
            }

            return false;
        }
    }

    // ==========================================
    // MESSAGE LISTENER
    // ==========================================
    function setupMessageListener() {
        window.addEventListener('message', (event) => {
            // Validate origin
            if (!event.origin.includes('localhost:3000')) {
                return;
            }

            // Check message type
            if (event.data.type !== CONFIG.messageType) {
                return;
            }

            console.log('[Spark] Received message from library:', event.data);

            const { promptText, promptDetails } = event.data;

            if (!promptText) {
                console.error('[Spark] No prompt text in message');
                return;
            }

            // Insert formatted prompt into input field
            const success = insertPromptText(promptText);

            // Open beautiful sidecar with details
            if (success && promptDetails) {
                openSidecar(promptDetails);
            }
        });

        console.log('[Spark] Message listener setup complete');
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================
    function init() {
        // Wait for page to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Give M365 Copilot time to render
        setTimeout(() => {
            createFloatingButton();
            createSidecar();
            setupMessageListener();
            console.log('[Spark] Integration v1.2.1 complete! ⚡');
            console.log('[Spark] ✓ Draggable button (FIXED: drag no longer opens library)');
            console.log('[Spark] ✓ Beautiful formatted prompts');
            console.log('[Spark] ✓ Opens in Chrome tab');
        }, 1500);
    }

    // Start initialization
    init();

})();
