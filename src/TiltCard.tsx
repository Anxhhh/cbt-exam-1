import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import React, { useRef } from "react";

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
}

export function TiltCard({ children, className }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth spring physics for fluid movement (Apple-like damping)
    const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

    function onMouseMove({ clientX, clientY }: React.MouseEvent) {
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        // Calculate normalized position (-0.5 to 0.5)
        // We invert Y for natural tilt (mouse up -> tilt back)
        const xPct = (clientX - left) / width - 0.5;
        const yPct = (clientY - top) / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    }

    function onMouseLeave() {
        x.set(0);
        y.set(0);
    }

    // Map mouse position to rotation degrees
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);

    // Dynamic gloss/reflection movement (moves opposite to tilt)
    // const sheenX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
    // const sheenY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

    // Interactive transparency/opacity change on tilt
    const brightness = useTransform(mouseY, [-0.5, 0.5], [1.05, 0.95]);

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{
                rotateX,
                rotateY,
                filter: useTransform(brightness, (b) => `brightness(${b})`),
                transformStyle: "preserve-3d",
            }}
            className={`relative perspective-1000 ${className || ''}`}
        >
            {/* Dynamic Holographic Sheen Layer */}
            <motion.div
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([xVal, yVal]) => `linear-gradient(${115 + (xVal as number) * 40}deg, transparent 30%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.0) 55%, transparent)`
                    ),
                    opacity: useTransform(mouseX, [-0.5, 0, 0.5], [0.4, 0, 0.4]) // Sheen visible at extremes
                }}
                className="absolute inset-0 z-50 pointer-events-none rounded-[2.5rem] mix-blend-overlay"
            />

            <div style={{ transform: "translateZ(20px)" }}>
                {children}
            </div>
        </motion.div>
    );
}
