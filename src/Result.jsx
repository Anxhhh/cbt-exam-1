import { useRef, useEffect } from "react";
import jsPDF from "jspdf";
import { Download, RefreshCw, CheckCircle, XCircle, AlertCircle, FileText, Share2, Award, TrendingUp, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from "framer-motion";

export default function Result({ exam, answers, timeTaken, onRetake, candidateName }) {
    if (!exam || !Array.isArray(exam.questions)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#1a1c23] font-sans text-slate-500">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-white/10 animate-spin"></div>
                    <span className="text-slate-400 font-medium">Calculating Performance...</span>
                </div>
            </div>
        );
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

    const formatTime = (s) => {
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

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.9, 0.9) } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.9, 0.9) } }));
            }, 250);
        }
    }, [scorePercent]);

    const generatePDF = () => {
        const doc = new jsPDF();

        // --- PAGE 1: REPORT CARD ---

        // Clear background (White)
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 210, 297, 'F');

        // Header
        doc.setFillColor(30, 58, 138); // Dark Blue Header
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("PERFORMANCE REPORT", 20, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("StatePrep CBT - Himachal Pradesh Mock Test", 20, 30);

        doc.text(`Roll No: HPGK-2026-001`, 190, 20, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, 30, { align: 'right' });

        // Candidate Summary Box
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(250, 250, 250);
        doc.rect(20, 50, 170, 35, 'F');
        doc.rect(20, 50, 170, 35, 'S');

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.text(`Candidate Name: ${candidateName || "Demo Candidate"}`, 25, 62);
        doc.text(`Total Questions: ${total}`, 25, 75);

        doc.text(`Time Taken: ${formatTime(timeTaken || 0)}`, 110, 62);
        doc.text(`Total Marks: ${correct}`, 110, 75);

        // Infographic Chart (Bar Chart Simulation)
        const chartY = 110;
        doc.setFont("helvetica", "bold");
        doc.text("Performance Analysis", 20, 100);

        const maxVal = Math.max(attempted, correct, wrong, unattempted, 1); // Avoid div by 0
        const barMaxHeight = 80;
        const scale = barMaxHeight / maxVal;

        // Draw Bars
        const drawBar = (x, val, label, color) => {
            const h = val * scale;
            doc.setFillColor(...color);
            doc.rect(x, chartY + (barMaxHeight - h), 30, h, 'F');

            // Value Top
            doc.setTextColor(0, 0, 0);
            doc.text(String(val), x + 15, chartY + (barMaxHeight - h) - 5, { align: 'center' });

            // Label Bottom
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(label, x + 15, chartY + barMaxHeight + 15, { align: 'center' });
        }

        drawBar(30, attempted, "Attempted", [59, 130, 246]); // Blue
        drawBar(75, correct, "Correct", [34, 197, 94]);    // Green
        drawBar(120, wrong, "Wrong", [239, 68, 68]);       // Red
        drawBar(165, unattempted, "Skipped", [148, 163, 184]); // Gray

        // Pie Chart Legend Simulation (Text based summary)
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.setFont("helvetica", "bold");
        doc.text("Overall Accuracy", 20, 230);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(30);
        doc.setTextColor(30, 58, 138);
        doc.text(`${Math.round((correct / (attempted || 1)) * 100)}%`, 20, 245);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Accuracy is calculated on attempted questions.", 20, 255);

        // Footer Page 1
        doc.setFontSize(8);
        doc.text("Page 1 of Detailed Report", 105, 290, { align: "center" });


        // --- PAGE 2+: DETAILED SOLUTIONS ---
        doc.addPage();

        let y = 20;

        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("DETAILED QUESTION ANALYSIS", 105, 13, { align: 'center' });

        y = 35;

        exam.questions.forEach((q, i) => {
            // Check page break
            if (y > 250) {
                doc.addPage();
                y = 20;
                // Header on new page
                doc.setFillColor(240, 240, 240);
                doc.rect(0, 0, 210, 10, 'F');
                doc.setTextColor(100, 100, 100);
                doc.setFontSize(8);
                doc.text("Detailed Analysis Continued...", 105, 7, { align: 'center' });
                y += 10;
            }

            // Question Text
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");

            const qPrefix = `Q${i + 1}. `;
            const qLines = doc.splitTextToSize(qPrefix + q.question, 170);
            doc.text(qLines, 20, y);
            y += (qLines.length * 5) + 2;

            // Options & Status
            const userAnsIdx = answers[q.id];
            const correctAnsIdx = q.answer;
            const correctText = q.options[correctAnsIdx];
            const userText = userAnsIdx !== undefined ? q.options[userAnsIdx] : "Not Attempted";

            // Status Badge
            let statusText = "SKIPPED";
            let statusColor = [150, 150, 150]; // Gray

            if (userAnsIdx !== undefined) {
                if (userAnsIdx === correctAnsIdx) {
                    statusText = "CORRECT";
                    statusColor = [34, 197, 94]; // Green
                } else {
                    statusText = "WRONG";
                    statusColor = [239, 68, 68]; // Red
                }
            }

            doc.setFillColor(...statusColor);
            doc.rect(20, y, 20, 6, 'F'); // Status badge bg
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.text(statusText, 30, y + 4, { align: 'center' });

            doc.setTextColor(50, 50, 50);
            doc.setFontSize(9);

            doc.text(`Correct Answer: ${correctText}`, 45, y + 4);
            y += 8;
            if (userAnsIdx !== undefined && userAnsIdx !== correctAnsIdx) {
                doc.setTextColor(220, 38, 38); // Red text for wrong
                doc.text(`Your Answer: ${userText}`, 45, y);
                y += 6;
            }

            // Separator
            doc.setDrawColor(230, 230, 230);
            doc.line(20, y + 2, 190, y + 2);
            y += 10;
        });

        doc.save("StatePrep-Detailed-Report.pdf");
    };

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
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };

    const circumference = 2 * Math.PI * 88;
    const offset = circumference - (scorePercent / 100) * circumference;

    return (
        <div className="min-h-screen bg-[#0f1116] flex items-center justify-center p-4 font-sans text-slate-200">
            <motion.div
                className="w-full max-w-5xl grid lg:grid-cols-[1.2fr_0.8fr] gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >

                {/* Main Card */}
                <motion.div variants={itemVariants} className="bg-[#1a1c23] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div>
                        <header className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">Performance Summary</h1>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-400">
                                {new Date().toLocaleDateString()}
                            </div>
                        </header>

                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="relative mb-6">
                                {/* Animated SVG Circular Progress */}
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                                    <motion.circle
                                        cx="96" cy="96" r="88"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        initial={{ strokeDashoffset: circumference }}
                                        animate={{ strokeDashoffset: offset }}
                                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                        className={`drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] ${scorePercent > 70 ? 'text-emerald-500' : scorePercent > 40 ? 'text-blue-500' : 'text-rose-500'}`}
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
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onRetake}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5"
                        >
                            <RefreshCw className="w-4 h-4" /> Retake Test
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={generatePDF}
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-600/20"
                        >
                            <Download className="w-4 h-4" /> Download AI Report
                        </motion.button>
                    </div>
                </motion.div>

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
                    <motion.div variants={itemVariants} className="bg-[#1a1c23] rounded-3xl p-6 border border-white/5 shadow-xl">
                        <h4 className="font-bold text-white flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-amber-500" /> AI Key Insights
                        </h4>
                        <ul className="space-y-4">
                            <motion.li
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="flex gap-3 text-sm text-slate-400"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                <span>Your accuracy is {Math.round((correct / (attempted || 1)) * 100)}%. Focus on reducing negative marking in the next attempt.</span>
                            </motion.li>
                            <motion.li
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.9 }}
                                className="flex gap-3 text-sm text-slate-400"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                                <span>You skipped {unattempted} questions. Try to manage time better to attempt more.</span>
                            </motion.li>
                            <motion.li
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1.0 }}
                                className="flex gap-3 text-sm text-slate-400"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                <span>Great consistency in the first half of the exam. Keep it up!</span>
                            </motion.li>
                        </ul>
                    </motion.div>
                </div>

            </motion.div>
        </div>
    );
}

function StatCard({ label, value, icon, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay, duration: 0.3 }}
            className="bg-[#1a1c23] p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-32 hover:border-white/10 transition-colors group hover:shadow-lg hover:shadow-black/20"
        >
            <div className="flex justify-between items-start">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</span>
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                    {icon}
                </div>
            </div>
            <span className="text-3xl font-bold text-white">{value}</span>
        </motion.div>
    );
}
