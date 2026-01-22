import { useEffect, useMemo, useState } from "react";
import profileImg from "./assets/profile.png";
import {
  ChevronLeft, ChevronRight, Menu, X, Flag,
  Clock, LayoutGrid, ArrowRight, Home, Eye, EyeOff,
  Save, Trash2
} from 'lucide-react';
import { cn, smartShuffle } from "./utils";
import { toast } from 'sonner';
import { sounds } from './utils/sound';
import { AnimatePresence, motion } from "framer-motion";

export default function Exam({
  data,
  answers,
  marked,
  setAnswers,
  setMarked,
  onSubmit,
  candidateName,
  onBackToStart,
  onClearSession
}) {
  // ================= STATE =================
  // Restore from localStorage if available, else default
  const savedState = JSON.parse(localStorage.getItem("cbt_exam_state") || "{}");

  const [index, setIndex] = useState(savedState.index || 0);
  const [time, setTime] = useState(savedState.timeRemaining || data.duration * 60);
  const [visited, setVisited] = useState(savedState.visited || {});

  // UI States
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Accessibility
  const [theme] = useState('dark'); // dark mode enforced
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInstantFeedback, setIsInstantFeedback] = useState(true);

  // ================= EFFECTS =================

  const currentQ = data.questions[index];

  const shuffledOptions = useMemo(() => {
    if (!currentQ || !currentQ.options) return [];
    const opts = currentQ.options.map((text, originalIndex) => ({ text, originalIndex }));
    return smartShuffle(opts);
  }, [currentQ?.id]);

  const handleAnswer = (originalIndex) => {
    // Lock only if instant feedback is enabled and already answered
    if (isInstantFeedback && answers[currentQ.id] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: originalIndex }));
    sounds.click();
  };

  const toggleReview = () => {
    if (currentQ) {
      const isMarking = !marked[currentQ.id];
      setMarked(prev => ({ ...prev, [currentQ.id]: isMarking }));
      if (isMarking) {
        toast.success("Marked for Review", { icon: '🚩' });
        sounds.mark();
      } else {
        sounds.click();
      }
    }
  };

  // 1. Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Keys
      if (e.key === 'ArrowRight') {
        if (index < data.questions.length - 1) {
          setIndex(prev => prev + 1);
          sounds.hover();
        }
      } else if (e.key === 'ArrowLeft') {
        if (index > 0) {
          setIndex(prev => prev - 1);
          sounds.hover();
        }
      }

      // Option Selection (A, B, C, D)
      const options = ['a', 'b', 'c', 'd', '1', '2', '3', '4'];
      const optIndex = options.indexOf(e.key.toLowerCase()) % 4; // Map 1->A, etc.
      if (optIndex !== -1 && currentQ) {
        // Find the original index of this shuffled option? 
        // currentQ.options is the shuffled one? NO. 
        // `shuffledOptions` is the view. We need to select based on VISUAL position.
        if (shuffledOptions[optIndex]) {
          const originalIdx = shuffledOptions[optIndex].originalIndex;
          handleAnswer(originalIdx);
        }
      }

      // Mark for Review (M)
      if (e.key.toLowerCase() === 'm') {
        toggleReview();
      }

      // Enter to Save & Next (if answered)
      if (e.key === 'Enter') {
        if (index < data.questions.length - 1) {
          setIndex(prev => prev + 1);
          sounds.click();
        } else {
          // Submit? Maybe too dangerous for Enter key. Let's just create a toast.
          toast.info("This is the last question.");
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, data.questions.length, shuffledOptions]);

  // 2. Prevent Accidental Refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome requires this
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // 3. Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const candidate = {
    name: candidateName || "Demo Candidate",
    rollNo: "HPGK-2026-001",
    photo: profileImg
  };



  // ================= EFFECTS =================

  // Timer
  // Persistence & Timer
  useEffect(() => {
    // Pause timer if exit modal is open
    if (showExitModal) return;

    if (time <= 0) {
      handleSubmit();
      return;
    }

    // Critical: Save state every second (throttling handled by interval naturally)
    // We save EVERYTHING needed to restore
    const saveState = {
      candidateName,
      answers, // This comes from props, make sure it's up to date
      marked,
      visited,
      index,
      timeRemaining: time,
      examId: data.questions[0]?.id // simple fingerprint
    };
    localStorage.setItem("cbt_exam_state", JSON.stringify(saveState));

    const t = setInterval(() => setTime(prev => prev - 1), 1000);

    // Low time warning
    if (time === 300) { // 5 mins
      toast.warning("5 Minutes Remaining!", { duration: 5000 });
      sounds.tick();
    }
    if (time <= 10 && time > 0) {
      sounds.tick();
    }

    return () => clearInterval(t);
  }, [time, index, visited, answers, marked, showExitModal]);

  const handleSubmit = () => {
    const timeTaken = (data.duration * 60) - time;
    onSubmit(timeTaken);
  };

  // Mark Visited
  useEffect(() => {
    setVisited(prev => ({ ...prev, [currentQ.id]: true }));
  }, [currentQ.id]);

  // Responsive: collapse sidebar on mobile initially
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ================= HELPERS =================

  // ================= HELPERS =================





  const stats = useMemo(() => {
    if (!data || !data.questions) return { total: 0, answeredCount: 0, markedCount: 0, visitedCount: 0, skipped: 0 };
    const total = data.questions.length;
    const answeredCount = Object.keys(answers).length;
    const markedCount = Object.keys(marked).filter(k => marked[k]).length;
    const visitedCount = Object.keys(visited).length;
    return { total, answeredCount, markedCount, visitedCount, skipped: total - answeredCount };
  }, [data, answers, marked, visited]);

  // If data is invalid or loading, show Skeleton
  if (!currentQ) {
    return (
      <div className={containerClasses}>
        <div className="h-1.5 w-full bg-slate-800 animate-pulse" />
        <div className="flex-1 flex overflow-hidden relative">
          <aside className="w-80 border-r border-white/5 bg-[#1a1c23] hidden lg:block p-4 space-y-4">
            <div className="h-8 w-32 bg-white/5 rounded animate-pulse" />
            <div className="grid grid-cols-5 gap-2">
              {[...Array(20)].map((_, i) => <div key={i} className="aspect-square rounded bg-white/5 animate-pulse" />)}
            </div>
          </aside>
          <main className="flex-1 p-10 space-y-8">
            <div className="h-8 w-64 bg-white/5 rounded animate-pulse" />
            <div className="h-32 w-full bg-white/5 rounded-xl animate-pulse" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 w-full bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          </main>
        </div>
      </div>
    );
  }

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
    return "bg-rose-500 animate-pulse";
  };

  const getTimerTextClass = () => {
    const percent = time / (data.duration * 60);
    if (percent > 0.2) return "text-slate-800 dark:text-slate-200";
    return "text-rose-600 dark:text-rose-400 font-bold";
  };

  // Theme Classes
  const themeClasses = {
    light: "bg-slate-50 text-slate-900",
    dark: "bg-[#1a1c23] text-slate-300 dark", // Softer dark background
    sepia: "bg-[#f4ecd8] text-[#433422]"
  };

  const containerClasses = cn(
    "fixed inset-0 flex flex-col transition-colors duration-300 font-sans isolate", // fixed inset-0 to prevent body scrolling
    themeClasses[theme],
    "text-base"
  );

  return (
    <div className={containerClasses}>
      {/* ================= SUPER HEADER (Progress + Zen) ================= */}
      {/* Pulse Timer Bar */}
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800/50 relative overflow-hidden">
        <div
          className={cn("h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(0,0,0,0.1)]", getTimerColor())}
          style={{ width: `${(time / (data.duration * 60)) * 100}%` }}
        />
      </div>

      <header className="flex-shrink-0 px-4 md:px-6 py-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between backdrop-blur-md bg-opacity-95 z-30 shadow-sm transition-colors duration-300 bg-white/80 dark:bg-[#1a1c23]/90 sepia:bg-[#f4ecd8]/90">

        {/* Left: Branding & User */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-400"
            title="Toggle Question Palette"
            aria-label="Toggle Question Palette"
          >
            {isSidebarOpen ? <LayoutGrid className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Home Button */}
          <button
            onClick={() => setShowExitModal(true)}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-400"
            title="Exit Exam"
            aria-label="Exit Exam"
          >
            <Home className="w-6 h-6" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-400 hidden sm:block"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <X className="w-5 h-5" /> : <div className="w-5 h-5 border-2 border-current rounded-sm border-dashed" />}
          </button>

          {/* Instant Feedback Toggle */}
          <button
            onClick={() => {
              setIsInstantFeedback(!isInstantFeedback);
              toast.success(!isInstantFeedback ? "Instant Feedback Enabled" : "Instant Feedback Disabled");
            }}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isInstantFeedback
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10"
            )}
            title={isInstantFeedback ? "Disable Instant Feedback" : "Enable Instant Feedback"}
            aria-label="Toggle Instant Feedback"
          >
            {isInstantFeedback ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-3">
            <img src={candidate.photo} alt="User" className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover shadow-sm" />
            <div className="leading-tight">
              <h2 className="font-bold text-xs uppercase tracking-wider opacity-60">Candidate</h2>
              <p className="font-semibold text-sm truncate max-w-[120px] md:max-w-none">{candidate.name}</p>
            </div>
          </div>
        </div>

        {/* Center: Title (Desktop) */}
        <h1 className="hidden lg:block font-bold text-lg opacity-80 tracking-tight absolute left-1/2 -translate-x-1/2">
          State Prep <span className="font-normal opacity-60">- AI Powered Quiz Engine</span>
        </h1>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 font-mono text-xl font-bold tabular-nums shadow-sm",
            getTimerTextClass()
          )}>
            <Clock className="w-5 h-5 opacity-80" />
            {formatTime(time)}
          </div>

          <button
            onClick={handleSubmit}
            className={cn("hidden lg:block px-6 py-2 rounded-lg font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20")}
          >
            Submit
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* === LEFT SIDEBAR (Question Palette) === */}
        <aside
          className={cn(
            "flex-shrink-0 border-r border-black/10 dark:border-white/5 bg-white dark:bg-[#1a1c23] sepia:bg-[#f4ecd8] overflow-hidden flex flex-col transition-all duration-300 absolute inset-y-0 left-0 z-20 lg:static shadow-2xl lg:shadow-none",
            isSidebarOpen ? "w-80 translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 lg:w-0 lg:opacity-0"
          )}
        >
          <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/5">
            <h3 className="font-bold opacity-90 flex items-center gap-2 text-sm uppercase tracking-wide">
              <LayoutGrid className="w-4 h-4" /> Question Palette
            </h3>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-black/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Questions ({data.questions.length})</h4>
            <div className="grid grid-cols-5 gap-2.5">
              {data.questions.map((q, i) => {
                const isActive = index === i;
                const isAnswered = answers[q.id] !== undefined;
                const isMarked = marked[q.id];
                const isVisited = visited[q.id];

                let stateClass = "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"; // Default (Not Visited - darker for visibility)

                if (isActive) stateClass = "bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-110 z-10 font-bold ring-2 ring-blue-600 ring-offset-2 ring-offset-white dark:ring-offset-[#1a1c23]";
                else if (isMarked) stateClass = "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/30";
                else if (isAnswered) stateClass = "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/30";
                else if (isVisited) stateClass = "bg-white border-2 border-slate-300 text-slate-700 dark:bg-transparent dark:border-slate-600 dark:text-slate-300";

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setIndex(i);
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={cn(
                      "aspect-square rounded-md flex items-center justify-center text-sm border transition-all duration-200 relative group font-bold shadow-sm",
                      stateClass
                    )}
                  >
                    {i + 1}
                    {isMarked && <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-white rounded-full ring-1 ring-purple-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-[11px] font-medium text-slate-500 dark:text-slate-400 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Answered</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white" /> Current</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Review</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-600" /> Not Visited</div>
            </div>
          </div>
        </aside>

        {/* === CENTER CANVAS === */}
        <main className="flex-1 flex flex-col relative min-w-0 bg-transparent transition-all duration-300">

          {/* === TOP ACTION BAR (Sticky) === */}
          <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-black/5 flex items-center justify-between shadow-sm z-20 dark:bg-[#1a1c23] dark:border-white/5 sepia:bg-[#f4ecd8]">
            <h2 className="text-sm font-bold opacity-50 uppercase tracking-widest hidden md:block">Question {index + 1} of {data.questions.length}</h2>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <button
                disabled={index === 0}
                onClick={() => setIndex(index - 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                disabled={index === data.questions.length - 1}
                onClick={() => setIndex(index + 1)}
                className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:scale-100"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-16 w-full mx-auto max-w-5xl">
            <div key={currentQ.id} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

              {/* Question Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-xs font-bold uppercase tracking-wider opacity-60">
                    {currentQ.section || "General"}
                  </span>
                  <button
                    onClick={toggleReview}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                      marked[currentQ.id]
                        ? "bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/40 dark:border-purple-800 dark:text-purple-300"
                        : "bg-transparent border-black/10 dark:border-white/10 text-slate-400 hover:text-slate-600 hover:border-black/20"
                    )}
                  >
                    <Flag className={cn("w-4 h-4", marked[currentQ.id] && "fill-current")} />
                    {marked[currentQ.id] ? "Marked for Review" : "Mark for Review"}
                  </button>
                </div>

                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-relaxed break-words">
                  <span className="inline-block text-slate-300 dark:text-slate-600 min-w-[2ch] mr-2 user-select-none">
                    {index + 1}.
                  </span>
                  {currentQ.question}
                </h2>
              </div>

              {/* Options Grid */}
              <div className="grid gap-3 pt-2">
                {shuffledOptions.map((opt, i) => {
                  const currentAnswer = answers[currentQ.id];
                  const hasAnswered = currentAnswer !== undefined;
                  const isSelected = currentAnswer === opt.originalIndex;
                  const isCorrect = opt.originalIndex === currentQ.answer;

                  // Feedback Logic: Only active if isInstantFeedback is TRUE
                  const showFeedback = isInstantFeedback;

                  const isRight = showFeedback && isSelected && isCorrect;
                  const isWrong = showFeedback && isSelected && !isCorrect;
                  const isMissed = showFeedback && !isSelected && isCorrect && hasAnswered;

                  // Standard selection styling (Exam Mode)
                  const isJustSelected = !showFeedback && isSelected;

                  return (
                    <div
                      key={i}
                      onClick={() => handleAnswer(opt.originalIndex)}
                      className={cn(
                        "relative group rounded-xl border-2 p-5 flex items-start gap-4 transition-all duration-200 select-none",
                        (showFeedback && hasAnswered) ? "cursor-default" : "cursor-pointer",
                        "bg-white dark:bg-white/5 border-slate-200 dark:border-[#2a2d36]", // Base

                        // Hover Logic
                        (!hasAnswered || !showFeedback) && "hover:border-blue-300 dark:hover:border-blue-700",

                        // Feedback Mode Styling
                        isRight && "ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20 z-10",
                        isMissed && "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 z-10",
                        isWrong && "ring-2 ring-red-500 border-red-500 bg-red-50 dark:bg-red-900/20 z-10",

                        // Standard Mode Styling (No feedback, just selected)
                        isJustSelected && "ring-2 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20 z-10",

                        showFeedback && hasAnswered && !isSelected && !isMissed && "opacity-50 grayscale" // Dim irrelevant options in feedback mode
                      )}
                    >
                      {/* Selection Indicator */}
                      <div className={cn(
                        "mt-0.5 min-w-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                        (isRight || isJustSelected) ? "border-blue-500 bg-blue-500 text-white" :
                          isMissed ? "border-emerald-500 bg-emerald-500 text-white" :
                            isWrong ? "border-red-500 bg-red-500 text-white" :
                              "border-slate-300 dark:border-slate-600 group-hover:border-blue-400"
                      )}>
                        {(isSelected || isMissed) && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                      </div>

                      <div className="flex-1">
                        <span className="text-lg font-medium opacity-90 block leading-snug">
                          {opt.text}
                        </span>

                        {/* Helper text appearing on hover */}
                        <span className={cn(
                          "block text-xs mt-1 transition-opacity",
                          (isSelected || isMissed) ? "opacity-100 font-semibold" : "opacity-0 group-hover:opacity-100 text-slate-400",
                          isRight ? "text-blue-600 dark:text-blue-400" :
                            isMissed ? "text-emerald-600 dark:text-emerald-400" :
                              isWrong ? "text-red-600 dark:text-red-400" :
                                isJustSelected ? "text-blue-600 dark:text-blue-400" : ""
                        )}>
                          {(isRight || isMissed) ? "Correct Answer" :
                            isWrong ? "Incorrect Answer" :
                              isJustSelected ? "Selected" : "Click to select"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Only Bottom Bar (redundant but kept for small screens as per conventional UX) */}
          <div className="md:hidden p-4 border-t border-black/5 bg-white dark:bg-[#1a1c23] flex justify-between items-center text-xs text-slate-500">
            <span>Swipe or use top buttons to navigate</span>
            <button onClick={() => setShowReviewModal(true)} className="underline font-bold text-blue-600">Review All</button>
          </div>
          {/* Attribution Footer */}
          <div className="absolute bottom-4 right-6 hidden md:block z-10 opacity-60 hover:opacity-100 transition-opacity">
            <a
              href="https://www.youtube.com/@stateprep"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-light italic text-slate-500 hover:text-blue-500 dark:text-slate-600 dark:hover:text-blue-400 transition-colors"
            >
              Subscribe to StatePrep
            </a>
          </div>
        </main>
      </div>

      {/* ================= REVIEW DASHBOARD MODAL ================= */}
      {
        showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white dark:bg-[#252830] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                <div>
                  <h2 className="text-xl font-bold">Review Exam Status</h2>
                </div>
                <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-black/5 rounded-full dark:hover:bg-white/10">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{stats.answeredCount}</span>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 opacity-70 uppercase tracking-wide">Answered</span>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{stats.markedCount}</span>
                    <span className="text-xs font-bold text-purple-800 dark:text-purple-300 opacity-70 uppercase tracking-wide">Marked</span>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-100 dark:border-rose-800 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">{stats.skipped}</span>
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300 opacity-70 uppercase tracking-wide">Skipped</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-bold text-slate-600 dark:text-slate-400 mb-1">{stats.visitedCount}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-300 opacity-70 uppercase tracking-wide">Visited</span>
                  </div>
                </div>

                <h3 className="font-bold text-lg mt-8 mb-4 border-b border-black/5 pb-2">Question Matrix</h3>
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
                        index === i ? "ring-2 ring-offset-2 ring-black dark:ring-white dark:ring-offset-[#252830]" : "",
                        answers[q.id] !== undefined ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" :
                          marked[q.id] ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800" :
                            visited[q.id] ? "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700" :
                              "bg-white dark:bg-transparent text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Keep Solving
                </button>
                <button
                  onClick={() => {
                    window.confirm("Are you surely you want to submit? This cannot be undone.") && handleSubmit();
                  }}
                  className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                >
                  Submit Final Exam
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* ================= EXIT CONFIRMATION MODAL ================= */}
      {
        showExitModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
            onClick={() => setShowExitModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1e2028] w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/10 animate-in zoom-in-95 duration-200 space-y-6 relative overflow-hidden"
            >
              {/* Decorative background element */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50" />

              <div className="text-center space-y-2 pt-2">
                <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 ring-4 ring-blue-50 dark:ring-blue-500/5">
                  <Home className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Terminate Session?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                  You can save your progress and resume later, or discard this session entirely.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    const saveState = {
                      candidateName,
                      answers,
                      marked,
                      visited,
                      index,
                      timeRemaining: time,
                      examId: data.questions[0]?.id
                    };
                    localStorage.setItem("cbt_exam_state", JSON.stringify(saveState));
                    toast.success("Session Saved Successfully");
                    onBackToStart();
                  }}
                  className="w-full group flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold transition-all shadow-lg shadow-blue-500/25"
                >
                  <Save className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                  Save & Exit
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("This will permanently delete your progress. Continue?")) {
                      onClearSession();
                      toast.success("Session Discarded");
                      onBackToStart();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 dark:bg-white/5 dark:hover:bg-red-900/20 dark:text-slate-300 dark:hover:text-red-400 font-bold transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Session
                </button>

                <button
                  onClick={() => setShowExitModal(false)}
                  className="w-full px-4 py-3 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                  Return to Exam
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
