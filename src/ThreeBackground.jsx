import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// --- Advanced Noise Generator for Terrain (Simplex-like) ---
// Using a simple pseudo-random hash for deterministic "randomness"
function hash(x, z) {
    let h = x * 374761393 + z * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return h ^ (h >> 16);
}
function noise(x, z) {
    const floorX = Math.floor(x);
    const floorZ = Math.floor(z);
    const fx = x - floorX;
    const fz = z - floorZ;

    // Cubic interpolation for smoothness
    const u = fx * fx * (3.0 - 2.0 * fx);
    const v = fz * fz * (3.0 - 2.0 * fz);

    const h00 = hash(floorX, floorZ);
    const h10 = hash(floorX + 1, floorZ);
    const h01 = hash(floorX, floorZ + 1);
    const h11 = hash(floorX + 1, floorZ + 1);

    // Normalize hash to 0..1 (approx)
    const n00 = (h00 & 0xffff) / 65535;
    const n10 = (h10 & 0xffff) / 65535;
    const n01 = (h01 & 0xffff) / 65535;
    const n11 = (h11 & 0xffff) / 65535;

    const lerpX1 = n00 + u * (n10 - n00);
    const lerpX2 = n01 + u * (n11 - n01);

    return lerpX1 + v * (lerpX2 - lerpX1);
}

// Fractal Brownian Motion for mountains
function fbm(x, z) {
    let total = 0;
    let amplitude = 1;
    let frequency = 0.5;
    let maxValue = 0;

    // 5 Octaves for extra rock detail (increased from 4)
    for (let i = 0; i < 5; i++) {
        total += noise(x * frequency, z * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }

    return (total / maxValue);
}

function DigitalHimalayas() {
    const count = 14000; // Increased density for sharper terrain
    const width = 70;    // Wider FOV
    const depth = 90;    // Deeper draw distance

    // Static Seeds
    const seeds = useMemo(() => {
        const arr = new Float32Array(count * 2);
        for (let i = 0; i < count; i++) {
            arr[i * 2] = (Math.random() - 0.5) * width;
            arr[i * 2 + 1] = (Math.random() - 0.5) * depth;
        }
        return arr;
    }, []);

    const bufferRef = useRef();
    const colorRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const positions = bufferRef.current.array;
        const colors = colorRef.current.array;

        // --- DRONE FLIGHT SIMULATION ---
        // Slightly slower, more cinematic speed (was 8.0)
        const speed = 6.0;
        const flyTime = t * speed;

        // Scanner pulsing effect
        // Slower scan beam for better readability
        const scanBeam = (t * 10) % 70;

        // Colors - Refined Palette
        const deepColor = new THREE.Color("#020617"); // Darker Slate (Deep Valleys)
        const midColor = new THREE.Color("#4f46e5");  // Indigo (Mid-elevation)
        const highColor = new THREE.Color("#06b6d4"); // Cyan (High peaks)
        const peakColor = new THREE.Color("#e0f2fe"); // White-Blue (Snow)

        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            const seedX = seeds[i * 2];
            const seedZ = seeds[i * 2 + 1];

            // Infinite Scroll Logic
            const rawZ = seedZ + flyTime;
            const range = depth;
            const wrappedZ = ((rawZ % range) + range) % range - (range / 2);

            // World Coordinates
            const terrainX = seedX;
            const terrainZ = wrappedZ - flyTime;

            // --- TERRAIN GENERATION ---
            // Adjusted scale for massive mountains
            const noiseScale = 0.12;
            let height = fbm(terrainX * noiseScale, terrainZ * noiseScale);

            // Shape the noise
            // Power of 2.8 makes peaks sharp but keeps some body to the mountains
            height = Math.pow(height * 2.8, 2.8);

            // Shift down to keep horizon clear
            height = Math.max(-10, height - 3);

            positions[ix] = seedX;
            positions[ix + 1] = height - 4; // Render Position Y
            positions[ix + 2] = wrappedZ;

            // --- COLORIZATION ---
            const hNorm = (height + 3) / 9; // Normalize ~0..1 based on shifted height

            let c = deepColor.clone();

            if (hNorm > 0.35) c.lerp(midColor, (hNorm - 0.35) * 1.8);
            if (hNorm > 0.65) c.lerp(highColor, (hNorm - 0.65) * 2.5);
            if (hNorm > 0.90) c.lerp(peakColor, (hNorm - 0.90) * 10);

            // "Lidar Scan" Effect
            const beamPos = scanBeam - 35; // centered range
            const distFromBeam = Math.abs(wrappedZ - beamPos);

            // Wider, softer beam
            if (distFromBeam < 4) {
                // Smooth falloff Gaussian-ish
                const intensity = Math.exp(-distFromBeam * distFromBeam * 0.3);
                c.addScalar(intensity * 0.6);
            }

            colors[ix] = c.r;
            colors[ix + 1] = c.g;
            colors[ix + 2] = c.b;
        }

        bufferRef.current.needsUpdate = true;
        colorRef.current.needsUpdate = true;

        // --- DRONE CAMERA DYNAMICS ---
        // Smoother, heavier drone feel
        const sway = Math.sin(t * 0.4) * 4;
        const bank = -sway * 0.015;

        state.camera.position.x = sway;
        state.camera.position.y = 3 + Math.cos(t * 0.6) * 0.5; // Slightly higher altitude
        state.camera.rotation.z = bank;
        state.camera.rotation.y = -bank * 0.3;

        // Engine vibration (high freq, low amp)
        state.camera.rotation.x = -0.15 + Math.sin(t * 15) * 0.0005;
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    ref={bufferRef}
                    attach="attributes-position"
                    count={count}
                    array={new Float32Array(count * 3)}
                    itemSize={3}
                />
                <bufferAttribute
                    ref={colorRef}
                    attach="attributes-color"
                    count={count}
                    array={new Float32Array(count * 3)}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.07} // Slightly smaller points for finer detail
                vertexColors
                sizeAttenuation={true}
                transparent={true}
                opacity={0.85}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </points>
    );
}

export default function ThreeBackground() {
    return (
        <div className="fixed inset-0 z-0 bg-[#0f1116] overflow-hidden pointer-events-none">
            {/* Cinematic Vignette - Darker edges */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#0f1116_110%)] z-10 opacity-90" />
            <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#0f1116] to-transparent z-10" />
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#0f1116] to-transparent z-10" />

            <Canvas>
                {/* Wider FOV for epic scale */}
                <PerspectiveCamera makeDefault position={[0, 4, 12]} fov={65} />
                <fog attach="fog" args={['#0f1116', 5, 50]} />

                <DigitalHimalayas />
                {/* More stars, slower twinkle */}
                <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />
            </Canvas>
        </div>
    );
}
