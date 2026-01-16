const fs = require("fs");
const csv = require("csv-parser");

const questions = [];
let counter = 1;

fs.createReadStream("questions.csv")
  .pipe(csv())
  .on("data", row => {
    // Guard empty rows
    if (!row["Question"]) return;

    // Convert A/B/C/D → 0/1/2/3
    const answerMap = { A: 0, B: 1, C: 2, D: 3 };
    const rawAnswer = row["Correct Option (A/B/C/D)"]?.trim();

    if (!answerMap.hasOwnProperty(rawAnswer)) {
      console.warn(`⚠️ Skipping row ${counter}: invalid answer`);
      return;
    }

    questions.push({
      id: `Q${String(counter).padStart(3, "0")}`,
      question: row["Question"].trim(),
      options: [
        row["Option A"]?.trim(),
        row["Option B"]?.trim(),
        row["Option C"]?.trim(),
        row["Option D"]?.trim()
      ],
      answer: answerMap[rawAnswer],
      section: row["Section"]?.trim() || "General"
    });

    counter++;
  })
  .on("end", () => {
    if (questions.length === 0) {
      console.error("❌ No valid questions found");
      return;
    }

    fs.writeFileSync(
      "public/exam.json",
      JSON.stringify(
        {
          duration: 90,
          questions
        },
        null,
        2
      )
    );

    console.log(`✔ exam.json generated (${questions.length} questions)`);
  })
  .on("error", err => {
    console.error("CSV parsing error:", err.message);
  });
