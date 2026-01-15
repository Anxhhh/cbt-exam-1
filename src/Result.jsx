import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Result({ exam, answers, onRetake }) {
  // HARD SAFETY GUARD (DO NOT REMOVE)
  if (!exam || !Array.isArray(exam.questions)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading result...
      </div>
    );
  }

  const total = exam.questions.length;

  let attempted = 0;
  let correct = 0;

  exam.questions.forEach(q => {
    if (answers && answers[q.id] !== undefined) {
      attempted++;
      if (answers[q.id] === q.answer) {
        correct++;
      }
    }
  });

  const wrong = attempted - correct;
  const unattempted = total - attempted;
  const scorePercent = Math.round((correct / total) * 100);

  const downloadPDF = () => {
    const doc = new jsPDF();

    // === HEADER ===
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // Blue 900
    doc.text("StatePrep CBT - Performance Report", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Himachal Pradesh GK (Mock-1)", 105, 28, { align: "center" });
    doc.line(20, 32, 190, 32);

    // === SCORE SUMMARY ===
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Summary", 20, 45);

    doc.setFontSize(12);
    doc.text(`Total Questions: ${total}`, 20, 55);
    doc.text(`Attempted: ${attempted}`, 20, 62);
    doc.text(`Correct: ${correct}`, 80, 55);
    doc.text(`Wrong: ${wrong}`, 80, 62);
    doc.text(`Unattempted: ${unattempted}`, 140, 55);
    doc.text(`Score: ${correct} / ${total} (${scorePercent}%)`, 140, 62);

    // === WEAKNESS ANALYSIS (Rules based on sections or question types) ===
    doc.setFontSize(16);
    doc.text("Improvement Strategy", 20, 80);
    doc.setFontSize(11);
    doc.setTextColor(80);

    const strategy = [
      "• Review the questions you skipped. Was it due to time pressure or lack of concept clarity?",
      "• Analyze your wrong answers. Did you fall for a 'distractor' option?",
      "• Focus on accuracy. Ensure you do not guess wildly in sections with negative marking (if active).",
      "• For HP GK, revise the 'Rivers' and 'Temples' topics as they carried high weightage."
    ];

    let yPos = 90;
    strategy.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 7;
    });

    // === DETAILED QUESTION TABLE ===
    const tableData = exam.questions.map((q, i) => {
      const userAnswerIdx = answers[q.id];
      const correctText = q.options[q.answer] || "N/A";
      const userText = userAnswerIdx !== undefined ? q.options[userAnswerIdx] : "Skipped";
      const status = userAnswerIdx === q.answer ? "Correct" : userAnswerIdx === undefined ? "Skipped" : "Wrong";

      return [
        `Q${i + 1}`,
        q.question.substring(0, 40) + "...",
        userText,
        correctText,
        status
      ];
    });

    autoTable(doc, {
      startY: 120,
      head: [["#", "Question", "Your Answer", "Correct Answer", "Status"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 70 },
        4: { cellWidth: 20 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const val = data.cell.raw;
          if (val === 'Correct') data.cell.styles.textColor = [22, 163, 74];
          else if (val === 'Wrong') data.cell.styles.textColor = [220, 38, 38];
          else data.cell.styles.textColor = [100, 116, 139];
        }
      }
    });

    doc.save("Exam_Report.pdf");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: "#ffffff",
          borderRadius: 16,
          padding: "36px 40px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)"
        }}
      >
        {/* HEADER */}
        <h1 style={{ marginTop: 0, color: "#1e3a8a", fontSize: 32 }}>
          Exam Result
        </h1>
        <p style={{ color: "#475569", marginTop: 4 }}>
          StatePrep CBT – Himachal Pradesh
        </p>

        <hr style={{ margin: "24px 0" }} />

        {/* SCORE */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 32
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#1d4ed8"
            }}
          >
            {correct} / {total}
          </div>
          <div style={{ color: "#475569", marginTop: 4, fontSize: 18 }}>
            Score ({scorePercent}%)
          </div>
        </div>

        {/* STATS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16
          }}
        >
          <Stat label="Attempted" value={attempted} />
          <Stat label="Correct" value={correct} />
          <Stat label="Wrong" value={wrong} />
          <Stat label="Unattempted" value={unattempted} />
        </div>

        {/* ACTIONS */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}
        >
          <button
            onClick={downloadPDF}
            style={{
              background: "#0f172a",
              color: "#ffffff",
              padding: "16px 28px",
              fontSize: 16,
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
            }}
          >
            <span>Download Detailed Report (PDF)</span>
          </button>

          <button
            onClick={onRetake}
            style={{
              background: "#ffffff",
              color: "#1d4ed8",
              padding: "14px 28px",
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #1d4ed8",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Retake Exam
          </button>
        </div>
      </div>
    </div>
  );
}

/* SMALL STAT CARD COMPONENT */
function Stat({ label, value }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: 12,
        padding: 16,
        textAlign: "center"
      }}
    >
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#0f172a"
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#64748b",
          marginTop: 4
        }}
      >
        {label}
      </div>
    </div>
  );
}
