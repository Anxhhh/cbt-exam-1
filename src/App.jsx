import { useEffect, useState } from "react";
import Start from "./Start";
import Exam from "./Exam";
import Result from "./Result";

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function App() {
  const [exam, setExam] = useState(null);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});


  /* ================= LOAD EXAM JSON ================= */
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "exam.json")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load exam.json");
        return res.json();
      })
      .then(data => {
        setExam({
          ...data,
          questions: shuffleArray(data.questions) // ✅ SHUFFLE ONCE
        });
      })
      .catch(err => {
        console.error("EXAM LOAD ERROR:", err);
        setExam({ questions: [] });
      });
  }, []);

  /* ================= LOADING STATE ================= */
  if (!exam || !exam.questions) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 18
        }}
      >
        Loading...
      </div>
    );
  }

  /* ================= START SCREEN ================= */
  if (!started) {
    return <Start onStart={() => setStarted(true)} />;
  }

  /* ================= RESULT SCREEN ================= */
  if (submitted) {
    if (!exam || !Array.isArray(exam.questions)) {
      return (
        <div
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          Loading result...
        </div>
      );
    }

    return (
      <Result
        exam={exam}
        answers={answers}
        onRetake={() => {
          setAnswers({});
          setMarked({});
          setSubmitted(false);
          setStarted(false);
        }}
      />
    );
  }

  /* ================= EXAM SCREEN ================= */
  return (
    <Exam
      data={exam}
      answers={answers}
      marked={marked}
      setAnswers={setAnswers}
      setMarked={setMarked}
      onSubmit={() => setSubmitted(true)}
    />
  );
}
