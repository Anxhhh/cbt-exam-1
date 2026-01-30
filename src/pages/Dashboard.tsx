import React, { Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Start from '../Start';
import ThreeBackground from '../ThreeBackground';
import { Toaster } from 'sonner';
import { useUser } from "@clerk/clerk-react";
import { Trash2, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUser();

    const handleStart = (name: string, testId: string) => {
        navigate(`/exam/${testId}`, { state: { name } });
    };

    return (
        <>
            <ThreeBackground intensity={1} />
            <Suspense fallback={<div className="min-h-screen bg-[#0b0f19]" />}>
                <Start
                    onStart={handleStart}
                    isRetake={location.state?.retake || false}
                    user={user}
                />
                <button
                    onClick={() => {
                        // eslint-disable-next-line no-restricted-globals
                        if (confirm("Are you sure you want to reset all progress? This action cannot be undone.")) {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-[calc(1rem+env(safe-area-inset-left))] p-3 md:p-2.5 rounded-full bg-black/20 hover:bg-red-900/40 backdrop-blur-md border border-white/5 hover:border-red-500/30 text-slate-500 hover:text-red-200 transition-all duration-300 z-50 group flex items-center justify-center gap-2 shadow-lg hover:shadow-red-900/20"
                    title="Reset Application Data"
                    aria-label="Reset Data"
                >
                    <Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100">
                        Reset Data
                    </span>
                </button>
            </Suspense>
            <Toaster theme="dark" position="top-center" />
        </>
    );
}
