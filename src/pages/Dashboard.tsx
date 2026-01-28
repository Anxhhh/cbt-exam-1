import React, { Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Start from '../Start';
import ThreeBackground from '../ThreeBackground';
import { Toaster } from 'sonner';
import { useUser } from "@clerk/clerk-react";

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUser();

    const handleStart = (name, testId) => {
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
            </Suspense>
            <Toaster theme="dark" position="top-center" />
        </>
    );
}
