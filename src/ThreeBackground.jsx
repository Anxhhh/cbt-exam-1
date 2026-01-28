import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * "Quantum Flux Surface"
 * 
 * Concept: A hyper-fluid data surface that behaves like varying liquid metal.
 * Visuals: Polished Obsidian spheres that glow (emissive) when they peak.
 * Physics: 3-Layer Harmonic Interference + Ripple Repulsion Physics.
 */

const HyperFluxGrid = ({ countX = 30, countY = 20 }) => {
    const meshRef = useRef();
    const { viewport } = useThree();

    // 1. Initialize Grid
    // Denser grid for smoother visual flow
    const { positions } = useMemo(() => {
        const pos = [];
        const sep = 0.9; // Increased separation for performance optimization
        for (let x = 0; x < countX; x++) {
            for (let y = 0; y < countY; y++) {
                const px = (x - countX / 2) * sep;
                const pz = (y - countY / 2) * sep;
                pos.push({ x: px, z: pz, y: 0, id: x * countY + y });
            }
        }
        return { positions: pos };
    }, [countX, countY]);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);
    // Reusing standard colors to avoid allocation in loop
    const cLow = new THREE.Color('#020617'); // Black/Slate base
    const cMid = new THREE.Color('#1d4ed8'); // Blue 700
    const cHigh = new THREE.Color('#22d3ee'); // Cyan 400

    const smoothedMouse = useRef(new THREE.Vector2(0, 0));

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        // Target Mouse (Raw)
        const targetX = (state.mouse.x * viewport.width) / 2;
        const targetY = -(state.mouse.y * viewport.height) / 2;

        // Smooth Mouse (Lerped) - 0.05 factor for heavy/slow feel
        smoothedMouse.current.x = THREE.MathUtils.lerp(smoothedMouse.current.x, targetX, 0.05);
        smoothedMouse.current.y = THREE.MathUtils.lerp(smoothedMouse.current.y, targetY, 0.05);

        const mx = smoothedMouse.current.x;
        const mz = smoothedMouse.current.y;

        let i = 0;
        for (let x = 0; x < countX; x++) {
            for (let y = 0; y < countY; y++) {
                const p = positions[i];

                // --- 1. Harmonic Physics ---
                // Layer 1: Big, slow rolling ocean swell
                const w1 = Math.sin(p.x * 0.15 + time * 0.2);
                // Layer 2: Faster, diagonal cross-chop
                const w2 = Math.cos((p.x * 0.3 + p.z * 0.3) + time * 0.4);
                // Layer 3: High frequency "jitter" or surface tension detail
                const w3 = Math.sin(p.z * 0.5 - time * 0.02);

                let h = (w1 + w2 * 0.8 + w3 * 0.5) * 0.8;

                // --- 2. Interaction Physics (Ripple Field) ---
                const dx = p.x - mx;
                const dz = p.z - mz;
                const dist = Math.sqrt(dx * dx + dz * dz);

                // Interactive Radius: 10 units
                if (dist < 10) {
                    // Create a "Dip" plus a "Ring"
                    // - Force is stronger at center (dip)
                    // - + sin wave creates a ripple ring around cursor
                    const falloff = (10 - dist) / 10; // 1 at center, 0 at edge

                    // Ripple equation: Dip at center, wave ring at edges
                    // We push DOWN (-3) at center
                    // We add ripples (sin) that move outward (dist * freq)
                    const ripple = -3 * falloff + Math.sin(dist * 2 - time * 2) * 0.5 * falloff;

                    h += ripple;
                }

                // Update Transform
                dummy.position.set(p.x, h, p.z);

                // Scale peaks slightly for visual "pop"
                // Smooth scale: 0.2 base + height influence
                const scale = 0.25 + Math.max(0, h + 2) * 0.05;
                dummy.scale.setScalar(scale);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);

                // --- 3. Dynamic Coloring (Glow) ---
                // Map height to color
                // h range is approx -4 to +4
                const normH = THREE.MathUtils.clamp((h + 3) / 6, 0, 1);

                if (normH < 0.3) {
                    // Dark base
                    meshRef.current.setColorAt(i, cLow);
                } else if (normH < 0.7) {
                    // Transition to Blue
                    color.lerpColors(cLow, cMid, (normH - 0.3) * 2.5);
                    meshRef.current.setColorAt(i, color);
                } else {
                    // Blue to Cyan highlight
                    color.lerpColors(cMid, cHigh, (normH - 0.7) * 3.3);
                    meshRef.current.setColorAt(i, color);
                }
                i++;
            }
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, countX * countY]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial
                roughness={0.1}   // Glossy
                metalness={0.6}   // Semi-metallic
                emissive="#000000" // Base emissive (we rely on instance color mostly)
                color="#ffffff"    // Tint
            />
        </instancedMesh>
    );
};

export default function ThreeBackground({ intensity = 1 }) {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#020617] transition-colors duration-1000">
            <Canvas camera={{ position: [0, 8, 12], fov: 50 }} dpr={[1, 2]}>
                <fog attach="fog" args={['#020617', 5, 35]} />

                {/* 
                   Lighting: 
                   1. Blue underglow (Point)
                   2. White Key Light (Directional) 
                */}
                <ambientLight intensity={0.4} color="#0f172a" />
                <pointLight position={[0, -5, 0]} intensity={3} color="#3b82f6" distance={20} />
                <directionalLight position={[5, 10, 5]} intensity={1.5} color="#cffafe" />

                <HyperFluxGrid />
            </Canvas>

            {/* Cinematic Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_10%,_#020617_110%)] pointer-events-none opacity-80" />

            {/* Seamless Blend UI */}
            <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#020617] to-transparent pointer-events-none" />
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />

            {/* Focus Dimmer */}
            <div
                className="absolute inset-0 bg-[#020617] transition-opacity duration-1000 pointer-events-none"
                style={{ opacity: 1 - intensity }}
            />
        </div>
    );
}
