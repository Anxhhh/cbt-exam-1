import { useRef, useEffect } from "react";
import jsPDF from "jspdf";
import { Download, RefreshCw, CheckCircle, XCircle, AlertCircle, FileText, Share2, Award, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Result({ exam, answers, onRetake }) {
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

        // Background
        doc.setFillColor(26, 28, 35); // Dark bg
        doc.rect(0, 0, 210, 297, 'F');

        // Header Band
        doc.setFillColor(37, 99, 235); // Blue
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.text("PERFORMANCE REPORT", 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("StatePrep CBT - Himachal Pradesh Mock Test", 105, 30, { align: "center" });

        // Score Card
        doc.setFillColor(30, 41, 59); // Card bg
        doc.roundedRect(20, 50, 170, 50, 3, 3, 'F');

        doc.setTextColor(148, 163, 184);
        doc.setFontSize(12);
        doc.text("FINAL SCORE", 105, 65, { align: 'center' });

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(36);
        doc.setFont("helvetica", "bold");
        doc.text(`${correct} / ${total}`, 105, 80, { align: 'center' });

        doc.setFontSize(10);
        doc.setTextColor(scorePercent > 70 ? 74 : 248, scorePercent > 70 ? 222 : 113, scorePercent > 70 ? 128 : 113); // Green or Slate
        doc.text(`Accuracy: ${Math.round((correct / (attempted || 1)) * 100)}%`, 105, 90, { align: 'center' });

        // Candidate Info Table
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text("Candidate Details", 20, 120);

        doc.setDrawColor(51, 65, 85);
        doc.line(20, 125, 190, 125);

        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text("Name:", 20, 135);
        doc.setTextColor(255, 255, 255);
        doc.text("Demo Candidate", 60, 135);

        doc.setTextColor(148, 163, 184);
        doc.text("Roll No:", 20, 142);
        doc.setTextColor(255, 255, 255);
        doc.text("HPGK-2026-001", 60, 142);

        doc.setTextColor(148, 163, 184);
        doc.text("Date:", 120, 135);
        doc.setTextColor(255, 255, 255);
        doc.text(new Date().toLocaleDateString(), 150, 135);

        // Stats Grid
        const startY = 160;
        const boxWidth = 35;
        const gap = 10;

        const drawMiniBox = (x, title, val, color) => {
            doc.setFillColor(30, 41, 59);
            doc.roundedRect(x, startY, boxWidth, 30, 2, 2, 'F');

            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(title, x + boxWidth / 2, startY + 10, { align: 'center' });

            doc.setFontSize(14);
            doc.setTextColor(...color);
            doc.setFont("helvetica", "bold");
            doc.text(String(val), x + boxWidth / 2, startY + 22, { align: 'center' });
        }

        drawMiniBox(20, "ATTEMPTED", attempted, [96, 165, 250]);
        drawMiniBox(65, "CORRECT", correct, [74, 222, 128]);
        drawMiniBox(110, "WRONG", wrong, [248, 113, 113]);
        drawMiniBox(155, "SKIPPED", unattempted, [148, 163, 184]);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text("Generated by StatePrep CBT System", 105, 280, { align: "center" });

        doc.save("StatePrep-Results.pdf");
    };

    return (
        <div className="min-h-screen bg-[#0f1116] flex items-center justify-center p-4 font-sans text-slate-200">
            <div className="w-full max-w-5xl grid lg:grid-cols-[1.2fr_0.8fr] gap-6 animate-in slide-in-from-bottom-4 duration-500">

                {/* Main Card */}
                <div className="bg-[#1a1c23] rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div>
                        <header className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">Performance Summary</h1>
                                <p className="text-slate-500 text-sm">HP GK - Mock Test Series 1</p>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-400">
                                {new Date().toLocaleDateString()}
                            </div>
                        </header>

                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="relative mb-6">
                                {/* Simple CSS Circular Progress */}
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                                    <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                                        strokeDasharray={2 * Math.PI * 88}
                                        strokeDashoffset={2 * Math.PI * 88 * (1 - scorePercent / 100)}
                                        className={`transition-all duration-1000 ease-out ${scorePercent > 70 ? 'text-emerald-500' : scorePercent > 40 ? 'text-blue-500' : 'text-rose-500'}`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-bold text-white">{scorePercent}%</span>
                                    <span className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1">Score</span>
                                </div>
                            </div>

                            <div className="text-center space-y-1">
                                <h3 className="text-xl font-bold text-white">
                                    {scorePercent > 80 ? "Outstanding Performance!" :
                                        scorePercent > 60 ? "Good Job, Keep Improving!" : "Needs More Practice"}
                                </h3>
                                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                                    You answered <span className="text-white font-bold">{correct}</span> out of <span className="text-white font-bold">{total}</span> questions correctly.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-8">
                        <button onClick={onRetake} className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5">
                            <RefreshCw className="w-4 h-4" /> Retake Test
                        </button>
                        <button onClick={generatePDF} className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-600/20">
                            <Download className="w-4 h-4" /> Download Report
                        </button>
                    </div>
                </div>

                {/* Analysis Side */}
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard label="Accuracy" value={`${Math.round((correct / (attempted || 1)) * 100)}%`} icon={<TrendingUp className="w-5 h-5 text-blue-400" />} />
                        <StatCard label="Attempted" value={attempted} icon={<FileText className="w-5 h-5 text-purple-400" />} />
                        <StatCard label="Correct" value={correct} icon={<CheckCircle className="w-5 h-5 text-emerald-400" />} />
                        <StatCard label="Wrong" value={wrong} icon={<XCircle className="w-5 h-5 text-rose-400" />} />
                    </div>

                    {/* Insights Card */}
                    <div className="bg-[#1a1c23] rounded-3xl p-6 border border-white/5 shadow-xl">
                        <h4 className="font-bold text-white flex items-center gap-2 mb-4">
                            <Award className="w-5 h-5 text-amber-500" /> Key Insights
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-sm text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                <span>Your accuracy is {Math.round((correct / (attempted || 1)) * 100)}%. Focus on reducing negative marking in the next attempt.</span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                                <span>You skipped {unattempted} questions. Try to manage time better to attempt more.</span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                <span>Great consistency in the first half of the exam. Keep it up!</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatCard({ label, value, icon }) {
    return (
        <div className="bg-[#1a1c23] p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-32 hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</span>
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                    {icon}
                </div>
            </div>
            <span className="text-3xl font-bold text-white">{value}</span>
        </div>
    );
}
