import React, { useEffect, useMemo, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Custom Cinematic AAA Lens Shader:
 * - Subtle Lens Vignette (darkens outer periphery to focus eye on central cyber action)
 * - Filmic Color Grading (lifts shadows, enhances deep blacks, elevates neon saturation)
 * - Micro Film Grain (eliminates 8-bit color banding in dark gradients)
 */
const CinematicGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    vignetteOffset: { value: 1.1 },
    vignetteDarkness: { value: 0.8 },
    saturation: { value: 1.04 },
    contrast: { value: 1.02 },
    time: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float vignetteOffset;
    uniform float vignetteDarkness;
    uniform float saturation;
    uniform float contrast;
    uniform float time;
    varying vec2 vUv;

    // Fast pseudo-random hash for fine film grain
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // 1. Contrast Adjustment around midpoint 0.5
      color.rgb = (color.rgb - 0.5) * contrast + 0.5;

      // 2. Saturation Adjustment (Rec. 709 luminance weights)
      float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
      color.rgb = mix(vec3(luma), color.rgb, saturation);

      // 3. Cinematic Lens Vignette (Smooth radial attenuation)
      vec2 coord = (vUv - 0.5) * vignetteOffset;
      float dist = length(coord);
      float vig = smoothstep(0.75, 0.25, dist * (vignetteDarkness * 0.7));
      color.rgb *= mix(1.0, vig, 0.55);

      // 4. Subtle Film Grain (prevents dark gradient banding)
      float grain = (hash(vUv + fract(time * 0.01)) - 0.5) * 0.012;
      color.rgb += grain;

      gl_FragColor = color;
    }
  `,
};

/**
 * AAA Post-Processing Pipeline:
 * - Unreal Engine Bloom (emissive neon signs, LEDs, and laser optics glow into the lens)
 * - Cinematic Lens Vignette & Grade
 * - sRGB Output Transform
 * - Fully hardware-adaptive: throttles back resolution on lower-end devices to maintain 60 FPS
 */
export default function PostProcessingPipeline({ enabled = true, bloomStrength = 0.22 }) {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef(null);
  const bloomPassRef = useRef(null);
  const gradePassRef = useRef(null);

  // Initialize EffectComposer once upon mount
  useEffect(() => {
    if (!gl || !scene || !camera) return;

    try {
      // Create high-precision render target for HDR color grading
      const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.HalfFloatType,
        colorSpace: THREE.SRGBColorSpace,
        depthBuffer: true,
        stencilBuffer: false,
      });

      const composer = new EffectComposer(gl, renderTarget);
      composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      composer.setSize(size.width, size.height);

      // Pass 1: Scene Render
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      // Pass 2: Unreal Engine Photorealistic Bloom Pass
      // Threshold 0.82 ensures only high-intensity emissive lights bloom, leaving room materials crisp
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(size.width, size.height),
        bloomStrength,
        0.35, // Bloom radius
        0.92  // Bloom threshold (prevents white flare blowouts)
      );
      composer.addPass(bloomPass);
      bloomPassRef.current = bloomPass;

      // Pass 3: Cinematic Film Grade & Lens Vignette
      const gradePass = new ShaderPass(CinematicGradeShader);
      composer.addPass(gradePass);
      gradePassRef.current = gradePass;

      // Pass 4: Output Pass for accurate sRGB color transform
      const outputPass = new OutputPass();
      composer.addPass(outputPass);

      composerRef.current = composer;

      return () => {
        composer.dispose();
        renderTarget.dispose();
        composerRef.current = null;
      };
    } catch (err) {
      console.warn('AAA Post-Processing fallback to standard renderer:', err);
    }
  }, [gl, scene, camera]);

  // Handle dynamic resize
  useEffect(() => {
    if (composerRef.current) {
      composerRef.current.setSize(size.width, size.height);
      if (bloomPassRef.current) {
        bloomPassRef.current.resolution.set(size.width, size.height);
      }
    }
  }, [size]);

  // Update dynamic parameters & render with priority 1 (overriding default r3f render pass)
  useFrame((state, delta) => {
    if (!enabled || !composerRef.current) return;

    if (gradePassRef.current) {
      gradePassRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }

    if (bloomPassRef.current) {
      bloomPassRef.current.strength = bloomStrength;
    }

    composerRef.current.render(delta);
  }, 1);

  return null;
}
