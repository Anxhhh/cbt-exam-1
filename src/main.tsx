import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import ErrorBoundary from "./ErrorBoundary";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const root = ReactDOM.createRoot(document.getElementById("root")!);

if (!PUBLISHABLE_KEY) {
    console.error("Missing Clerk Publishable Key");
    // Graceful fallback UI as requested
    root.render(
        <React.StrictMode>
            <div className="min-h-screen flex items-center justify-center bg-[#0f1116] text-slate-300 font-sans p-6">
                <div className="max-w-md w-full bg-[#1a1c23] border border-red-500/20 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-white">Missing Configuration</h1>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        The application cannot start because the <code className="bg-white/10 px-1.5 py-0.5 rounded text-red-400">VITE_CLERK_PUBLISHABLE_KEY</code> is missing from the environment variables.
                    </p>
                    <p className="text-xs text-slate-500 mt-4">
                        If you just added the <code className="text-slate-400">.env</code> file, please <b>restart your development server</b>.
                    </p>
                </div>
            </div>
        </React.StrictMode>
    );
} else {
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <ClerkProvider
                    publishableKey={PUBLISHABLE_KEY}
                    afterSignOutUrl="/"
                    appearance={{
                        variables: {
                            colorPrimary: '#3b82f6', // bright blue
                            colorText: '#f8fafc',
                            colorBackground: '#0b0f19', // Darker background
                            colorInputBackground: '#1a1c23',
                            colorInputText: '#fff',
                            colorTextSecondary: '#94a3b8',
                        },
                        elements: {
                            rootBox: "w-full",
                            card: "bg-[#0b0f19]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] rounded-2xl",
                            headerTitle: "text-white font-bold text-xl",
                            headerSubtitle: "text-slate-400",
                            socialButtonsBlockButton: "text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-xl",
                            socialButtonsBlockButtonText: "text-white font-medium",
                            dividerLine: "bg-white/10",
                            dividerText: "text-slate-500",
                            formFieldInput: "bg-[#1a1c23] border border-white/10 text-white rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all",
                            formFieldLabel: "text-slate-400 text-xs uppercase tracking-wider font-bold",
                            formButtonPrimary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-none shadow-lg shadow-blue-500/20 rounded-xl py-3",
                            footerActionLink: "text-blue-400 hover:text-blue-300 font-medium",
                            identityPreviewText: "text-slate-300",
                            identityPreviewEditButtonIcon: "text-slate-400"
                        }
                    }}
                >
                    <App />
                </ClerkProvider>
            </ErrorBoundary>
        </React.StrictMode>
    );
}
