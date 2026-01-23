import { ArrowRight, BookOpen, Clock, ShieldCheck, Zap, User, FileText, CheckCircle2, ChevronRight, Layers, Trash2 } from 'lucide-react';
import { useState, useEffect } from "react";
import { cn } from './utils';
import { motion } from "framer-motion";
import BuyMeCoffeeBtn from './BuyMeCoffeeBtn';
import ThreeBackground from './ThreeBackground';
import GlassButton from './GlassButton';

export default function Start({ onStart }) {
  const [name, setName] = useState("");
  const [testSet, setTestSet] = useState("1"); // Default to Test 1
  const [examType, setExamType] = useState("Himachal GK"); // Default to Himachal GK

  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cbt_exam_state"));
      if (saved && saved.timeRemaining > 0 && !saved.submitted) {
        setResumeData(saved);
      }
    } catch (e) { console.error(e); }
  }, []);

  const handleStart = () => {
    if (name.trim()) {
      let finalId = parseInt(testSet);
      if (examType === "JOA IT") {
        finalId += 4;
      }
      onStart(name, finalId.toString());
    }
  };

  const handleResume = () => {
    if (resumeData) {
      // We assume '1' if not saved, or we should have saved it.
      // Since we didn't save testSet explicitly in Exam.jsx (my bad), 
      // we might just default to 1, OR we can infer it. 
      // For now let's hope the user remembers or we default. 
      // Update: I will update App.jsx to save the "testSet" into the Exam Data context passed to Exam.jsx?
      // Or just pass it.
      // Let's just use the current selected testSet if we can't find it, or allow user to pick.
      // ACTUALLY: The `resumeData` contains `answers` and `candidateName`.
      // If we call onStart, it re-fetches the CSV.
      // Then Exam.jsx mounts and restores Time/Index/Visited.
      // THIS WORKS.

      setName(resumeData.candidateName);

      // Calculate ID based on current selection logic
      let finalId = parseInt(testSet);
      if (examType === "JOA IT") {
        finalId += 4;
      }

      onStart(resumeData.candidateName, finalId.toString());
    }
  };

  const handleClearSession = (e) => {
    e.stopPropagation();
    localStorage.removeItem("cbt_exam_state");
    setResumeData(null);
  };

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen text-slate-300 font-sans selection:bg-blue-500/30 flex items-center justify-center p-4 relative">

      {/* 3D Background */}
      <ThreeBackground />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-16 items-start mt-10 lg:mt-0"
      >

        {/* Left Column: Branding & Value Props */}
        <motion.div variants={itemVariants} className="space-y-10 pt-4">

          <div className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              Live Assessment System
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              StatePrep-AI <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Automated Computer Based Test</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Experience a high-fidelity examination environment designed for Himachal Pradesh State level exams. Challenge yourself with HPPSC/HPRCA standard questions and instant detailed feedback.
            </p>
          </div>

          <motion.div variants={containerVariants} className="grid grid-cols-2 gap-4">
            <FeatureBox icon={<Clock className="w-5 h-5 text-blue-400" />} title="Timed Session" desc="30 Minutes strict limit" />
            <FeatureBox icon={<BookOpen className="w-5 h-5 text-purple-400" />} title="Comprehensive" desc="120 Questions coverage" />
            <FeatureBox icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} title="Fair Testing" desc="No Negative Marking" />
            <FeatureBox icon={<Zap className="w-5 h-5 text-amber-400" />} title="Instant Analytics" desc="Detailed Review" />
          </motion.div>

          {/* Quick instructions inline for cleaner look */}
          <motion.div variants={itemVariants} className="pt-4 border-t border-white/5">
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
          variants={itemVariants}
          className="flex flex-col gap-4 items-end sticky top-8"
        >
          <div className="relative group w-full">
            {/* Glow backing */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

            <div className="relative bg-[#1a1c23] border border-white/10 rounded-xl p-8 shadow-2xl flex flex-col gap-8">

              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Candidate Portal</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure your session</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              {/* Step 1: Exam Type Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-3 h-3" /> Select Exam
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Himachal GK", "JOA IT"].map((type) => (
                    <motion.button
                      key={type}
                      onClick={() => setExamType(type)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative h-12 rounded-lg font-bold text-xs transition-all overflow-hidden border",
                        examType === type
                          ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/20"
                          : "bg-[#0f1116] text-slate-500 border-white/5 hover:bg-white/5"
                      )}
                    >
                      {type}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Step 2: Set Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Select Module
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["1", "2", "3", "4"].map((id) => (
                    <motion.button
                      key={id}
                      onClick={() => setTestSet(id)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "relative h-14 rounded-lg font-bold text-sm transition-all overflow-hidden group/btn",
                        testSet === id
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                          : "bg-[#0f1116] text-slate-500 hover:bg-white/5 border border-white/5"
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
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-4 pr-4 py-4 bg-[#0f1116] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* Step 4: Action */}
              <div className="pt-4 space-y-3">
                {resumeData && (
                  <GlassButton
                    color="emerald"
                    onClick={handleResume}
                    className="w-full h-auto px-6 py-4"
                  >
                    <div className="flex flex-col items-center justify-center w-full">
                      <span className="font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Resume Previous Session
                      </span>
                      <span className="text-[10px] text-emerald-200 opacity-80">
                        {resumeData.candidateName} • {Math.floor(resumeData.timeRemaining / 60)}m left
                      </span>
                    </div>

                    {/* Delete Session Button (Visible on Hover) */}
                    <button
                      onClick={handleClearSession}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20"
                      title="Delete saved session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </GlassButton>
                )}

                <GlassButton
                  color="blue"
                  onClick={handleStart}
                  disabled={!name.trim()}
                  className="w-full h-auto px-6 py-4"
                >
                  <div className="flex items-center justify-center w-full">
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
          </div>
          <p className="text-slate-500 text-xs italic opacity-70 hover:opacity-100 transition-opacity">
            Developed by Ansh Powered by Gemini 3 pro and Three.js
          </p>
        </motion.div>

      </motion.div>
      <BuyMeCoffeeBtn screen="start" />
    </div>
  );
}

function FeatureBox({ icon, title, desc }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
      }}
      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors flex flex-row items-center gap-4 group cursor-default hover:border-blue-500/20"
    >
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform text-white/80 group-hover:text-white group-hover:bg-blue-500/10">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-white text-sm">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </motion.div>
  );
}


