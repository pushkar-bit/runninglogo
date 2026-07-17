"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  sampleLogoCloud,
  sampleKangarooCloud,
  sampleScatterCloud,
  pointsToFloat32,
} from "@/lib/particles";

gsap.registerPlugin(ScrollTrigger);

const PRIMARY = new THREE.Color("#ad96f9");
const ACCENT = new THREE.Color("#d1547f");

const VERTEX_SHADER = /* glsl */ `
  uniform float uGenesis;
  uniform float uMorph;
  uniform float uTime;
  uniform float uPixelRatio;
  attribute vec3 aScatter;
  attribute vec3 aLogo;
  attribute vec3 aKangaroo;
  attribute vec3 aColor;
  attribute float aRand;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 afterGenesis = mix(aScatter, aLogo, uGenesis);
    vec3 pos = mix(afterGenesis, aKangaroo, uMorph);

    pos.x += sin(uTime * 0.6 + aRand * 6.2831) * 0.012;
    pos.y += cos(uTime * 0.5 + aRand * 6.2831) * 0.012;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float depthBoost = 1.0 + pos.z * 0.5;
    gl_PointSize = (1.6 + aRand * 1.6) * depthBoost * uPixelRatio * (6.0 / -mvPosition.z);

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
      uMorph: { value: 0 },
      uFade: { value: 1 },
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    };

    const geometry = new THREE.BufferGeometry();
    const scatter = sampleScatterCloud(PARTICLE_COUNT);
    const logo = sampleLogoCloud(PARTICLE_COUNT);

    const rand = new Float32Array(PARTICLE_COUNT);
    const color = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      rand[i] = Math.random();
      const c = PRIMARY.clone().lerp(ACCENT, Math.random() < 0.3 ? Math.random() * 0.8 : 0);
      color[i * 3] = c.r;
      color[i * 3 + 1] = c.g;
      color[i * 3 + 2] = c.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(pointsToFloat32(logo), 3));
    geometry.setAttribute("aScatter", new THREE.BufferAttribute(pointsToFloat32(scatter), 3));
    geometry.setAttribute("aLogo", new THREE.BufferAttribute(pointsToFloat32(logo), 3));
    geometry.setAttribute("aKangaroo", new THREE.BufferAttribute(pointsToFloat32(logo), 3)); // placeholder until loaded
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

    // Swap in the real kangaroo cloud once sampled from the image.
    sampleKangarooCloud(PARTICLE_COUNT).then((kangaroo) => {
      if (disposed) return;
      geometry.setAttribute(
        "aKangaroo",
        new THREE.BufferAttribute(pointsToFloat32(kangaroo), 3)
      );
    });

    // Mouse parallax (desktop only — harmless no-op on touch since no mousemove fires).
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

    if (reducedMotion) {
      uniforms.uGenesis.value = 1;
      renderer.render(scene, camera);
    } else {
      frameId = requestAnimationFrame(renderLoop);

      const genesisTween = gsap.to(uniforms.uGenesis, {
        value: 1,
        duration: 2,
        ease: "power2.out",
        delay: 0.3,
      });
      ctxCleanups.push(() => genesisTween.kill());

      const morphTween = gsap.to(uniforms.uMorph, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "#scroll-track",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });
      ctxCleanups.push(() => {
        morphTween.scrollTrigger?.kill();
        morphTween.kill();
      });

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
    }

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

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
