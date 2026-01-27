import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * "Flux Matrix"
 * 
 * Concept: A digital ocean of data points moving in harmonic waves.
 * Aesthetic: Dark, Neon, Mathematical perfection.
 * Interaction: Mouse creates a "gravity well" that pulls points up/down.
 */

const WaveGrid = ({ countX = 50, countY = 50 }) => {
    const meshRef = useRef();
    const { viewport, mouse } = useThree();

    // 1. Initialize Grid
    // We create a densely packed grid of spheres
    const { positions, baseColors } = useMemo(() => {
        const pos = [];
        const cols = [];
        const sep = 0.5; // Separation
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

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.getElapsedTime();

        // Mouse interaction relative to grid
        const mx = (state.mouse.x * viewport.width) / 2;
        const my = (state.mouse.y * viewport.height) / 2; // vertically on screen maps to Z in grid?
        // Actually, our grid is XZ plane, camera looks from above/angle.
        // Let's map screen Y to Grid Z roughly.
        const mz = -my;

        let i = 0;
        for (let x = 0; x < countX; x++) {
            for (let y = 0; y < countY; y++) {
                const p = positions[i];

                // 1. Wave Math
                // Combine sine waves for complex fluid motion
                const w1 = Math.sin(x * 0.3 + time) * 1.5;
                const w2 = Math.cos(y * 0.2 + time * 0.8) * 1.5;
                const w3 = Math.sin((x + y) * 0.1 + time * 0.5) * 1.0;

                let h = (w1 + w2 + w3) * 0.5;

                // 2. Mouse Interaction (Gravity Well)
                const dx = p.x - mx;
                const dz = p.z - mz * 2; // Scale Z to match viewport feel
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < 8) {
                    const force = (8 - dist) / 8; // 0 to 1
                    h -= force * 3; // Push down
                }

                // Update Position
                dummy.position.set(p.x, h, p.z);

                // Scale based on height (peaks are larger)
                const scale = 0.3 + Math.max(0, h + 2) * 0.1;
                dummy.scale.setScalar(scale);
                dummy.updateMatrix();
                meshRef.current.setMatrixAt(i, dummy.matrix);

                // Update Color based on height
                // Deep Blue (low) -> Cyan (mid) -> Purple (high)
                // Map h from approx -3 to +3
                const normH = THREE.MathUtils.clamp((h + 3) / 6, 0, 1);

                // Interpolate colors
                // Low: #1e3a8a (Blue 900)
                // Mid: #06b6d4 (Cyan 500)
                // High: #d946ef (Fuchsia 500)
                if (normH < 0.5) {
                    color.set('#1e3a8a').lerp(new THREE.Color('#06b6d4'), normH * 2);
                } else {
                    color.set('#06b6d4').lerp(new THREE.Color('#d946ef'), (normH - 0.5) * 2);
                }

                meshRef.current.setColorAt(i, color);

                i++;
            }
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, countX * countY]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
                roughness={0.2}
                metalness={0.8}
            />
        </instancedMesh>
    );
};

export default function ThreeBackground({ intensity = 1 }) {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#020617] transition-colors duration-1000">
            {/* 
                Camera Angle: Tilted perspective to see the landscape 
                Position: Up and back
            */}
            <Canvas camera={{ position: [0, 10, 15], fov: 45 }} dpr={[1, 2]}>
                <fog attach="fog" args={['#020617', 5, 40]} />

                {/* Lighting to make the spheres pop */}
                <ambientLight intensity={0.5} color="#0f172a" />
                <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
                <pointLight position={[-10, 5, -5]} intensity={5} color="#3b82f6" />

                <WaveGrid />
            </Canvas>

            {/* Gradient Overlay (Vignette) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_120%)] pointer-events-none opacity-90" />

            {/* Top/Bottom Fade to blend seamlessly */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#020617] to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none" />

            {/* Intensity Focus Layer */}
            <div
                className="absolute inset-0 bg-[#020617] transition-opacity duration-1000 pointer-events-none"
                style={{ opacity: 1 - intensity }}
            />
        </div>
    );
}
