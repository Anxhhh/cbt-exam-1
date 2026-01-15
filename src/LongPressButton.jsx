import { useRef, useEffect, useState } from "react";
import { cn } from "./utils";

export const LongPressButton = ({ onClick, children, className, disabled, holdDuration = 2000 }) => {
    const [holding, setHolding] = useState(false);
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(0);

    const startHold = (e) => {
        if (disabled) return;
        // Prevent default to avoid text selection or weird touch behaviors
        if (e.type === 'touchstart') e.preventDefault();

        setHolding(true);
        setProgress(0);
        startTimeRef.current = Date.now();

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const p = Math.min((elapsed / holdDuration) * 100, 100);
            setProgress(p);

            if (p >= 100) {
                finishHold();
            }
        }, 16); // ~60fps
    };

    const finishHold = () => {
        stopHold();
        // Vibrate if available
        if (navigator.vibrate) navigator.vibrate(50);
        onClick();
    };

    const stopHold = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setHolding(false);
        setProgress(0);
    };

    return (
        <button
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onMouseLeave={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
            disabled={disabled}
            className={cn("relative overflow-hidden select-none touch-none", className)}
            style={{ WebkitUserSelect: 'none' }}
        >
            {/* Background Fill */}
            <div
                className="absolute inset-0 bg-white/20 transition-all duration-0 ease-linear origin-left"
                style={{ width: `${progress}%` }}
            />

            <span className="relative z-10 flex items-center justify-center gap-2">
                {holding && progress < 100 ? "Hold to Confirm..." : children}
            </span>
        </button>
    );
};
