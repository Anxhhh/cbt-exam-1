import { useEffect, useMemo, useState, useRef } from "react";
import profileImg from "./assets/profile.png";
import {
  ChevronLeft, ChevronRight, Menu, X, Flag,
  Settings, Type, CheckCircle, Circle, Clock,
  Maximize2, Minimize2, Eye, EyeOff, MinusCircle,
  LayoutGrid, Sun, Moon, BookOpen
} from 'lucide-react';
import { cn } from "./utils";

export default function Exam({
  data,
  answers,
  marked,
  setAnswers,
  setMarked,
  onSubmit
}) {
  // ================= STATE =================
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState(data.duration * 60);
  const [visited, setVisited] = useState({});
  const [eliminated, setEliminated] = useState({}); // { [qId]: { [optIdx]: true } }

  // UI States
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isZenMode, setZenMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Accessibility
  const [theme, setTheme] = useState('light'); // light, dark, sepia
  const [fontSize, setFontSize] = useState('normal'); // normal, large, xl

  const candidate = {
    name: "Demo Candidate",
    rollNo: "HPGK-2026-001",
    photo: profileImg
  };

  const currentQ = data.questions[index];

  // ================= EFFECTS =================

  // Timer
  useEffect(() => {
    if (time <= 0) {
      onSubmit();
      return;
    }
    const t = setInterval(() => setTime(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [time, onSubmit]);

  // Mark Visited
  useEffect(() => {
    setVisited(prev => ({ ...prev, [currentQ.id]: true }));
  }, [currentQ.id]);

  // Responsive: collapse sidebar on mobile initially
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else if (!isZenMode) setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isZenMode]);

  // ================= HELPERS =================

  // Shuffle Options (Memoized)
  const shuffledOptions = useMemo(() => {
    return currentQ.options
      .map((text, originalIndex) => ({ text, originalIndex }))
      .sort(() => {
        // Simple consistent shuffle based on text length + index to simulate randomness but keep it stable during render
        // Actually for a real exam we want stable randomness. 
        // The previous implementation used Math.random() in useMemo. 
        // We'll stick to that but depend on currentQ.id to reset only when Q changes.
        return Math.random() - 0.5;
      });
  }, [currentQ.id]);

  const toggleReview = () => {
    setMarked(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleEliminate = (e, optIdx) => {
    e.preventDefault();
    setEliminated(prev => {
      const qElim = prev[currentQ.id] || {};
      const newQElim = { ...qElim, [optIdx]: !qElim[optIdx] };
      return { ...prev, [currentQ.id]: newQElim };
    });
  };

  const stats = useMemo(() => {
    const total = data.questions.length;
    const answeredCount = Object.keys(answers).length;
    const markedCount = Object.keys(marked).filter(k => marked[k]).length;
    const visitedCount = Object.keys(visited).length;
    return { total, answeredCount, markedCount, visitedCount, skipped: total - answeredCount };
  }, [data, answers, marked, visited]);

  // ================= RENDER HELPERS =================

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percent = time / (data.duration * 60);
    if (percent > 0.5) return "bg-emerald-500";
    if (percent > 0.2) return "bg-amber-500";
    return "bg-rose-600 animate-pulse";
  };

  const getTimerTextClass = () => {
    const percent = time / (data.duration * 60);
    if (percent > 0.2) return "text-slate-800 dark:text-slate-200 bg-black/5 dark:bg-white/10";
    return "text-rose-600 font-bold bg-rose-50 dark:bg-rose-900/20";
  };

  // Theme Classes
  const themeClasses = {
    light: "bg-slate-50 text-slate-900",
    dark: "bg-slate-900 text-slate-100 dark",
    sepia: "bg-[#fdf6e3] text-[#5f4b32]"
  };

  const fontClasses = {
    normal: "text-base",
    large: "text-lg",
    xl: "text-xl"
  };

  const containerClasses = cn(
    "min-h-screen flex flex-col transition-colors duration-300 font-sans",
    themeClasses[theme],
    fontClasses[fontSize]
  );

  return (
    <div className={containerClasses}>
      {/* ================= SUPER HEADER (Progress + Zen) ================= */}
      {/* Pulse Timer Bar */}
      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700/50 relative overflow-hidden">
        <div
          className={cn("h-full transition-all duration-1000 ease-linear", getTimerColor())}
          style={{ width: `${(time / (data.duration * 60)) * 100}%` }}
        />
      </div>

      {!isZenMode && (
        <header className="px-6 py-3 border-b border-black/5 flex items-center justify-between backdrop-blur-sm bg-opacity-90 sticky top-0 z-20 shadow-sm relative">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src={candidate.photo} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-200 object-cover" />
              <div className="leading-tight">
                <h2 className="font-bold text-sm tracking-wide uppercase opacity-70">Candidate</h2>
                <p className="font-semibold text-base">{candidate.name}</p>
              </div>
            </div>
            <div className="hidden md:block h-8 w-px bg-current opacity-10 mx-2"></div>
            <h1 className="hidden md:block font-bold text-lg opacity-80 trcking-tight">
              StatePrep CBT <span className="font-normal opacity-60">— Himachal Pradesh</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer Display - Improved Visibility */}
            <div className={cn("hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xl font-bold tabular-nums border border-transparent dark:border-slate-700 transition-colors", getTimerTextClass())}>
              <Clock className="w-5 h-5 opacity-70" />
              {formatTime(time)}
            </div>

            {/* Tools */}
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 bg-black/5 p-1 rounded-lg">
                <button
                  onClick={() => setZenMode(true)}
                  className="p-2 rounded-md hover:bg-white/50 dark:hover:bg-white/10 active:scale-95 transition-all text-slate-700 dark:text-slate-200"
                  title="Zen Mode"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={cn("p-2 rounded-md hover:bg-white/50 dark:hover:bg-white/10 active:scale-95 transition-all text-slate-700 dark:text-slate-200", showSettings && "bg-white/80 dark:bg-slate-700 shadow-sm")}
                    title="Accessibility Settings"
                  >
                    <Type className="w-5 h-5" />
                  </button>

                  {/* Accessibility Popover */}
                  {showSettings && (
                    <div className="absolute top-12 right-0 w-64 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl border border-black/10 z-50 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Text Size</label>
                          <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                            {['normal', 'large', 'xl'].map((s) => (
                              <button
                                key={s}
                                onClick={() => setFontSize(s)}
                                className={cn(
                                  "flex-1 py-1.5 rounded-md text-sm font-medium transition-all",
                                  fontSize === s ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"
                                )}
                              >
                                {s === 'normal' ? 'A' : s === 'large' ? 'A+' : 'A++'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Theme</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setTheme('light')}
                              className={cn("h-10 rounded-lg border-2 flex items-center justify-center bg-slate-50", theme === 'light' ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400 hover:bg-slate-100")}
                              title="Light Mode"
                            >
                              <Sun className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setTheme('dark')}
                              className={cn("h-10 rounded-lg border-2 flex items-center justify-center bg-slate-900", theme === 'dark' ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:bg-slate-800")}
                              title="Dark Mode (Subtle)"
                            >
                              <Moon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setTheme('sepia')}
                              className={cn("h-10 rounded-lg border-2 flex items-center justify-center bg-[#fdf6e3]", theme === 'sepia' ? "border-blue-500 text-blue-600" : "border-transparent text-[#8e7b64] hover:bg-[#f3eacb]")}
                              title="Warm / Sepia"
                            >
                              <BookOpen className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Next Button for Header */}
              <button
                disabled={index === data.questions.length - 1}
                onClick={() => setIndex(index + 1)}
                className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onSubmit}
                className={cn("hidden md:block px-6 py-2 rounded-lg font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20 ml-2")}
              >
                Submit
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* === LEFT SIDEBAR (Question Palette) === */}
        <aside
          className={cn(
            "w-72 flex-shrink-0 border-r border-black/5 bg-white/50 backdrop-blur-sm overflow-hidden flex flex-col transition-all duration-300 absolute inset-y-0 left-0 z-10 lg:static lg:translate-x-0 shadow-xl lg:shadow-none",
            !isSidebarOpen && "-translate-x-full lg:w-0 lg:opacity-0 lg:overflow-hidden",
            isZenMode && "-translate-x-full lg:w-0"
          )}
        >
          <div className="p-4 border-b border-black/5 flex items-center justify-between">
            <h3 className="font-bold opacity-80 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> Question Palette
            </h3>
            {/* Collapse Button - Repositioned */}
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-md hover:bg-black/5 text-slate-500 hover:text-slate-700 transition-colors" title="Collapse Sidebar">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-5 gap-2">
              {data.questions.map((q, i) => {
                const isActive = index === i;
                const isAnswered = answers[q.id] !== undefined;
                const isMarked = marked[q.id];
                const isVisited = visited[q.id];

                let stateClass = "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"; // Default (Not Visited)

                if (isActive) stateClass = "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30 scale-105 z-10 ring-2 ring-blue-200";
                else if (isMarked) stateClass = "bg-purple-100 text-purple-600 border-purple-300 hover:bg-purple-200";
                else if (isAnswered) stateClass = "bg-emerald-100 text-emerald-600 border-emerald-300 hover:bg-emerald-200";
                else if (isVisited) stateClass = "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100";

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setIndex(i);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={cn(
                      "aspect-square rounded-lg flex items-center justify-center font-bold text-sm border transition-all duration-200 relative group",
                      stateClass
                    )}
                  >
                    {i + 1}
                    {isMarked && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white ring-1 ring-purple-200" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-black/5 bg-black/5 text-xs text-slate-500 space-y-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Answered</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500" /> Not Answered</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300" /> Not Visited</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /> Marked for Review</div>
          </div>
        </aside>

        {/* === CENTER CANVAS === */}
        <main className="flex-1 flex flex-col relative min-w-0 bg-transparent">
          {/* Zen Toggle Floating (When header hidden) */}
          {isZenMode && (
            <div className="absolute top-4 right-4 z-50 flex gap-2">
              <div className={cn("px-3 py-1 bg-black/80 text-white rounded-full font-mono text-sm backdrop-blur-md shadow-xl", getTimerTextClass())}>
                {formatTime(time)}
              </div>
              <button
                onClick={() => setZenMode(false)}
                className="p-2 bg-white/20 backdrop-blur-md border border-white/30 text-slate-800 dark:text-white rounded-full hover:bg-white/40 transition-all shadow-xl"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Sidebar Toggle (Mobile/Desktop) */}
          {!isZenMode && !isSidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute top-4 left-4 z-10 p-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Question Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 lg:p-12 max-w-5xl mx-auto w-full">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Question Header */}
              <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-black/5 text-xs font-bold uppercase tracking-wider opacity-60 mb-2">
                    {currentQ.section || "General"}
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold leading-normal">
                    <span className="opacity-40 mr-2">Q{index + 1}.</span>
                    {currentQ.question}
                  </h2>
                </div>
                <button
                  onClick={toggleReview}
                  className={cn(
                    "flex-shrink-0 p-3 rounded-xl border transition-all",
                    marked[currentQ.id]
                      ? "bg-purple-100 border-purple-200 text-purple-700"
                      : "bg-transparent border-black/10 text-slate-400 hover:text-slate-600 hover:border-black/20"
                  )}
                  title="Mark for Review"
                >
                  <Flag className={cn("w-6 h-6", marked[currentQ.id] && "fill-current")} />
                </button>
              </div>

              {/* Options Grid */}
              <div className="grid gap-3">
                {shuffledOptions.map((opt, i) => {
                  const isSelected = answers[currentQ.id] === opt.originalIndex;
                  const isEliminated = eliminated[currentQ.id]?.[opt.originalIndex];

                  return (
                    <div
                      key={i}
                      onContextMenu={(e) => handleEliminate(e, opt.originalIndex)}
                      onClick={() => !isEliminated && setAnswers({ ...answers, [currentQ.id]: opt.originalIndex })}
                      className={cn(
                        "relative group cursor-pointer rounded-xl border-2 p-4 flex items-center gap-4 transition-all duration-200 select-none",
                        isSelected
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10"
                          : "border-black/5 bg-white/50 hover:bg-white hover:border-blue-200 hover:shadow-md",
                        isEliminated && "opacity-40 grayscale bg-slate-100 border-transparent hover:bg-slate-100 cursor-not-allowed"
                      )}
                    >
                      {/* Selection Indicator */}
                      <div className={cn(
                        "min-w-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300 group-hover:border-blue-400"
                      )}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>

                      {/* Text */}
                      <span className={cn(
                        "text-base md:text-lg font-medium opacity-90",
                        isEliminated && "line-through decoration-slate-400 decoration-2"
                      )}>
                        {opt.text}
                      </span>

                      {/* Elimination Indicator (Right side) */}
                      {isEliminated && (
                        <div className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded">
                          Eliminated
                        </div>
                      )}

                      {/* Hint Text for Interactions */}
                      <span className={cn(
                        "absolute right-4 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block",
                        isEliminated && "hidden"
                      )}>
                        {isSelected ? "Selected" : "Click to select • Right-click to eliminate"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Sticky Action Bar */}
          <div className="p-4 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-black/5 flex items-center justify-between z-10 transition-transform">
            <button
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>

            <button
              onClick={() => setShowReviewModal(true)}
              className="lg:hidden text-sm font-medium text-slate-500 underline"
            >
              Review Status
            </button>

            <button
              disabled={index === data.questions.length - 1}
              onClick={() => setIndex(index + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-white dark:text-slate-900 transition-all shadow-lg shadow-slate-900/20"
            >
              Next Question <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </main>
      </div>

      {/* ================= REVIEW DASHBOARD MODAL ================= */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col m-4 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold">Review Exam Status</h2>
                <p className="text-slate-500 text-sm">Overview of your attempt before submission.</p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-slate-200 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2 min-h-24">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-emerald-600 mb-1">{stats.answeredCount}</span>
                  <span className="text-sm font-medium text-emerald-800 opacity-70 uppercase tracking-wide">Answered</span>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-purple-600 mb-1">{stats.markedCount}</span>
                  <span className="text-sm font-medium text-purple-800 opacity-70 uppercase tracking-wide">Marked for Review</span>
                </div>
                <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-100 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-rose-600 mb-1">{stats.skipped}</span>
                  <span className="text-sm font-medium text-rose-800 opacity-70 uppercase tracking-wide">Skipped</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-slate-600 mb-1">{stats.visitedCount}</span>
                  <span className="text-sm font-medium text-slate-800 opacity-70 uppercase tracking-wide">Visited</span>
                </div>
              </div>

              <h3 className="font-bold text-lg mt-8 mb-4">Question Analysis</h3>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {data.questions.map((q, i) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setIndex(i);
                      setShowReviewModal(false);
                    }}
                    className={cn(
                      "aspect-square rounded-md flex items-center justify-center text-sm font-semibold border transition-all hover:scale-110",
                      index === i ? "ring-2 ring-offset-2 ring-black" : "",
                      answers[q.id] !== undefined ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        marked[q.id] ? "bg-purple-100 text-purple-700 border-purple-200" :
                          visited[q.id] ? "bg-rose-50 text-rose-700 border-rose-200" :
                            "bg-slate-50 text-slate-400 border-slate-100"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-black/5 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-5 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Solving
              </button>
              <button
                onClick={() => {
                  window.confirm("Are you surely you want to submit? This cannot be undone.") && onSubmit();
                }}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20"
              >
                Submit Final Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
