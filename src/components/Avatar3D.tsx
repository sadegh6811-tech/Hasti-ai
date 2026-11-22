"use client";

/**
 * Avatar3D — the identity of the assistant.
 *
 * Procedural Three.js avatar (no external meshes): a faceted icosahedron
 * shell with a glowing inner core, a halo ring and orbiting satellite nodes.
 *
 * Three states via props (`state`):
 *   idle      — slow continuous rotation, calm cyan glow
 *   thinking  — fast sway, warm amber energy pulse
 *   responding— steady rhythm, brighter cyan/teal glow with a breathing pulse
 */

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, Sparkles } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial, PointLight } from "three";

export type AvatarState = "idle" | "thinking" | "responding";

const STATES: Record<
  AvatarState,
  {
    rotationSpeed: number;
    floatSpeed: number;
    floatIntensity: number;
    pulseSpeed: number;
    baseEnergy: number;
    glow: string;
    shell: string;
    ring: string;
    satellite: string;
  }
> = {
  idle: {
    rotationSpeed: 0.32,
    floatSpeed: 1.3,
    floatIntensity: 1.0,
    pulseSpeed: 1.6,
    baseEnergy: 0.65,
    glow: "#00e5ff",
    shell: "#2a2a5e",
    ring: "#00e5ff",
    satellite: "#00e5ff",
  },
  thinking: {
    rotationSpeed: 1.7,
    floatSpeed: 4.4,
    floatIntensity: 1.55,
    pulseSpeed: 5.4,
    baseEnergy: 0.5,
    glow: "#ffb300",
    shell: "#3b2a18",
    ring: "#ffb300",
    satellite: "#ffb300",
  },
  responding: {
    rotationSpeed: 0.8,
    floatSpeed: 2.4,
    floatIntensity: 1.25,
    pulseSpeed: 3.2,
    baseEnergy: 0.85,
    glow: "#34ff9c",
    shell: "#1e3a5c",
    ring: "#34ff9c",
    satellite: "#34ff9c",
  },
};

function Core3D({ state }: { state: AvatarState }) {
  const config = STATES[state];

  const group = useRef<Group>(null);
  const ring = useRef<Mesh>(null);
  const orbit = useRef<Group>(null);
  const glowMaterial = useRef<MeshStandardMaterial>(null);
  const cyanLight = useRef<PointLight>(null);
  const amberLight = useRef<PointLight>(null);

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime;

    if (group.current) {
      group.current.rotation.y += delta * config.rotationSpeed; // continuous spin
      group.current.rotation.x = Math.sin(t * 0.55) * 0.07; // gentle body wobble
    }
    if (ring.current) ring.current.rotation.z += delta * config.rotationSpeed * 0.7;
    if (orbit.current) orbit.current.rotation.y += delta * config.rotationSpeed * 1.8;

    // breathing energy pulse
    const pulse = 0.5 + 0.5 * Math.sin(t * config.pulseSpeed);
    if (glowMaterial.current) {
      glowMaterial.current.emissiveIntensity = config.baseEnergy + pulse * 0.55;
    }

    // lights breathe with the same rhythm, amber stays warm underneath
    if (cyanLight.current) cyanLight.current.intensity = 42 + pulse * (config.rotationSpeed > 1 ? 42 : 20);
    if (amberLight.current) amberLight.current.intensity = 34 + (1 - pulse) * 16;
  });

  return (
    <>
      {/* cyan key light */}
      <pointLight
        ref={cyanLight}
        position={[-4.6, 1.7, 2.4]}
        color="#00e5ff"
        intensity={42}
        distance={12}
        decay={2}
      />
      {/* amber back-glow */}
      <pointLight
        ref={amberLight}
        position={[4.6, -1.3, 1.8]}
        color="#ffb300"
        intensity={34}
        distance={12}
        decay={2}
      />

      <Float
        speed={config.floatSpeed}
        rotationIntensity={0.85}
        floatIntensity={config.floatIntensity}
        floatingRange={[-0.22, 0.22]}
      >
        <group ref={group}>
          {/* faceted metal shell */}
          <mesh>
            <icosahedronGeometry args={[1.12, 1]} />
            <meshStandardMaterial
              color={config.shell}
              metalness={0.88}
              roughness={0.24}
              flatShading
              envMapIntensity={1.25}
            />
          </mesh>

          {/* glowing core */}
          <mesh>
            <icosahedronGeometry args={[0.7, 2]} />
            <meshStandardMaterial
              ref={glowMaterial}
              color="#05070d"
              emissive={config.glow}
              emissiveIntensity={0.8}
              roughness={0.2}
              metalness={0.1}
              flatShading
            />
          </mesh>

          {/* wireframe shell */}
          <mesh scale={1.24}>
            <icosahedronGeometry args={[1.12, 0]} />
            <meshBasicMaterial color={config.glow} wireframe transparent opacity={0.3} />
          </mesh>

          {/* halo ring */}
          <mesh ref={ring} rotation={[Math.PI / 2.35, 0, 0]} position={[0, -0.3, 0]}>
            <torusGeometry args={[1.8, 0.022, 8, 96]} />
            <meshBasicMaterial color={config.ring} transparent opacity={0.85} />
          </mesh>

          {/* orbiting satellite nodes */}
          <group ref={orbit}>
            <mesh position={[2.45, 0, 0]}>
              <sphereGeometry args={[0.1, 18, 18]} />
              <meshBasicMaterial color={config.satellite} />
            </mesh>
            <mesh position={[-1.9, 1.05, 0.62]}>
              <sphereGeometry args={[0.06, 18, 18]} />
              <meshBasicMaterial color="#ffb300" />
            </mesh>
            <mesh position={[0.4, -1.68, 1.5]}>
              <sphereGeometry args={[0.078, 18, 18]} />
              <meshBasicMaterial color={config.satellite} />
            </mesh>
          </group>
        </group>
      </Float>

      <Sparkles count={38} scale={[7, 3.6, 3.6]} size={2.1} speed={0.45} opacity={0.5} color="#7ff3ff" />
      <ContactShadows position={[0, -2.05, 0]} opacity={0.45} scale={8} blur={2.4} far={3.2} color="#022c22" />
    </>
  );
}

export default function Avatar3D({ state = "idle" }: { state?: AvatarState }) {
  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.5, 4.9], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={0.42} />
        <directionalLight position={[4, 5, 5]} intensity={2.2} color="#e0f7ff" />

        <Core3D state={state} />
      </Canvas>
    </div>
  );
}
