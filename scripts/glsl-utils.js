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
    // Clean up the shader code
    const cleanShader = fragmentShader
        .replace(/#version 300 es\s*\n/, '')  // Remove version directive
        .replace(/true/g, '')  // Remove 'true' strings added by the editor
        .replace(/\n\s*\n+/g, '\n\n');  // Clean up multiple empty lines

    // Basic vertex shader for WebGL2 (without version directive)
    const vertexShader = `in vec3 position;
        void main() {
            gl_Position = vec4(position, 1.0);
        }`;

    // Log the cleaned shader for debugging
    console.log('Clean shader:', cleanShader);

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
    <script async src="https://unpkg.com/es-module-shims@1.8.0/dist/es-module-shims.js"></script>
    <script type="importmap">
    {
        "imports": {
            "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
            "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
        }
    }
    </script>

    <script type="module">
        import * as THREE from 'three';

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        
        // Resize handler
        function onWindowResize() {
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize);

        // Define shaders
        const vertexShader = \`${vertexShader}\`;
        const fragmentShader = \`${cleanShader}\`;

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
            glslVersion: THREE.GLSL3
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

export { initDownloadButton };
