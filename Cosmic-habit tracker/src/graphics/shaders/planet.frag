// Basic Planet Fragment Shader (Placeholder)
uniform float uTime;
uniform vec3 uColor; // Base planet color
uniform float uStageProgress;
uniform float uIntensity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

// Basic noise function (as above)
float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
float noise(vec2 st) { vec2 i=floor(st),f=fract(st); float a=random(i),b=random(i+vec2(1.,0.)),c=random(i+vec2(0.,1.)),d=random(i+vec2(1.,1.)); vec2 u=f*f*(3.-2.*f); return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y; }
float fbm(vec2 st) { float v=.0,a=.5; for(int i=0;i<6;i++){v+=a*noise(st);st*=2.;a*=.5;} return v; }

void main() {
  // Simple procedural texture
  float n = fbm(vUv * 6.0 + uTime * 0.05);
  vec3 surfaceColor = uColor * (0.5 + n * 0.5); // Vary base color with noise

  // Basic lighting (diffuse)
  vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0)); // Example light direction
  float diffuse = max(dot(vNormal, lightDirection), 0.0);

  // Atmosphere glow (rim lighting)
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float rim = 1.0 - abs(dot(viewDirection, vNormal));
  rim = pow(rim, 3.0) * 1.5; // Sharper rim glow

  vec3 finalColor = surfaceColor * diffuse * uIntensity + uColor * rim * 0.8; // Surface + Rim

  gl_FragColor = vec4(finalColor, 1.0);
}
