"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  sampleLogoCloud,
  sampleKangarooCloud,
  sampleHumanCloud,
  sampleScatterCloud,
  pointsToFloat32,
} from "@/lib/particles";

gsap.registerPlugin(ScrollTrigger);

const PRIMARY = new THREE.Color("#ad96f9");
const ACCENT = new THREE.Color("#d1547f");

// Scroll-progress (0..1 across the whole #scroll-track) boundaries for each
// act of the sequence: logo -> kangaroo -> hop -> hop (-> human mid-hop) -> run.
const P_LOGO_END = 0.2;
const P_JUMP1_END = 0.38;
const P_JUMP2_END = 0.58;
const P_RUN_END = 0.94;

const HOP1_AMPLITUDE = 0.55;
const HOP2_AMPLITUDE = 0.7;
const HOP_FORWARD_1 = 0.16;
const HOP_FORWARD_2 = 0.2;
const RUN_DRIFT = 0.3;
const RUN_BOB_AMPLITUDE = 0.07;
const RUN_BOB_CYCLES = 5;

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

const VERTEX_SHADER = /* glsl */ `
  uniform float uGenesis;
  uniform float uShapeMorph;
  uniform float uHopY;
  uniform float uHopSquashX;
  uniform float uHopSquashY;
  uniform float uDriftX;
  uniform float uRunBob;
  uniform float uTime;
  uniform float uPixelRatio;
  attribute vec3 aScatter;
  attribute vec3 aLogo;
  attribute vec3 aKangaroo;
  attribute vec3 aHuman;
  attribute vec3 aColor;
  attribute float aRand;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 shapeA = mix(aLogo, aKangaroo, clamp(uShapeMorph, 0.0, 1.0));
    vec3 shaped = mix(shapeA, aHuman, clamp(uShapeMorph - 1.0, 0.0, 1.0));
    vec3 pos = mix(aScatter, shaped, uGenesis);

    pos.x += sin(uTime * 0.6 + aRand * 6.2831) * 0.012;
    pos.y += cos(uTime * 0.5 + aRand * 6.2831) * 0.012;

    pos.x *= uHopSquashX;
    pos.y *= uHopSquashY;
    pos.y += uHopY + uRunBob;
    pos.x += uDriftX;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depthBoost = 1.0 + pos.z * 0.5;
    gl_PointSize = (2.0 + aRand * 2.0) * depthBoost * uPixelRatio * (6.0 / -mvPosition.z);

    vColor = aColor;
    vAlpha = 0.5 + aRand * 0.5;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uFade;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.0, d) * vAlpha * uFade;
    if (alpha < 0.015) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export default function ParticleField() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const PARTICLE_COUNT = coarsePointer ? 6000 : 9000;

    let disposed = false;
    let frameId = 0;
    const ctxCleanups: Array<() => void> = [];

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(new THREE.Color("#030204"), 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 4.4;

    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    setSize();

    const uniforms = {
      uGenesis: { value: 0 },
      uShapeMorph: { value: 0 },
      uHopY: { value: 0 },
      uHopSquashX: { value: 1 },
      uHopSquashY: { value: 1 },
      uDriftX: { value: 0 },
      uRunBob: { value: 0 },
      uFade: { value: 1 },
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    };

    const geometry = new THREE.BufferGeometry();
    const scatter = sampleScatterCloud(PARTICLE_COUNT);
    const scatterBuf = pointsToFloat32(scatter);

    const rand = new Float32Array(PARTICLE_COUNT);
    const color = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      rand[i] = Math.random();
      const c = PRIMARY.clone().lerp(ACCENT, Math.random() < 0.3 ? Math.random() * 0.8 : 0);
      color[i * 3] = c.r;
      color[i * 3 + 1] = c.g;
      color[i * 3 + 2] = c.b;
    }

    // Placeholder shapes (all scatter) until the real clouds are sampled —
    // harmless since uGenesis stays 0 until then, so rendered position is
    // always aScatter regardless of what these buffers hold.
    geometry.setAttribute("position", new THREE.BufferAttribute(scatterBuf.slice(), 3));
    geometry.setAttribute("aScatter", new THREE.BufferAttribute(scatterBuf, 3));
    geometry.setAttribute("aLogo", new THREE.BufferAttribute(scatterBuf.slice(), 3));
    geometry.setAttribute("aKangaroo", new THREE.BufferAttribute(scatterBuf.slice(), 3));
    geometry.setAttribute("aHuman", new THREE.BufferAttribute(scatterBuf.slice(), 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    geometry.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const mouse = { x: 0, y: 0 };
    const targetRot = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reducedMotion) window.addEventListener("mousemove", onMouseMove);

    const clock = new THREE.Clock();
    let idleRotation = 0;

    const renderLoop = () => {
      const dt = clock.getDelta();
      uniforms.uTime.value += dt;

      if (!reducedMotion) {
        idleRotation += dt * 0.06;
        targetRot.x += (mouse.y * 0.18 - targetRot.x) * 0.04;
        targetRot.y += (mouse.x * 0.28 - targetRot.y) * 0.04;
        points.rotation.y = idleRotation + targetRot.y;
        points.rotation.x = targetRot.x;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(renderLoop);
    };

    const applyProgress = (progress: number) => {
      let shapeMorph = 0;
      let hopY = 0;
      let squashX = 1;
      let squashY = 1;
      let driftX = 0;
      let runBob = 0;

      if (progress < P_LOGO_END) {
        shapeMorph = smoothstep(0, P_LOGO_END, progress);
      } else if (progress < P_JUMP1_END) {
        shapeMorph = 1;
        const t = (progress - P_LOGO_END) / (P_JUMP1_END - P_LOGO_END);
        hopY = HOP1_AMPLITUDE * 4 * t * (1 - t);
        squashY = 1 + 0.15 * Math.sin(t * Math.PI);
        squashX = 1 - 0.08 * Math.sin(t * Math.PI);
        driftX = HOP_FORWARD_1 * t;
      } else if (progress < P_JUMP2_END) {
        const t = (progress - P_JUMP1_END) / (P_JUMP2_END - P_JUMP1_END);
        shapeMorph = 1 + smoothstep(0.35, 1.0, t);
        hopY = HOP2_AMPLITUDE * 4 * t * (1 - t);
        squashY = 1 + 0.15 * Math.sin(t * Math.PI);
        squashX = 1 - 0.08 * Math.sin(t * Math.PI);
        driftX = HOP_FORWARD_1 + HOP_FORWARD_2 * t;
      } else if (progress < P_RUN_END) {
        shapeMorph = 2;
        const t = (progress - P_JUMP2_END) / (P_RUN_END - P_JUMP2_END);
        runBob = Math.abs(Math.sin(t * RUN_BOB_CYCLES * Math.PI)) * RUN_BOB_AMPLITUDE;
        driftX = HOP_FORWARD_1 + HOP_FORWARD_2 + RUN_DRIFT * t;
      } else {
        shapeMorph = 2;
        driftX = HOP_FORWARD_1 + HOP_FORWARD_2 + RUN_DRIFT;
      }

      uniforms.uShapeMorph.value = shapeMorph;
      uniforms.uHopY.value = hopY;
      uniforms.uHopSquashX.value = squashX;
      uniforms.uHopSquashY.value = squashY;
      uniforms.uDriftX.value = driftX;
      uniforms.uRunBob.value = runBob;
    };

    if (reducedMotion) {
      uniforms.uGenesis.value = 1;
      renderer.render(scene, camera);
    } else {
      frameId = requestAnimationFrame(renderLoop);
    }

    // Sample the real shapes, then wire genesis + the scroll timeline.
    Promise.all([
      sampleLogoCloud(PARTICLE_COUNT),
      sampleKangarooCloud(PARTICLE_COUNT),
    ]).then(([logo, kangaroo]) => {
      if (disposed) return;
      const human = sampleHumanCloud(PARTICLE_COUNT);

      const logoBuf = pointsToFloat32(logo);
      geometry.setAttribute("position", new THREE.BufferAttribute(logoBuf.slice(), 3));
      geometry.setAttribute("aLogo", new THREE.BufferAttribute(logoBuf, 3));
      geometry.setAttribute(
        "aKangaroo",
        new THREE.BufferAttribute(pointsToFloat32(kangaroo), 3)
      );
      geometry.setAttribute(
        "aHuman",
        new THREE.BufferAttribute(pointsToFloat32(human), 3)
      );

      if (reducedMotion) {
        renderer.render(scene, camera);
        return;
      }

      const genesisTween = gsap.to(uniforms.uGenesis, {
        value: 1,
        duration: 2,
        ease: "power2.out",
        delay: 0.3,
      });
      ctxCleanups.push(() => genesisTween.kill());

      applyProgress(0);
      const trigger = ScrollTrigger.create({
        trigger: "#scroll-track",
        start: "top top",
        // "bottom top" (not "bottom bottom") so 0..1 spans the track's full
        // height — "bottom bottom" would end one viewport-height early.
        end: "bottom top",
        scrub: 0.8,
        onUpdate: (self) => applyProgress(self.progress),
      });
      ctxCleanups.push(() => trigger.kill());

      const fadeTween = gsap.to(uniforms.uFade, {
        value: 0.4,
        ease: "none",
        scrollTrigger: {
          trigger: "#join",
          start: "top 85%",
          end: "top 35%",
          scrub: 0.8,
        },
      });
      ctxCleanups.push(() => {
        fadeTween.scrollTrigger?.kill();
        fadeTween.kill();
      });
    });

    const onResize = () => {
      setSize();
      uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(uniforms.uPixelRatio.value);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      ctxCleanups.forEach((fn) => fn());
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0" aria-hidden="true" />;
}
