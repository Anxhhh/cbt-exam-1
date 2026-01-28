import React from "react";
import { useAuth, RedirectToSignIn } from "@clerk/clerk-react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../layout/Navbar";
import { Toaster } from 'sonner';

export default function ProtectedRoute() {
    const { isLoaded, isSignedIn } = useAuth();
    const location = useLocation();
    const isExamPage = location.pathname.startsWith('/exam');

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
                {/* Custom Skeleton equivalent to Loading State */}
                <div className="space-y-4 flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <div className="text-slate-500 text-sm animate-pulse">Initializing Security...</div>
                </div>
            </div>
        );
    }

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    return (
        <>
            {!isExamPage && <Navbar />}
            <main className={!isExamPage ? "pt-16 min-h-screen bg-[#0f1116]" : "min-h-screen bg-[#0f1116]"}>
                <Outlet />
            </main>
            <Toaster
                theme="dark"
                position="top-center"
                toastOptions={{
                    style: { background: '#1a1c23', border: '1px solid #334155', color: '#e2e8f0' },
                }}
            />
        </>
    );
}
