// Storage keys
const STORAGE_KEYS = {
    PAYMENT: 'visit_count',
    PAYMENT_STATUS: 'has_donated',
    TAILWIND_EDITOR: 'tailwindcss_editor_code',
    REALTIME_HTML: 'realtimehtml_code',
    MARKDOWN_EDITOR: 'markdown_editor_code',
    SVELTE_EDITOR: 'svelte_editor_code',
    SHADER_EDITOR: 'shader_editor_code'
};

// Embed code utility functions
const embed = {
    async copyCode(editor, type = 'editor') {
        try {
            const content = editor.getValue();
            const encoded = btoa(unescape(encodeURIComponent(content)));
            const currentPath = window.location.pathname;
            const embedUrl = `${window.location.origin}${currentPath}#code=${encoded}`;
            const embedCode = `<iframe src="${embedUrl}" style="width: 100%; height: 600px; border: none; border-radius: 4px; overflow: hidden;"></iframe>`;
            
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(embedCode);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = embedCode;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }

            const button = document.getElementById('embedButton');
            button.textContent = 'Copied!';
            
            setTimeout(() => {
                button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg>Copy embed code';
            }, 2000);

            return true;
        } catch (error) {
            console.error('Error copying embed code:', error);
            return false;
        }
    },

    getCode(editor) {
        const content = editor.getValue();
        const encoded = btoa(unescape(encodeURIComponent(content)));
        const currentPath = window.location.pathname;
        const embedUrl = `${window.location.origin}${currentPath}#code=${encoded}`;
        return `<iframe src="${embedUrl}" style="width: 100%; height: 600px; border: none; border-radius: 4px; overflow: hidden;"></iframe>`;
    }
};

// Storage utility functions
const storage = {
    save(key, content, defaultContent) {
        try {
            // If content is empty, save the default content instead
            const contentToSave = content || defaultContent;
            localStorage.setItem(key, contentToSave);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            // Try clearing some space in localStorage if it's full
            try {
                // Remove old items if storage is full
                for (let i = 0; i < localStorage.length; i++) {
                    const storageKey = localStorage.key(i);
                    if (storageKey !== key) {
                        localStorage.removeItem(storageKey);
                    }
                }
                // Try saving again
                localStorage.setItem(key, contentToSave);
                return true;
            } catch (retryError) {
                console.error('Failed to save even after cleanup:', retryError);
                return false;
            }
        }
    },
    
    load(key, defaultContent) {
        try {
            return localStorage.getItem(key) || defaultContent;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultContent;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Payment specific storage functions
    savePaymentStatus(status) {
        return this.save(STORAGE_KEYS.PAYMENT_STATUS, status.toString());
    },

    getPaymentStatus() {
        return this.load(STORAGE_KEYS.PAYMENT_STATUS) === 'true';
    },

    saveVisitCount(count) {
        return this.save(STORAGE_KEYS.PAYMENT, count.toString());
    },

    getVisitCount() {
        return parseInt(this.load(STORAGE_KEYS.PAYMENT, '0'));
    },

    clearPaymentData() {
        this.remove(STORAGE_KEYS.PAYMENT);
    }
};

// Modal and share functionality
const modal = {
    getModalHTML() {
        // Get current path for the example URL
        const currentPath = window.location.pathname;
        const baseUrl = `${window.location.origin}${currentPath}`;
        
        return `
        <div id="shareModal" class="modal" onclick="if(event.target === this) modal.hide()">
            <div class="modal-content">
                <button class="modal-close" onclick="modal.hide()" title="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 10.586L16.95 5.636L18.364 7.05L13.414 12L18.364 16.95L16.95 18.364L12 13.414L7.05 18.364L5.636 16.95L10.586 12L5.636 7.05L7.05 5.636L12 10.586Z" fill="currentColor"/>
                    </svg>
                </button>
                <h2 style="margin-top: 0;">Share Your Code</h2>
                
                <div class="share-option">
                    <h3>Option 1: Share via GitHub Gist (Recommended)</h3>
                    <p>Create a new Gist at <a href="https://gist.github.com" target="_blank" style="color: #7cb7ff;">gist.github.com</a>, paste your code, click "Raw" after saving, then add the raw URL to: <code style="background: #404040; padding: 2px 6px; border-radius: 4px;">${baseUrl}#https://gist.githubusercontent.com/user/id/raw/...</code></p>
                </div>

                <div class="share-option">
                    <h3>Option 2: Quick Share (URL Compressed)</h3>
                    <p>Get an instantly shareable link with your code compressed into the URL (max 1200 lines).</p>
                    <button id="compressedButton" class="share-button" onclick="modal.shareCode(window.location.pathname.split('/').pop() || 'index.html')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
                        </svg>
                        Copy compressed URL
                    </button>
                </div>

                <div class="share-option">
                    <h3>Option 3: Embed Code</h3>
                    <p>Add this HTML code to embed the editor in your website. You can test the embed code in this editor itself:</p>
                    <div class="code-container">
                        <code id="embedCode"></code>
                    </div>
                    <button id="embedButton" class="share-button" onclick="modal.copyEmbedCode()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
                        </svg>
                        Copy embed code
                    </button>
                </div>
            </div>
        </div>`;
    },

    getModalStyles() {
        return `
            .modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10001;
                opacity: 0;
                transition: all 0.2s ease;
                font-family: var(--system-fonts);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            .modal.show {
                display: flex;
                opacity: 1;
            }
            
            .modal-content {
                position: relative;
                background: var(--modal-bg);
                margin: auto;
                padding: 20px;
                border-radius: 8px;
                width: 90%;
                max-width: 800px;
                color: #fff;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            }
            
            /* ... rest of the modal styles from index.html ... */
            
            .share-option {
                background: #363636;
                padding: 15px;
                margin: 10px 0;
                border-radius: 6px;
                transition: all 0.2s ease;
            }
            
            .share-button {
                font-family: var(--system-fonts);
                font-weight: 500;
                background: #4a4a4a;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s ease;
            }

            .modal-close {
                position: absolute;
                top: 12px;
                right: 12px;
                width: 32px;
                height: 32px;
                padding: 4px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 50%;
                color: #999;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                outline: none;
            }

            .modal-close:hover {
                background: rgba(255, 255, 255, 0.2);
                color: #fff;
                transform: rotate(90deg);
            }

            .modal-close:active {
                background: rgba(255, 255, 255, 0.15);
                transform: rotate(90deg) scale(0.95);
            }

            .share-option h3 {
                margin: 3px 0 8px 0;
                font-size: 16px;
                color: #fff;
                font-weight: 500;
            }

            .share-option p {
                margin: 0 0 12px 0;
                color: #bbb;
                font-size: 14px;
                line-height: 1.5;
                font-weight: 400;
                width: 100%;
            }

            /* Embed code styles */
            #shareModal .code-container {
                background: #404040;
                padding: 8px;
                border-radius: 4px;
                margin-bottom: 8px;
            }

            #shareModal .code-container #embedCode {
                color: #fff;
                display: block;
                white-space: pre-wrap;
                word-wrap: break-word;
                font-family: monospace;
                max-height: 100px !important;
                overflow-y: auto;
                overflow-x: auto;
                scrollbar-width: thin;
                scrollbar-color: #666 #404040;
                padding-right: 10px;
            }
        `;
    },

    init(editor) {
        this.editor = editor;
        
        // Add both modals HTML to body
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = this.getModalHTML() + this.getInfoModalHTML();
        document.body.appendChild(modalDiv.firstElementChild);
        document.body.appendChild(modalDiv.lastElementChild);
        
        // Add styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = this.getModalStyles() + this.getInfoModalStyles();
        document.head.appendChild(styleSheet);
        
        // Make modal methods and analytics globally available
        window.modal = this;
        window.analytics = analytics;
    },

    show() {
        document.getElementById('shareModal').classList.add('show');
        document.getElementById('embedCode').textContent = embed.getCode(this.editor);
    },
    
    hide() {
        document.getElementById('shareModal').classList.remove('show');
    },

    async shareCode(pageName = 'index.html') {
        analytics.trackQuickShare(pageName);
        const content = this.editor.getValue();
        try {
            // Get the current page URL without hash
            const baseUrl = window.location.href.split('#')[0];
            const encoded = btoa(unescape(encodeURIComponent(content)));
            const shareUrl = `${baseUrl}#code=${encoded}`;
            
            const copySuccess = await clipboard.copy(shareUrl);
            const button = document.getElementById('compressedButton');
            
            if (copySuccess) {
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg>Copy compressed URL';
                }, 2000);
            } else {
                throw new Error('Copy failed');
            }
        } catch (error) {
            console.error('Error sharing code:', error);
            alert('Could not automatically copy the URL. Here it is to copy manually:\n\n' + shareUrl);
        }
    },

    async copyEmbedCode() {
        analytics.trackEmbedCopy();
        const success = await embed.copyCode(this.editor);
        if (!success) {
            alert('Failed to copy embed code. Please try again.');
        }
    },

    // Add this helper function to load code from URL or storage
    loadInitialContent(defaultContent, storageKey) {
        const hash = window.location.hash;
        
        // First try loading from URL hash
        if (hash) {
            if (hash.startsWith('#code=')) {
                try {
                    const encoded = hash.substring(6);
                    const content = decodeURIComponent(escape(atob(encoded)));
                    if (content) return content;
                } catch (error) {
                    console.error('Error loading shared code:', error);
                }
            } else if (hash.startsWith('#')) {
                // For Gist URLs, return null to let the caller handle async loading
                return null;
            }
        }
        
        // If no hash or failed to load from hash, try localStorage
        return storage.load(storageKey, defaultContent);
    },

    getInfoModalHTML() {
        return `
        <div id="infoModal" class="modal" onclick="if(event.target === this) modal.hideInfo()">
            <div class="modal-content">
                <button class="modal-close" onclick="modal.hideInfo()" title="Close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 10.586L16.95 5.636L18.364 7.05L13.414 12L18.364 16.95L16.95 18.364L12 13.414L7.05 18.364L5.636 16.95L10.586 12L5.636 7.05L7.05 5.636L12 10.586Z" fill="currentColor"/>
                    </svg>
                </button>
                <h2>Available Editors</h2>
                <div class="editors-grid">
                    <a href="/index.html" class="editor-card">
                        <h3>HTML/CSS/JS</h3>
                        <p>Real-time HTML, CSS, and JavaScript editor with live preview</p>
                    </a>
                    <a href="/svelte.html" class="editor-card">
                        <h3>Svelte</h3>
                        <p>Svelte component editor with Tailwind CSS support</p>
                    </a>
                    <a href="/markdown.html" class="editor-card">
                        <h3>Markdown</h3>
                        <p>Markdown editor with instant preview and GitHub flavor</p>
                    </a>
                    <a href="/glsl.html" class="editor-card">
                        <h3>GLSL Shader</h3>
                        <p>WebGL shader editor with Shadertoy compatibility</p>
                    </a>
                    <a href="/tailwind.html" class="editor-card">
                        <h3>Tailwind CSS</h3>
                        <p>Tailwind CSS playground with class suggestions</p>
                    </a>
                </div>
                <div class="support-info">
                    <p>For payment-related issues or refund requests, please contact <a href="mailto:me@davidb.dev">me@davidb.dev</a></p>
                </div>
            </div>
        </div>`;
    },

    getInfoModalStyles() {
        return `
            .editors-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-top: 20px;
            }
            
            .editor-card {
                background: #363636;
                padding: 15px;
                border-radius: 6px;
                text-decoration: none;
                color: white;
                transition: all 0.2s ease;
                min-width: 200px;
            }
            
            @media (max-width: 900px) {
                .editors-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            
            @media (max-width: 600px) {
                .editors-grid {
                    grid-template-columns: 1fr;
                }
            }
            
            .editor-card:hover {
                background: #404040;
                transform: translateY(-2px);
            }
            
            .editor-card h3 {
                margin: 0 0 8px 0;
                font-size: 18px;
                color: #fff;
            }
            
            .editor-card p {
                margin: 0;
                font-size: 14px;
                color: #bbb;
                line-height: 1.4;
            }

            .support-info {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #444;
                text-align: center;
            }

            .support-info p {
                color: #bbb;
                font-size: 14px;
                margin: 0;
            }

            .support-info a {
                color: #7cb7ff;
                text-decoration: none;
                transition: color 0.2s ease;
            }

            .support-info a:hover {
                color: #9ccaff;
                text-decoration: underline;
            }
        `;
    },

    showInfo() {
        document.getElementById('infoModal').classList.add('show');
    },
    
    hideInfo() {
        document.getElementById('infoModal').classList.remove('show');
    }
};

// Update the clipboard utility
const clipboard = {
    async copy(text) {
        try {
            // Try the modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text);
                    return true;
                } catch (clipboardError) {
                    console.warn('Clipboard API failed:', clipboardError);
                    // Fall back to execCommand method
                }
            }
            
            // Fallback for non-secure contexts or if clipboard API fails
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-999999px';
            textarea.style.top = '-999999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            } catch (execCommandError) {
                console.error('execCommand failed:', execCommandError);
                document.body.removeChild(textarea);
                return false;
            }
        } catch (error) {
            console.error('Copy failed:', error);
            return false;
        }
    }
};

// Create the analytics object without exporting it directly
const analytics = {
    // Debug logger for development
    logEvent(eventName, params) {
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            console.log('GA Event:', eventName, params);
        }
    },

    // Generic tracking function that handles all events
    track(eventName, pageType) {
        try {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const eventParams = {
                'event_category': 'engagement',
                'event_label': `Custom - ${eventName} - ${currentPage}`
            };
            
            // Construct event name with page type
            const fullEventName = `custom_${eventName}_${pageType}`;
            
            // Send to GA
            if (typeof gtag === 'function') {
                gtag('event', fullEventName, eventParams);
                this.logEvent(fullEventName, eventParams);
            } else {
                console.warn('Google Analytics not loaded');
            }
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    },

    // Specific event tracking functions
    trackShare() {
        const pageType = window.location.pathname.split('.')[0].split('/').pop() || 'index';
        this.track('share', pageType);
    },

    trackInfo() {
        const pageType = window.location.pathname.split('.')[0].split('/').pop() || 'index';
        this.track('info', pageType);
    },

    trackQuickShare(pageName) {
        const pageType = pageName.split('.')[0] || 'index';
        this.track('quick_share', pageType);
    },

    trackEmbedCopy() {
        const pageType = window.location.pathname.split('.')[0].split('/').pop() || 'index';
        this.track('embed_copy', pageType);
    },

    trackDonationStart() {
        const pageType = window.location.pathname.split('.')[0].split('/').pop() || 'index';
        this.track('donation_start', pageType);
    },

    trackDonationLater() {
        const pageType = window.location.pathname.split('.')[0].split('/').pop() || 'index';
        this.track('donation_later', pageType);
    }
};

// Single export statement at the bottom
export { STORAGE_KEYS, storage, embed, modal, analytics };
