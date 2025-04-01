import { storage, STORAGE_KEYS, embed, modal } from '../utils.js';

// Define default Svelte component
const defaultStuff = `<script>
    let count = 0;
    let name = 'counter';
<\/script>

<main>
    <div>
        <h2 class="text-3xl pb-3" >Count is {count}</h2>
        <button class='bg-black p-3 rounded text-white ' 
                on:click={() => count += 1}>
            Increment {name}
        </button>
    </div>
</main>

<style>
    main {
        text-align: center;
        margin-top: 45%;
    }

    button:hover {
        background: #ff5722;
    }
</style>`;

let editor;
let previousContent = '';

// Initialize editor
function init() {
    let initialContent = defaultStuff;
    const hash = window.location.hash;

    // Try loading from URL first
    if (hash && hash.startsWith('#')) {
        if (hash.startsWith('#code=')) {
            initialContent = modal.loadInitialContent(defaultStuff, STORAGE_KEYS.SVELTE_EDITOR);
        } else {
            // Handle Gist URLs
            const gistUrl = hash.substring(1);
            loadGistContent(gistUrl).then(content => {
                if (content) {
                    editor.setValue(content);
                    debouncedPreviewUpdate();
                }
            });
        }
    } else {
        // Only load from storage if no URL hash is present
        initialContent = storage.load(STORAGE_KEYS.SVELTE_EDITOR, defaultStuff);
    }

    // Initialize CodeMirror
    editor = CodeMirror(document.querySelector('#editor'), {
        value: initialContent,
        mode: 'htmlmixed',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        lineWrapping: true,
        indentUnit: 2,
        tabSize: 2,
        viewportMargin: Infinity
    });

    editor.on('change', (cm) => {
        debouncedPreviewUpdate();
        const content = cm.getValue();
        storage.save(STORAGE_KEYS.SVELTE_EDITOR, content, defaultStuff);
    });

    editor.focus();
    debouncedPreviewUpdate();

    // Initialize modal with editor instance
    modal.init(editor);
}

// Preview update function with Svelte compilation
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

    try {
        const { js, css } = window.svelte.compile(newContent, {
            css: true,
            dev: true,
            format: 'esm',
            name: 'SvelteComponent'
        });

        const html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <script src="https://cdn.tailwindcss.com"><\/script>
                        <style>${css.code}<\/style>
                    </head>
                    <body>
                        <div id="app"></div>
                        <script async src="https://cdn.jsdelivr.net/npm/es-module-shims@1.7.0/dist/es-module-shims.js"><\/script>
                        <script type="importmap">
                            {
                                "imports": {
                                    "svelte": "https://cdn.jsdelivr.net/npm/svelte@3.59.2/index.mjs",
                                    "svelte/internal": "https://cdn.jsdelivr.net/npm/svelte@3.59.2/internal/index.mjs"
                                }
                            }
                        <\/script>
                        <script type="module">
                            import * as svelte from 'svelte';
                            import * as internal from 'svelte/internal';
                            
                            // Make svelte internals available globally
                            window.svelte = svelte;
                            window.svelteInternal = internal;
                            
                            ${js.code}
                            
                            new SvelteComponent({
                                target: document.getElementById('app')
                            });
                        <\/script>
                    </body>
                    </html>
                `;

        iframe.srcdoc = html;
    } catch (error) {
        iframe.srcdoc = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body {
                                font-family: monospace;
                                padding: 20px;
                                color: #ff3e00;
                                white-space: pre-wrap;
                                word-wrap: break-word;
                            }
                        </style>
                    </head>
                    <body>
                        Svelte Compilation Error:
                        ${error.message}
                    </body>
                    </html>
                `;
    }
}, 150);

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

// Gist loading function
async function loadGistContent(url) {
    try {
        // Convert github.com URLs to raw content URLs
        if (url.includes('github.com/gist/') || url.includes('gist.github.com/')) {
            if (!url.includes('raw.githubusercontent.com') && !url.includes('/raw/')) {
                url = url.replace('gist.github.com/', 'gist.githubusercontent.com/')
                    .replace('github.com/gist/', 'gist.githubusercontent.com/')
                    .replace('/blob/', '/raw/');

                if (!url.endsWith('/raw')) {
                    url = url + '/raw';
                }
            }
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch Gist');
        return await response.text();
    } catch (error) {
        console.error('Error loading gist:', error);
        return null;
    }
}

// Initialize on load
window.addEventListener('load', () => {
    const shareButton = document.getElementById('shareButton');
    const infoButton = document.getElementById('infoButton');
    const buttonWidth = 36; // Width of the buttons

    function updateButtonPositions() {
        const gutter = document.querySelector('.gutter');
        if (gutter) {
            const gutterRect = gutter.getBoundingClientRect();
            const gutterCenter = gutterRect.left + (gutterRect.width / 2);
            const buttonOffset = gutterCenter - (buttonWidth / 2) + 5;
            shareButton.style.transform = `translateX(${buttonOffset}px)`;
            infoButton.style.transform = `translateX(${buttonOffset}px)`;
        }
    }

    // Initial positioning
    const initialOffset = (window.innerWidth / 2) - (buttonWidth / 2);
    shareButton.style.transform = `translateX(${initialOffset}px)`;
    infoButton.style.transform = `translateX(${initialOffset}px)`;

    // Initialize Split.js
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
            editor?.refresh();
            updateButtonPositions();
        }
    });

    // Handle window resize
    window.addEventListener('resize', updateButtonPositions);

    // Initialize editor
    init();
});