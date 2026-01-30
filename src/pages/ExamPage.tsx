import React, { useEffect, useState, Suspense, lazy } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from "@clerk/clerk-react";

// Imports (adjust paths as needed)
import { smartShuffle } from "../utils";
import ThreeBackground from "../ThreeBackground";
import AIConsoleLoader from "../AIConsoleLoader";

// Lazy load components
const Exam = lazy(() => import("../Exam"));
const Result = lazy(() => import("../Result"));

import { ExamData, AnswersState, MarkedState } from "../types";

// Helper from App.jsx
const getAnswerIndex = (letter: string) => {
    if (!letter) return -1;
    const l = letter.trim().toUpperCase();
    if (l === 'A') return 0;
    if (l === 'B') return 1;
    if (l === 'C') return 2;
    if (l === 'D') return 3;
    return -1;
};

export default function ExamPage() {
    const { id: testId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useUser();

    // State from App.jsx
    const [exam, setExam] = useState<ExamData | null>(null);
    const [started, setStarted] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [timeTaken, setTimeTaken] = useState(0);
    const [candidateName, setCandidateName] = useState(location.state?.name || "Candidate");
    const [loading, setLoading] = useState(false);
    const [tensionLoading, setTensionLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    // loadingTestId not really needed if we use params, but helpful for UI

    const [answers, setAnswers] = useState<AnswersState>({});
    const [marked, setMarked] = useState<MarkedState>({});
    const [isRetake, setIsRetake] = useState(false);

    // Security Effects
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
                toast.error("Copying content is disabled.");
            }
        };
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Load Exam Logic
    useEffect(() => {
        if (!testId) return;

        const loadExam = async (name: string, tid: string) => {
            setTensionLoading(true);

            try {
                const fetchPromise = (async () => {
                    const baseConfigResponse = await fetch(import.meta.env.BASE_URL + "exam.json");
                    if (!baseConfigResponse.ok) throw new Error("Failed to load base config");
                    const baseConfig = await baseConfigResponse.json();

                    const csvFile = tid === "PYQ" ? "pyquestions.csv" :
                        tid === "PYQ2" ? "pyquestions2.csv" :
                            (tid ? `questions${tid}.csv` : `questions1.csv`);

                    const csvResponse = await fetch(import.meta.env.BASE_URL + csvFile);
                    if (!csvResponse.ok) throw new Error(`Failed to load ${csvFile}`);
                    const csvText = await csvResponse.text();

                    return new Promise<{ exam: ExamData, answers: AnswersState, marked: MarkedState }>((resolve, reject) => {
                        Papa.parse(csvText, {
                            header: true,
                            skipEmptyLines: true,
                            transformHeader: (h) => h.trim(),
                            complete: (results: any) => {
                                const parsedQuestions = results.data.map((row: any, index: number) => {
                                    return {
                                        id: `Q${index + 1}`,
                                        question: row["Question"],
                                        options: [
                                            row["Option A"],
                                            row["Option B"],
                                            row["Option C"],
                                            row["Option D"]
                                        ].filter((opt: string) => opt),
                                        answer: getAnswerIndex(row["Correct Option (A/B/C/D)"]),
                                        section: row["Section"] || "General"
                                    };
                                });

                                const validQuestions = parsedQuestions.filter((q: any) => q.question && q.answer !== -1 && q.options.length > 1);

                                // Logic for saved state (resume)
                                const savedState = JSON.parse(localStorage.getItem("cbt_exam_state") || "{}");
                                let initialAnswers: AnswersState = {};
                                let initialMarked: MarkedState = {};

                                if (savedState && savedState.candidateName === name && !savedState.submitted) {
                                    // Basic check if it matches the test ID could be added here
                                    initialAnswers = savedState.answers || {};
                                    initialMarked = savedState.marked || {};
                                }

                                const numericId = parseInt(tid) || 1;
                                let examType = "Himachal GK";
                                if (tid === "PYQ" || tid === "PYQ2") {
                                    examType = "HPAS Prelims PYQ's";
                                } else if (numericId >= 5) {
                                    examType = "JOA IT";
                                }

                                resolve({
                                    exam: {
                                        ...baseConfig,
                                        questions: smartShuffle(validQuestions),
                                        id: tid,
                                        type: examType
                                    },
                                    answers: initialAnswers,
                                    marked: initialMarked
                                });
                            },
                            error: (err) => reject(err)
                        });
                    });
                })();

                // Artificial tension delay
                const tensionPromise = new Promise(resolve => setTimeout(resolve, 3000)); // Reduced from 6000 for better UX? Or keep 6000
                const [data] = await Promise.all([fetchPromise, tensionPromise]);

                setAnswers(data.answers);
                setMarked(data.marked);
                setExam(data.exam);
                setStarted(true);
                setTensionLoading(false);

            } catch (err: any) {
                console.error("EXAM LOAD ERROR:", err);
                toast.error(`Failed to load exam data: ${err.message}`);
                setTensionLoading(false);
                setLoading(false);
            }
        };

        loadExam(candidateName, testId);
    }, [testId, candidateName]);


    // Skeletons
    const ExamSkeleton = () => (
        <div className="fixed inset-0 flex flex-col font-sans bg-[#1a1c23] text-slate-300 animate-pulse">
            {/* Simplified Skeleton */}
            <div className="h-1.5 w-full bg-slate-800/50" />
            <div className="p-4 border-b border-white/5 flex justify-between">
                <div className="w-32 h-8 bg-white/5 rounded" />
                <div className="w-32 h-8 bg-white/5 rounded" />
            </div>
            <div className="flex-1 flex">
                <div className="hidden lg:block w-80 border-r border-white/5 bg-white/5" />
                <div className="flex-1 p-8 space-y-4">
                    <div className="w-full h-24 bg-white/5 rounded" />
                    <div className="w-full h-12 bg-white/5 rounded" />
                    <div className="w-full h-12 bg-white/5 rounded" />
                </div>
            </div>
        </div>
    );

    const ResultSkeleton = () => (
        <div className="min-h-screen relative flex items-center justify-center p-4 font-sans text-slate-200 overflow-hidden">
            <div className="w-full max-w-5xl grid lg:grid-cols-[1.2fr_0.8fr] gap-6 relative z-20 animate-pulse">

                {/* Main Card Skeleton */}
                <div className="h-full bg-black/30 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 flex flex-col justify-between min-h-[600px]">
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
                            <div key={i} className="bg-[#1a1c23]/80 backdrop-blur-md p-6 rounded-3xl border border-white/5 h-32 flex flex-col justify-between">
                                <div className="flex justify-between items-center">
                                    <div className="h-3 w-16 bg-white/10 rounded"></div>
                                    <div className="h-5 w-5 bg-white/10 rounded-full"></div>
                                </div>
                                <div className="h-10 w-24 bg-white/10 rounded-lg"></div>
                            </div>
                        ))}
                    </div>

                    {/* Insights Card Skeleton */}
                    <div className="bg-black/30 backdrop-blur-2xl rounded-[2rem] p-6 border border-white/5 h-full min-h-[200px]">
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

    const AnalyzingScreen = () => {
        const [step, setStep] = useState(0);
        const sequence = [
            { text: "Analyzing Sessions...", subtext: "Verifying response integrity.", duration: 1500 },
            { text: "Pattern Recognition", subtext: "Correlating answers with difficulty vectors.", duration: 2000 },
            { text: "Generating Insights", subtext: "Synthesizing performance metrics.", duration: 1500 },
            { text: "Finalizing Report", subtext: "Structuring your personalized summary.", duration: 1000 }
        ];

        useEffect(() => {
            let totalDelay = 0;
            sequence.forEach((s, i) => {
                setTimeout(() => setStep(i), totalDelay);
                totalDelay += s.duration;
            });
        }, []);

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
                                <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="url(#sparkle-gradient-result)" />
                                <defs>
                                    <linearGradient id="sparkle-gradient-result" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
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
                            transition={{ duration: 6, ease: "linear" }}
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
    };

    // Render Logic
    let content = null;

    if (loading) { // Initial Loading
        content = <ExamSkeleton />;
    } else if (tensionLoading) {
        content = (
            <motion.div key="loader" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                <AIConsoleLoader name={candidateName} testId={testId} />
            </motion.div>
        );
    } else if (analyzing) {
        content = <AnalyzingScreen />;
    } else if (submitted) {
        content = (
            <Suspense fallback={<ResultSkeleton />}>
                <Result
                    exam={exam}
                    answers={answers}
                    timeTaken={timeTaken}
                    candidateName={user?.fullName || candidateName}
                    userPhoto={user?.imageUrl}
                    onRetake={() => {
                        // Logic for retake: Reset and Navigate back to dashboard?
                        // Or reset state and stay here?
                        // Original App.jsx handled retake by showing Start screen.
                        navigate('/dashboard', { state: { retake: true } });
                    }}
                />
            </Suspense>
        );
    } else if (started && exam) {
        content = (
            <Suspense fallback={<ExamSkeleton />}>
                <Exam
                    data={exam}
                    answers={answers}
                    marked={marked}
                    candidateName={user?.fullName || candidateName}
                    userPhoto={user?.imageUrl}
                    setAnswers={setAnswers}
                    setMarked={setMarked}
                    onSubmit={(tt) => {
                        setTimeTaken(tt || 0);
                        setAnalyzing(true);
                        setTimeout(() => {
                            setAnalyzing(false);
                            setSubmitted(true);
                            localStorage.removeItem("cbt_exam_state");
                        }, 6000);
                    }}
                    onClearSession={() => localStorage.removeItem("cbt_exam_state")}
                    onBackToStart={() => navigate('/dashboard')}
                />
            </Suspense>
        );
    }

    // Intensity
    let bgIntensity = 1;
    if (tensionLoading || analyzing) bgIntensity = 0.5;
    else if (started && !submitted) bgIntensity = 0.15;
    else if (submitted) bgIntensity = 1;

    return (
        <>
            <ThreeBackground intensity={bgIntensity} />
            <AnimatePresence mode="wait">
                {content}
            </AnimatePresence>
        </>
    );
}
