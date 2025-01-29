// Storage keys
const STORAGE_KEYS = {
    PAYMENT: 'visit_count',
    PAYMENT_STATUS: 'has_donated',
    TAILWIND_EDITOR: 'tailwindcss_editor_code',
    REALTIME_HTML: 'realtimehtml_code',
    MARKDOWN_EDITOR: 'markdown_editor_code'
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

export { STORAGE_KEYS, storage };
