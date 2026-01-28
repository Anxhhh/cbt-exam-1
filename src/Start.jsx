import { ArrowRight, BookOpen, Clock, ShieldCheck, Zap, User, FileText, CheckCircle2, ChevronRight, Layers, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from "react";
import { UserButton } from "@clerk/clerk-react"; // Import Clerk UserButton
import { cn } from './utils';
import { sounds } from './utils/sound'; // Import sounds
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import BuyMeCoffeeBtn from './BuyMeCoffeeBtn';
import ThreeBackground from './ThreeBackground';
import GlassButton from './GlassButton';
import { TiltCard } from './TiltCard';

export default function Start({ onStart, isRetake, user }) {
  const [name, setName] = useState(user?.fullName || "");
  const [testSet, setTestSet] = useState("1"); // Default to Test 1
  const [examType, setExamType] = useState("Himachal GK"); // Default to Himachal GK

  const [resumeData, setResumeData] = useState(null);

  // Long Press Logic for Deleting Session
  const [isLongPressing, setIsLongPressing] = useState(false);
  const pressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const handlePressStart = () => {
    if (!resumeData) return;
    longPressTriggered.current = false;
    setIsLongPressing(true);
    pressTimer.current = setTimeout(() => {
      // Delete Action
      localStorage.removeItem("cbt_exam_state");
      setResumeData(null);
      longPressTriggered.current = true;
      setIsLongPressing(false);
      if (navigator.vibrate) navigator.vibrate(200);
      try { sounds.click(); } catch (e) { } // Feedback sound
    }, 3000); // 3 seconds
  };

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setIsLongPressing(false);
  };

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cbt_exam_state"));
      if (saved && saved.timeRemaining > 0 && !saved.submitted) {
        setResumeData(saved);
      }
    } catch (e) { console.error(e); }
  }, []);

  // Reset testSet when examType changes to avoid invalid states
  useEffect(() => {
    setTestSet("1");
  }, [examType]);

  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName);
    }
  }, [user]);

  // Retake Auto-Scroll
  const portalRef = useRef(null);
  useEffect(() => {
    if (isRetake && portalRef.current) {
      // slight delay to allow animations to start
      setTimeout(() => {
        portalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [isRetake]);

  const handleStart = () => {
    // Unlock Audio Context for iOS
    try { sounds.click(); } catch (e) { }

    if (name.trim()) {
      let finalId;
      if (examType === "HPAS Prelims PYQ's") {
        finalId = testSet === "2" ? "PYQ2" : "PYQ";
      } else {
        finalId = parseInt(testSet);
        if (examType === "JOA IT") {
          finalId += 4;
        }
      }
      onStart(name, finalId.toString());
    }
  };

  const handleResume = () => {
    // Unlock Audio Context for iOS
    try { sounds.click(); } catch (e) { }

    if (resumeData) {
      setName(resumeData.candidateName);

      // Calculate ID based on current selection logic
      let finalId;
      if (examType === "HPAS Prelims PYQ's") {
        // For resume, we might ideally want to know what the original ID was from resumeData if available,
        // but since resumeData structure might not have it explicitly saved separately from what we can infer,
        // we'll rely on the user's selection or default. 
        // Ideally, we should really save 'examId' in local storage to be perfect.
        finalId = testSet === "2" ? "PYQ2" : "PYQ";
      } else {
        finalId = parseInt(testSet);
        if (examType === "JOA IT") {
          finalId += 4;
        }
      }

      onStart(resumeData.candidateName, finalId.toString());
    }
  };

  const handleClearSession = (e) => {
    e.stopPropagation();
    localStorage.removeItem("cbt_exam_state");
    setResumeData(null);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Enter to Start
      if (e.key === 'Enter') {
        if (name.trim()) handleStart();
      }

      // F for Fullscreen (ignore if typing)
      if (e.key.toLowerCase() === 'f' && document.activeElement.tagName !== 'INPUT') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(e => console.error(e));
        } else {
          document.exitFullscreen().catch(e => console.error(e));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [name, testSet, examType]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Determine available sets based on exam type
  const availableSets = examType === "HPAS Prelims PYQ's" ? ["1", "2"] : ["1", "2", "3", "4"];

  return (
    <div className="h-screen overflow-y-auto no-scrollbar text-slate-300 font-sans selection:bg-blue-500/30 flex justify-center p-4 pr-[calc(1rem+env(safe-area-inset-right))] pl-[calc(1rem+env(safe-area-inset-left))] pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(1rem+env(safe-area-inset-bottom))] relative">

      {/* 3D Background */}
      {/* 3D Background lifted to App.jsx */}

      <div
        className="w-full max-w-6xl relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-16 items-start mt-10 lg:mt-0 my-auto"
      >

        {/* Left Column: Branding & Value Props */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }} // Re-trigger animation on scroll
          className="space-y-10 pt-4"
        >

          <div className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0, scale: 0.8 }}
              whileInView={{ x: 0, opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              Live Assessment System
            </motion.div>
            <motion.h1

              initial={{ y: 50, opacity: 0, rotateX: -20, filter: "blur(10px)" }}
              whileInView={{ y: 0, opacity: 1, rotateX: 0, filter: "blur(0px)" }}
              viewport={{ once: false, margin: "-10%" }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]"
            >
              StatePrep-AI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Automated Computer Based Test</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-400 max-w-lg leading-relaxed text-justify"
            >
              Experience a high-fidelity examination environment designed for Himachal Pradesh State level exams. Challenge yourself with HPPSC/HPRCA standard questions and instant detailed feedback.
            </motion.p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <FeatureBox icon={<Clock className="w-5 h-5 text-blue-400" />} title="Timed Session" desc="30 Minutes strict limit" />
            <FeatureBox icon={<BookOpen className="w-5 h-5 text-purple-400" />} title="Comprehensive" desc="120 Questions coverage" />
            <FeatureBox icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} title="Fair Testing" desc="No Negative Marking" />
            <FeatureBox icon={<Zap className="w-5 h-5 text-amber-400" />} title="Instant Analytics" desc="Detailed Review" />
          </motion.div>

          {/* Quick instructions inline for cleaner look */}
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            whileInView={{ y: 0, opacity: 1, scale: 1 }}
            viewport={{ once: false, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="pt-4 border-t border-white/5"
          >
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Exam Guidelines</h4>
            <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> No page refresh permitted</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Auto-submission on timer end</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Use 'Save' to confirm answers</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Stable internet required</li>
            </ul>
          </motion.div>

        </motion.div>

        {/* Right Column: Candidate Action Card */}
        <motion.div
          initial={{ opacity: 0, x: 100, rotateY: -10, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0, filter: "blur(0px)" }}
          viewport={{ once: false, margin: "-10%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col gap-4 items-end sticky top-8"
          ref={portalRef}
        >
          <TiltCard className="w-full relative group">
            {/* Glow backing */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

            <div className="relative bg-black/30 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/5 flex flex-col gap-5 overflow-hidden">
              {/* Internal Ambient Glow (Match Result Card) */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white max-w-[200px] truncate">{name.trim() || "Candidate Portal"}</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure your session</p>
                </div>
                <div className="relative z-50">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10 border border-white/10 hover:border-blue-500/50 transition-colors"
                      }
                    }}
                  />
                </div>
              </div>

              {/* Step 1: Exam Type Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-3 h-3" /> Select Exam
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Himachal GK", "JOA IT", "HPAS Prelims PYQ's"].map((type) => (
                    <motion.button
                      key={type}
                      onClick={() => setExamType(type)}
                      whileHover={{
                        scale: 1.05,
                        y: -2,
                        transition: { type: "spring", stiffness: 400, damping: 15 }
                      }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative h-12 rounded-2xl font-bold text-xs transition-all overflow-hidden border backdrop-blur-md z-0 hover:z-10 whitespace-nowrap",
                        examType === type
                          ? "bg-blue-500/20 text-blue-100 border-blue-400/30 shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
                          : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_15px_-5px_rgba(255,255,255,0.1)]"
                      )}
                    >
                      <span className="relative z-10">{type}</span>
                      {type === "HPAS Prelims PYQ's" && (
                        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-center opacity-0 hover:opacity-100 transition-opacity duration-300 z-20 px-2">
                          <span className="text-[9px] text-blue-200 font-medium leading-tight">
                            it covers all pyq's from 2016-2025
                          </span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Step 2: Set Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Select Module
                </label>
                <div className={cn("grid gap-2", availableSets.length === 2 ? "grid-cols-2" : "grid-cols-4")}>
                  {availableSets.map((id) => (
                    <motion.button
                      key={id}
                      onClick={() => setTestSet(id)}
                      whileHover={{
                        scale: 1.15,
                        y: -5,
                        transition: { type: "spring", stiffness: 300, damping: 12 }
                      }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "relative h-16 rounded-2xl font-bold text-sm transition-all duration-300 overflow-hidden group/btn border backdrop-blur-md z-0 hover:z-20",
                        testSet === id
                          ? "bg-transparent text-white border-blue-400/40 shadow-[0_8px_32px_-8px_rgba(59,130,246,0.6)]" // Glowing active state
                          : "bg-gradient-to-b from-white/10 to-transparent text-slate-400 hover:text-white border-white/10 hover:border-white/30 hover:shadow-[0_8px_20px_-8px_rgba(255,255,255,0.2)]"
                      )}
                    >
                      <span className="relative z-10 flex flex-col items-center justify-center">
                        <span>SET</span>
                        <span className="text-lg leading-none">{id}</span>
                      </span>
                      {testSet === id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-500 opacity-100"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Step 3: Name Input */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3 h-3" /> Identification
                </label>
                <div className="relative">
                  <motion.div
                    animate={!name.trim() ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-sm -z-10"
                  />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-5 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none text-sm font-medium backdrop-blur-md"
                  />
                </div>
              </div>

              {/* Step 4: Action */}
              <div className="pt-4 space-y-3">
                {resumeData && (
                  <GlassButton
                    color="emerald"
                    onClick={() => {
                      if (longPressTriggered.current) {
                        longPressTriggered.current = false;
                        return;
                      }
                      handleResume();
                    }}
                    onMouseDown={handlePressStart}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={handlePressStart}
                    onTouchEnd={handlePressEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-auto px-6 py-4 select-none relative overflow-hidden"
                  >
                    {/* Long Press Progress Bar */}
                    {isLongPressing && (
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "linear" }}
                        className="absolute bottom-0 left-0 h-1.5 bg-red-500/80 z-50"
                      />
                    )}

                    <div className="flex flex-col items-center justify-center w-full relative z-10 transition-all duration-200">
                      {isLongPressing ? (
                        <div className="flex flex-col items-center animate-pulse text-red-100">
                          <span className="font-bold flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Deleting Session...
                          </span>
                          <span className="text-[10px] opacity-80">Keep holding to confirm</span>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-white flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Resume Previous Session
                          </span>
                          <span className="text-[10px] text-emerald-200 opacity-80">
                            {resumeData.candidateName} • {Math.floor(resumeData.timeRemaining / 60)}m left
                          </span>
                        </>
                      )}
                    </div>

                    {/* Delete Session Button (Visible on Hover - Desktop Backup) */}
                    {!isLongPressing && (
                      <div
                        onClick={handleClearSession}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20 cursor-pointer hidden md:block"
                        title="Delete saved session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </div>
                    )}
                  </GlassButton>
                )}

                <GlassButton
                  color="blue"
                  onClick={handleStart}
                  disabled={!name.trim()}
                  className="w-full h-auto px-6 py-4 relative overflow-hidden"
                >
                  {/* Validation Shockwave */}
                  {name.trim() && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"
                    />
                  )}

                  <div className="relative z-10 flex items-center justify-center w-full">
                    <span className="font-bold text-white flex items-center gap-2 group-disabled:text-slate-400">
                      {resumeData ? "Start New Exam" : "Initialize Exam"} <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </GlassButton>
                <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-widest">
                  Secure Browser Environment • Ver 2.5.0
                </p>
              </div>

            </div>
          </TiltCard>

          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <p className="text-slate-500 text-xs italic opacity-70 hover:opacity-100 transition-opacity text-center sm:text-left order-2 sm:order-1 w-full sm:w-auto">
              Developed by Ansh Powered by Gemini 3 pro and Three.js
            </p>

            <a
              href="https://x.com/anshmatlotia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-300 group backdrop-blur-md shadow-sm hover:shadow-lg order-1 sm:order-2"
            >
              <span className="text-[10px] font-bold tracking-wide uppercase">Follow</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-3 h-3 fill-current opacity-70 group-hover:opacity-100 transition-opacity">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>
          </div>
        </motion.div >

      </div >
      <BuyMeCoffeeBtn screen="start" />
    </div >
  );
}

function FeatureBox({ icon, title, desc }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
        visible: { opacity: 1, y: 0, filter: 'blur(0px)' }
      }}
      className="relative p-5 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 overflow-hidden group hover:border-white/20 transition-all hover:bg-white/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 flex flex-col gap-3">
        <div className="p-2 w-fit rounded-lg bg-white/5 text-blue-400 group-hover:text-white group-hover:bg-blue-500/20 transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-white text-sm tracking-tight">{title}</h4>
          <p className="text-xs text-slate-500 font-medium">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}


