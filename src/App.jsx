import { useEffect, useState, Suspense, lazy } from "react";
import Papa from "papaparse";
import { Toaster, toast } from 'sonner';
import { smartShuffle } from "./utils";
import ThreeBackground from "./ThreeBackground";



// Lazy load components
const Start = lazy(() => import("./Start"));
const Exam = lazy(() => import("./Exam"));
const Result = lazy(() => import("./Result"));

// ... (keep getAnswerIndex same)
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
  const [analyzing, setAnalyzing] = useState(false);

  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});

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

  // ... (keep loadExam logic same)
  /* ================= LOAD EXAM DATA ================= */
  const loadExam = async (name, testId) => {
    setLoading(true);
    setCandidateName(name);

    try {
      // 1. Load base exam configuration (for duration etc.)
      const baseConfigResponse = await fetch(import.meta.env.BASE_URL + "exam.json");
      if (!baseConfigResponse.ok) throw new Error("Failed to load base config");
      const baseConfig = await baseConfigResponse.json();

      // 2. Load the specific CSV based on selection
      const csvFile = testId ? `questions${testId}.csv` : `questions1.csv`;

      const csvResponse = await fetch(import.meta.env.BASE_URL + csvFile);
      if (!csvResponse.ok) throw new Error(`Failed to load ${csvFile}`);
      const csvText = await csvResponse.text();

      // 3. Parse CSV
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
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

          // Filter out any broken rows
          const validQuestions = parsedQuestions.filter(q => q.question && q.answer !== -1 && q.options.length > 1);

          // === HYDRATION LOGIC ===
          const savedState = JSON.parse(localStorage.getItem("cbt_exam_state") || "{}");
          if (savedState && savedState.candidateName === name && !savedState.submitted) {
            setAnswers(savedState.answers || {});
            setMarked(savedState.marked || {});
          } else {
            setAnswers({});
            setMarked({});
          }

          const numericId = parseInt(testId) || 1;
          const examType = numericId >= 5 ? "JOA IT" : "Himachal GK";

          setExam({
            ...baseConfig,
            questions: smartShuffle(validQuestions),
            id: testId,
            type: examType
          });
          setStarted(true);
          setLoading(false);
        },
        error: (err) => {
          console.error("CSV PARSE ERROR:", err);
          alert("Failed to parse question data.");
          setLoading(false);
        }
      });

    } catch (err) {
      console.error("EXAM LOAD ERROR:", err);
      alert(`Failed to load exam data: ${err.message}`);
      setLoading(false);
    }
  };

  /* ================= SKELETONS ================= */
  const ExamSkeleton = () => (
    <div className="fixed inset-0 flex flex-col font-sans bg-[#1a1c23] text-slate-300">
      {/* ================= SUPER HEADER (Progress) ================= */}
      <div className="h-1.5 w-full bg-slate-800/50 relative overflow-hidden">
        <div className="h-full w-1/3 bg-slate-700 animate-pulse" />
      </div>

      {/* ================= HEADER ================= */}
      <header className="flex-shrink-0 px-4 md:px-6 py-3 border-b border-white/5 flex items-center justify-between bg-[#1a1c23]/90 backdrop-blur-md">
        {/* Left: Branding & User */}
        <div className="flex items-center gap-4">
          {/* Menu Button Placeholder */}
          <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />
          {/* Home Button Placeholder */}
          <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />

          {/* Candidate Profile Placeholder */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
            <div className="space-y-1">
              <div className="h-2 w-16 bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Center: Title Placeholder */}
        <div className="hidden lg:block h-4 w-48 bg-white/5 rounded animate-pulse" />

        {/* Right: Timer & Submit */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 rounded-md border border-white/10 bg-black/20 animate-pulse" />
          <div className="hidden lg:block h-10 w-24 rounded-lg bg-blue-600/20 animate-pulse" />
        </div>
      </header>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* === LEFT SIDEBAR (Question Palette) === */}
        <aside className="hidden lg:flex w-80 flex-shrink-0 border-r border-white/5 bg-[#1a1c23] flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
          </div>

          {/* Grid */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="h-3 w-20 bg-white/5 rounded mb-3 animate-pulse" />
            <div className="grid grid-cols-5 gap-2.5">
              {[...Array(25)].map((_, i) => (
                <div key={i} className="aspect-square rounded-md bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/5 bg-white/5 mt-auto">
            <div className="grid grid-cols-2 gap-2">
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </aside>

        {/* === CENTER CANVAS === */}
        <main className="flex-1 flex flex-col relative min-w-0 bg-transparent">

          {/* Top Action Bar */}
          <div className="flex-shrink-0 px-6 py-3 bg-[#1a1c23] border-b border-white/5 flex items-center justify-between">
            <div className="h-4 w-32 bg-white/5 rounded animate-pulse hidden md:block" />
            <div className="flex gap-3 w-full md:w-auto justify-end">
              <div className="h-9 w-24 bg-white/5 rounded-lg animate-pulse" />
              <div className="h-9 w-32 bg-blue-600/20 rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Question Area */}
          <div className="flex-1 p-3 md:p-10 lg:p-16 w-full mx-auto max-w-5xl space-y-8">

            {/* Question Header */}
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

            {/* Options Grid */}
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
        <div className="space-y-10 pt-4 hidden lg:block">
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
            <div className="h-14 bg-white/5 rounded" />
          </div>
          <div className="h-32 bg-white/5 rounded-xl" />
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

  if (loading) {
    return <ExamSkeleton />;
  }
  /* ================= ANALYZING SCREEN ================= */
  const AnalyzingScreen = () => {
    const [statusText, setStatusText] = useState("Initializing Analysis Engine...");

    // Cycle through status messages
    useEffect(() => {
      const messages = [
        "Verifying Response Integrity...",
        "Correlating Answers with Key...",
        "Calculating Accuracy Metrics...",
        "Generating Performance Report..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        setStatusText(messages[i]);
        i = (i + 1) % messages.length;
      }, 750); // Change text every 750ms
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="min-h-screen text-slate-300 font-sans flex flex-col items-center justify-center relative overflow-hidden select-none">

        {/* 3D Background */}
        <ThreeBackground />

        <div className="relative z-10 flex flex-col items-center gap-6 md:gap-10">

          {/* Main Visual: Processing Core */}
          <div className="relative">
            {/* Outer Rings */}
            <div className="absolute inset-[-20%] border border-blue-500/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute inset-[-10%] border border-dashed border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>

            {/* Center Pulse */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 bg-[#0f172a] rounded-xl md:rounded-2xl rotate-45 border border-blue-500/30 flex items-center justify-center shadow-[0_0_40px_-5px_rgba(59,130,246,0.3)] animate-pulse">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/10 rounded-lg flex items-center justify-center -rotate-45">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 animate-bounce md:w-8 md:h-8"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 9h6v6H9z" /><path d="M15 9l-6 6" /><path d="M9 15l6-6" /></svg>
              </div>
            </div>

            {/* Orbiting particles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 animate-[spin_3s_linear_infinite]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"></div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="h-6 overflow-hidden">
              <span className="text-blue-400 font-mono text-xs md:text-sm tracking-widest uppercase animate-pulse">
                {statusText}
              </span>
            </div>

            {/* Techy Progress Line */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-6 md:w-8 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 animate-[shimmer_1.5s_infinite]"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (analyzing) return <AnalyzingScreen />;

  /* ================= START SCREEN ================= */
  if (!started) {
    return (
      <Suspense fallback={<StartSkeleton />}>
        <Start onStart={loadExam} />
      </Suspense>
    );
  }

  /* ================= RESULT SCREEN ================= */
  if (submitted) {
    if (!exam || !Array.isArray(exam.questions)) {
      return (
        <div className="min-h-screen bg-[#0f1116] flex items-center justify-center text-slate-400">
          Error: Exam data missing.
        </div>
      );
    }

    return (
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
            setExam(null); // Reset exam to allow re-selection
          }}
        />
      </Suspense>
    );
  }

  /* ================= EXAM SCREEN ================= */
  if (!exam) return null; // Should be covered by loading/started state, but safeguard

  return (
    <>
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
            // Trigger analysis interruption
            setAnalyzing(true);
            setTimeout(() => {
              setAnalyzing(false);
              setSubmitted(true);
              localStorage.removeItem("cbt_exam_state");
            }, 3000); // 3 Second "Analysis" Delay
          }}
          // Pass a cleaner method to clear session
          onClearSession={() => localStorage.removeItem("cbt_exam_state")}
          onBackToStart={() => setStarted(false)}
        />
      </Suspense>
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
