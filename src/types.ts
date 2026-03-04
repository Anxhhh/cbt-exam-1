export interface Question {
    id: string;
    question: string;
    options: string[];
    answer: number;
    section: string;
}

export interface ExamData {
    id: string;
    type: string;
    questions: Question[];
}

export interface AnswersState {
    [key: string]: number; // questionId -> selectedOptionIndex
}

export interface ResultProps {
    exam: ExamData;
    answers: AnswersState;
    timeTaken: number;
    onRetake: () => void;
    onReview?: () => void;
    candidateName: string;
    userPhoto?: string;
}

export interface ResumeData {
    candidateName: string;
    timeRemaining: number;
    submitted: boolean;
    answers: AnswersState;
    marked: { [key: string]: boolean };
}

export interface MarkedState {
    [key: string]: boolean;
}

export interface ExamProps {
    data: ExamData;
    answers: AnswersState;
    marked: MarkedState;
    setAnswers: React.Dispatch<React.SetStateAction<AnswersState>>;
    setMarked: React.Dispatch<React.SetStateAction<MarkedState>>;
    onSubmit: (timeTaken: number) => void;
    candidateName: string;
    userPhoto?: string;
    onBackToStart: () => void;
    onClearSession: () => void;
    reviewMode?: boolean;
}
