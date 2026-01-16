const exam = require("../public/exam.json");

const ids = new Set();

exam.questions.forEach((q, i) => {
  if (!q.id) throw new Error(`Missing id at index ${i}`);
  if (ids.has(q.id)) throw new Error(`Duplicate id: ${q.id}`);
  ids.add(q.id);

  if (!Array.isArray(q.options) || q.options.length !== 4)
    throw new Error(`Invalid options at ${q.id}`);

  if (typeof q.answer !== "number" || q.answer < 0 || q.answer > 3)
    throw new Error(`Invalid answer at ${q.id}`);
});

console.log(`✔ exam.json validated (${exam.questions.length} questions)`);
