// Basic Nebula Fragment Shader
uniform float uTime;
uniform vec3 uColor1; // Base color
uniform vec3 uColor2; // Swirl color
uniform float uStageProgress; // 0.0 to 1.0 within stage (not used yet)

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

// Basic noise function (replace with glsl-noise later if needed)
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    for (int i = 0; i < 4; i++) { // Octaves
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}


void main() {
  // Simple swirling noise pattern
  float timeFactor = uTime * 0.1;
  vec2 uv = vUv * 3.0; // Scale UVs
  float n = fbm(uv + vec2(timeFactor, -timeFactor * 0.5));

  // Mix colors based on noise
  vec3 mixedColor = mix(uColor1, uColor2, smoothstep(0.3, 0.7, n));

  // Add some transparency and glow towards edges (using normal/view direction)
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float edgeFactor = 1.0 - abs(dot(viewDirection, vNormal));
  edgeFactor = pow(edgeFactor, 2.0); // Sharpen the edge glow

  float alpha = smoothstep(0.2, 0.8, n) * 0.6 + edgeFactor * 0.4; // Base opacity + edge glow

  gl_FragColor = vec4(mixedColor, alpha);
}
