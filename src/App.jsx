import { useEffect, useState, Suspense, lazy } from "react";
import Papa from "papaparse";

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
            // Columns: Question, Option A, Option B, Option C, Option D, Correct Option (A/B/C/D), Section
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
  const LoadingSpinner = () => (
    <div className="min-h-screen bg-[#0f1116] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-white/10 animate-spin"></div>
      <span className="text-slate-400 font-medium animate-pulse">Loading...</span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1116] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-white/10 animate-spin"></div>
        <span className="text-slate-400 font-medium animate-pulse">Loading Test Config...</span>
      </div>
    );
  }

  /* ================= START SCREEN ================= */
  if (!started) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
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
      <Suspense fallback={<LoadingSpinner />}>
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
    <Suspense fallback={<LoadingSpinner />}>
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
        }}
      />
    </Suspense>
  );
}
