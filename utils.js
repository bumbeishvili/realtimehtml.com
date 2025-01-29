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

export { STORAGE_KEYS, storage, embed };
