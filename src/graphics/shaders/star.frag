// Basic Star Fragment Shader
uniform float uTime;
uniform vec3 uColor; // Base star color
uniform float uStageProgress; // 0.0 to 1.0 within stage
uniform float uIntensity; // Controls overall brightness/emissive

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

// Basic noise function (as above)
float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
float noise(vec2 st) { vec2 i=floor(st),f=fract(st); float a=random(i),b=random(i+vec2(1.,0.)),c=random(i+vec2(0.,1.)),d=random(i+vec2(1.,1.)); vec2 u=f*f*(3.-2.*f); return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y; }
float fbm(vec2 st) { float v=.0,a=.5; for(int i=0;i<5;i++){v+=a*noise(st);st*=2.;a*=.5;} return v; }

void main() {
  // Surface noise / texture
  float timeFactor = uTime * 0.2;
  vec2 uv = vUv * 4.0;
  float surfaceNoise = fbm(uv + vec2(timeFactor * 0.5, -timeFactor));
  surfaceNoise = smoothstep(0.3, 0.7, surfaceNoise);

  // Core brightness
  float coreFactor = 1.0 - length(vUv - 0.5) * 2.0; // Brighter at center
  coreFactor = smoothstep(0.0, 1.0, coreFactor);

  // Limb darkening/brightening (using normal/view direction)
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float limbFactor = abs(dot(viewDirection, vNormal)); // 1 at center, 0 at edge
  limbFactor = pow(limbFactor, 0.5); // Adjust falloff

  // Combine factors
  float brightness = (coreFactor * 0.6 + surfaceNoise * 0.4 + pow(1.0 - limbFactor, 2.0) * 0.5) * uIntensity; // Base + surface + limb glow
  brightness = clamp(brightness, 0.0, 1.5); // Clamp brightness

  vec3 finalColor = uColor * brightness;

  gl_FragColor = vec4(finalColor, 1.0); // Stars are opaque
}
