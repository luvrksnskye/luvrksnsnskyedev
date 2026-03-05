/* =============================================
   GLASS CANVAS MODULE
   Enhanced WebGL shader for video background
   with autonomous liquid distortion, chromatic
   aberration, FBM noise, and vignette.
   No pointer dependency - effect is purely
   time-driven for organic flowing movement.
   ============================================= */

class GlassCanvas {
    constructor() {
        this.canvas = null;
        this.gl = null;
        this.video = null;
        this.program = null;
        this.texture = null;
        this.uniforms = {};
        this.rafId = null;
        this.startTime = performance.now();
    }

    init() {
        this.canvas = document.getElementById('glass-canvas');
        this.video = document.getElementById('bgVideo');

        if (!this.canvas || !this.video) return;

        this.gl = this.canvas.getContext('webgl', {
            alpha: true,
            premultipliedAlpha: false,
            antialias: false,
            preserveDrawingBuffer: false,
        });

        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        this.resize();
        this.buildProgram();
        this.buildGeometry();
        this.buildTexture();
        this.cacheUniforms();
        this.bindEvents();
        this.start();
    }

    /* --- Shaders --- */

    get vertexSource() {
        return `
            attribute vec2 a_position;
            varying vec2 v_uv;
            void main() {
                v_uv = (a_position + 1.0) * 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
    }

    get fragmentSource() {
        return `
            precision mediump float;

            uniform sampler2D u_texture;
            uniform float u_time;
            uniform vec4 u_panels[20];
            uniform int u_panelCount;

            varying vec2 v_uv;

            /* Smooth value noise */
            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            /* 6-octave FBM for deep organic turbulence */
            float fbm(vec2 p) {
                float v = 0.0;
                float a = 0.5;
                vec2 shift = vec2(100.0);
                mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
                for (int i = 0; i < 6; i++) {
                    v += a * noise(p);
                    p = rot * p * 2.0 + shift;
                    a *= 0.5;
                }
                return v;
            }

            /* Warped FBM: feed FBM into itself for liquid swirl */
            float warpedFbm(vec2 p, float t) {
                vec2 q = vec2(
                    fbm(p + vec2(0.0, 0.0) + t * 0.15),
                    fbm(p + vec2(5.2, 1.3) + t * 0.12)
                );
                vec2 r = vec2(
                    fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.1),
                    fbm(p + 4.0 * q + vec2(8.3, 2.8) + t * 0.08)
                );
                return fbm(p + 3.5 * r);
            }

            /* Caustics-like pattern from intersecting sine waves */
            float caustics(vec2 p, float t) {
                float c = 0.0;
                /* Three rotated wave layers */
                c += sin(p.x * 18.0 + t * 1.2) * sin(p.y * 14.0 - t * 0.9);
                c += sin((p.x * 0.7 + p.y * 0.7) * 22.0 + t * 1.5) * 0.6;
                c += sin((p.x * 0.9 - p.y * 0.4) * 16.0 - t * 1.1) * 0.4;
                return c * 0.33;
            }

            /* Soft panel mask with edge falloff */
            float panelMask(vec2 uv) {
                float mask = 0.0;
                for (int i = 0; i < 20; i++) {
                    if (i >= u_panelCount) break;
                    vec4 r = u_panels[i];
                    vec2 center = r.xy + r.zw * 0.5;
                    vec2 half_size = r.zw * 0.5;
                    vec2 d = abs(uv - center) - half_size;
                    float edge = max(d.x, d.y);
                    float soft = smoothstep(0.0, -0.012, edge);
                    mask = max(mask, soft);
                }
                return mask;
            }

            void main() {
                vec2 uv = v_uv;
                float t = u_time;
                float mask = panelMask(uv);

                vec2 distorted = uv;

                if (mask > 0.01) {
                    /* --- Primary liquid distortion (warped FBM) --- */
                    float warp1 = warpedFbm(uv * 4.0, t);
                    float warp2 = warpedFbm(uv * 4.0 + vec2(3.7, 7.1), t);

                    /* --- Layered wave patterns at different scales --- */
                    /* Large slow swell */
                    float wave1 = sin(uv.x * 8.0 + t * 0.7) * sin(uv.y * 6.0 + t * 0.5) * 0.005;
                    /* Medium ripple */
                    float wave2 = sin(uv.x * 16.0 - t * 1.3) * sin(uv.y * 14.0 + t * 1.0) * 0.003;
                    /* Fine shimmer */
                    float wave3 = sin(uv.x * 28.0 + t * 2.2) * cos(uv.y * 24.0 - t * 1.8) * 0.0015;

                    float totalWave = wave1 + wave2 + wave3;

                    /* Combine warped noise + waves */
                    float strength = mask * 0.018;
                    distorted.x += (warp1 - 0.5) * strength + totalWave;
                    distorted.y += (warp2 - 0.5) * strength + totalWave * 0.85;
                }

                /* --- Chromatic aberration (stronger) --- */
                float aberration = mask * 0.004;
                vec2 dir = distorted - 0.5;
                float r = texture2D(u_texture, distorted + dir * aberration).r;
                float g = texture2D(u_texture, distorted).g;
                float b = texture2D(u_texture, distorted - dir * aberration).b;
                vec3 color = vec3(r, g, b);

                /* --- Caustics light pattern overlay --- */
                if (mask > 0.01) {
                    float c = caustics(uv * 5.0, t);
                    /* Bright caustic highlights */
                    float highlight = smoothstep(0.3, 0.9, c) * mask * 0.06;
                    color += highlight;
                    /* Subtle color shift in caustics */
                    color.b += smoothstep(0.4, 0.8, c) * mask * 0.02;
                }

                /* Brightness boost inside panels */
                color += mask * 0.025;

                /* Vignette */
                float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv - 0.5) * 1.2);
                color *= mix(0.85, 1.0, vignette);

                gl_FragColor = vec4(color, 1.0);
            }
        `;
    }

    /* --- Build --- */

    buildProgram() {
        const gl = this.gl;
        const vs = this.compileShader(gl.VERTEX_SHADER, this.vertexSource);
        const fs = this.compileShader(gl.FRAGMENT_SHADER, this.fragmentSource);

        this.program = gl.createProgram();
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Shader link error:', gl.getProgramInfoLog(this.program));
        }

        gl.useProgram(this.program);
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    buildGeometry() {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1, 1, -1, -1, 1, 1, 1
        ]), gl.STATIC_DRAW);

        const pos = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    }

    buildTexture() {
        const gl = this.gl;
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }

    cacheUniforms() {
        const gl = this.gl;
        this.uniforms = {
            time: gl.getUniformLocation(this.program, 'u_time'),
            panels: gl.getUniformLocation(this.program, 'u_panels'),
            panelCount: gl.getUniformLocation(this.program, 'u_panelCount'),
        };
    }

    /* --- Events --- */

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const dpr = Math.min(window.devicePixelRatio, 1.5);
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    /* --- Panel detection --- */

    getPanelRects() {
        const panels = document.querySelectorAll('.glass-panel');
        const rects = [];
        const w = window.innerWidth;
        const h = window.innerHeight;

        panels.forEach(panel => {
            const r = panel.getBoundingClientRect();
            rects.push(
                r.left / w,
                1.0 - (r.bottom / h),
                r.width / w,
                r.height / h
            );
        });

        return rects;
    }

    /* --- Render loop --- */

    start() {
        const render = () => {
            this.rafId = requestAnimationFrame(render);
            this.draw();
        };
        this.video.play().catch(() => {});
        requestAnimationFrame(render);
    }

    draw() {
        const gl = this.gl;
        const elapsed = (performance.now() - this.startTime) * 0.001;

        /* Upload video frame */
        if (this.video.readyState >= 2) {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
        }

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        /* Panel data */
        const panelData = this.getPanelRects();
        const padded = new Float32Array(80);
        for (let i = 0; i < panelData.length && i < 80; i++) {
            padded[i] = panelData[i];
        }

        gl.uniform1f(this.uniforms.time, elapsed);
        gl.uniform4fv(this.uniforms.panels, padded);
        gl.uniform1i(this.uniforms.panelCount, Math.min(Math.floor(panelData.length / 4), 20));

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }
}

const glassCanvas = new GlassCanvas();
export default glassCanvas;
