import jsPDF from "jspdf";
import { ExamData, AnswersState } from "../types";

interface PDFGeneratorProps {
    exam: ExamData;
    answers: AnswersState;
    timeTaken: number;
    candidateName: string;
    stats: {
        total: number;
        attempted: number;
        correct: number;
        wrong: number;
        unattempted: number;
    };
}

const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
};

export const generatePDF = ({ exam, answers, timeTaken, candidateName, stats }: PDFGeneratorProps) => {
    const { total, attempted, correct, wrong, unattempted } = stats;
    const doc = new jsPDF();

    // --- PAGE 1: REPORT CARD ---

    // Clear background (White)
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');

    // Header
    doc.setFillColor(30, 58, 138); // Dark Blue Header
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("PERFORMANCE REPORT", 20, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("StatePrep CBT - Himachal Pradesh Mock Test", 20, 30);

    doc.text(`Roll No: HPGK-2026-001`, 190, 20, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, 30, { align: 'right' });

    // Candidate Summary Box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.rect(20, 50, 170, 35, 'F');
    doc.rect(20, 50, 170, 35, 'S');

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.text(`Candidate Name: ${candidateName || "Demo Candidate"}`, 25, 62);
    doc.text(`Total Questions: ${total}`, 25, 75);

    doc.text(`Time Taken: ${formatTime(timeTaken || 0)}`, 110, 62);
    doc.text(`Total Marks: ${correct}`, 110, 75);

    // Infographic Chart (Bar Chart Simulation)
    const chartY = 110;
    doc.setFont("helvetica", "bold");
    doc.text("Performance Analysis", 20, 100);

    const maxVal = Math.max(attempted, correct, wrong, unattempted, 1); // Avoid div by 0
    const barMaxHeight = 80;
    const scale = barMaxHeight / maxVal;

    // Draw Bars
    const drawBar = (x: number, val: number, label: string, color: [number, number, number]) => {
        const h = val * scale;
        doc.setFillColor(...color);
        doc.rect(x, chartY + (barMaxHeight - h), 30, h, 'F');

        // Value Top
        doc.setTextColor(0, 0, 0);
        doc.text(String(val), x + 15, chartY + (barMaxHeight - h) - 5, { align: 'center' });

        // Label Bottom
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(label, x + 15, chartY + barMaxHeight + 15, { align: 'center' });
    }

    drawBar(30, attempted, "Attempted", [59, 130, 246]); // Blue
    drawBar(75, correct, "Correct", [34, 197, 94]);    // Green
    drawBar(120, wrong, "Wrong", [239, 68, 68]);       // Red
    drawBar(165, unattempted, "Skipped", [148, 163, 184]); // Gray

    // Pie Chart Legend Simulation (Text based summary)
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "bold");
    doc.text("Overall Accuracy", 20, 230);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(30);
    doc.setTextColor(30, 58, 138);
    doc.text(`${Math.round((correct / (attempted || 1)) * 100)}%`, 20, 245);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Accuracy is calculated on attempted questions.", 20, 255);

    // Footer Page 1
    doc.setFontSize(8);
    doc.text("Page 1 of Detailed Report", 105, 290, { align: "center" });


    // --- PAGE 2+: DETAILED SOLUTIONS ---
    doc.addPage();

    let y = 20;

    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DETAILED QUESTION ANALYSIS", 105, 13, { align: 'center' });

    y = 35;

    exam.questions.forEach((q, i) => {
        // Check page break
        if (y > 250) {
            doc.addPage();
            y = 20;
            // Header on new page
            doc.setFillColor(240, 240, 240);
            doc.rect(0, 0, 210, 10, 'F');
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.text("Detailed Analysis Continued...", 105, 7, { align: 'center' });
            y += 10;
        }

        // Question Text
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");

        const qPrefix = `Q${i + 1}. `;
        const qLines = doc.splitTextToSize(qPrefix + q.question, 170);
        doc.text(qLines, 20, y);
        y += (qLines.length * 5) + 2;

        // Options & Status
        const userAnsIdx = answers[q.id];
        const correctAnsIdx = q.answer;
        const correctText = q.options[correctAnsIdx];
        const userText = userAnsIdx !== undefined ? q.options[userAnsIdx] : "Not Attempted";

        // Status Badge
        let statusText = "SKIPPED";
        let statusColor: [number, number, number] = [150, 150, 150]; // Gray

        if (userAnsIdx !== undefined) {
            if (userAnsIdx === correctAnsIdx) {
                statusText = "CORRECT";
                statusColor = [34, 197, 94]; // Green
            } else {
                statusText = "WRONG";
                statusColor = [239, 68, 68]; // Red
            }
        }

        doc.setFillColor(...statusColor);
        doc.rect(20, y, 20, 6, 'F'); // Status badge bg
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.text(statusText, 30, y + 4, { align: 'center' });

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(9);

        doc.text(`Correct Answer: ${correctText}`, 45, y + 4);
        y += 8;
        if (userAnsIdx !== undefined && userAnsIdx !== correctAnsIdx) {
            doc.setTextColor(220, 38, 38); // Red text for wrong
            doc.text(`Your Answer: ${userText}`, 45, y);
            y += 6;
        }

        // Separator
        doc.setDrawColor(230, 230, 230);
        doc.line(20, y + 2, 190, y + 2);
        y += 10;
    });

    doc.save("StatePrep-Detailed-Report.pdf");
};
