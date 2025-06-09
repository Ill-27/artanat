// arterii-starfield.js
(function() {
    // ================= ЗАЩИТА ================= //
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('copy', e => {
        e.clipboardData.setData('text/plain', '© ARTERRII Protected Content');
        e.preventDefault();
    });

    // ================= Создаем необходимые элементы ================= //
    const canvas = document.createElement('canvas');
    canvas.id = 'starfield';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    document.body.appendChild(canvas);

    const watermarkDiv = document.createElement('div');
    watermarkDiv.id = 'watermark';
    watermarkDiv.style.position = 'fixed';
    watermarkDiv.style.top = '0';
    watermarkDiv.style.left = '0';
    watermarkDiv.style.width = '100%';
    watermarkDiv.style.height = '100%';
    watermarkDiv.style.pointerEvents = 'none';
    watermarkDiv.style.zIndex = '9';
    document.body.appendChild(watermarkDiv);

    // Добавляем стили
    const style = document.createElement('style');
    style.textContent = `
        body { 
            margin: 0; 
            overflow: hidden; 
            background: transparent;
            touch-action: none;
            user-select: none;
            font-family: 'Fira Code', monospace;
        }
    `;
    document.head.appendChild(style);

    // Подключаем шрифт
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // ================= WEBGL STARFIELD ================= //
    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: false });

    if (!gl) {
        document.body.innerHTML = '<h1 style="color:red">WebGL not supported</h1>';
        throw new Error('WebGL not supported');
    }

    // Шейдеры для звездного поля
    const vertexShader = `
        attribute vec3 aPosition;
        attribute float aSize;
        attribute float aAlpha;
        attribute float aColorIndex;
        
        uniform mat4 uProjection;
        uniform mat4 uModelView;
        uniform float uTime;
        
        varying float vAlpha;
        varying float vColorIndex;
        
        void main() {
            vec4 pos = uModelView * vec4(aPosition, 1.0);
            pos.xyz += sin(uTime * 0.001 + aColorIndex * 10.0) * 5.0;
            gl_Position = uProjection * pos;
            gl_PointSize = aSize * (1.5 + sin(uTime * 0.005 + aColorIndex) * 0.5);
            vAlpha = aAlpha;
            vColorIndex = aColorIndex;
        }
    `;

    const fragmentShader = `
        precision highp float;
        
        uniform float uTime;
        varying float vAlpha;
        varying float vColorIndex;
        
        vec3 getColor(float index) {
            int colorType = int(mod(index * 10.0, 7.0));
            
            if (colorType == 0) return vec3(0.5, 0.0, 1.0);   // Фиолетовый
            if (colorType == 1) return vec3(0.0, 0.0, 1.0);   // Синий
            if (colorType == 2) return vec3(0.0, 0.75, 1.0);  // Голубой
            if (colorType == 3) return vec3(0.0, 1.0, 0.5);   // Зеленый
            if (colorType == 4) return vec3(1.0, 1.0, 0.0);   // Желтый
            if (colorType == 5) return vec3(1.0, 0.38, 0.0);  // Оранжевый
            if (colorType == 6) return vec3(1.0, 0.0, 0.0);   // Красный
            
            return vec3(0.9); // Белый
        }
        
        void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            
            float alpha = vAlpha * (0.6 + 0.4 * sin(uTime * 0.002 + vColorIndex * 10.0));
            vec3 color = mix(vec3(0.9), getColor(vColorIndex), step(0.93, vColorIndex));
            
            gl_FragColor = vec4(color, alpha * (1.0 - smoothstep(0.3, 0.5, dist)));
        }
    `;

    // Компиляция шейдеров
    function compileShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const vs = compileShader(gl, vertexShader, gl.VERTEX_SHADER);
    const fs = compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }
    
    gl.useProgram(program);

    // Генерация звезд
    const STARS_COUNT = 7000;
    const positions = new Float32Array(STARS_COUNT * 3);
    const sizes = new Float32Array(STARS_COUNT);
    const alphas = new Float32Array(STARS_COUNT);
    const colorIndices = new Float32Array(STARS_COUNT);

    for (let i = 0; i < STARS_COUNT; i++) {
        positions[i*3] = (Math.random() - 0.5) * 2500;
        positions[i*3+1] = (Math.random() - 0.5) * 2500;
        positions[i*3+2] = (Math.random() - 0.5) * 2500;
        
        sizes[i] = 0.8 + Math.random() * 1.4;
        alphas[i] = 0.7 + Math.random() * 0.3;
        colorIndices[i] = Math.random();
    }

    // Буферы
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    
    const alphaBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.STATIC_DRAW);
    
    const colorIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorIndexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorIndices, gl.STATIC_DRAW);

    // Атрибуты
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    
    const aSize = gl.getAttribLocation(program, 'aSize');
    gl.enableVertexAttribArray(aSize);
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 0, 0);
    
    const aAlpha = gl.getAttribLocation(program, 'aAlpha');
    gl.enableVertexAttribArray(aAlpha);
    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, 0, 0);
    
    const aColorIndex = gl.getAttribLocation(program, 'aColorIndex');
    gl.enableVertexAttribArray(aColorIndex);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorIndexBuffer);
    gl.vertexAttribPointer(aColorIndex, 1, gl.FLOAT, false, 0, 0);

    // Юниформы
    const uProjection = gl.getUniformLocation(program, 'uProjection');
    const uModelView = gl.getUniformLocation(program, 'uModelView');
    const uTime = gl.getUniformLocation(program, 'uTime');

    // Матрицы
    const projection = new Float32Array(16);
    const modelView = new Float32Array(16);
    
    function updateMatrix() {
        const fov = 75 * Math.PI / 180;
        const aspect = canvas.width / canvas.height;
        const near = 0.1;
        const far = 10000;
        
        // Projection matrix
        const f = 1.0 / Math.tan(fov / 2);
        projection.fill(0);
        projection[0] = f / aspect;
        projection[5] = f;
        projection[10] = (far + near) / (near - far);
        projection[11] = -1;
        projection[14] = (2 * far * near) / (near - far);
        
        // ModelView matrix
        modelView.fill(0);
        modelView[0] = 1;
        modelView[5] = 1;
        modelView[10] = 1;
        modelView[15] = 1;
        modelView[14] = -1200;
    }

    // Включение прозрачности
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Рендер звездного поля
    let time = 0;
    function renderStars() {
        time += 16;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Вращение
        const speed = 0.009;
        modelView[0] = Math.cos(time * speed * 0.15);
        modelView[2] = Math.sin(time * speed * 0.09);
        modelView[8] = -Math.sin(time * speed * 0.1);
        modelView[10] = Math.cos(time * speed * 0.09);
        
        gl.uniformMatrix4fv(uProjection, false, projection);
        gl.uniformMatrix4fv(uModelView, false, modelView);
        gl.uniform1f(uTime, time);
        
        gl.drawArrays(gl.POINTS, 0, STARS_COUNT);
        requestAnimationFrame(renderStars);
    }

    // Ресайз
    function resize() {
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        updateMatrix();
    }
    
    window.addEventListener('resize', resize);
    resize();
    updateMatrix();
    renderStars();

    // ================= ВОДЯНЫЕ ЗНАКИ ================= //
    // Загружаем Three.js динамически
    const loadThreeJS = new Promise((resolve) => {
        if (window.THREE) {
            return resolve(window.THREE);
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js';
        script.onload = () => {
            const fontLoaderScript = document.createElement('script');
            fontLoaderScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/FontLoader.js';
            fontLoaderScript.onload = () => resolve(window.THREE);
            document.head.appendChild(fontLoaderScript);
        };
        document.head.appendChild(script);
    });

    loadThreeJS.then((THREE) => {
        const watermarkScene = new THREE.Scene();
        const watermarkCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        watermarkCamera.position.z = 20;
        
        const watermarkRenderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true,
            powerPreference: "high-performance"
        });
        watermarkRenderer.setSize(window.innerWidth, window.innerHeight);
        watermarkRenderer.domElement.style.position = 'fixed';
        watermarkRenderer.domElement.style.top = '0';
        watermarkRenderer.domElement.style.left = '0';
        watermarkRenderer.domElement.style.zIndex = '9999';
        watermarkRenderer.domElement.style.pointerEvents = 'none';
        watermarkRenderer.domElement.style.opacity = '0.7';
        document.getElementById('watermark').appendChild(watermarkRenderer.domElement);

        // Параметры водяных знаков
        const watermarkConfig = {
            columns: 12,
            rows: 8,
            baseSize: 0.15,
            speed: 0.01,
            drift: 0.03,
            opacity: 0.6,
            colors: [
                new THREE.Color(0.95, 0.95, 1.0),
                new THREE.Color(1.0, 1.0, 1.0),
                new THREE.Color(0.9, 0.95, 1.0)
            ],
            updateInterval: 50
        };

        // Класс водяного знака
        class SeamlessWatermark {
            constructor(font) {
                this.font = font;
                this.meshes = [];
                this.timeElements = [];
                this.lastUpdate = 0;
                this.initSeamlessGrid();
                this.setupProtection();
            }
            
            initSeamlessGrid() {
                const texts = [
                    'Arterrrii', 'arterrii.ru', 
                    this.generateId(),
                    'v.1.9.5.25'
                ];
                
                const columnWidth = 80 / watermarkConfig.columns;
                const rowHeight = 60 / watermarkConfig.rows;
                
                for (let col = 0; col < watermarkConfig.columns; col++) {
                    for (let row = 0; row < watermarkConfig.rows * 1.5; row++) {
                        const isTime = (col % 3 === 0 && row % 5 === 0);
                        const text = isTime ? this.getCurrentTime() : 
                                   texts[Math.floor(Math.random() * texts.length)];
                        
                        this.createWatermark(
                            text,
                            -40 + col * columnWidth + (Math.random() - 0.5) * columnWidth * 0.8,
                            30 - row * rowHeight * 0.6 + (Math.random() - 0.5) * rowHeight * 0.4,
                            isTime
                        );
                    }
                }
            }
            
            createWatermark(text, x, y, isTime) {
                const size = watermarkConfig.baseSize * (0.8 + Math.random() * 0.5);
                const color = watermarkConfig.colors[
                    Math.floor(Math.random() * watermarkConfig.colors.length)
                ].clone();
                
                const geometry = new THREE.TextGeometry(text, {
                    font: this.font,
                    size: size,
                    height: 0.01,
                    curveSegments: 4
                });
                
                this.addSubtleNoise(geometry);
                
                const material = new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: watermarkConfig.opacity * (0.9 + Math.random() * 0.2),
                    blending: THREE.NormalBlending
                });
                
                const mesh = new THREE.Mesh(geometry, material);
                
                mesh.position.set(x, y, (Math.random() - 0.5) * 20);
                
                mesh.userData = {
                    speed: watermarkConfig.speed * (0.8 + Math.random() * 0.4),
                    drift: watermarkConfig.drift * (0.5 + Math.random()),
                    phase: Math.random() * Math.PI * 2,
                    isTime: isTime,
                    originalText: text,
                    color: color,
                    size: size,
                    initialY: y
                };
                
                watermarkScene.add(mesh);
                this.meshes.push(mesh);
                if (isTime) this.timeElements.push(mesh);
            }
            
            addSubtleNoise(geometry) {
                const position = geometry.attributes.position;
                const noiseIntensity = 0.03;
                
                for (let i = 0; i < position.count; i++) {
                    position.setZ(i, (Math.random() - 0.5) * noiseIntensity);
                }
                position.needsUpdate = true;
            }
            
            update(deltaTime) {
                if (deltaTime - this.lastUpdate > watermarkConfig.updateInterval) {
                    const timeStr = this.getCurrentTime();
                    this.timeElements.forEach(mesh => {
                        this.updateText(mesh, timeStr);
                    });
                    this.lastUpdate = deltaTime;
                }
                
                this.meshes.forEach(mesh => {
                    this.animateWatermark(mesh, deltaTime);
                });
            }
            
            updateText(mesh, newText) {
                mesh.geometry.dispose();
                mesh.geometry = new THREE.TextGeometry(newText, {
                    font: this.font,
                    size: mesh.userData.size,
                    height: 0.01,
                    curveSegments: 4
                });
                this.addSubtleNoise(mesh.geometry);
                mesh.userData.originalText = newText;
            }
            
            animateWatermark(mesh, time) {
                const ud = mesh.userData;
                
                mesh.position.y -= ud.speed;
                mesh.position.x += Math.cos(time * 0.001 + ud.phase) * ud.drift * 0.3;
                
                if (mesh.position.y < -30) {
                    mesh.position.y = 30;
                    mesh.position.x = ud.initialY + (Math.random() - 0.5) * 5;
                }
                
                mesh.material.opacity = watermarkConfig.opacity * 
                    (0.9 + Math.sin(time * 0.003 + ud.phase) * 0.1);
                
                if (Math.random() > 0.98) {
                    mesh.material.color.offsetHSL(0, (Math.random() - 0.5) * 0.05, 0);
                }
            }
            
            getCurrentTime() {
                const now = new Date();
                return now.toLocaleTimeString('ru-RU', { hour12: false });
            }
            
            generateId() {
                return 'ID-' + Array.from({length: 12}, () => 
                    Math.floor(Math.random() * 16).toString(16)).join('');
            }
            
            setupProtection() {
                setInterval(() => {
                    if (!document.getElementById('watermark').contains(watermarkRenderer.domElement)) {
                        document.getElementById('watermark').appendChild(watermarkRenderer.domElement);
                    }
                }, 1000);
                
                document.addEventListener('copy', (e) => {
                    e.clipboardData.setData('text/plain', '© ARTERRII Protected Content');
                    e.preventDefault();
                });
                
                document.body.addEventListener('keydown', (e) => {
                    if ((e.ctrlKey || e.metaKey) && (e.key === 'PrintScreen' || e.key === 's')) {
                        e.preventDefault();
                    }
                });
            }
        }

        // Загрузка шрифта и инициализация водяных знаков
        new THREE.FontLoader().load(
            'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/fonts/helvetiker_regular.typeface.json', 
            (font) => {
                const watermarkSystem = new SeamlessWatermark(font);
                
                let lastTime = 0;
                function animateWatermarks(currentTime) {
                    requestAnimationFrame(animateWatermarks);
                    const deltaTime = currentTime - lastTime;
                    lastTime = currentTime;
                    
                    watermarkSystem.update(currentTime);
                    watermarkRenderer.render(watermarkScene, watermarkCamera);
                }
                
                animateWatermarks(0);
            }
        );

        // Адаптивность водяных знаков
        window.addEventListener('resize', () => {
            watermarkCamera.aspect = window.innerWidth / window.innerHeight;
            watermarkCamera.updateProjectionMatrix();
            watermarkRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    });
})();
