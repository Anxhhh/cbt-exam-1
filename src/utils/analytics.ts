import { ExamData, AnswersState } from "../types";

export interface Insight {
    color: string;
    text: string;
}

export const generateInsights = (
    exam: ExamData,
    answers: AnswersState,
    correct: number,
    attempted: number,
    total: number // Although not strictly used in current logic, good to have for future extensibility
): Insight[] => {
    // 1. Calculate Section Performance
    const sections: { [key: string]: { total: number; correct: number } } = {};
    exam.questions.forEach(q => {
        if (!sections[q.section]) sections[q.section] = { total: 0, correct: 0 };
        sections[q.section].total++;
        if (answers[q.id] === q.answer) sections[q.section].correct++;
    });

    // 2. Generate Insights
    const insights: Insight[] = [];

    // Accuracy Insight
    const accuracy = Math.round((correct / (attempted || 1)) * 100);
    if (accuracy > 80) {
        insights.push({ color: 'bg-emerald-500', text: "High Precision: Your accuracy is excellent. You avoided guessing." });
    } else if (accuracy < 50) {
        insights.push({ color: 'bg-rose-500', text: "High Negative Impact: Many wrong attempts. Try to skip if unsure." });
    } else {
        insights.push({ color: 'bg-blue-500', text: `Balanced Approach: ${accuracy}% accuracy. Room for improvement.` });
    }

    // 3. Exam Specific Insights
    if (exam.type === "JOA IT") {
        const compSection = Object.entries(sections).find(([name]) =>
            name.toLowerCase().includes("computer") || name.toLowerCase().includes("it") || name.toLowerCase().includes("tech")
        );
        if (compSection) {
            const [name, stats] = compSection;
            const pct = Math.round((stats.correct / stats.total) * 100);
            const color = pct > 70 ? 'bg-emerald-500' : pct > 40 ? 'bg-amber-500' : 'bg-rose-500';
            insights.push({
                color,
                text: `Technical Core (${name}): ${pct}%. ${pct > 70 ? 'Strong command over IT concepts.' : 'Critical for JOA. Focus revision here.'}`
            });
        }

        // NEW: Non-Technical Balance
        const nonTechSections = Object.entries(sections).filter(([name]) =>
            !name.toLowerCase().includes("computer") &&
            !name.toLowerCase().includes("it") &&
            !name.toLowerCase().includes("tech")
        );

        if (nonTechSections.length > 0) {
            let ntTotal = 0;
            let ntCorrect = 0;
            nonTechSections.forEach(([_, s]) => { ntTotal += s.total; ntCorrect += s.correct; });

            if (ntTotal > 0) {
                const ntPct = Math.round((ntCorrect / ntTotal) * 100);
                const color = ntPct > 60 ? 'bg-blue-500' : 'bg-purple-500'; // Blue for good, Purple for needs balance
                insights.push({
                    color,
                    text: `General Aptitude: ${ntPct}%. ${ntPct > 60 ? 'Good balance between Tech & GK.' : 'Don\'t ignore GK/Lang sections.'}`
                });
            }
        }
    } else if (exam.type === "Himachal GK") {
        const hpSection = Object.entries(sections).find(([name]) =>
            name.toLowerCase().includes("hp") || name.toLowerCase().includes("himachal")
        );
        if (hpSection) {
            const [name, stats] = hpSection;
            const pct = Math.round((stats.correct / stats.total) * 100);
            const color = pct > 70 ? 'bg-emerald-500' : pct > 40 ? 'bg-amber-500' : 'bg-rose-500';
            insights.push({
                color,
                text: `State GK (${name}): ${pct}%. ${pct > 70 ? 'Excellent state knowledge.' : 'Focus on Himachal specific topics.'}`
            });
        }
    }

    // Strongest Section (Generic)
    const sortedSections = Object.entries(sections).sort(([, a], [, b]) => (b.correct / b.total) - (a.correct / a.total));

    // Filter out the one we just mentioned if any
    const otherSections = sortedSections.filter(([name]) => {
        if (exam.type === "JOA IT") return !name.toLowerCase().includes("computer") && !name.toLowerCase().includes("it");
        if (exam.type === "Himachal GK") return !name.toLowerCase().includes("hp") && !name.toLowerCase().includes("himachal");
        return true;
    });

    const best = otherSections[0];
    const worst = otherSections[otherSections.length - 1];

    if (best) {
        const bestPct = Math.round((best[1].correct / best[1].total) * 100);
        insights.push({ color: 'bg-purple-500', text: `Strong Domain: ${best[0]} (${bestPct}%). Capitalize on this.` });
    }

    if (worst && worst !== best) {
        const worstPct = Math.round((worst[1].correct / worst[1].total) * 100);
        insights.push({ color: 'bg-amber-500', text: `Weak Area: ${worst[0]} (${worstPct}%). Focus your revision here.` });
    }

    return insights.slice(0, 3);
};
