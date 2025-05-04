// Basic Vertex Shader
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition; // World position

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
