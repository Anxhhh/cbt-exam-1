import { useEffect, useState, Suspense, lazy } from "react";
import Papa from "papaparse";
import { Toaster, toast } from 'sonner';

// Lazy load components
const Start = lazy(() => import("./Start"));
const Exam = lazy(() => import("./Exam"));
const Result = lazy(() => import("./Result"));

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Function to map letter to index
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

  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});

  /* ================= LOAD EXAM DATA ================= */
  const loadExam = async (name, testId) => {
    setLoading(true);
    setCandidateName(name);

    try {
      // 1. Load base exam configuration (for duration etc.)
      // We will reuse exam.json just for the outline if needed, or create a default config
      const baseConfigResponse = await fetch(import.meta.env.BASE_URL + "exam.json");
      if (!baseConfigResponse.ok) throw new Error("Failed to load base config");
      const baseConfig = await baseConfigResponse.json();

      // 2. Load the specific CSV based on selection
      // Map Set 1 -> questions1.csv, Set 2 -> questions2.csv, etc.
      // Defaulting to "questions1.csv" if undefined
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
            // Map CSV columns to Question Object
            return {
              id: `Q${index + 1}`,
              question: row["Question"],
              options: [
                row["Option A"],
                row["Option B"],
                row["Option C"],
                row["Option D"]
              ].filter(opt => opt), // Ensure no empty options if any
              answer: getAnswerIndex(row["Correct Option (A/B/C/D)"]),
              section: row["Section"] || "General"
            };
          });

          // Filter out any broken rows (e.g. missing question or answer)
          const validQuestions = parsedQuestions.filter(q => q.question && q.answer !== -1 && q.options.length > 1);

          // === HYDRATION LOGIC ===
          // Check if we have a saved state for THIS specific user and exam
          // Note: Ideally we should check if 'testId' matches too, but for now we assume user resumes correctly.
          const savedState = JSON.parse(localStorage.getItem("cbt_exam_state") || "{}");
          if (savedState && savedState.candidateName === name && !savedState.submitted) {
            // Restore Global State
            setAnswers(savedState.answers || {});
            setMarked(savedState.marked || {});
          } else {
            // New Exam - Reset
            setAnswers({});
            setMarked({});
          }

          setExam({
            ...baseConfig,
            questions: shuffleArray(validQuestions) // ✅ SHUFFLE ONCE
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

  /* ================= LOADING SCREEN ================= */
  /* ================= LOADING SCREEN (SKELETON) ================= */
  const SkeletonLoader = () => (
    <div className="min-h-screen bg-[#0f1116] flex flex-col font-sans animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 border-b border-white/5 bg-white/5 w-full flex items-center px-6 justify-between">
        <div className="h-6 w-32 bg-slate-700/50 rounded"></div>
        <div className="h-8 w-24 bg-slate-700/50 rounded"></div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Skeleton (Desktop) */}
        <div className="hidden lg:block w-80 border-r border-white/5 p-4 space-y-4 bg-white/[0.02]">
          <div className="h-4 w-20 bg-slate-700/50 rounded mb-4"></div>
          <div className="grid grid-cols-5 gap-2">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="aspect-square rounded bg-slate-700/30"></div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 p-8 md:p-12 space-y-8">
          <div className="flex justify-between items-center">
            <div className="h-4 w-20 bg-slate-700/50 rounded"></div>
            <div className="h-8 w-32 bg-slate-700/50 rounded"></div>
          </div>

          <div className="h-8 w-3/4 bg-slate-700/50 rounded"></div>
          <div className="h-8 w-1/2 bg-slate-700/50 rounded"></div>

          <div className="space-y-4 pt-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-full rounded-xl border border-white/5 bg-white/[0.02]"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  /* ================= START SCREEN ================= */
  if (!started) {
    return (
      <Suspense fallback={<SkeletonLoader />}>
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
      <Suspense fallback={<SkeletonLoader />}>
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
      <Suspense fallback={<SkeletonLoader />}>
        <Exam
          data={exam}
          answers={answers}
          marked={marked}
          candidateName={candidateName}
          setAnswers={setAnswers}
          setMarked={setMarked}
          onSubmit={(tt) => {
            setTimeTaken(tt || 0);
            setSubmitted(true);
            // Clear local storage on submit
            localStorage.removeItem("cbt_exam_state");
          }}
          // Pass a cleaner method to clear session
          onClearSession={() => localStorage.removeItem("cbt_exam_state")}
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
