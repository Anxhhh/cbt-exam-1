// Audio synthesis utility using Web Audio API
// No external assets required

let ctx: AudioContext | null = null;

const getContext = () => {
    if (!ctx) {
        if (typeof window === 'undefined') return null;
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            ctx = new AudioContext();
        }
    }
    return ctx;
};

// @ts-ignore - unused for now but good to keep
const playTone = (freq: number, type: OscillatorType, duration: number, vol = 0.1) => {
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
    hover: () => { },
    click: () => { },
    submit: () => { },
    success: () => { },
    error: () => { },
    tick: () => { },
    mark: () => { }
};
