function initStarfieldBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'starfield-bg';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-9999'; // Очень низкий z-index
    canvas.style.pointerEvents = 'none'; // Чтобы не блокировал клики
    document.body.insertBefore(canvas, document.body.firstChild);

    const gl = canvas.getContext('webgl', { 
        preserveDrawingBuffer: false,
        alpha: true // Включаем поддержку прозрачности
    });

    if (!gl) {
        console.error('WebGL not supported for background');
        return;
    }

    // Шейдеры
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
            
            return vec3(1.0); // Белый (был черный)
        }
        
        void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            
            float alpha = vAlpha * (0.6 + 0.4 * sin(uTime * 0.002 + vColorIndex * 10.0));
            vec3 color = mix(vec3(1.0), getColor(vColorIndex), step(0.93, vColorIndex)); // Белый вместо черного
            
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
    const STARS_COUNT = 70000;
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

    // Рендер
    let time = 0;
    function render() {
        time += 16;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0); // Прозрачный фон (альфа = 0)
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
        requestAnimationFrame(render);
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
    render();
}

// Инициализация фона при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initStarfieldBackground();
});
