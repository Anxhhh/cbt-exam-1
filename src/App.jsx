import { useEffect, useState, Suspense, lazy } from "react";
import Papa from "papaparse";
import { Toaster, toast } from 'sonner';
import { smartShuffle } from "./utils";
import ThreeBackground from "./ThreeBackground";
import AIConsoleLoader from "./AIConsoleLoader";
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load components
const Start = lazy(() => import("./Start"));
const Exam = lazy(() => import("./Exam"));
const Result = lazy(() => import("./Result"));

const getAnswerIndex = (letter) => {
  if (!letter) return -1;
  const l = letter.trim().toUpperCase();
  if (l === 'A') return 0;
  if (l === 'B') return 1;
  if (l === 'C') return 2;
  if (l === 'D') return 3;
  return -1;
};

export default function App() {
  const [exam, setExam] = useState(null);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [candidateName, setCandidateName] = useState("");
  const [loading, setLoading] = useState(false);
  const [tensionLoading, setTensionLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingTestId, setLoadingTestId] = useState(null);

  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [isRetake, setIsRetake] = useState(false);

  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 2. Disable Copy Shortcuts (Ctrl+C, Cmd+C)
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

  /* ================= LOAD EXAM DATA ================= */
  const loadExam = async (name, testId) => {
    setTensionLoading(true);
    setLoadingTestId(testId);
    setCandidateName(name);
    setIsRetake(false);

    try {
      const fetchPromise = (async () => {
        const baseConfigResponse = await fetch(import.meta.env.BASE_URL + "exam.json");
        if (!baseConfigResponse.ok) throw new Error("Failed to load base config");
        const baseConfig = await baseConfigResponse.json();

        const csvFile = testId === "PYQ" ? "pyquestions.csv" :
          testId === "PYQ2" ? "pyquestions2.csv" :
            (testId ? `questions${testId}.csv` : `questions1.csv`);
        const csvResponse = await fetch(import.meta.env.BASE_URL + csvFile);
        if (!csvResponse.ok) throw new Error(`Failed to load ${csvFile}`);
        const csvText = await csvResponse.text();

        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim(),
            complete: (results) => {
              const parsedQuestions = results.data.map((row, index) => {
                return {
                  id: `Q${index + 1}`,
                  question: row["Question"],
                  options: [
                    row["Option A"],
                    row["Option B"],
                    row["Option C"],
                    row["Option D"]
                  ].filter(opt => opt),
                  answer: getAnswerIndex(row["Correct Option (A/B/C/D)"]),
                  section: row["Section"] || "General"
                };
              });

              const validQuestions = parsedQuestions.filter(q => q.question && q.answer !== -1 && q.options.length > 1);
              const savedState = JSON.parse(localStorage.getItem("cbt_exam_state") || "{}");
              let initialAnswers = {};
              let initialMarked = {};

              if (savedState && savedState.candidateName === name && !savedState.submitted) {
                initialAnswers = savedState.answers || {};
                initialMarked = savedState.marked || {};
              }

              const numericId = parseInt(testId) || 1;
              let examType = "Himachal GK";
              if (testId === "PYQ" || testId === "PYQ2") {
                examType = "HPAS Prelims PYQ's";
              } else if (numericId >= 5) {
                examType = "JOA IT";
              }

              resolve({
                exam: {
                  ...baseConfig,
                  questions: smartShuffle(validQuestions),
                  id: testId,
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

      const tensionPromise = new Promise(resolve => setTimeout(resolve, 6000));
      const [data] = await Promise.all([fetchPromise, tensionPromise]);

      setAnswers(data.answers);
      setMarked(data.marked);
      setExam(data.exam);
      setStarted(true);
      setTensionLoading(false);

    } catch (err) {
      console.error("EXAM LOAD ERROR:", err);
      alert(`Failed to load exam data: ${err.message}`);
      setTensionLoading(false);
      setLoading(false);
    }
  };

  /* ================= SKELETONS ================= */
  const ExamSkeleton = () => (
    <div className="fixed inset-0 flex flex-col font-sans bg-[#1a1c23] text-slate-300">
      <div className="h-1.5 w-full bg-slate-800/50 relative overflow-hidden">
        <div className="h-full w-1/3 bg-slate-700 animate-pulse" />
      </div>
      <header className="flex-shrink-0 px-4 md:px-6 py-3 border-b border-white/5 flex items-center justify-between bg-[#1a1c23]/90 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
            <div className="space-y-1">
              <div className="h-2 w-16 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="hidden lg:block h-4 w-48 bg-white/5 rounded animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 rounded-md border border-white/10 bg-black/20 animate-pulse" />
          <div className="hidden lg:block h-10 w-24 rounded-lg bg-blue-600/20 animate-pulse" />
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden relative">
        <aside className="hidden lg:flex w-80 flex-shrink-0 border-r border-white/5 bg-[#1a1c23] flex-col">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="h-3 w-20 bg-white/5 rounded mb-3 animate-pulse" />
            <div className="grid grid-cols-5 gap-2.5">
              {[...Array(25)].map((_, i) => (
                <div key={i} className="aspect-square rounded-md bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-white/5 bg-white/5 mt-auto">
            <div className="grid grid-cols-2 gap-2">
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </aside>
        <main className="flex-1 flex flex-col relative min-w-0 bg-transparent">
          <div className="flex-shrink-0 px-6 py-3 bg-[#1a1c23] border-b border-white/5 flex items-center justify-between">
            <div className="h-4 w-32 bg-white/5 rounded animate-pulse hidden md:block" />
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <div className="h-9 w-24 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-9 w-32 bg-blue-600/20 rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="flex-1 p-3 md:p-10 lg:p-16 w-full mx-auto max-w-5xl space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="h-6 w-20 rounded-full bg-white/10 animate-pulse" />
                <div className="h-8 w-32 rounded-lg bg-white/5 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-full bg-white/5 rounded animate-pulse" />
                <div className="h-8 w-3/4 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
            <div className="grid gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl border border-white/5 bg-white/[0.02] animate-pulse flex items-center px-4 gap-4">
                  <div className="w-6 h-6 rounded-full border-2 border-white/10" />
                  <div className="h-4 w-1/2 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  const StartSkeleton = () => (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-4 relative font-sans">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-16 items-start mt-10 lg:mt-0">
        <div className="space-y-10 pt-4">
          <div className="space-y-4">
            <div className="w-40 h-8 bg-blue-500/10 rounded-full animate-pulse border border-blue-500/10" />
            <div className="space-y-2">
              <div className="w-3/4 h-14 bg-white/5 rounded-xl animate-pulse" />
              <div className="w-1/2 h-14 bg-white/5 rounded-xl animate-pulse" />
            </div>
            <div className="w-full h-24 bg-white/5 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse border border-white/5" />)}
          </div>
        </div>
        <div className="w-full bg-[#1a1c23] border border-white/10 rounded-xl p-8 space-y-8 animate-pulse shadow-2xl">
          <div className="flex justify-between items-center pb-6 border-b border-white/5">
            <div className="space-y-2">
              <div className="w-32 h-6 bg-white/10 rounded" />
              <div className="w-24 h-4 bg-white/5 rounded" />
            </div>
            <div className="w-12 h-12 rounded-full bg-white/5" />
          </div>
          <div className="space-y-4">
            <div className="w-24 h-4 bg-white/5 rounded" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 bg-white/5 rounded" />
              <div className="h-12 bg-white/5 rounded" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="w-24 h-4 bg-white/5 rounded" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded" />)}
            </div>
          </div>
          <div className="space-y-4">
            <div className="w-24 h-4 bg-white/5 rounded" />
            <div className="h-14 bg-white/5 rounded-xl" />
          </div>
          <div className="h-16 bg-blue-600/20 rounded-xl" />
        </div>
      </div>
    </div>
  );

  const ResultSkeleton = () => (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-[#0b0f19]">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.2fr_0.8fr] gap-6 relative z-10">
        <div className="bg-[#1a1c23] rounded-3xl p-8 h-[600px] animate-pulse border border-white/5 flex flex-col justify-between">
          <div className="w-full flex justify-between">
            <div className="w-48 h-8 bg-white/5 rounded" />
            <div className="w-32 h-6 bg-white/5 rounded-full" />
          </div>
          <div className="self-center w-64 h-64 rounded-full border-8 border-white/5 bg-white/[0.02]" />
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="h-12 bg-white/5 rounded-xl" />
            <div className="h-12 bg-blue-600/20 rounded-xl" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#1a1c23] h-32 rounded-2xl animate-pulse border border-white/5 p-4 flex flex-col justify-between">
                <div className="w-full flex justify-between">
                  <div className="w-16 h-4 bg-white/5 rounded" />
                  <div className="w-8 h-8 bg-white/5 rounded-lg" />
                </div>
                <div className="w-12 h-8 bg-white/5 rounded" />
              </div>
            ))}
          </div>
          <div className="bg-[#1a1c23] h-64 rounded-3xl animate-pulse border border-white/5 p-6 space-y-4">
            <div className="w-48 h-6 bg-white/5 rounded" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="w-full h-8 bg-white/5 rounded" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ================= ANALYZING SCREEN (Gemini Style) ================= */
  const AnalyzingScreen = () => {
    const [step, setStep] = useState(0);

    const sequence = [
      { text: "Analyzing Sessions...", subtext: "Verifying response integrity.", duration: 1500 },
      { text: "Pattern Recognition", subtext: "Correlating answers with difficulty vectors.", duration: 2000 },
      { text: "Generating Insights", subtext: " Synthesizing performance metrics.", duration: 1500 },
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
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"
            />
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill="url(#sparkle-gradient-analyze)" />
                <defs>
                  <linearGradient id="sparkle-gradient-analyze" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#93c5fd" />
                    <stop offset="1" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
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

  /* ================= MAIN RENDER ================= */
  let content = null;

  if (loading) {
    content = (
      <motion.div key="skeleton" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
        <ExamSkeleton />
      </motion.div>
    );
  } else if (tensionLoading) {
    content = (
      <motion.div key="loader" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
        <AIConsoleLoader name={candidateName} testId={loadingTestId} />
      </motion.div>
    );
  } else if (analyzing) {
    content = (
      <motion.div key="analyzing" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
        <AnalyzingScreen />
      </motion.div>
    );
  } else if (!started) {
    content = (
      <motion.div
        key="start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 0.8 }}
      >
        <Suspense fallback={<StartSkeleton />}>
          <Start onStart={loadExam} isRetake={isRetake} />
        </Suspense>
      </motion.div>
    );
  } else if (submitted) {
    if (!exam || !Array.isArray(exam.questions)) {
      content = (
        <div className="min-h-screen bg-[#0f1116] flex items-center justify-center text-slate-400">
          Error: Exam data missing.
        </div>
      );
    } else {
      content = (
        <motion.div
          key="result"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Suspense fallback={<ResultSkeleton />}>
            <Result
              exam={exam}
              answers={answers}
              timeTaken={timeTaken}
              candidateName={candidateName}
              onRetake={() => {
                setAnswers({});
                setMarked({});
                setSubmitted(false);
                setStarted(false);
                setTimeTaken(0);
                setCandidateName("");
                setExam(null);
                setIsRetake(true);
              }}
            />
          </Suspense>
        </motion.div>
      );
    }
  } else if (exam) {
    content = (
      <motion.div
        key="exam"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, filter: "blur(10px)" }}
        transition={{ duration: 1 }}
      >
        <Suspense fallback={<ExamSkeleton />}>
          <Exam
            data={exam}
            answers={answers}
            marked={marked}
            candidateName={candidateName}
            setAnswers={setAnswers}
            setMarked={setMarked}
            onSubmit={(tt) => {
              setTimeTaken(tt || 0);
              setAnalyzing(true);
              setTimeout(() => {
                setAnalyzing(false);
                setSubmitted(true);
                localStorage.removeItem("cbt_exam_state");
              }, 6000); // Increased to match Sequence Duration
            }}
            onClearSession={() => localStorage.removeItem("cbt_exam_state")}
            onBackToStart={() => setStarted(false)}
          />
        </Suspense>
      </motion.div>
    );
  }

  // Adaptive Focus Mode Calculation
  let bgIntensity = 1;
  if (tensionLoading || analyzing) bgIntensity = 0.5; // Slightly dimmed during transitions
  else if (started && !submitted) bgIntensity = 0.15; // Focus Mode (Exam)
  else if (submitted) bgIntensity = 1; // Celebration (Result)
  else bgIntensity = 1; // Start Screen

  return (
    <>
      <ThreeBackground intensity={bgIntensity} />
      <AnimatePresence mode="wait">
        {content}
      </AnimatePresence>
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: { background: '#1a1c23', border: '1px solid #334155', color: '#e2e8f0' },
        }}
      />
    </>
  );
}
