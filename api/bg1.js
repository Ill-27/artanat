// api/bg1.js

const jwt = require('jsonwebtoken')

const SECRET = 'ArTERRII_3D-ProT3ct!on_Key_89d2@r0Wz'

module.exports = (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace('Bearer ', '')

  try {
    jwt.verify(token, SECRET)
  } catch (err) {
    res.status(401).send('Unauthorized')
    return
  }

  // HTML-код фона (минифицированный)
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ARTERII SECURE STARFIELD</title><style>body{margin:0;overflow:hidden;background:transparent;touch-action:none;user-select:none;font-family:'Fira Code',monospace}canvas{display:block;width:100vw;height:100vh;position:fixed;top:0;left:0}#watermark{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999}</style><link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400&display=swap" rel="stylesheet"></head><body><canvas id="starfield"></canvas><div id="watermark"></div><script src="https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js"></script><script src="https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/FontLoader.js"></script><script>
document.addEventListener("contextmenu",e=>e.preventDefault());
document.addEventListener("copy",e=>{e.clipboardData.setData("text/plain","© ARTERRII Protected Content");e.preventDefault();});
const canvas=document.getElementById("starfield"),gl=canvas.getContext("webgl",{preserveDrawingBuffer:!1});
if(!gl){document.body.innerHTML='<h1 style="color:red">WebGL not supported</h1>';throw new Error("WebGL not supported")}
const vertexShader=`attribute vec3 aPosition;attribute float aSize,aAlpha,aColorIndex;uniform mat4 uProjection,uModelView;uniform float uTime;varying float vAlpha,vColorIndex;void main(){vec4 pos=uModelView*vec4(aPosition,1.0);pos.xyz+=sin(uTime*.001+aColorIndex*10.0)*5.0;gl_Position=uProjection*pos;gl_PointSize=aSize*(1.5+sin(uTime*.005+aColorIndex)*.5);vAlpha=aAlpha;vColorIndex=aColorIndex;}`,
fragmentShader=`precision highp float;uniform float uTime;varying float vAlpha,vColorIndex;vec3 getColor(float index){int c=int(mod(index*10.0,7.0));if(c==0)return vec3(0.5,0.0,1.0);if(c==1)return vec3(0.0,0.0,1.0);if(c==2)return vec3(0.0,0.75,1.0);if(c==3)return vec3(0.0,1.0,0.5);if(c==4)return vec3(1.0,1.0,0.0);if(c==5)return vec3(1.0,0.38,0.0);if(c==6)return vec3(1.0,0.0,0.0);return vec3(0.9);}void main(){float d=length(gl_PointCoord-vec2(0.5));if(d>0.5)discard;float a=vAlpha*(0.6+0.4*sin(uTime*.002+vColorIndex*10.0));vec3 c=mix(vec3(0.9),getColor(vColorIndex),step(0.93,vColorIndex));gl_FragColor=vec4(c,a*(1.0-smoothstep(0.3,0.5,d)));}`;
function compileShader(g,s,t){const sh=g.createShader(t);g.shaderSource(sh,s);g.compileShader(sh);if(!g.getShaderParameter(sh,g.COMPILE_STATUS)){console.error(g.getShaderInfoLog(sh));g.deleteShader(sh);return null}return sh}
const vs=compileShader(gl,vertexShader,gl.VERTEX_SHADER),fs=compileShader(gl,fragmentShader,gl.FRAGMENT_SHADER),program=gl.createProgram();
gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
if(!gl.getProgramParameter(program,gl.LINK_STATUS))console.error(gl.getProgramInfoLog(program));
gl.useProgram(program);
const STARS_COUNT=7000,positions=new Float32Array(STARS_COUNT*3),sizes=new Float32Array(STARS_COUNT),alphas=new Float32Array(STARS_COUNT),colorIndices=new Float32Array(STARS_COUNT);
for(let i=0;i<STARS_COUNT;i++){positions[i*3]=(Math.random()-.5)*2500;positions[i*3+1]=(Math.random()-.5)*2500;positions[i*3+2]=(Math.random()-.5)*2500;sizes[i]=.8+Math.random()*1.4;alphas[i]=.7+Math.random()*.3;colorIndices[i]=Math.random();}
const positionBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);gl.bufferData(gl.ARRAY_BUFFER,positions,gl.STATIC_DRAW);
const sizeBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,sizeBuffer);gl.bufferData(gl.ARRAY_BUFFER,sizes,gl.STATIC_DRAW);
const alphaBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,alphaBuffer);gl.bufferData(gl.ARRAY_BUFFER,alphas,gl.STATIC_DRAW);
const colorIndexBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,colorIndexBuffer);gl.bufferData(gl.ARRAY_BUFFER,colorIndices,gl.STATIC_DRAW);
const aPosition=gl.getAttribLocation(program,"aPosition");gl.enableVertexAttribArray(aPosition);gl.bindBuffer(gl.ARRAY_BUFFER,positionBuffer);gl.vertexAttribPointer(aPosition,3,gl.FLOAT,!1,0,0);
const aSize=gl.getAttribLocation(program,"aSize");gl.enableVertexAttribArray(aSize);gl.bindBuffer(gl.ARRAY_BUFFER,sizeBuffer);gl.vertexAttribPointer(aSize,1,gl.FLOAT,!1,0,0);
const aAlpha=gl.getAttribLocation(program,"aAlpha");gl.enableVertexAttribArray(aAlpha);gl.bindBuffer(gl.ARRAY_BUFFER,alphaBuffer);gl.vertexAttribPointer(aAlpha,1,gl.FLOAT,!1,0,0);
const aColorIndex=gl.getAttribLocation(program,"aColorIndex");gl.enableVertexAttribArray(aColorIndex);gl.bindBuffer(gl.ARRAY_BUFFER,colorIndexBuffer);gl.vertexAttribPointer(aColorIndex,1,gl.FLOAT,!1,0,0);
const uProjection=gl.getUniformLocation(program,"uProjection"),uModelView=gl.getUniformLocation(program,"uModelView"),uTime=gl.getUniformLocation(program,"uTime");
const projection=new Float32Array(16),modelView=new Float32Array(16);
function updateMatrix(){const fov=75*Math.PI/180,aspect=canvas.width/canvas.height,near=.1,far=1e4,f=1/Math.tan(fov/2);projection.fill(0);projection[0]=f/aspect;projection[5]=f;projection[10]=(far+near)/(near-far);projection[11]=-1;projection[14]=2*far*near/(near-far);modelView.fill(0);modelView[0]=1;modelView[5]=1;modelView[10]=1;modelView[15]=1;modelView[14]=-1200;}
gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
let time=0;
function renderStars(){time+=16;gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);const speed=.009;modelView[0]=Math.cos(time*speed*.15);modelView[2]=Math.sin(time*speed*.09);modelView[8]=-Math.sin(time*speed*.1);modelView[10]=Math.cos(time*speed*.09);gl.uniformMatrix4fv(uProjection,!1,projection);gl.uniformMatrix4fv(uModelView,!1,modelView);gl.uniform1f(uTime,time);gl.drawArrays(gl.POINTS,0,STARS_COUNT);requestAnimationFrame(renderStars);}
function resize(){canvas.width=window.innerWidth*window.devicePixelRatio;canvas.height=window.innerHeight*window.devicePixelRatio;canvas.style.width=window.innerWidth+"px";canvas.style.height=window.innerHeight+"px";updateMatrix();}
window.addEventListener("resize",resize);resize();updateMatrix();renderStars();
</script></body></html>`

  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).send(html)
}
