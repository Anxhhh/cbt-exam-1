import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * "Luminous Fiber Optic Flow"
 * 
 * Concept: Vertical strands of "fiber optic" data cables swaying gently.
 * Symbolism: Connectivity, Flow of Knowledge, Infrastructure.
 * Visuals: 
 * - Tall, vertical lines that move like sea-grass.
 * - Gradient colors (Cyan to Purple).
 * - "Data Packets" (points) travelling up the lines.
 */

// --- 1. The Strands (Vertical Waves) ---
const FiberStrands = ({ count = 40 }) => {
    const linesRef = useRef();
    const { viewport, mouse } = useThree();

    // Generate strands
    // distinct lines, each with randomized properties
    const strands = useMemo(() => {
        return new Array(count).fill().map(() => ({
            x: (Math.random() - 0.5) * 25, // Spread across X
            z: (Math.random() - 0.5) * 10, // Depth
            height: 12 + Math.random() * 8, // Tall lines
            speed: 0.5 + Math.random() * 0.5,
            offset: Math.random() * 10,
            colorPhase: Math.random() * Math.PI
        }));
    }, [count]);

    // Geometry: We'll construct a single buffer geometry for all lines
    // Each line has M segments
    const segments = 20;
    const vertexCount = count * segments;

    // Position Buffer
    const positions = useMemo(() => new Float32Array(vertexCount * 3), [vertexCount]);
    // Color Buffer (for gradient)
    const colors = useMemo(() => new Float32Array(vertexCount * 3), [vertexCount]);

    useFrame((state) => {
        if (!linesRef.current) return;

        const time = state.clock.getElapsedTime();
        const mx = (state.mouse.x * viewport.width) / 2;

        strands.forEach((strand, i) => {
            // Calculate base color for this strand
            const baseColor = new THREE.Color()
                .setHSL(0.55 + Math.sin(time * 0.1 + strand.colorPhase) * 0.1, 0.8, 0.6); // Blue-ish range

            for (let j = 0; j < segments; j++) {
                const idx = (i * segments + j) * 3;

                // Normalized height (0 at bottom, 1 at top)
                const t = j / (segments - 1);

                // Base Position
                const y = -10 + t * strand.height; // Start from bottom (-10)

                // Wave Animation
                // Sway amount increases with height (t)
                const sway = Math.sin(time * strand.speed + strand.offset + (y * 0.2)) * (t * 2);

                // Mouse Wind interaction
                // Calculate distance to mouse X
                const distToMouse = Math.abs(strand.x - mx);
                const repel = Math.max(0, 1 - distToMouse / 4) * 2 * t; // Top moves more
                const mouseForce = (strand.x < mx ? -1 : 1) * repel;

                positions[idx] = strand.x + sway + mouseForce;     // X
                positions[idx + 1] = y;                            // Y
                positions[idx + 2] = strand.z;                     // Z

                // Colors: Darker at bottom, brighter at top
                const color = baseColor.clone().multiplyScalar(0.2 + t * 1.5); // Fade in from bottom
                colors[idx] = color.r;
                colors[idx + 1] = color.g;
                colors[idx + 2] = color.b;
            }
        });

        linesRef.current.geometry.attributes.position.needsUpdate = true;
        linesRef.current.geometry.attributes.color.needsUpdate = true;
    });

    return (
        <lineSegments ref={linesRef}>
            {/* 
               Note: To draw continuous lines with lineSegments, we need to duplicate indices or use GL_LINES logic.
               However, strictly creating disconnected segments is easier in basic setup.
               For true curved lines, we'd need (j, j+1) pairs in buffer. 
               Let's do indices.
            */}
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={vertexCount} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={vertexCount} array={colors} itemSize={3} />
                {/* Index buffer for connecting segments */}
                <bufferAttribute
                    attach="index"
                    count={count * (segments - 1) * 2}
                    array={useMemo(() => {
                        const indices = [];
                        for (let i = 0; i < count; i++) {
                            for (let j = 0; j < segments - 1; j++) {
                                const base = i * segments + j;
                                indices.push(base, base + 1);
                            }
                        }
                        return new Uint16Array(indices);
                    }, [count, segments])}
                    itemSize={1}
                />
            </bufferGeometry>
            <lineBasicMaterial vertexColors opacity={0.6} transparent blending={THREE.AdditiveBlending} linewidth={1} />
        </lineSegments>
    );
};

// --- 2. Floating Data Packets (Upward Particles) ---
const FloatingPackets = ({ count = 100 }) => {
    const pointsRef = useRef();

    const [positions, shifts] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const shift = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 30; // x
            pos[i * 3 + 1] = -10 + Math.random() * 20; // y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
            shift[i] = Math.random() * Math.PI;
        }
        return [pos, shift];
    }, [count]);

    // Soft glow texture
    const texture = useMemo(() => {
        const c = document.createElement('canvas');
        c.width = 32; c.height = 32;
        const ctx = c.getContext('2d');
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 12);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fill();
        return new THREE.CanvasTexture(c);
    }, []);

    useFrame((state) => {
        if (!pointsRef.current) return;
        const time = state.clock.getElapsedTime();
        const parr = pointsRef.current.geometry.attributes.position.array;

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            // Float up
            parr[idx + 1] += 0.03 + Math.sin(time + shifts[i]) * 0.01;

            // Loop
            if (parr[idx + 1] > 12) {
                parr[idx + 1] = -12;
                parr[idx] = (Math.random() - 0.5) * 30; // Reset X
            }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                map={texture}
                size={0.25}
                transparent
                opacity={0.8}
                color="#a5f3fc"
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

export default function ThreeBackground({ intensity = 1 }) {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#02040a] transition-colors duration-1000">
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 2]}>
                <fog attach="fog" args={['#02040a', 5, 30]} />
                <group scale={[1, 1, 1]} position={[0, -2, 0]}>
                    <FiberStrands count={60} />
                    <FloatingPackets count={150} />
                </group>
            </Canvas>

            {/* Aurora Overlay */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500/10 to-transparent mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-500/10 to-transparent mix-blend-screen pointer-events-none" />

            {/* Focus Mode Dimmers */}
            <div
                className="absolute inset-0 bg-[#02040a] transition-opacity duration-1000 pointer-events-none"
                style={{ opacity: 1 - intensity }}
            />
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
