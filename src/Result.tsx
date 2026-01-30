import { useEffect, useRef } from "react";
import { Download, RefreshCw, CheckCircle, XCircle, Award, TrendingUp, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from "framer-motion";
import BuyMeCoffeeBtn from './BuyMeCoffeeBtn';
import { TiltCard } from './TiltCard';
import { ResultProps } from "./types";
import { generatePDF } from "./utils/pdfGenerator";
import { generateInsights } from "./utils/analytics";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    delay: number;
}

export default function Result({ exam, answers, timeTaken, onRetake, candidateName }: ResultProps) {
    if (!exam || !Array.isArray(exam.questions)) {
        return <ResultSkeleton />;
    }

    const total = exam.questions.length;
    let attempted = 0;
    let correct = 0;

    exam.questions.forEach(q => {
        if (answers && answers[q.id] !== undefined) {
            attempted++;
            if (answers[q.id] === q.answer) {
                correct++;
            }
        }
    });

    const wrong = attempted - correct;
    const unattempted = total - attempted;
    const scorePercent = Math.round((correct / total) * 100);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}m ${sec}s`;
    };

    // Trigger confetti on high score
    useEffect(() => {
        if (scorePercent > 70) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.9, 0.9) } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.9, 0.9) } }));
            }, 250);

            return () => clearInterval(interval);
        }
    }, [scorePercent]);

    const handleGeneratePDF = () => {
        generatePDF({
            exam,
            answers,
            timeTaken,
            candidateName,
            stats: { total, attempted, correct, wrong, unattempted }
        });
    };

    const insights = generateInsights(exam, answers, correct, attempted, total);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring" as const, stiffness: 300, damping: 24 }
        }
    };

    const circumference = 2 * Math.PI * 88;
    const offset = circumference - (scorePercent / 100) * circumference;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef} className="min-h-screen relative flex items-center justify-center p-4 font-sans text-slate-200 overflow-hidden">
            {/* Note: ThreeBackground is now handled in the parent/layout or App.tsx */}
            <motion.div
                className="w-full max-w-5xl grid lg:grid-cols-[1.2fr_0.8fr] gap-6 relative z-20"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.1 }}
            >

                {/* Main Card */}
                <TiltCard className="h-full">
                    <motion.div variants={itemVariants} className="bg-black/30 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/5 relative overflow-hidden flex flex-col justify-between h-full">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div>
                            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 sm:gap-0">
                                <div>
                                    <h1 className="text-2xl font-bold text-white tracking-tight">Performance Summary</h1>
                                </div>
                                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-400 self-start sm:self-auto backdrop-blur-md">
                                    {new Date().toLocaleDateString()}
                                </div>
                            </header>

                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="relative mb-6">
                                    {/* Animated SVG Circular Progress */}
                                    <svg className="w-48 h-48 transform -rotate-90">
                                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                                        <motion.circle
                                            cx="96" cy="96" r="88"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={circumference}
                                            initial={{ strokeDashoffset: circumference }}
                                            animate={{ strokeDashoffset: offset }}
                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                            className={`drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] ${scorePercent > 70 ? 'text-emerald-500' : scorePercent > 40 ? 'text-blue-500' : 'text-rose-500'}`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <motion.span
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 1, type: "spring" }}
                                            className="text-5xl font-bold text-white"
                                        >
                                            {scorePercent}%
                                        </motion.span>
                                        <span className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1">Score</span>
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2 }}
                                    className="text-center space-y-1"
                                >
                                    <h3 className="text-xl font-bold text-white">
                                        {scorePercent > 80 ? "Outstanding Performance!" :
                                            scorePercent > 60 ? "Good Job, Keep Improving!" : "Needs More Practice"}
                                    </h3>
                                    <p className="text-slate-400 text-sm max-w-sm mx-auto">
                                        You answered <span className="text-white font-bold">{correct}</span> out of <span className="text-white font-bold">{total}</span> questions correctly.
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-8">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onRetake}
                                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5 backdrop-blur-md"
                            >
                                <RefreshCw className="w-4 h-4" /> Retake Test
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleGeneratePDF}
                                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-blue-600/80 hover:bg-blue-600 text-white transition-all shadow-[0_8px_30px_rgba(37,99,235,0.3)] backdrop-blur-md border border-blue-500/30"
                            >
                                <Download className="w-4 h-4" /> Download AI Report
                            </motion.button>
                        </div>
                    </motion.div>
                </TiltCard>

                {/* Analysis Side */}
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard delay={0.2} label="Accuracy" value={`${Math.round((correct / (attempted || 1)) * 100)}%`} icon={<TrendingUp className="w-5 h-5 text-blue-400" />} />
                        <StatCard delay={0.3} label="Time Taken" value={formatTime(timeTaken || 0)} icon={<Clock className="w-5 h-5 text-amber-500" />} />
                        <StatCard delay={0.4} label="Correct" value={correct} icon={<CheckCircle className="w-5 h-5 text-emerald-400" />} />
                        <StatCard delay={0.5} label="Wrong" value={wrong} icon={<XCircle className="w-5 h-5 text-rose-400" />} />
                    </div>

                    {/* Insights Card */}
                    <TiltCard className="">
                        <motion.div
                            initial={{ opacity: 0, y: 60, rotateX: -10, filter: "blur(8px)" }}
                            whileInView={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                            viewport={{ once: false, margin: "-10%" }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="bg-black/30 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/10 shadow-xl"
                        >
                            <h4 className="font-bold text-white flex items-center gap-2 mb-4">
                                <Award className="w-5 h-5 text-amber-500" /> Smart Performance Analysis {exam.type && <span className="text-xs opacity-50 bg-white/10 px-2 py-1 rounded-full">{exam.type}</span>}
                            </h4>
                            <ul className="space-y-4">
                                {insights.map((insight, idx) => (
                                    <motion.li
                                        key={idx}
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.8 + (idx * 0.1) }}
                                        className="flex gap-3 text-sm text-slate-400 items-start"
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${insight.color} mt-1.5 flex-shrink-0 shadow-[0_0_8px_${insight.color.replace('bg-', '')}]`} />
                                        <span>{insight.text}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </TiltCard>
                </div>
            </motion.div>
            <BuyMeCoffeeBtn screen="result" score={scorePercent} targetRef={containerRef} />
        </div>
    );
}

function StatCard({ label, value, icon, delay }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, margin: "-20px" }}
            transition={{ delay: delay, duration: 0.5, ease: "easeOut" }}
            className="relative bg-[#1a1c23] p-6 rounded-3xl border border-white/5 overflow-hidden group hover:border-white/10 transition-all"
        >
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />

            <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
                    <div className="text-slate-400 group-hover:text-white transition-colors group-hover:scale-110 duration-300">
                        {icon}
                    </div>
                </div>
                <span className="text-3xl md:text-4xl font-bold text-white tracking-tighter">{value}</span>
            </div>
        </motion.div>
    );
}

function ResultSkeleton() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 font-sans text-slate-200 overflow-hidden bg-[#1a1c23]">
            <div className="w-full max-w-5xl grid lg:grid-cols-[1.2fr_0.8fr] gap-6 relative z-20 animate-pulse">

                {/* Main Card Skeleton */}
                <div className="h-full bg-black/30 rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-between min-h-[600px]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 sm:gap-0">
                        <div className="h-8 w-64 bg-white/10 rounded-lg"></div>
                        <div className="h-8 w-32 bg-white/10 rounded-full"></div>
                    </div>

                    <div className="flex flex-col items-center justify-center py-8 flex-grow">
                        <div className="w-48 h-48 rounded-full border-[12px] border-white/5 flex items-center justify-center mb-6 relative">
                            <div className="w-24 h-12 bg-white/10 rounded"></div>
                        </div>
                        <div className="space-y-4 text-center w-full flex flex-col items-center mt-4">
                            <div className="h-8 w-64 bg-white/10 rounded-lg"></div>
                            <div className="h-4 w-48 bg-white/10 rounded-lg"></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8">
                        <div className="h-14 bg-white/5 rounded-xl"></div>
                        <div className="h-14 bg-white/5 rounded-xl"></div>
                    </div>
                </div>

                {/* Analysis Side Skeleton */}
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-[#1a1c23] p-6 rounded-3xl border border-white/5 h-32 flex flex-col justify-between">
                                <div className="flex justify-between items-center">
                                    <div className="h-3 w-16 bg-white/10 rounded"></div>
                                    <div className="h-5 w-5 bg-white/10 rounded-full"></div>
                                </div>
                                <div className="h-10 w-24 bg-white/10 rounded-lg"></div>
                            </div>
                        ))}
                    </div>

                    {/* Insights Card Skeleton */}
                    <div className="bg-black/30 rounded-[2rem] p-6 border border-white/5 h-full min-h-[200px]">
                        <div className="h-6 w-56 bg-white/10 rounded-lg mb-6"></div>
                        <div className="space-y-5">
                            <div className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-white/10 mt-2"></div>
                                <div className="h-4 w-full bg-white/5 rounded"></div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-white/10 mt-2"></div>
                                <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-white/10 mt-2"></div>
                                <div className="h-4 w-4/6 bg-white/5 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
