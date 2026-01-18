// Audio synthesis utility using Web Audio API
// No external assets required

let ctx = null;

const getContext = () => {
    if (!ctx) {
        if (typeof window === 'undefined') return null;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            ctx = new AudioContext();
        }
    }
    return ctx;
};

const playTone = (freq, type, duration, vol = 0.1) => {
    const audioCtx = getContext();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => { });
    }

    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn("Audio play failed", e);
    }
};

export const sounds = {
    hover: () => {
        // Very subtle high frequency tick
        // playTone(800, 'sine', 0.05, 0.02); 
    },
    click: () => {
        // Soft woodblock-like click
        playTone(600, 'sine', 0.1, 0.05);
    },
    submit: () => {
        // Success marking sound
        playTone(800, 'sine', 0.1, 0.05);
        setTimeout(() => playTone(1200, 'sine', 0.2, 0.05), 100);
    },
    success: () => {
        // Ascending major triad
        playTone(440, 'sine', 0.2, 0.1);
        setTimeout(() => playTone(554, 'sine', 0.2, 0.1), 100);
        setTimeout(() => playTone(659, 'sine', 0.4, 0.1), 200);
    },
    error: () => {
        // Low buzzer
        playTone(150, 'sawtooth', 0.3, 0.05);
    },
    tick: () => {
        // Clock tick
        playTone(1000, 'square', 0.03, 0.01);
    },
    mark: () => {
        // Paper crunch / distinct notification
        playTone(300, 'triangle', 0.1, 0.05);
    }
};
