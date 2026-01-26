import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * "High-End Plexus Interface"
 * 
 * Aesthetic: Deep Slate + Bioluminescent Blue.
 * Tech: Optimized BufferGeometry for lines, Canvas-generated texture for perfect circles.
 * Vibe: Intelligent, Logic, Clean.
 */

// Helper: Generate a pure white circle texture for smooth particles
const useCircleTexture = () => {
    return useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const context = canvas.getContext('2d');
        context.beginPath();
        context.arc(16, 16, 14, 0, 2 * Math.PI);
        context.fillStyle = '#ffffff';
        context.fill();
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }, []);
};

const PlexusNodes = ({ count = 220, maxDistance = 3 }) => {
    const { viewport, mouse } = useThree();
    const pointsRef = useRef();
    const linesRef = useRef();
    const circleTex = useCircleTexture();

    // 1. Initialize Particle State
    const particles = useMemo(() => {
        const temp = [];
        // Wider spread for a vast feel
        const width = 30;
        const height = 18;

        for (let i = 0; i < count; i++) {
            temp.push({
                pos: new THREE.Vector3(
                    (Math.random() - 0.5) * width,
                    (Math.random() - 0.5) * height,
                    (Math.random() - 0.5) * 8 // Depth
                ),
                // Very smooth, slow drift
                vel: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.008,
                    (Math.random() - 0.5) * 0.008,
                    0
                ),
                // Randomize size slightly for depth perception
                size: 0.8 + Math.random() * 0.5
            });
        }
        return temp;
    }, [count]);

    const positions = useMemo(() => new Float32Array(count * 3), [count]);
    // Sizes attribute for size attenuation variation
    const sizes = useMemo(() => {
        const arr = new Float32Array(count);
        particles.forEach((p, i) => arr[i] = p.size);
        return arr;
    }, [count, particles]);

    useFrame((state) => {
        // Project mouse to working plane
        const mx = (state.mouse.x * viewport.width) / 2;
        const my = (state.mouse.y * viewport.height) / 2;
        const mousePos = new THREE.Vector3(mx, my, 0);

        const linePositions = [];

        // A. Update Particles
        particles.forEach((p, i) => {
            // 1. Move
            p.pos.add(p.vel);

            // 2. Wrap around (Infinity Pool) instead of bounce for smoother flow
            const rangeX = 16;
            const rangeY = 10;
            if (p.pos.x > rangeX) p.pos.x = -rangeX;
            if (p.pos.x < -rangeX) p.pos.x = rangeX;
            if (p.pos.y > rangeY) p.pos.y = -rangeY;
            if (p.pos.y < -rangeY) p.pos.y = rangeY;

            // 3. Mouse Interaction: Stronger Repulsion & Connection
            const distToMouse = p.pos.distanceTo(mousePos);
            const interactRadius = 6;

            if (distToMouse < interactRadius) {
                const force = (interactRadius - distToMouse) / interactRadius;
                const repelDir = new THREE.Vector3().subVectors(p.pos, mousePos).normalize();

                // Stronger "Ripple" push
                p.pos.add(repelDir.multiplyScalar(force * 0.15));

                // 4. Connect to Mouse (New Feature)
                // If very close, draw a line to the cursor so it feels "plugged in"
                if (distToMouse < 3.5) {
                    linePositions.push(
                        p.pos.x, p.pos.y, p.pos.z,
                        mousePos.x, mousePos.y, mousePos.z
                    );
                }
            }

            // Update Buffer
            positions[i * 3] = p.pos.x;
            positions[i * 3 + 1] = p.pos.y;
            positions[i * 3 + 2] = p.pos.z;
        });

        if (pointsRef.current) {
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // B. Calculate Connections (Particle to Particle)
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const p1 = particles[i];
                const p2 = particles[j];

                // Squared dist check for perf
                const distSq = p1.pos.distanceToSquared(p2.pos);
                const threshold = maxDistance * maxDistance;

                if (distSq < threshold) {
                    linePositions.push(
                        p1.pos.x, p1.pos.y, p1.pos.z,
                        p2.pos.x, p2.pos.y, p2.pos.z
                    );
                }
            }
        }

        if (linesRef.current) {
            linesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        }
    });

    return (
        <group>
            {/* Nodes: Circular, Glowing Points */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                    {/* We could use 'sizes' attribute in a custom shader, but standard PointsMaterial doesn't support per-point size array easily without patch. 
              We'll just stick to uniform size for perfect cleanliness or use 'sizeAttenuation'. 
          */}
                </bufferGeometry>
                <pointsMaterial
                    map={circleTex} // Makes points circular
                    color="#3b82f6" // Blue-500 (Primary App Color)
                    size={0.12}      // Size
                    sizeAttenuation={true}
                    transparent={true}
                    alphaTest={0.5} // Cut off edges if needed, or just blend
                    opacity={0.7}
                    blending={THREE.AdditiveBlending} // THE GLOW
                    depthWrite={false}
                />
            </points>

            {/* Connections: Thin, Translucent Lines */}
            <lineSegments ref={linesRef}>
                <bufferGeometry />
                <lineBasicMaterial
                    color="#3b82f6" // Blue-500
                    transparent={true}
                    opacity={0.06} // Very delicate
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>
        </group>
    );
};

export default function ThreeBackground({ intensity = 1 }) {
    return (
        <div
            className="fixed inset-0 z-0 pointer-events-none bg-[#0b0f19] transition-all duration-1000 ease-in-out"
        >
            {/* 
                Background: Deepest App Background (#0b0f19).
                We use an overlay div to dim the scene instead of unmounting, preserving the WebGL context.
            */}
            <Canvas camera={{ position: [0, 0, 12], fov: 50 }} dpr={[1, 2]}>
                <PlexusNodes count={220} />
            </Canvas>

            {/* Focus Mode Overlay: Dims the background when intensity < 1 */}
            <div
                className="absolute inset-0 bg-[#0b0f19] transition-opacity duration-1000 pointer-events-none"
                style={{ opacity: 1 - intensity }}
            />

            {/* Focus Mode Blur: Blurs the background when intensity < 1 */}
            <div
                className="absolute inset-0 backdrop-blur-sm transition-all duration-1000 pointer-events-none"
                style={{
                    opacity: intensity < 0.5 ? 1 : 0,
                    backdropFilter: `blur(${10 * (1 - intensity)}px)`
                }}
            />
        </div>
    );
}
