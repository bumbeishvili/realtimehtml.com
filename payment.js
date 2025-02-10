// Payment integration script
import { storage, STORAGE_KEYS, analytics } from './utils.js';

// Environment Configuration
const isLive = true; // Set to false for test environment


// For testing, you can use these example test card numbers:

// Success: 4242 4242 4242 4242
// Declined: 4000 0000 0000 0002

// Stripe Configuration
const stripeConfig = {
    test: {
        publishableKey: 'pk_test_51OvPGD2L08TdNw1TA3BmJZSWNhbUg3HaW647yhsF8dHXm6MSN5JyxNyUC7aaxEOIrrZLNuwq0FNMWVNwdufiBu7l00s1r44mAQ',
        priceId: 'price_1Qmau92L08TdNw1TP7Jc7KcC'
    },
    live: {
        publishableKey: 'pk_live_51OvPGD2L08TdNw1TGVlkaf8f4mEsqkwCHMF3Av110O79YdG578m1L18WbKyjZFbn6lHwRmNR1RiiHU00IEIt0Wpb00iWR2ouIQ',
        priceId: 'price_1QmZsf2L08TdNw1TK8jMpiTr'
    }
};

// Get current configuration based on environment
const currentConfig = isLive ? stripeConfig.live : stripeConfig.test;

// Initialize Stripe with appropriate key
const stripe = Stripe(currentConfig.publishableKey);

// Configuration
const VISIT_LIMIT = 20; // Configurable visit limit
const TRIAL_EXTENSION = 3; // Number of additional trials when clicking "Later"
const PAYMENT_STORAGE_KEY = 'visit_count';
const PAYMENT_STATUS_KEY = 'has_donated';

// Create and inject modal styles
const modalStyles = `
    .payment-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10002;
        opacity: 0;
        transition: opacity 0.2s ease;
    }
    .payment-modal.show {
        display: flex;
        opacity: 1;
    }
    .payment-modal-content {
        position: relative;
        background: #2d2d2d;
        margin: auto;
        padding: 25px;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        color: #fff;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
    }
    .payment-modal-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 5px;
        font-size: 24px;
        line-height: 1;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    .payment-modal-close:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
    }
    .payment-modal h2 {
        margin: 0 0 20px 0;
        font-size: 24px;
        font-weight: 600;
    }
    .payment-modal p {
        margin: 0 0 20px 0;
        line-height: 1.6;
        color: #e0e0e0;
    }
    .payment-error {
        color: #ff4444;
        margin-bottom: 15px;
        display: none;
    }
    .payment-button {
        display: inline-block;
        background: #4CAF50;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    .payment-button:hover {
        background: #45a049;
        transform: translateY(-1px);
    }
    .later-button {
        display: inline-block;
        background: transparent;
        color: #999;
        padding: 12px 24px;
        border: 1px solid #666;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        margin-left: 10px;
        transition: all 0.2s ease;
    }
    .later-button:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
    }
`;

// Inject styles
function injectStyles() {
    const style = document.createElement('style');
    style.textContent = modalStyles;
    document.head.appendChild(style);
}

// Create modal HTML
function createModal() {
    const modal = document.createElement('div');
    modal.className = 'payment-modal';
    modal.innerHTML = `
        <div class="payment-modal-content">
            <button class="payment-modal-close">&times;</button>
            <h2>Support Our Platform 🙏</h2>
            <p>Thank you for being an active user! To help keep this tool free and maintain our servers, would you consider making a small donation?</p>
            <p style="font-size: 14px; color: #999;">Once you make a donation, we'll remember your support and won't show this popup again in this browser.</p>
            <div class="payment-error"></div>
            <div>
                <button class="payment-button"> Get rid of this annoying popup (2.99$)</button>
                <button class="later-button">Later</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Add event listeners
    const closeBtn = modal.querySelector('.payment-modal-close');
    const laterBtn = modal.querySelector('.later-button');
    const paymentBtn = modal.querySelector('.payment-button');
    
    // Get current page name
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageType = currentPage.split('.')[0]; // Gets 'index', 'svelte', etc.
    
    closeBtn.addEventListener('click', () => hideModal());
    laterBtn.addEventListener('click', () => {
        analytics.trackDonationLater();
        storage.saveVisitCount(VISIT_LIMIT - TRIAL_EXTENSION);
        hideModal();
    });
    
    paymentBtn.addEventListener('click', () => {
        analytics.trackDonationStart();
        handlePayment();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    return modal;
}

// Show modal
function showModal() {
    let modal = document.querySelector('.payment-modal');
    if (!modal) {
        modal = createModal();
    }
    setTimeout(() => modal.classList.add('show'), 10);
}

// Hide modal
function hideModal() {
    const modal = document.querySelector('.payment-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Handle Stripe payment
async function handlePayment() {
    try {
        const { error } = await stripe.redirectToCheckout({
            lineItems: [{
                price: currentConfig.priceId, // Use environment-specific price ID
                quantity: 1,
            }],
            mode: 'payment',
            successUrl: `${window.location.origin}${window.location.pathname}?payment=success`,
            cancelUrl: `${window.location.origin}${window.location.pathname}?payment=cancelled`,
        });

        if (error) {
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Payment failed:', error);
        const errorElement = document.querySelector('.payment-error');
        if (errorElement) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
    }
}

// Check payment status
function checkPaymentStatus() {
    // First check if user has already paid
    const hasAlreadyPaid = storage.getPaymentStatus();
    
    if (hasAlreadyPaid) {
        return true;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
        storage.savePaymentStatus(true);
        storage.clearPaymentData(); // Clear visit count
        
        // Clean up URL
        const cleanUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({}, document.title, cleanUrl);
        
        return true;
    }
    
    return false;
}

// Check visits
function checkVisits() {
    // First check if user has already paid
    if (checkPaymentStatus()) {
        return; // Skip visit counting for paid users
    }

    try {
        // Get current visit count
        let visitCount = storage.getVisitCount();
        
        // Increment visit count
        visitCount++;
        
        // Store updated count
        storage.saveVisitCount(visitCount);
        
        // Check if limit reached
        if (visitCount >= VISIT_LIMIT) {
            onLimitReached();
        }
    } catch (error) {
        console.error('Error tracking visits:', error);
    }
}

// Function to handle limit reached
function onLimitReached() {
    console.log('reached limit');
    injectStyles();
    showModal();
}

// Run initial checks
document.addEventListener('DOMContentLoaded', () => {
    checkPaymentStatus();
    checkVisits();
});
