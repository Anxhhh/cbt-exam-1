import { ArrowRight, BookOpen, Clock, ShieldCheck, Zap, User, FileText, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { useState } from "react";
import { cn } from './utils';

export default function Start({ onStart }) {
  const [name, setName] = useState("");
  const [testSet, setTestSet] = useState("1"); // Default to Test 1

  const handleStart = () => {
    if (name.trim()) {
      onStart(name, testSet);
    } else {
      // Small "shake" effect validation could go here
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1116] text-slate-300 font-sans selection:bg-blue-500/30 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-6xl relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-16 items-start mt-10 lg:mt-0">

        {/* Left Column: Branding & Value Props */}
        <div className="space-y-10 animate-in slide-in-from-left-8 duration-700 fade-in pt-4">

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              Live Assessment System
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              StatePrep <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Computer Based Test</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Experience a high-fidelity examination environment designed for Himachal Pradesh Patwari Exam. Challenge yourself with tcs-standard questions and instant detailed feedback.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FeatureBox icon={<Clock className="w-5 h-5 text-blue-400" />} title="Timed Session" desc="90 Minutes strict limit" />
            <FeatureBox icon={<BookOpen className="w-5 h-5 text-purple-400" />} title="Comprehensive" desc="120 Questions coverage" />
            <FeatureBox icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} title="Fair Testing" desc="No Negative Marking" />
            <FeatureBox icon={<Zap className="w-5 h-5 text-amber-400" />} title="Instant Analytics" desc="Detailed Review" />
          </div>

          {/* Quick instructions inline for cleaner look */}
          <div className="pt-4 border-t border-white/5">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Exam Guidelines</h4>
            <ul className="grid sm:grid-cols-2 gap-3 text-sm text-slate-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> No page refresh permitted</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Auto-submission on timer end</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Use 'Save' to confirm answers</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Stable internet required</li>
            </ul>
          </div>

        </div>

        {/* Right Column: Candidate Action Card */}
        <div className="flex flex-col gap-4 items-end">
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

              {/* Step 1: Set Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3 h-3" /> Select Module
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["1", "2", "3", "4"].map((id) => (
                    <button
                      key={id}
                      onClick={() => setTestSet(id)}
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
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-500 opacity-100" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Name Input */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-3 h-3" /> Identification
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter full candidate name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-4 pr-4 py-4 bg-[#0f1116] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* Step 3: Action */}
              <div className="pt-4">
                <button
                  onClick={handleStart}
                  disabled={!name.trim()}
                  className="w-full relative group/start overflow-hidden rounded-xl p-[1px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-100 animate-gradient-x" />
                  <div className="relative bg-[#1a1c23] hover:bg-transparent transition-colors duration-200 rounded-xl h-full px-6 py-4 flex items-center justify-center">
                    <span className="font-bold text-white flex items-center gap-2 group-disabled/start:text-slate-400">
                      Initialize Exam <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
                <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-widest">
                  Secure Browser Environment • Ver 2.4.0
                </p>
              </div>

            </div>
          </div>
          <p className="text-slate-500 text-xs italic opacity-70 hover:opacity-100 transition-opacity">
            Developed by Ansh Powered by Gemini 3 pro
          </p>
        </div>

      </div>
    </div>
  );
}

function FeatureBox({ icon, title, desc }) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors flex flex-row items-center gap-4 group">
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-white text-sm">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}
