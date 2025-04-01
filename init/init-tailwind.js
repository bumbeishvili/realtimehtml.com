import { storage, STORAGE_KEYS, embed, modal } from '../utils.js';

// Define Tailwind classes for autocompletion
const tailwindClasses = [
    // Layout
    'container', 'flex', 'grid', 'block', 'inline', 'inline-block', 'hidden', 'flow-root', 'contents', 'list-item', 'relative', 'absolute', 'fixed', 'sticky',
    
    // Flexbox
    'flex-row', 'flex-col', 'flex-row-reverse', 'flex-col-reverse',
    'flex-wrap', 'flex-wrap-reverse', 'flex-nowrap',
    'flex-1', 'flex-auto', 'flex-initial', 'flex-none',
    'items-start', 'items-end', 'items-center', 'items-baseline', 'items-stretch',
    'justify-start', 'justify-end', 'justify-center', 'justify-between', 'justify-around', 'justify-evenly',
    'content-center', 'content-start', 'content-end', 'content-between', 'content-around', 'content-evenly',
    
    // Grid
    'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-7', 'grid-cols-8', 'grid-cols-9', 'grid-cols-10', 'grid-cols-11', 'grid-cols-12',
    'grid-cols-none',
    'col-auto', 'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6', 'col-span-7', 'col-span-8', 'col-span-9', 'col-span-10', 'col-span-11', 'col-span-12',
    'col-span-full',
    'grid-rows-1', 'grid-rows-2', 'grid-rows-3', 'grid-rows-4', 'grid-rows-5', 'grid-rows-6',
    'row-auto', 'row-span-1', 'row-span-2', 'row-span-3', 'row-span-4', 'row-span-5', 'row-span-6',
    'row-span-full',
    
    // Spacing (Padding)
    'p-0', 'p-px', 'p-0.5', 'p-1', 'p-1.5', 'p-2', 'p-2.5', 'p-3', 'p-3.5', 'p-4', 'p-5', 'p-6', 'p-7', 'p-8', 'p-9', 'p-10', 'p-11', 'p-12', 'p-14', 'p-16', 'p-20', 'p-24', 'p-28', 'p-32', 'p-36', 'p-40', 'p-44', 'p-48', 'p-52', 'p-56', 'p-60', 'p-64', 'p-72', 'p-80', 'p-96',
    'px-0', 'px-px', 'px-0.5', 'px-1', 'px-1.5', 'px-2', 'px-2.5', 'px-3', 'px-3.5', 'px-4', 'px-5', 'px-6', 'px-7', 'px-8', 'px-9', 'px-10', 'px-11', 'px-12', 'px-14', 'px-16', 'px-20', 'px-24', 'px-28', 'px-32', 'px-36', 'px-40', 'px-44', 'px-48', 'px-52', 'px-56', 'px-60', 'px-64', 'px-72', 'px-80', 'px-96',
    'py-0', 'py-px', 'py-0.5', 'py-1', 'py-1.5', 'py-2', 'py-2.5', 'py-3', 'py-3.5', 'py-4', 'py-5', 'py-6', 'py-7', 'py-8', 'py-9', 'py-10', 'py-11', 'py-12', 'py-14', 'py-16', 'py-20', 'py-24', 'py-28', 'py-32', 'py-36', 'py-40', 'py-44', 'py-48', 'py-52', 'py-56', 'py-60', 'py-64', 'py-72', 'py-80', 'py-96',
    'pt-0', 'pt-px', 'pt-0.5', 'pt-1', 'pt-1.5', 'pt-2', 'pt-2.5', 'pt-3', 'pt-3.5', 'pt-4', 'pt-5', 'pt-6', 'pt-7', 'pt-8', 'pt-9', 'pt-10', 'pt-11', 'pt-12', 'pt-14', 'pt-16', 'pt-20', 'pt-24', 'pt-28', 'pt-32', 'pt-36', 'pt-40', 'pt-44', 'pt-48', 'pt-52', 'pt-56', 'pt-60', 'pt-64', 'pt-72', 'pt-80', 'pt-96',
    'pr-0', 'pr-px', 'pr-0.5', 'pr-1', 'pr-1.5', 'pr-2', 'pr-2.5', 'pr-3', 'pr-3.5', 'pr-4', 'pr-5', 'pr-6', 'pr-7', 'pr-8', 'pr-9', 'pr-10', 'pr-11', 'pr-12', 'pr-14', 'pr-16', 'pr-20', 'pr-24', 'pr-28', 'pr-32', 'pr-36', 'pr-40', 'pr-44', 'pr-48', 'pr-52', 'pr-56', 'pr-60', 'pr-64', 'pr-72', 'pr-80', 'pr-96',
    'pb-0', 'pb-px', 'pb-0.5', 'pb-1', 'pb-1.5', 'pb-2', 'pb-2.5', 'pb-3', 'pb-3.5', 'pb-4', 'pb-5', 'pb-6', 'pb-7', 'pb-8', 'pb-9', 'pb-10', 'pb-11', 'pb-12', 'pb-14', 'pb-16', 'pb-20', 'pb-24', 'pb-28', 'pb-32', 'pb-36', 'pb-40', 'pb-44', 'pb-48', 'pb-52', 'pb-56', 'pb-60', 'pb-64', 'pb-72', 'pb-80', 'pb-96',
    'pl-0', 'pl-px', 'pl-0.5', 'pl-1', 'pl-1.5', 'pl-2', 'pl-2.5', 'pl-3', 'pl-3.5', 'pl-4', 'pl-5', 'pl-6', 'pl-7', 'pl-8', 'pl-9', 'pl-10', 'pl-11', 'pl-12', 'pl-14', 'pl-16', 'pl-20', 'pl-24', 'pl-28', 'pl-32', 'pl-36', 'pl-40', 'pl-44', 'pl-48', 'pl-52', 'pl-56', 'pl-60', 'pl-64', 'pl-72', 'pl-80', 'pl-96',

    // Spacing (Margin)
    'm-0', 'm-px', 'm-0.5', 'm-1', 'm-1.5', 'm-2', 'm-2.5', 'm-3', 'm-3.5', 'm-4', 'm-5', 'm-6', 'm-7', 'm-8', 'm-9', 'm-10', 'm-11', 'm-12', 'm-14', 'm-16', 'm-20', 'm-24', 'm-28', 'm-32', 'm-36', 'm-40', 'm-44', 'm-48', 'm-52', 'm-56', 'm-60', 'm-64', 'm-72', 'm-80', 'm-96', 'm-auto',
    'mx-0', 'mx-px', 'mx-0.5', 'mx-1', 'mx-1.5', 'mx-2', 'mx-2.5', 'mx-3', 'mx-3.5', 'mx-4', 'mx-5', 'mx-6', 'mx-7', 'mx-8', 'mx-9', 'mx-10', 'mx-11', 'mx-12', 'mx-14', 'mx-16', 'mx-20', 'mx-24', 'mx-28', 'mx-32', 'mx-36', 'mx-40', 'mx-44', 'mx-48', 'mx-52', 'mx-56', 'mx-60', 'mx-64', 'mx-72', 'mx-80', 'mx-96', 'mx-auto',
    'my-0', 'my-px', 'my-0.5', 'my-1', 'my-1.5', 'my-2', 'my-2.5', 'my-3', 'my-3.5', 'my-4', 'my-5', 'my-6', 'my-7', 'my-8', 'my-9', 'my-10', 'my-11', 'my-12', 'my-14', 'my-16', 'my-20', 'my-24', 'my-28', 'my-32', 'my-36', 'my-40', 'my-44', 'my-48', 'my-52', 'my-56', 'my-60', 'my-64', 'my-72', 'my-80', 'my-96', 'my-auto',
    
    // Width & Height
    'w-0', 'w-px', 'w-0.5', 'w-1', 'w-1.5', 'w-2', 'w-2.5', 'w-3', 'w-3.5', 'w-4', 'w-5', 'w-6', 'w-7', 'w-8', 'w-9', 'w-10', 'w-11', 'w-12', 'w-14', 'w-16', 'w-20', 'w-24', 'w-28', 'w-32', 'w-36', 'w-40', 'w-44', 'w-48', 'w-52', 'w-56', 'w-60', 'w-64', 'w-72', 'w-80', 'w-96',
    'w-1/2', 'w-1/3', 'w-2/3', 'w-1/4', 'w-2/4', 'w-3/4', 'w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-1/6', 'w-2/6', 'w-3/6', 'w-4/6', 'w-5/6',
    'w-auto', 'w-full', 'w-screen', 'w-min', 'w-max', 'w-fit',
    
    // Typography
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl',
    'font-thin', 'font-extralight', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'font-extrabold', 'font-black',
    'text-left', 'text-center', 'text-right', 'text-justify',
    'uppercase', 'lowercase', 'capitalize', 'normal-case',
    'truncate', 'text-ellipsis', 'text-clip',
    'align-baseline', 'align-top', 'align-middle', 'align-bottom', 'align-text-top', 'align-text-bottom',
    
    // Colors (with shades)
    ...['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'].flatMap(color => [
        `text-${color}-50`, `text-${color}-100`, `text-${color}-200`, `text-${color}-300`, `text-${color}-400`,
        `text-${color}-500`, `text-${color}-600`, `text-${color}-700`, `text-${color}-800`, `text-${color}-900`,
        `bg-${color}-50`, `bg-${color}-100`, `bg-${color}-200`, `bg-${color}-300`, `bg-${color}-400`,
        `bg-${color}-500`, `bg-${color}-600`, `bg-${color}-700`, `bg-${color}-800`, `bg-${color}-900`,
        `border-${color}-50`, `border-${color}-100`, `border-${color}-200`, `border-${color}-300`, `border-${color}-400`,
        `border-${color}-500`, `border-${color}-600`, `border-${color}-700`, `border-${color}-800`, `border-${color}-900`,
    ]),
    
    // Borders
    'border', 'border-0', 'border-2', 'border-4', 'border-8',
    'border-x', 'border-y', 'border-t', 'border-r', 'border-b', 'border-l',
    'border-solid', 'border-dashed', 'border-dotted', 'border-double', 'border-hidden', 'border-none',
    'rounded-none', 'rounded-sm', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
    
    // Effects
    'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl', 'shadow-inner', 'shadow-none',
    'opacity-0', 'opacity-5', 'opacity-10', 'opacity-20', 'opacity-25', 'opacity-30', 'opacity-40', 'opacity-50',
    'opacity-60', 'opacity-70', 'opacity-75', 'opacity-80', 'opacity-90', 'opacity-95', 'opacity-100',
    
    // Transitions & Animation
    'transition', 'transition-all', 'transition-colors', 'transition-opacity', 'transition-shadow', 'transition-transform',
    'duration-75', 'duration-100', 'duration-150', 'duration-200', 'duration-300', 'duration-500', 'duration-700', 'duration-1000',
    'ease-linear', 'ease-in', 'ease-out', 'ease-in-out',
    'animate-none', 'animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce',
    
    // Hover/Focus States
    'hover:underline', 'hover:no-underline',
    'hover:opacity-0', 'hover:opacity-50', 'hover:opacity-100',
    'focus:outline-none', 'focus:ring', 'focus:ring-1', 'focus:ring-2', 'focus:ring-4',
    'focus:border-transparent', 'focus:border-current',
    
    // Responsive Prefixes
    'sm:', 'md:', 'lg:', 'xl:', '2xl:',
    
    // State Variants
    'hover:', 'focus:', 'active:', 'disabled:', 'visited:', 'checked:', 'first:', 'last:', 'odd:', 'even:', 'group-hover:', 'group-focus:', 'focus-within:', 'focus-visible:', 'motion-safe:', 'motion-reduce:', 'dark:'
];

const defaultStuff = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body class="bg-gray-50 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-sm w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <div class="p-4 border-b flex items-center justify-between">
            <span class="text-xl">✨ Welcome!</span>
            <span class="text-gray-400 hover:text-gray-600 cursor-pointer">×</span>
        </div>
        <div class="p-4">
            <p class="text-gray-600">Start editing to see the magic happen ✨</p>
            <button class="mt-3 block w-full bg-blue-500 text-white text-center py-2 rounded-md hover:bg-blue-600">
                Get Started
            </button>
        </div>
    </div>
</body>
</html>`;

let editor;
let previousContent = '';

// Initialize editor
function init() {
    let initialContent = defaultStuff;
    const hash = window.location.hash;

    // Try loading from URL first
    if (hash && hash.startsWith('#')) {
        if (hash.startsWith('#code=')) {
            initialContent = modal.loadInitialContent(defaultStuff, STORAGE_KEYS.TAILWIND_EDITOR);
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
        initialContent = storage.load(STORAGE_KEYS.TAILWIND_EDITOR, defaultStuff);
    }

    // Initialize CodeMirror with all options at once
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
        viewportMargin: Infinity,
        extraKeys: {
            "'<'": completeAfter,
            "'/'": completeIfAfterLt,
            "' '": completeIfInClass,
            "'='": completeIfInClass,
            "Ctrl-Space": "autocomplete"
        },
        hintOptions: {
            completeSingle: false,
            hint: function(editor) {
                const cursor = editor.getCursor();
                const token = editor.getTokenAt(cursor);
                const line = editor.getLine(cursor.line);
                const tokenString = token.string;
                
                console.log('Hint function called:', {
                    cursor,
                    token,
                    line,
                    tokenString
                });
                
                // Check if we're inside a class attribute
                const isInClassAttribute = (function() {
                    const upToToken = line.slice(0, cursor.ch);
                    const classMatch = upToToken.match(/class\s*=\s*["'][^"']*/);
                    console.log('Class attribute check:', {
                        upToToken,
                        classMatch,
                        isMatch: classMatch !== null
                    });
                    return classMatch !== null;
                })();

                if (!isInClassAttribute) return null;
                
                // Get the current word being typed
                const currentWord = (function() {
                    const beforeCursor = line.slice(0, cursor.ch);
                    const classes = beforeCursor.split(/[\s"']+/);
                    const word = classes[classes.length - 1] || '';
                    console.log('Current word:', {
                        beforeCursor,
                        classes,
                        word
                    });
                    return word;
                })();

                // Filter matching classes
                const matchingClasses = tailwindClasses
                    .filter(cls => {
                        // If currentWord starts with a modifier (like hover:), match against the base class
                        const [modifier, baseClass] = currentWord.split(':');
                        if (baseClass) {
                            return cls.startsWith(modifier + ':') && cls.toLowerCase().includes(baseClass.toLowerCase());
                        }
                        return cls.toLowerCase().startsWith(currentWord.toLowerCase());
                    });

                console.log('Matching classes:', matchingClasses);

                if (matchingClasses.length === 0) return null;

                const result = {
                    list: matchingClasses.map(cls => ({
                        text: cls,
                        displayText: cls,
                        className: 'tailwind-suggestion',
                        hint: function(cm, data, completion) {
                            const from = {line: cursor.line, ch: cursor.ch - currentWord.length};
                            const to = {line: cursor.line, ch: cursor.ch};
                            cm.replaceRange(completion.text, from, to);
                        }
                    })),
                    from: CodeMirror.Pos(cursor.line, cursor.ch - currentWord.length),
                    to: cursor
                };

                console.log('Returning hint result:', result);
                return result;
            }
        }
    });

    // Helper functions for autocompletion
    function completeAfter(cm, pred) {
        if (!pred || pred()) setTimeout(function() {
            if (!cm.state.completionActive)
                cm.showHint({completeSingle: false});
        }, 100);
        return CodeMirror.Pass;
    }

    function completeIfAfterLt(cm) {
        return completeAfter(cm, function() {
            var cur = cm.getCursor();
            return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
        });
    }

    function completeIfInClass(cm) {
        return completeAfter(cm, function() {
            var cur = cm.getCursor();
            var token = cm.getTokenAt(cur);
            var line = cm.getLine(cur.line);
            const upToToken = line.slice(0, cur.ch);
            return upToToken.match(/class\s*=\s*["'][^"']*/);
        });
    }

    // Improve keyup event handler
    editor.on('keyup', function(cm, event) {
        // Trigger on space, letters, numbers, hyphen, colon, or equals
        if (!/^[ a-zA-Z0-9-:=]$/.test(event.key)) return;
        
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        
        // Check if we're in a class attribute
        const upToToken = line.slice(0, cursor.ch);
        if (upToToken.match(/class\s*=\s*["'][^"']*/)) {
            cm.showHint({ completeSingle: false });
        }
    });

    editor.on('change', (cm) => {
        debouncedPreviewUpdate();
        const content = cm.getValue();
        storage.save(STORAGE_KEYS.TAILWIND_EDITOR, content, defaultStuff);
    });
    
    editor.focus();
    editor.execCommand('selectAll');
    
    debouncedPreviewUpdate();

    // Initialize modal with editor instance
    modal.init(editor);
}

// Gist loading function
async function loadGistContent(url) {
    try {
        // Convert github.com URLs to raw content URLs
        if (url.includes('github.com/gist/') || url.includes('gist.github.com/')) {
            // If it's not already a raw URL, convert it
            if (!url.includes('raw.githubusercontent.com') && !url.includes('/raw/')) {
                // Handle both full and shortened URLs
                url = url.replace('gist.github.com/', 'gist.githubusercontent.com/')
                         .replace('github.com/gist/', 'gist.githubusercontent.com/')
                         .replace('/blob/', '/raw/');
                
                // If URL doesn't end with /raw, add it
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
    
    // Process the content to add loop protection and ensure Tailwind is included
    const processedContent = newContent.replace(/\b(for|while)\b\s*\(/g, (match, keyword, offset) => {
        const lineNumber = newContent.substr(0, offset).split('\n').length;
        return `${match}loopProtect(${lineNumber}),`;
    });

    // Create the protected HTML content with Tailwind
    const html = [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '    <meta charset="utf-8">',
        '    <script src="https://cdn.tailwindcss.com"><\/script>',
        '    <script>',
        '        // Loop protection',
        '        window.__loopProtect = true;',
        '        window.__loopProtectTimeout = 500;',
        '        let __loopCount = {};',
        '',
        '        // Override setTimeout and setInterval',
        '        const originalSetTimeout = setTimeout;',
        '        const originalSetInterval = setInterval;',
        '',
        '        window.setTimeout = function(fn, delay) {',
        '            if (delay < 10) delay = 10;',
        '            return originalSetTimeout.call(this, fn, delay);',
        '        };',
        '',
        '        window.setInterval = function(fn, delay) {',
        '            if (delay < 10) delay = 10;',
        '            return originalSetInterval.call(this, fn, delay);',
        '        };',
        '',
        '        function loopProtect(line) {',
        '            if (!window.__loopProtect) return;',
        '            const key = "loop" + line;',
        '            __loopCount[key] = (__loopCount[key] || 0) + 1;',
        '',
        '            if (__loopCount[key] > 1000000) {',
        '                const msg = "Potential infinite loop detected on line " + line;',
        '                console.error(msg);',
        '                document.body.innerHTML = \'<div style="color: red; font-family: monospace; padding: 20px;">\' + msg + "</div>";',
        '                throw new Error(msg);',
        '            }',
        '',
        '            if (__loopCount[key] === 1) {',
        '                setTimeout(() => { __loopCount[key] = 0; }, window.__loopProtectTimeout);',
        '            }',
        '            return true;',
        '        }',
        '    <\/script>',
        '</head>',
        '<body>',
        processedContent,
        '</body>',
        '</html>'
    ].join('\n');
    
    iframe.srcdoc = html;
}, 150);

// Move window.onload inside module and ensure CodeMirror is loaded
window.addEventListener('load', function() {
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
    
    // Initialize Split.js first
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