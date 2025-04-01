// Function to open text in new tab
function openInNewTab(content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Clean up the URL after a delay to ensure it's loaded
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Function to generate Three.js sample code with the current shader
function generateThreeJsSample(fragmentShader) {
    // Clean up the shader code and remove version directive and uniforms
    let cleanShader = fragmentShader
        .replace(/#version 300 es[\s\S]*?out vec4 fragColor;/, '')  // Remove version and uniforms block
        .replace(/#version.*\n/g, '')  // Remove any remaining version directives
        .replace(/true/g, '')  // Remove 'true' strings added by the editor
        .replace(/\n\s*\n+/g, '\n\n')  // Clean up multiple empty lines
        .trim();  // Remove leading/trailing whitespace

    // Basic vertex shader for WebGL2 (without version directive)
    const vertexShader = `in vec3 position;
        void main() {
            gl_Position = vec4(position, 1.0);
        }`;

    // Define shaders section
    const shaderSection = `
        // Define shaders
        const vertexShader = \`${vertexShader}\`;
        const fragmentShader = \`
precision highp float;
precision highp int;
uniform vec3      iResolution;
uniform float     iTime;
uniform float     iTimeDelta;
uniform float     iFrameRate;
uniform int       iFrame;
uniform float     iChannelTime[4];
uniform vec3      iChannelResolution[4];
uniform vec4      iMouse;
uniform vec4      iDate;
out vec4 fragColor;

${cleanShader.replace(/`/g, '\\`')}\`;`;

    return `<!-- 
    Want to see how this shader works? 
    Copy and paste this entire code at https://realtimehtml.com to see it in action!
-->

<!DOCTYPE html>
<html>
<head>
    <title>Three.js Shader Example</title>
    <!-- disable-loop-protection -->
    <style>
        body { margin: 0; }
        canvas { display: block; }
    </style>
</head>
<body>
    <script type="module">
        import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // Force WebGL2
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('webgl2', {
            antialias: true,
            powerPreference: "high-performance",
            depth: false,
            stencil: false,
            alpha: false,
            preserveDrawingBuffer: false,
            premultipliedAlpha: false,
            desynchronized: false,
            failIfMajorPerformanceCaveat: false
        });
        if (!context) {
            throw new Error('WebGL2 not supported');
        }

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            context: context
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        document.body.appendChild(renderer.domElement);
        
        // Resize handler
        function onWindowResize() {
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize);

        ${shaderSection}

        // Shader material
        const uniforms = {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector3() },
            iMouse: { value: new THREE.Vector4() },
            iFrame: { value: 0 },
            iTimeDelta: { value: 0 },
            iFrameRate: { value: 60 },
            iChannelTime: { value: [0, 0, 0, 0] },
            iChannelResolution: { value: [
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, 0)
            ]},
            iDate: { value: new THREE.Vector4() }
        };

        const material = new THREE.RawShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms,
            glslVersion: THREE.GLSL3,
            toneMapped: false,
            transparent: false,
            depthTest: false,
            depthWrite: false
        });

        // Create a plane that fills the screen
        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Mouse handling
        let mousePosition = { x: 0, y: 0, z: 0, w: 0 };
        let isMouseDown = false;

        renderer.domElement.addEventListener('mousemove', (e) => {
            mousePosition.x = e.clientX;
            mousePosition.y = window.innerHeight - e.clientY;
            if (isMouseDown) {
                mousePosition.z = mousePosition.x;
                mousePosition.w = mousePosition.y;
            }
            uniforms.iMouse.value.set(mousePosition.x, mousePosition.y, mousePosition.z, mousePosition.w);
        });

        renderer.domElement.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            mousePosition.z = e.clientX;
            mousePosition.w = window.innerHeight - e.clientY;
            uniforms.iMouse.value.set(mousePosition.x, mousePosition.y, mousePosition.z, mousePosition.w);
        });

        renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        // Animation loop
        let startTime = Date.now();
        let lastTime = startTime;
        function animate() {
            requestAnimationFrame(animate);
            
            const currentTime = Date.now();
            const deltaTime = (currentTime - lastTime) * 0.001; // in seconds
            lastTime = currentTime;

            uniforms.iTime.value = (currentTime - startTime) * 0.001;
            uniforms.iTimeDelta.value = deltaTime;
            uniforms.iFrame.value++;
            uniforms.iFrameRate.value = 1.0 / deltaTime;
            uniforms.iResolution.value.set(window.innerWidth, window.innerHeight, 1);

            // Update date uniform
            const date = new Date();
            uniforms.iDate.value.set(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours() * 60 * 60 + 
                date.getMinutes() * 60 + 
                date.getSeconds() + 
                date.getMilliseconds() * 0.001
            );
            
            renderer.render(scene, camera);
        }
        animate();
    </script>
</body>
</html>`;
}

// Function to handle the download button click
function handleThreejsDownload(editor) {
    const shaderCode = editor.getValue();
    const sampleCode = generateThreeJsSample(shaderCode);
    openInNewTab(sampleCode);
}

// Initialize download functionality
function initDownloadButton(editor) {
    const downloadButton = document.getElementById('downloadButton');
    if (downloadButton) {
        downloadButton.addEventListener('click', () => handleThreejsDownload(editor));
    }
}

function generateThreeShader(glslCode) {
    // Remove any existing main function and "How to port shaders" comment section
    let cleanCode = glslCode.replace(/\/\/ ----[^]*?void main\(\)[^]*?}/, '');
    
    // Add the main function at the end, keeping original color output
    return cleanCode + `

void main() {
    mainImage(fragColor, gl_FragCoord.xy);
}`;
}

export { initDownloadButton };
