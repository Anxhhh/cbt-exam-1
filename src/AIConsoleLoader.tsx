import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Dynamic Exam Knowledge Base ---
const getExamData = (testId: string) => {
    // 1. HPAS PYQ Set 1
    if (testId === "PYQ") {
        return {
            title: "HPAS Prelims (2016-2025)",
            difficulty: "Advanced",
            domains: ["Himachal History", "Polity", "Geography", "Economy"],
            insights: [
                "Analyzing question frequency from 2016-2025...",
                "Detecting high weightage in 'Himachal Culture'...",
                "Correlating Polity questions with recent amendments...",
                "Retrieving 10-year historical difficulty trends..."
            ]
        };
    }

    // 2. HPAS PYQ Set 2
    if (testId === "PYQ2") {
        return {
            title: "HPAS Prelims - Set 2",
            difficulty: "Hard / Adaptive",
            domains: ["Current Affairs", "General Science", "Environment", "Logic"],
            insights: [
                "Scanning recent current affairs databases...",
                "Calibrating complexity for 'Environmental Science'...",
                "Reviewing logical reasoning patterns...",
                "Synthesizing multi-disciplinary question vectors..."
            ]
        };
    }

    const id = parseInt(testId);

    // 3. JOA IT (IDs >= 5)
    if (id >= 5) {
        return {
            title: `JOA IT Module ${id}`,
            difficulty: "Technical / Moderate",
            domains: ["Computer Science", "Networking", "Hardware", "Office Suites"],
            insights: [
                "Loading binary logic and syntax libraries...",
                "Compiling questions on 'Network Protocols'...",
                "Accessing database of recent IT trends...",
                "Optimizing for accuracy in technical definitions..."
            ]
        };
    }

    // 4. Default: General Knowledge
    return {
        title: `General Knowledge Set ${testId || '1'}`,
        difficulty: "Moderate",
        domains: ["General Awareness", "Sports", "Awards", "Facts"],
        insights: [
            "Accessing global knowledge graph...",
            "Triangulating data points for 'General Awareness'...",
            "Verifying factual consistency across domains...",
            "Selecting diversified topics for balanced assessment..."
        ]
    };
};

interface AIConsoleLoaderProps {
    name: string;
    testId: string;
}

export default function AIConsoleLoader({ name, testId }: AIConsoleLoaderProps) {
    const [step, setStep] = useState(0);

    // Memoize the sequence so it stays stable during the render, but randomized on mount
    const sequence = useMemo(() => {
        const data = getExamData(testId);

        // Pick a random unique insight for variety every time
        const randomInsight = data.insights[Math.floor(Math.random() * data.insights.length)];

        return [
            {
                text: `Hello, ${name || 'Candidate'}.`,
                subtext: "Establishing secure neural connection...",
                duration: 1500
            },
            {
                text: `Accessing ${data.title}...`,
                subtext: `Domains: ${data.domains.join(", ")}`,
                duration: 2000
            },
            {
                text: randomInsight,
                subtext: "Processing deep-learning vectors...",
                duration: 2000
            },
            {
                text: `Difficulty Est: ${data.difficulty}`,
                subtext: "Adjusting evaluation metrics to your profile.",
                duration: 1500
            }
        ];
    }, [name, testId]);

    useEffect(() => {
        let totalDelay = 0;
        sequence.forEach((s, i) => {
            setTimeout(() => setStep(i), totalDelay);
            totalDelay += s.duration;
        });
    }, [sequence]);

    return (
        <div className="fixed inset-0 z-[100] bg-[#020617] flex items-center justify-center font-sans p-6 overflow-hidden">
            {/* Ambient Spotlight */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_60%)] opacity-40 pointer-events-none" />

            <div className="w-full max-w-xl text-center space-y-10 relative z-10">

                {/* Refined AI Sparkle Icon */}
                <div className="flex justify-center items-center relative h-20">
                    {/* Outer Glow */}
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"
                    />

                    {/* Main Sparkle */}
                    <div className="relative w-14 h-14">
                        <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="url(#sparkle-gradient-1)" />
                            <defs>
                                <linearGradient id="sparkle-gradient-1" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#93c5fd" />
                                    <stop offset="1" stopColor="#c084fc" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Secondary Star (Rotating) */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute w-8 h-8 opacity-70"
                    >
                        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="white" />
                        </svg>
                    </motion.div>
                </div>

                {/* Text Content */}
                <div className="h-32 flex flex-col items-center justify-start">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.05, filter: 'blur(5px)' }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-3"
                        >
                            <h2 className="text-3xl md:text-3xl font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-slate-400">
                                {sequence[step]?.text}
                            </h2>
                            <p className="text-slate-400/80 text-sm md:text-base font-light tracking-wide max-w-md mx-auto">
                                {sequence[step]?.subtext}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Ultra-Minimal Progress Line */}
                <div className="w-64 mx-auto relative h-0.5 bg-slate-800/50 rounded-full overflow-hidden">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-blue-400 to-purple-400"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 7, ease: "linear" }} // Matched approx total duration
                    />
                    {/* Shimmer Effect */}
                    <motion.div
                        className="absolute inset-y-0 top-0 w-20 bg-white/20 skew-x-12 blur-sm"
                        animate={{ x: [-100, 300] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
                    />
                </div>

            </div>
        </div>
    );
}
