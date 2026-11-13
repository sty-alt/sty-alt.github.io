/* Живой узор икат (адрас) на WebGL: каждая «нить» холста сдвинута по вертикали,
   отсюда характерные размытые края орнамента. Без библиотек. */
(() => {
  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

  const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uMouse;
uniform float uMode;
uniform float uThread;
uniform float uUnit;

float hash(float n){ return fract(sin(n * 91.3458) * 47453.5453); }
float vn(float x){
  float i = floor(x), f = fract(x);
  f = f * f * (3. - 2. * f);
  return mix(hash(i), hash(i + 1.), f);
}
vec3 pal(float i){
  i = mod(i, 6.);
  if (i < 1.) return vec3(.039, .063, .188);
  if (i < 2.) return vec3(.184, .298, 1.);
  if (i < 3.) return vec3(.953, .945, .906);
  if (i < 4.) return vec3(1., .31, .43);
  if (i < 5.) return vec3(.153, .827, .757);
  return vec3(1., .76, .28);
}
void main(){
  vec2 fc = gl_FragCoord.xy;
  float tid = floor(fc.x / uThread);
  float tx = (tid + .5) * uThread;
  float x = tx / uUnit;
  float y = fc.y / uUnit;

  float jit = (vn(tid * .11 + uTime * .05) - .5) * .6 + (hash(tid) - .5) * .17;
  float dm = (tx - uMouse.x) / uUnit;
  jit += exp(-dm * dm * 1.4) * uMouse.z * .42 * sin(uTime * 2.2 + tid * .33);
  y += jit + uTime * .05;

  float col = floor(x);
  float lx = fract(x) - .5;
  float ly = fract(y * .5 + hash(col + 3.)) - .5;
  float d = abs(lx) + abs(ly);
  float ring = floor(d * 5.);
  vec3 c = pal(ring + floor(hash(col * 7. + 1.) * 6.));
  if (abs(lx) > .435) c = pal(col * 2. + 1.);

  c *= .9 + .1 * hash(tid + 9.);
  c *= .95 + .05 * step(.5, fract(fc.y / uThread));

  vec2 uv = fc / uRes;
  float m = 1.;
  if (uMode < .5) m = smoothstep(.42, .74, uv.x) * smoothstep(0., .34, uv.y) * mix(1., .22, smoothstep(.8, .97, uv.y));
  else if (uMode < 1.5) m = smoothstep(0., .7, uv.y);
  gl_FragColor = vec4(mix(vec3(.039, .063, .188), c, m * .94), 1.);
}`;

  const compile = (gl, type, src) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };

  const createProgram = (gl) => {
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
  };

  const MODES = { fade: 0, strip: 1, full: 2 };

  const initIkat = (canvas) => {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    const program = gl && createProgram(gl);
    if (!program) return;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = Object.fromEntries(
      ['uRes', 'uTime', 'uMouse', 'uMode', 'uThread', 'uUnit'].map((name) => [name, gl.getUniformLocation(program, name)]),
    );
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const state = { dpr: 1, mouseX: -9999, strength: 0, target: 0, visible: false, raf: 0 };

    const modeNow = () => {
      const wanted = canvas.dataset.ikat || 'fade';
      const narrow = window.matchMedia('(max-width: 860px)').matches;
      return wanted === 'fade' && narrow ? MODES.strip : MODES[wanted];
    };

    const resize = () => {
      state.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(canvas.clientWidth * state.dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * state.dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      const unit = Math.min(Math.max(canvas.clientHeight / 3, 56), 132) * state.dpr;
      gl.uniform2f(u.uRes, w, h);
      gl.uniform1f(u.uThread, 3 * state.dpr);
      gl.uniform1f(u.uUnit, unit);
      gl.uniform1f(u.uMode, modeNow());
    };

    const draw = (ms) => {
      state.strength += (state.target - state.strength) * 0.06;
      gl.uniform1f(u.uTime, ms / 1000);
      gl.uniform3f(u.uMouse, state.mouseX, 0, state.strength);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (ms) => {
      draw(ms);
      state.raf = state.visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };
    const wake = () => {
      if (!still && !state.raf && state.visible && !document.hidden) state.raf = requestAnimationFrame(loop);
    };

    const host = canvas.parentElement;
    host.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect();
      state.mouseX = (event.clientX - rect.left) * state.dpr;
      state.target = 1;
    });
    host.addEventListener('pointerleave', () => { state.target = 0; });

    new ResizeObserver(() => { resize(); if (still) draw(4000); }).observe(canvas);
    new IntersectionObserver(([entry]) => { state.visible = entry.isIntersecting; wake(); }).observe(canvas);
    document.addEventListener('visibilitychange', wake);

    resize();
    draw(4000);
    canvas.classList.add('is-live');
  };

  document.querySelectorAll('canvas[data-ikat]').forEach(initIkat);
})();
