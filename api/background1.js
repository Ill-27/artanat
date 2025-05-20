const { validateToken } = require('./_auth');
const { createHmac } = require('crypto');

module.exports = (req, res) => {
  try {
    // 1. Проверка авторизации
    const token = req.headers['x-auth-token'];
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ua = req.headers['user-agent'] || '';
    
    if (!validateToken(token, ip, ua)) {
      return res.status(401).send('Invalid or expired token');
    }

    // 2. Генерация уникального идентификатора сессии
    const sessionHash = createHmac('sha256', process.env.JWT_SECRET)
      .update(ip + ua + Date.now())
      .digest('hex')
      .slice(0, 12);

    // 3. Возвращаем защищенный код
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(`
      (function() {
        // ${sessionHash} | ARTERRII PROTECTED CONTENT
        try {
          // ======== БЛОК ИНИЦИАЛИЗАЦИИ ========
          const _0xad3b = ['\x41\x52\x54\x45\x52\x52\x49\x49','\x6C\x6F\x67','\x70\x72\x6F\x74\x65\x63\x74\x65\x64'];
          const canvas = document.createElement('canvas');
          canvas.style.cssText = \`
            position:fixed;
            top:0;
            left:0;
            width:100vw;
            height:100vh;
            z-index:-1000;
            pointer-events:none;
            opacity:0;
            transition:opacity 1.5s;
          \`;
          document.body.prepend(canvas);
          
          setTimeout(() => { canvas.style.opacity = '1' }, 100);

          // ======== ЗАЩИТА ОТ КОПИРОВАНИЯ ========
          const _0xfe72 = () => {
            if (!document.body.contains(canvas)) {
              const newCanvas = canvas.cloneNode(true);
              newCanvas.style.opacity = '1';
              document.body.prepend(newCanvas);
            }
          };
          setInterval(_0xfe72, 1500);
          canvas.oncontextmenu = () => false;

          // ======== ОСНОВНОЙ КОД ФОНА ========
          const gl = canvas.getContext('webgl', {preserveDrawingBuffer:false}) || 
                     canvas.getContext('experimental-webgl', {preserveDrawingBuffer:false});
          if (!gl) return;

          // Шейдеры (обфусцированные)
          const vShader = \`attribute vec3 aP;attribute float aS,aA,aC;uniform mat4 uP,uM;uniform float uT;varying float vA,vC;void main(){vec4 p=uM*vec4(aP,1.);p.xyz+=sin(uT*.001+aC*10.)*5.;gl_Position=uP*p;gl_PointSize=aS*(1.5+sin(uT*.005+aC)*.5);vA=aA;vC=aC;}\`;
          const fShader = \`precision highp float;uniform float uT;varying float vA,vC;vec3 gC(float i){int t=int(mod(i*10.,7.));if(t==0)return vec3(.5,0,1);if(t==1)return vec3(0,0,1);if(t==2)return vec3(0,.75,1);if(t==3)return vec3(0,1,.5);if(t==4)return vec3(1,1,0);if(t==5)return vec3(1,.38,0);if(t==6)return vec3(1,0,0);return vec3(.9);}void main(){float d=length(gl_PointCoord-vec2(.5));if(d>.5)discard;float a=vA*(.6+.4*sin(uT*.002+vC*10.));vec3 c=mix(vec3(.9),gC(vC),step(.93,vC));gl_FragColor=vec4(c,a*(1.-smoothstep(.3,.5,d)));}\`;

          // Компиляция шейдеров
          const sV = gl.createShader(gl.VERTEX_SHADER);
          gl.shaderSource(sV, vShader);
          gl.compileShader(sV);
          const sF = gl.createShader(gl.FRAGMENT_SHADER);
          gl.shaderSource(sF, fShader);
          gl.compileShader(sF);
          const p = gl.createProgram();
          gl.attachShader(p, sV);
          gl.attachShader(p, sF);
          gl.linkProgram(p);
          gl.useProgram(p);

          // Генерация звезд
          const SC = 7000;
          const pos = new Float32Array(SC*3);
          const sz = new Float32Array(SC);
          const alp = new Float32Array(SC);
          const clr = new Float32Array(SC);

          for(let i=0;i<SC;i++){
            pos[i*3]=(Math.random()-.5)*2500;
            pos[i*3+1]=(Math.random()-.5)*2500;
            pos[i*3+2]=(Math.random()-.5)*2500;
            sz[i]=.8+Math.random()*1.4;
            alp[i]=.7+Math.random()*.3;
            clr[i]=Math.random();
          }

          // Буферы
          const bP=gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER,bP);
          gl.bufferData(gl.ARRAY_BUFFER,pos,gl.STATIC_DRAW);
          const aP=gl.getAttribLocation(p,'aP');
          gl.enableVertexAttribArray(aP);
          gl.vertexAttribPointer(aP,3,gl.FLOAT,false,0,0);

          const bS=gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER,bS);
          gl.bufferData(gl.ARRAY_BUFFER,sz,gl.STATIC_DRAW);
          const aS=gl.getAttribLocation(p,'aS');
          gl.enableVertexAttribArray(aS);
          gl.vertexAttribPointer(aS,1,gl.FLOAT,false,0,0);

          const bA=gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER,bA);
          gl.bufferData(gl.ARRAY_BUFFER,alp,gl.STATIC_DRAW);
          const aA=gl.getAttribLocation(p,'aA');
          gl.enableVertexAttribArray(aA);
          gl.vertexAttribPointer(aA,1,gl.FLOAT,false,0,0);

          const bC=gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER,bC);
          gl.bufferData(gl.ARRAY_BUFFER,clr,gl.STATIC_DRAW);
          const aC=gl.getAttribLocation(p,'aC');
          gl.enableVertexAttribArray(aC);
          gl.vertexAttribPointer(aC,1,gl.FLOAT,false,0,0);

          // Матрицы
          const uP=gl.getUniformLocation(p,'uP');
          const uM=gl.getUniformLocation(p,'uM');
          const uT=gl.getUniformLocation(p,'uT');
          const prj=new Float32Array(16);
          const mdl=new Float32Array(16);

          function updMtx(){
            const f=1/Math.tan(75*Math.PI/360);
            const a=canvas.width/canvas.height;
            prj[0]=f/a;prj[5]=f;
            prj[10]=-1.0002;prj[11]=-1;
            prj[14]=-0.20002;
            mdl.fill(0);
            mdl[0]=mdl[5]=mdl[10]=mdl[15]=1;
            mdl[14]=-1200;
          }

          // Рендер
          let t=0;
          function render(){
            t+=16;
            gl.viewport(0,0,canvas.width,canvas.height);
            gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
            
            mdl[0]=Math.cos(t*.000135);
            mdl[2]=Math.sin(t*.000081);
            mdl[8]=-Math.sin(t*.00009);
            mdl[10]=Math.cos(t*.000081);
            
            gl.uniformMatrix4fv(uP,false,prj);
            gl.uniformMatrix4fv(uM,false,mdl);
            gl.uniform1f(uT,t);
            gl.drawArrays(gl.POINTS,0,SC);
            requestAnimationFrame(render);
          }

          // Ресайз
          function resize(){
            canvas.width=window.innerWidth*window.devicePixelRatio;
            canvas.height=window.innerHeight*window.devicePixelRatio;
            canvas.style.width=window.innerWidth+'px';
            canvas.style.height=window.innerHeight+'px';
            updMtx();
          }
          
          window.addEventListener('resize',resize);
          resize();
          gl.enable(gl.BLEND);
          gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
          updMtx();
          render();

        } catch(e) { 
          console.error(\`[\${_0xad3b[0]}] \${e.message}\`);
        }
      })();
    `);
  } catch (error) {
    res.status(500).send('Internal server error');
  }
};
