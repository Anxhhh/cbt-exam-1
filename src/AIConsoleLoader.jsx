import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const getExamInfo = (testId) => {
    if (testId === "PYQ") {
        return {
            module: "HPAS_PRELIMS_PYQ_SET_1",
            desc: "Loading historical data patterns (2016-2025)... Analyzing frequency of topics..."
        };
    }
    if (testId === "PYQ2") {
        return {
            module: "HPAS_PRELIMS_PYQ_SET_2",
            desc: "Accessing recent examination archives... Correlating year-wise difficulty metrics..."
        };
    }
    const id = parseInt(testId);
    if (id >= 5) {
        return {
            module: `JOA_IT_TECH_MODULE_0${id}`,
            desc: "Initializing Computer Science proficiency algorithms... Loading technical syntax libraries..."
        };
    }
    return {
        module: `HP_GK_GENERAL_SET_0${testId || '1'}`,
        desc: "Connecting to Regional Knowledge Base... Triangulating geographical and cultural data points..."
    };
};

export default function AIConsoleLoader({ name, testId, onComplete }) {
    const [lines, setLines] = useState([]);
    const { module, desc } = getExamInfo(testId);

    const conversation = [
        { text: "> SYSTEM_INIT...", delay: 200 },
        { text: "> CONNECTING TO NEURAL INTERFACE...", delay: 600 },
        { text: `> IDENTITY_VERIFIED: [ CANDIDATE: ${name?.toUpperCase() || 'UNKNOWN'} ]`, delay: 1200, highlight: true },
        { text: `> TARGET_MODULE: ${module}`, delay: 1800, color: "text-blue-400" },
        { text: `> ANALYSIS: ${desc}`, delay: 2600, type: "typing" },
        { text: "> OPTIMIZING QUESTION VECTORS...", delay: 4500 },
        { text: "> READY_TO_DEPLOY.", delay: 5500, color: "text-green-400" }
    ];

    useEffect(() => {
        let timeouts = [];

        conversation.forEach((line, index) => {
            const timeout = setTimeout(() => {
                setLines(prev => [...prev, line]);
            }, line.delay);
            timeouts.push(timeout);
        });

        return () => timeouts.forEach(clearTimeout);
    }, [name, module, desc]);

    return (
        <div className="fixed inset-0 z-[100] bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center font-mono p-4">
            <div className="w-full max-w-2xl bg-[#0f172a] border border-blue-500/20 rounded-lg p-6 md:p-10 shadow-2xl relative overflow-hidden">
                {/* Scan line effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent h-[10px] w-full animate-[scan_2s_linear_infinite] pointer-events-none" />

                {/* Header */}
                <div className="flex justify-between items-center mb-6 border-b border-blue-500/20 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse delay-75" />
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse delay-150" />
                    </div>
                    <div className="text-xs text-blue-500/50">AI_CORE_V.2.4.0</div>
                </div>

                {/* Console Output */}
                <div className="space-y-3 font-mono text-sm md:text-base h-64 overflow-y-auto">
                    {lines.map((line, i) => (
                        <ConsoleLine key={i} line={line} />
                    ))}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="w-3 h-5 bg-blue-500 inline-block align-middle ml-1"
                    />
                </div>

                {/* Footer Status */}
                <div className="mt-6 pt-4 border-t border-blue-500/20 flex justify-between items-center text-xs text-slate-400">
                    <span>STATUS: <span className="text-blue-400 animate-pulse">PROCESSING</span></span>
                    <span>SECURE_CONNECTION</span>
                </div>
            </div>
        </div>
    );
}

const ConsoleLine = ({ line }) => {
    // If it's a typing effect line
    if (line.type === "typing") {
        return <TypingText text={line.text} color={line.color} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${line.highlight ? 'bg-blue-500/10 border-l-2 border-blue-500 pl-2 py-1' : ''} ${line.color || 'text-slate-300'}`}
        >
            {line.text}
        </motion.div>
    );
};

const TypingText = ({ text, color }) => {
    const [displayed, setDisplayed] = useState("");

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(text.substring(0, i));
            i++;
            if (i > text.length) clearInterval(interval);
        }, 30); // Typing speed
        return () => clearInterval(interval);
    }, [text]);

    return <div className={`${color || 'text-blue-300/80'} italic`}>{displayed}</div>;
};
