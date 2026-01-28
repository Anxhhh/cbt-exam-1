import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ExamPage from "./pages/ExamPage";
import { SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Redirect root to dashboard, which is protected */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/exam/:id" element={<ExamPage />} />
                </Route>

                {/* Fallback for unknown routes */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
