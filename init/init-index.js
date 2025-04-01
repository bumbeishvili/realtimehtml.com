
import { storage, STORAGE_KEYS, modal } from '../utils.js';

// Make modal functions globally available

const defaultStuff = `<html>
 <head></head>
<body>

    <div id="message"></div>

    <script\> 
       document.getElementById('message').innerHTML = 'Edit code left, see the result right';
    <\/script>

</body>
<html>`;

let editor;
let previousContent = '';

// Initialize editor
async function init() {
    let initialContent = defaultStuff;
    const hash = window.location.hash;

    if (hash) {
        if (hash.startsWith('#code=')) {
            try {
                const encoded = hash.substring(6);
                const content = decodeURIComponent(escape(atob(encoded)));
                if (content) initialContent = content;
            } catch (error) {
                console.error('Error loading shared code:', error);
            }
        } else if (hash.startsWith('#@') || hash.startsWith('#http')) {
            const gistUrl = hash.startsWith('#@') ? hash.substring(2) : hash.substring(1);
            const content = await loadGistContent(gistUrl);
            if (content) initialContent = content;
        }
    } else {
        initialContent = storage.load(STORAGE_KEYS.REALTIME_HTML, defaultStuff);
    }

    editor = CodeMirror(document.querySelector('#editor'), {
        value: initialContent,
        mode: 'htmlmixed',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 2,
        tabSize: 2,
        lineWrapping: true,
        viewportMargin: Infinity,
    });

    // Add auto-save functionality
    editor.on('change', (cm) => {
        debouncedPreviewUpdate();
        // Save to localStorage
        const content = cm.getValue();
        storage.save(STORAGE_KEYS.REALTIME_HTML, content, defaultStuff);
    });
    
    editor.focus();
    editor.execCommand('selectAll');
    
    debouncedPreviewUpdate();

    // Inside init() or after editor is created, add:
    modal.init(editor);
}

// Gist loading function
async function loadGistContent(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch Gist');
        return await response.text();
    } catch (error) {
        console.error('Error loading gist:', error);
        return null;
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Preview update function
const debouncedPreviewUpdate = debounce(() => {
    const newContent = editor.getValue();
    if (previousContent === newContent) return;
    
    previousContent = newContent;
    const rightPanel = document.querySelector('#right-panel');
    const iframe = document.querySelector('#preview') || document.createElement('iframe');
    
    if (!iframe.id) {
        iframe.id = 'preview';
        iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-modals allow-forms allow-popups');
        rightPanel.appendChild(iframe);
    }
    
    // Check if loop protection is disabled
    const isLoopProtectionDisabled = newContent.includes('<!-- disable-loop-protection -->') || 
                                   newContent.includes('// disable-loop-protection');
    
    // Process the content to add loop protection only if not disabled
    const processedContent = isLoopProtectionDisabled ? 
        newContent : 
        newContent.replace(/\b(for|while)\b\s*\(((?:[^;()]|\([^)]*\))*);([^;]*);([^)]*)\)/g, 
            (match, keyword, init, condition, increment) => {
                const lineNumber = newContent.substr(0, match.index).split('\n').length;
                return `${keyword}(${init};${condition};loopProtect(${lineNumber}) && (${increment}))`;
            });

    // Create the protected HTML content
    const html = [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '    <meta charset="utf-8">',
        isLoopProtectionDisabled ? '' : `<script>
            // Loop protection
            window.__loopProtect = true;
            window.__loopProtectTimeout = 500;
            let __loopCount = {};

            // Override setTimeout and setInterval
            const originalSetTimeout = setTimeout;
            const originalSetInterval = setInterval;

            window.setTimeout = function(fn, delay) {
                if (delay < 10) delay = 10;
                return originalSetTimeout.call(this, fn, delay);
            };

            window.setInterval = function(fn, delay) {
                if (delay < 10) delay = 10;
                return originalSetInterval.call(this, fn, delay);
            };

            function loopProtect(line) {
                if (!window.__loopProtect) return;
                const key = "loop" + line;
                __loopCount[key] = (__loopCount[key] || 0) + 1;

                if (__loopCount[key] > 1000000) {
                    const msg = "Potential infinite loop detected on line " + line+' <br> <br>If you are sure that this is not an infinite loop, you can disable the loop protection by adding <b>disable-loop-protection</b> as a comment in the code';
                    console.error(msg);
                    document.body.innerHTML = '<div style="color: red; font-family: monospace; padding: 20px;">' + msg + "</div>";
                    throw new Error(msg);
                }

                if (__loopCount[key] === 1) {
                    setTimeout(() => { __loopCount[key] = 0; }, window.__loopProtectTimeout);
                }
                return true;
            }
        <\/script>`,
        '</head>',
        '<body>',
        processedContent,
        '</body>',
        '</html>'
    ].join('\n');
    
    iframe.srcdoc = html;
}, 150);

// Update the Split initialization
window.addEventListener('load', function() {
    const shareButton = document.getElementById('shareButton');
    const infoButton = document.getElementById('infoButton');
    const buttonWidth = 36; // Width of the buttons
    
    function updateButtonPositions() {
        const gutter = document.querySelector('.gutter');
        if (gutter) {
            const gutterRect = gutter.getBoundingClientRect();
            const gutterCenter = gutterRect.left + (gutterRect.width / 2);
            const buttonOffset = gutterCenter - (buttonWidth / 2)+5;
            shareButton.style.transform = `translateX(${buttonOffset}px)`;
            infoButton.style.transform = `translateX(${buttonOffset}px)`;
        }
    }
    
    // Initial positioning
    const initialOffset = (window.innerWidth / 2) - (buttonWidth / 2);
    shareButton.style.transform = `translateX(${initialOffset}px)`;
    infoButton.style.transform = `translateX(${initialOffset}px)`;
    
    Split(['#left-panel', '#right-panel'], {
        sizes: [50, 50],
        minSize: [200, 200],
        gutterSize: 10,
        dragInterval: 1,
        snapOffset: 0,
        elementStyle: (dimension, size, gutterSize) => ({
            'flex-basis': `calc(${size}% - ${gutterSize}px)`,
        }),
        gutterStyle: (dimension, gutterSize) => ({
            'flex-basis': `${gutterSize}px`,
        }),
        onDrag: () => {
            editor.refresh();
            updateButtonPositions();
        }
    });
    init();
    
    // Handle window resize
    window.addEventListener('resize', updateButtonPositions);
});