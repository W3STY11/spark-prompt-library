// ==UserScript==
// @name         Spark AI Prompt Library - Copilot Integration
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Adds a floating button to Microsoft Copilot Chat for accessing the Spark AI Prompt Library
// @author       Serrala AI Team
// @match        https://copilot.microsoft.com/*
// @match        https://www.bing.com/chat*
// @match        https://www.bing.com/search?q=*&form=*CODEX*
// @icon         data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTMgMkw0IDEzaDdsLTEgOUwxOSAxMmgtN2wxLTEweiIgZmlsbD0iIzYzNjZmMSIgc3Ryb2tlPSIjNjM2NmYxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==
// @grant        GM_addStyle
// @grant        GM_openInTab
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const LIBRARY_URL = 'https://spark-prompts.vercel.app'; // Update with your actual deployment URL
    // For local testing, use: const LIBRARY_URL = 'http://localhost:3002';

    // Add custom styles for the floating button
    GM_addStyle(`
        #spark-prompt-library-btn {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 99999;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 28px;
            color: white;
            animation: spark-pulse 2s ease-in-out infinite;
        }

        #spark-prompt-library-btn:hover {
            transform: scale(1.1) translateY(-2px);
            box-shadow: 0 12px 32px rgba(99, 102, 241, 0.5);
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        }

        #spark-prompt-library-btn:active {
            transform: scale(0.95);
        }

        @keyframes spark-pulse {
            0%, 100% {
                box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
            }
            50% {
                box-shadow: 0 8px 32px rgba(99, 102, 241, 0.6);
            }
        }

        #spark-prompt-library-tooltip {
            position: fixed;
            bottom: 94px;
            right: 24px;
            z-index: 99998;
            background: rgba(17, 24, 39, 0.95);
            backdrop-filter: blur(8px);
            color: white;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        #spark-prompt-library-btn:hover + #spark-prompt-library-tooltip {
            opacity: 1;
        }

        /* Sidecar Panel Styles */
        #spark-sidecar-panel {
            position: fixed;
            top: 0;
            right: -450px;
            width: 450px;
            height: 100vh;
            background: white;
            box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
            z-index: 99997;
            transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
        }

        #spark-sidecar-panel.open {
            right: 0;
        }

        #spark-sidecar-header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
        }

        #spark-sidecar-header h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        #spark-sidecar-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
            font-size: 20px;
        }

        #spark-sidecar-close:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        #spark-sidecar-content {
            flex: 1;
            overflow: hidden;
        }

        #spark-sidecar-iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        #spark-sidecar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(2px);
            z-index: 99996;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        #spark-sidecar-overlay.visible {
            opacity: 1;
            pointer-events: auto;
        }
    `);

    // Wait for page to be fully loaded
    function init() {
        // Check if we're on a Copilot page
        const isCopilotPage = window.location.hostname.includes('copilot.microsoft.com') ||
                             window.location.hostname.includes('bing.com');

        if (!isCopilotPage) return;

        // Create floating button
        const button = document.createElement('button');
        button.id = 'spark-prompt-library-btn';
        button.innerHTML = '⚡';
        button.title = 'Open Spark AI Prompt Library';
        button.setAttribute('aria-label', 'Open Spark AI Prompt Library');

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'spark-prompt-library-tooltip';
        tooltip.textContent = '⚡ Spark Prompt Library';

        // Create sidecar overlay
        const overlay = document.createElement('div');
        overlay.id = 'spark-sidecar-overlay';

        // Create sidecar panel
        const sidecar = document.createElement('div');
        sidecar.id = 'spark-sidecar-panel';
        sidecar.innerHTML = `
            <div id="spark-sidecar-header">
                <h2>⚡ Spark Prompt Library</h2>
                <button id="spark-sidecar-close" aria-label="Close">✕</button>
            </div>
            <div id="spark-sidecar-content">
                <iframe id="spark-sidecar-iframe" src="${LIBRARY_URL}"></iframe>
            </div>
        `;

        // Add click handler to button
        button.addEventListener('click', () => {
            toggleSidecar();
        });

        // Add click handler to close button
        const closeBtn = sidecar.querySelector('#spark-sidecar-close');
        closeBtn.addEventListener('click', () => {
            closeSidecar();
        });

        // Add click handler to overlay
        overlay.addEventListener('click', () => {
            closeSidecar();
        });

        // Append elements to page
        document.body.appendChild(button);
        document.body.appendChild(tooltip);
        document.body.appendChild(overlay);
        document.body.appendChild(sidecar);

        console.log('✅ Spark AI Prompt Library integration loaded successfully');
    }

    function toggleSidecar() {
        const sidecar = document.getElementById('spark-sidecar-panel');
        const overlay = document.getElementById('spark-sidecar-overlay');

        if (sidecar.classList.contains('open')) {
            closeSidecar();
        } else {
            openSidecar();
        }
    }

    function openSidecar() {
        const sidecar = document.getElementById('spark-sidecar-panel');
        const overlay = document.getElementById('spark-sidecar-overlay');

        sidecar.classList.add('open');
        overlay.classList.add('visible');
    }

    function closeSidecar() {
        const sidecar = document.getElementById('spark-sidecar-panel');
        const overlay = document.getElementById('spark-sidecar-overlay');

        sidecar.classList.remove('open');
        overlay.classList.remove('visible');
    }

    // Listen for messages from the library iframe
    window.addEventListener('message', (event) => {
        // Verify message origin (update with your actual domain)
        if (event.origin !== LIBRARY_URL.replace(/\/$/, '')) return;

        if (event.data.type === 'SPARK_SEND_TO_COPILOT') {
            // Handle sending prompt to Copilot
            const promptText = event.data.prompt;
            insertPromptToCopilot(promptText);
            closeSidecar();
        }
    });

    function insertPromptToCopilot(promptText) {
        // Find the Copilot input field
        // Note: Selectors may need to be updated based on Microsoft's UI changes
        const selectors = [
            'textarea[placeholder*="Ask me"]',
            'textarea.textarea',
            'textarea[data-id="chatInput"]',
            '#searchbox',
            'textarea'
        ];

        let inputField = null;
        for (const selector of selectors) {
            inputField = document.querySelector(selector);
            if (inputField) break;
        }

        if (inputField) {
            // Insert the prompt
            inputField.value = promptText;
            inputField.focus();

            // Trigger input event to update any React/Angular state
            const event = new Event('input', { bubbles: true });
            inputField.dispatchEvent(event);

            console.log('✅ Prompt inserted into Copilot chat');
        } else {
            console.warn('⚠️ Could not find Copilot input field');
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(promptText).then(() => {
                alert('Prompt copied to clipboard! Paste it into Copilot Chat.');
            });
        }
    }

    // Initialize when page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
