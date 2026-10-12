"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Seeded PRNG so the brain has the same shape on every visit.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const N = 1400;
const PULSES = 70;

function useBrainGeometry() {
  return useMemo(() => {
    const rand = mulberry32(2006); // first year in data
    const pts: THREE.Vector3[] = [];
    while (pts.length < N) {
      // Two hemispheres: an ellipsoid split by a longitudinal fissure, with folds.
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      const fold = 1 + 0.07 * Math.sin(u * 9) * Math.sin(v * 7);
      let x = Math.sin(v) * Math.cos(u) * 1.55 * fold;
      const y = Math.cos(v) * 1.08 * fold;
      const z = Math.sin(v) * Math.sin(u) * 1.2 * fold;
      if (Math.abs(x) < 0.08) continue; // fissure
      x += Math.sign(x) * 0.06;
      const depth = 0.82 + rand() * 0.18;
      pts.push(new THREE.Vector3(x * depth, y * depth * (y < 0 ? 0.8 : 1), z * depth));
    }
    const positions = new Float32Array(N * 3);
    const colors = new Float32Array(N * 3);
    const cyan = new THREE.Color("#5eead4");
    const violet = new THREE.Color("#a78bfa");
    const amber = new THREE.Color("#fbbf24");
    pts.forEach((p, i) => {
      positions.set([p.x, p.y, p.z], i * 3);
      const t = (p.x + 1.6) / 3.2;
      const c = cyan.clone().lerp(violet, t);
      if (rand() < 0.04) c.copy(amber);
      colors.set([c.r, c.g, c.b], i * 3);
    });

    // Connect each point to near neighbours (capped) — the "synapses".
    const edges: [number, number][] = [];
    for (let i = 0; i < N; i += 2) {
      let links = 0;
      for (let j = i + 1; j < N && links < 3; j++) {
        if (pts[i].distanceToSquared(pts[j]) < 0.028) { edges.push([i, j]); links++; }
      }
    }
    const linePos = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], k) => {
      linePos.set([pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z], k * 6);
    });
    return { pts, positions, colors, linePos, edges, rand };
  }, []);
}

function Brain({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Points>(null);
  const { pts, positions, colors, linePos, edges, rand } = useBrainGeometry();

  const pulses = useMemo(
    () => Array.from({ length: PULSES }, () => ({ e: Math.floor(rand() * edges.length), t: rand(), speed: 0.4 + rand() * 1.2 })),
    [edges.length, rand],
  );
  const pulsePos = useMemo(() => new Float32Array(PULSES * 3), []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += dt * 0.08;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.current.y * 0.25, 0.04);
    g.position.x = THREE.MathUtils.lerp(g.position.x, pointer.current.x * 0.15, 0.04);

    // Move pulses along edges; when one arrives, jump to a new edge.
    for (let i = 0; i < PULSES; i++) {
      const p = pulses[i];
      p.t += dt * p.speed;
      if (p.t >= 1) { p.t = 0; p.e = Math.floor(Math.random() * edges.length); }
      const [a, b] = edges[p.e];
      const A = pts[a], B = pts[b];
      pulsePos[i * 3] = A.x + (B.x - A.x) * p.t;
      pulsePos[i * 3 + 1] = A.y + (B.y - A.y) * p.t;
      pulsePos[i * 3 + 2] = A.z + (B.z - A.z) * p.t;
    }
    if (pulseRef.current) pulseRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group ref={group} scale={1.15}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.022} vertexColors transparent opacity={0.9} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePos, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#5eead4" transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <points ref={pulseRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pulsePos, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#fbbf24" transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

export default function BrainScene() {
  const pointer = useRef({ x: 0, y: 0 });
  return (
    <div
      className="absolute inset-0"
      onPointerMove={(e) => {
        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        pointer.current = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
      }}
      aria-hidden
    >
      <Canvas camera={{ position: [0, 0, 4.4], fov: 45 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <Brain pointer={pointer} />
      </Canvas>
    </div>
  );
}
