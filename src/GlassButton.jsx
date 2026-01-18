import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from './utils';

export default function GlassButton({
    children,
    onClick,
    className,
    color = 'blue',
    disabled = false,
    ...props
}) {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!divRef.current || disabled) return;
        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleFocus = () => {
        setOpacity(1);
    };

    const handleBlur = () => {
        setOpacity(0);
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    // Color Mapping for the Interactive Glow
    const glowColors = {
        emerald: 'from-emerald-500/10 via-teal-500/10 to-transparent',
        blue: 'from-blue-500/10 via-indigo-500/10 to-transparent'
    }[color] || 'from-white/10 to-transparent';

    const borderColors = {
        emerald: 'group-hover:border-emerald-500/30',
        blue: 'group-hover:border-blue-500/30'
    }[color] || 'group-hover:border-white/30';

    return (
        <motion.button
            ref={divRef}
            onClick={!disabled ? onClick : undefined}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            whileHover={!disabled ? { scale: 1.01 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            disabled={disabled}
            className={cn(
                "relative group w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl transition-all duration-300",
                "shadow-[0_4px_30px_rgba(0,0,0,0.1)]", // Subtle glass shadow
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-white/[0.04]",
                borderColors,
                className
            )}
            {...props}
        >
            {/* Interactive Spotlight Glow */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    opacity,
                    background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.03), transparent 40%)`
                }}
            />

            {/* Colored Gradient Follower (Subtle Tint) */}
            <div
                className={cn(
                    "pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100",
                    "bg-gradient-to-r",
                    glowColors
                )}
                style={{
                    maskImage: `radial-gradient(300px circle at ${position.x}px ${position.y}px, black, transparent)`,
                    WebkitMaskImage: `radial-gradient(300px circle at ${position.x}px ${position.y}px, black, transparent)`
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.button>
    );
}
