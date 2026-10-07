import * as THREE from 'three';

// Authentic Atmospheric Limb Rim Shader (Zero obscuration in center, pure edge limb)
export const AtmosphereShaderMaterial = {
  uniforms: {
    color: { value: new THREE.Color('#00d2d3') },
    glowIntensity: { value: 1.0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform float glowIntensity;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vec3 viewDir = normalize(vViewPosition);
      // NdotV is 1.0 at center facing camera (0.0 fresnel = 100% transparent surface!)
      // NdotV approaches 0.0 at grazing edge (1.0 fresnel = delicate atmospheric rim)
      float NdotV = max(0.0, dot(vNormal, viewDir));
      float fresnel = pow(1.0 - NdotV, 4.0);
      float alpha = clamp(fresnel * glowIntensity * 0.75, 0.0, 1.0);
      gl_FragColor = vec4(color, alpha);
    }
  `,
};

// Accretion Disk Shader with Doppler Beaming and Radial Distortion
export const AccretionDiskShader = {
  uniforms: {
    time: { value: 0 },
    innerRadius: { value: 1.5 },
    outerRadius: { value: 4.5 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPos;
    void main() {
      vUv = uv;
      vPos = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    varying vec2 vUv;
    varying vec3 vPos;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f*f*(3.0-2.0*f);
      return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                 mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
    }

    void main() {
      vec2 centered = vUv - 0.5;
      float dist = length(centered) * 2.0;

      if (dist < 0.35 || dist > 0.98) {
        discard;
      }

      float angle = atan(centered.y, centered.x);
      // Swirling rotation
      float swirl = angle * 3.0 + dist * 12.0 - time * 2.5;
      float n = noise(vec2(swirl, dist * 8.0));

      // Relativistic Doppler beaming: one side shines hotter and brighter
      float beaming = 0.5 + 0.5 * sin(angle);

      // Color temperature ramp: from blue-white near ISCO to fiery orange/red outer edge
      float temp = clamp((1.0 - dist) * 1.5, 0.0, 1.0);
      vec3 innerCol = vec3(1.0, 0.95, 0.8);
      vec3 midCol = vec3(1.0, 0.55, 0.1);
      vec3 outerCol = vec3(0.9, 0.15, 0.05);

      vec3 col = mix(outerCol, midCol, smoothstep(0.4, 0.7, dist));
      col = mix(col, innerCol, smoothstep(0.7, 0.95, 1.0 - dist));
      col *= (0.8 + 0.5 * n) * (0.8 + 0.4 * beaming);

      // Smooth alpha falloff at inner and outer boundaries
      float alpha = smoothstep(0.35, 0.42, dist) * smoothstep(0.98, 0.85, dist);

      gl_FragColor = vec4(col * 2.0, alpha * 0.95);
    }
  `,
};
