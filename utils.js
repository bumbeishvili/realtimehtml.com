// Storage keys
const STORAGE_KEYS = {
    PAYMENT: 'visit_count',
    PAYMENT_STATUS: 'has_donated',
    TAILWIND_EDITOR: 'tailwindcss_editor_code',
    REALTIME_HTML: 'realtimehtml_code',
    MARKDOWN_EDITOR: 'markdown_editor_code'
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
                    <p>Create a new Gist at <a href="https://gist.github.com" target="_blank" style="color: #7cb7ff;">gist.github.com</a>, paste your code, click "Raw" after saving, then add the raw URL to: <code style="background: #404040; padding: 2px 6px; border-radius: 4px;">realtimehtml.com#https://gist.githubusercontent.com/user/id/raw/...</code></p>
                </div>

                <div class="share-option">
                    <h3>Option 2: Quick Share (URL Compressed)</h3>
                    <p>Get an instantly shareable link with your code compressed into the URL (max 1200 lines).</p>
                    <button id="compressedButton" class="share-button" onclick="modal.shareCode()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
                        </svg>
                        Copy compressed URL
                    </button>
                </div>

                <div class="share-option">
                    <h3>Option 3: Embed Code</h3>
                    <p>Add this HTML code to embed the editor in your website. You can test the embed code in this editor itself:</p>
                    <div class="code-container" style="background: #404040; padding: 10px; border-radius: 4px; margin-bottom: 10px;">
                        <code id="embedCode" style="color: #fff; display: block; white-space: pre-wrap; word-wrap: break-word; font-family: monospace; max-height: 200px; overflow-y: auto; overflow-x: auto; scrollbar-width: thin; scrollbar-color: #666 #404040; padding-right: 10px;"></code>
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
        `;
    },

    init(editor) {
        this.editor = editor;
        
        // Add modal HTML to body
        const modalDiv = document.createElement('div');
        modalDiv.innerHTML = this.getModalHTML();
        document.body.appendChild(modalDiv.firstElementChild);
        
        // Add styles
        const styleSheet = document.createElement('style');
        styleSheet.textContent = this.getModalStyles();
        document.head.appendChild(styleSheet);
        
        // Make modal methods globally available
        window.modal = this;
    },

    show() {
        document.getElementById('shareModal').classList.add('show');
        document.getElementById('embedCode').textContent = embed.getCode(this.editor);
    },
    
    hide() {
        document.getElementById('shareModal').classList.remove('show');
    },

    async shareCode() {
        const content = this.editor.getValue();
        try {
            if (typeof gtag === 'function') {
                gtag('event', 'click', {
                    'event_category': 'Share',
                    'event_label': 'Quick Share Button',
                    'value': 1
                });
            }
            
            const encoded = btoa(unescape(encodeURIComponent(content)));
            const shareUrl = `${window.location.origin}#code=${encoded}`;
            
            await clipboard.copy(shareUrl);
            const button = document.getElementById('compressedButton');
            button.textContent = 'Copied!';
            
            setTimeout(() => {
                button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/></svg>Copy compressed URL';
            }, 2000);
        } catch (error) {
            console.error('Error sharing code:', error);
            alert('Could not automatically copy the URL');
        }
    },

    async copyEmbedCode() {
        if (typeof gtag === 'function') {
            gtag('event', 'click', {
                'event_category': 'Share',
                'event_label': 'Embed Code Button',
                'value': 1
            });
        }
        const success = await embed.copyCode(this.editor);
        if (!success) {
            alert('Failed to copy embed code. Please try again.');
        }
    }
};

// Add clipboard utility
const clipboard = {
    async copy(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            return Promise.resolve();
        } catch (err) {
            console.error('Failed to copy:', err);
            return Promise.reject(err);
        } finally {
            document.body.removeChild(textarea);
        }
    }
};

export { STORAGE_KEYS, storage, embed, modal };
