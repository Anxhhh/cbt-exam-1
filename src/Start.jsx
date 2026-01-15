import { ArrowRight, BookOpen, Clock, ShieldCheck, Zap } from 'lucide-react';
import { cn } from './utils';

export default function Start({ onStart }) {
  return (
    <div className="min-h-screen bg-[#0f1116] text-slate-300 font-sans selection:bg-blue-500/30 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-4xl relative z-10 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* Left: Content */}
        <div className="space-y-8 animate-in slide-in-from-left-8 duration-700 fade-in">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
              Live Mock Test
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              StatePrep <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">CBT</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md">
              Himachal Pradesh General Knowledge Series - Test 01. Challenge yourself with industry-standard questions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FeatureBox icon={<Clock className="w-5 h-5 text-blue-400" />} title="90 Minutes" desc="Strict time limit" />
            <FeatureBox icon={<BookOpen className="w-5 h-5 text-purple-400" />} title="120 Questions" desc="Comprehensive coverage" />
            <FeatureBox icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} title="No Negative" desc="Attempt freely" />
            <FeatureBox icon={<Zap className="w-5 h-5 text-amber-400" />} title="Instant Result" desc="Detailed analytics" />
          </div>

          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95 w-full sm:w-auto overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Examination <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Right: Instructions Card */}
        <div className="bg-[#1a1c23]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-right-8 duration-700 fade-in delay-200 hidden lg:block">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-500 rounded-full" /> Instructions
          </h3>

          <ul className="space-y-4">
            <InstructionItem text="Ensure you have a stable internet connection." />
            <InstructionItem text="Do not refresh the page during the exam." />
            <InstructionItem text="Questions are randomly shuffled." />
            <InstructionItem text="Submit before the timer runs out." />
            <InstructionItem text="Click 'Save & Next' to save answers." />
          </ul>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>ID: HPGK-MOCK-01</span>
            <span>Ver: 2.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureBox({ icon, title, desc }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex flex-col gap-2">
      {icon}
      <div>
        <h4 className="font-bold text-white text-sm">{title}</h4>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function InstructionItem({ text }) {
  return (
    <li className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-600 flex-shrink-0" />
      {text}
    </li>
  );
}
