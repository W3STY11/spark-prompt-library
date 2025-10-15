// PASTE THIS INTO YOUR CHROME CONSOLE ON M365 COPILOT PAGE
// Press F12 → Console tab → Paste this entire code → Press Enter

(function() {
    'use strict';

    console.log('[Spark] Initializing M365 Copilot integration...');

    const CONFIG = {
        libraryUrl: 'http://localhost:3002',
        inputSelector: '#m365-chat-editor-target-element',
        sidecarWidth: '450px',
        messageType: 'SPARK_SEND_TO_COPILOT'
    };

    let libraryWindow = null;
    let sidecarOpen = false;
    let currentPromptDetails = null;

    function createFloatingButton() {
        // Remove old button if exists
        const oldButton = document.getElementById('spark-floating-btn');
        if (oldButton) oldButton.remove();

        const button = document.createElement('button');
        button.id = 'spark-floating-btn';
        button.innerHTML = '⚡';
        button.title = 'Open Spark AI Prompt Library';

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
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            zIndex: '10000',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        });

        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        });

        button.addEventListener('click', () => {
            console.log('[Spark] Opening library...');
            if (libraryWindow && !libraryWindow.closed) {
                libraryWindow.focus();
            } else {
                libraryWindow = window.open(
                    CONFIG.libraryUrl,
                    'SparkPromptLibrary',
                    'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no'
                );
            }
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes spark-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            #spark-floating-btn {
                animation: spark-pulse 2s ease-in-out infinite;
            }
            #spark-floating-btn:hover {
                animation: none;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(button);
        console.log('[Spark] Floating button added');
    }

    function createSidecar() {
        // Remove old sidecar if exists
        const oldOverlay = document.getElementById('spark-sidecar-overlay');
        const oldSidecar = document.getElementById('spark-sidecar');
        if (oldOverlay) oldOverlay.remove();
        if (oldSidecar) oldSidecar.remove();

        const overlay = document.createElement('div');
        overlay.id = 'spark-sidecar-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: '9998',
            display: 'none',
            transition: 'opacity 0.3s ease'
        });

        overlay.addEventListener('click', closeSidecar);

        const sidecar = document.createElement('div');
        sidecar.id = 'spark-sidecar';
        Object.assign(sidecar.style, {
            position: 'fixed',
            top: '0',
            right: '-450px',
            width: CONFIG.sidecarWidth,
            height: '100vh',
            background: 'white',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
            zIndex: '9999',
            transition: 'right 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        });

        const header = document.createElement('div');
        Object.assign(header.style, {
            padding: '20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
        });

        const headerTitle = document.createElement('div');
        headerTitle.innerHTML = '<strong style="font-size: 18px;">⚡ Spark Prompt</strong>';

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.title = 'Close';
        Object.assign(closeBtn.style, {
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px'
        });
        closeBtn.addEventListener('click', closeSidecar);
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.background = 'transparent';
        });

        header.appendChild(headerTitle);
        header.appendChild(closeBtn);

        const content = document.createElement('div');
        content.id = 'spark-sidecar-content';
        Object.assign(content.style, {
            flex: '1',
            padding: '20px',
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#374151'
        });

        sidecar.appendChild(header);
        sidecar.appendChild(content);

        document.body.appendChild(overlay);
        document.body.appendChild(sidecar);

        console.log('[Spark] Sidecar panel created');
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

        let html = `
            <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <span style="font-size: 36px;">${promptDetails.icon}</span>
                    <div>
                        <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #111827;">${promptDetails.title}</h2>
                        <div style="display: flex; gap: 8px; margin-top: 6px;">
                            <span style="background: #667eea; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;">${promptDetails.department}</span>
                            <span style="background: #e5e7eb; color: #374151; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;">${promptDetails.complexity}</span>
                        </div>
                    </div>
                </div>
                ${promptDetails.subcategory ? `<p style="color: #6b7280; margin: 0 0 12px 0; font-weight: 500;">${promptDetails.subcategory}</p>` : ''}
                <p style="color: #4b5563; margin: 0;">${promptDetails.description}</p>
            </div>
        `;

        if (promptDetails.tips && promptDetails.tips.length > 0) {
            html += `
                <div style="margin-bottom: 20px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #111827;">💡 Tips</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${promptDetails.tips.map(tip => `<li style="margin-bottom: 8px; color: #4b5563;">${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (promptDetails.tags && promptDetails.tags.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #111827;">🏷️ Tags</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${promptDetails.tags.map(tag => `<span style="background: #e5e7eb; color: #374151; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;">${tag}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        content.innerHTML = html;

        overlay.style.display = 'block';
        setTimeout(() => {
            overlay.style.opacity = '1';
            sidecar.style.right = '0';
        }, 10);

        sidecarOpen = true;
        console.log('[Spark] Sidecar opened with prompt:', promptDetails.title);
    }

    function closeSidecar() {
        const overlay = document.getElementById('spark-sidecar-overlay');
        const sidecar = document.getElementById('spark-sidecar');

        if (overlay && sidecar) {
            sidecar.style.right = '-450px';
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }

        sidecarOpen = false;
        currentPromptDetails = null;
        console.log('[Spark] Sidecar closed');
    }

    function insertPromptText(promptText) {
        const inputElement = document.querySelector(CONFIG.inputSelector);

        if (!inputElement) {
            console.error('[Spark] Input element not found:', CONFIG.inputSelector);
            alert('Could not find Copilot input field. Please refresh the page and try again.');
            return false;
        }

        try {
            inputElement.focus();

            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(inputElement);
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('delete', false);

            const success = document.execCommand('insertText', false, promptText);

            if (!success) {
                console.warn('[Spark] execCommand failed, trying fallback method');
                inputElement.textContent = promptText;

                const events = [
                    new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType: 'insertText', data: promptText }),
                    new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: promptText }),
                    new Event('change', { bubbles: true, cancelable: true }),
                    new KeyboardEvent('keyup', { bubbles: true, cancelable: true })
                ];

                events.forEach(event => inputElement.dispatchEvent(event));
            }

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

            console.log('[Spark] Prompt text inserted successfully (simulated typing)');
            return true;
        } catch (error) {
            console.error('[Spark] Error inserting prompt:', error);

            try {
                navigator.clipboard.writeText(promptText).then(() => {
                    alert('Could not insert text automatically. Prompt copied to clipboard - please paste (Ctrl+V) into Copilot.');
                    console.log('[Spark] Fallback: Text copied to clipboard');
                });
            } catch (clipboardError) {
                alert('Error inserting prompt. Please copy manually from the sidecar.');
            }

            return false;
        }
    }

    function setupMessageListener() {
        window.addEventListener('message', (event) => {
            if (!event.origin.includes('localhost:3002')) {
                return;
            }

            if (event.data.type !== CONFIG.messageType) {
                return;
            }

            console.log('[Spark] Received message from library:', event.data);

            const { promptText, promptDetails } = event.data;

            if (!promptText) {
                console.error('[Spark] No prompt text in message');
                return;
            }

            const success = insertPromptText(promptText);

            if (success && promptDetails) {
                openSidecar(promptDetails);
            }
        });

        console.log('[Spark] Message listener setup complete');
    }

    createFloatingButton();
    createSidecar();
    setupMessageListener();
    console.log('[Spark] Integration complete! ⚡');

    alert('✅ Spark button installed! Look for the purple ⚡ button in bottom-right corner.');
})();
