import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, SignUpButton } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-transparent border-none transition-all duration-300">
            <div className="flex items-center gap-4">
                {/* Branding removed as per request */}
            </div>

            <div className="flex items-center gap-4">
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="px-4 py-2 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 hover:border-white/20">
                            Login
                        </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
                            Sign Up
                        </button>
                    </SignUpButton>
                </SignedOut>

                {/* UserButton removed as it is now in the Candidate Portal */}
            </div>
        </header>
    );
}
