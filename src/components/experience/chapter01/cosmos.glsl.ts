// Shader source for the Chapter 01 matter/light field.
//
// Step A establishes the static visual language: a center-biased, gently
// drifting cloud of points rendered as soft additive glows. The `uExpansion`
// uniform is declared now (default 0.5) but not yet driven by any control —
// Step B will wire it to the dial so the cosmos responds in real time.

export const cosmosVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uExpansion;

  attribute float aScale;
  attribute float aSeed;
  attribute float aColorMix;
  attribute float aRadius;

  varying float vTwinkle;
  varying float vMix;
  varying float vDepth;

  void main() {
    vec3 pos = position;

    // Slow per-point drift so the field feels alive, never static.
    float phase = aSeed * 6.2831853;
    float t = uTime * 0.06;
    pos.x += sin(t + phase) * 0.05 * (0.4 + aRadius);
    pos.y += cos(t * 0.8 + phase) * 0.05 * (0.4 + aRadius);
    pos.z += sin(t * 0.5 + phase * 1.3) * 0.05 * (0.4 + aRadius);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Per-point twinkle, each on its own clock.
    float twinkle = 0.55 + 0.45 * sin(uTime * 1.4 + aSeed * 42.0);

    // Perspective-correct sizing with a gentle floor so distant motes survive.
    float perspective = 320.0 / max(-mvPosition.z, 0.001);
    gl_PointSize = uSize * aScale * twinkle * uPixelRatio * perspective;

    vTwinkle = twinkle;
    vMix = aColorMix;
    vDepth = clamp(-mvPosition.z / 14.0, 0.0, 1.0);
  }
`;

export const cosmosFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColorA; // indigo  — the cold/outer tone
  uniform vec3 uColorB; // goldilocks green — the living core
  uniform vec3 uColorC; // warm    — embers / first light

  varying float vTwinkle;
  varying float vMix;
  varying float vDepth;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);

    // Soft round mote with a hot core.
    float soft = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.16, 0.0, d);

    vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.55, vMix));
    col = mix(col, uColorC, smoothstep(0.55, 1.0, vMix));
    col += core * 0.7;

    // Fade with depth so the cloud has volume rather than a flat wall.
    float depthFade = mix(1.0, 0.35, vDepth);
    float alpha = soft * vTwinkle * depthFade;

    gl_FragColor = vec4(col, alpha);
  }
`;
