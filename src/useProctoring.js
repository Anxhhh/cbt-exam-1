import { useRef, useEffect, useState, useMemo } from 'react';

export function useProctoring() {
    const [logs, setLogs] = useState([]);
    const [isFocused, setIsFocused] = useState(true);
    const [latency, setLatency] = useState(24);
    const videoRef = useRef(null);

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [{ id: Date.now(), msg, type }, ...prev].slice(0, 50));
    };

    // Window Focus Detection
    useEffect(() => {
        const handleBlur = () => {
            setIsFocused(false);
            addLog("Window focus lost", "warning");
        };
        const handleFocus = () => {
            setIsFocused(true);
            addLog("Window focus restored", "success");
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        }
    }, []);

    // Fake Network Latency Simulation
    useEffect(() => {
        const i = setInterval(() => {
            setLatency(Math.floor(20 + Math.random() * 40));
        }, 3000);
        return () => clearInterval(i);
    }, []);

    // WebCam Access (Try to get it)
    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                    addLog("Camera access granted", "success");
                })
                .catch(err => {
                    addLog("Camera access denied or failed", "error");
                });
        }
    }, []);

    return {
        logs,
        isFocused,
        latency,
        videoRef
    };
}
