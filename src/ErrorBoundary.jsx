import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0f1116] text-red-500 flex flex-col items-center justify-center p-8 text-center font-sans">
                    <h1 className="text-4xl font-bold mb-4">Something went wrong.</h1>
                    <div className="bg-black/20 p-4 rounded-xl border border-red-500/20 max-w-2xl overflow-auto text-left">
                        <p className="font-mono text-sm whitespace-pre-wrap">{this.state.error?.toString()}</p>
                        <hr className="my-2 border-red-500/20" />
                        <details>
                            <summary className="cursor-pointer">Stack Trace</summary>
                            <p className="font-mono text-xs mt-2 opacity-70 whitespace-pre-wrap">
                                {this.state.errorInfo?.componentStack}
                            </p>
                        </details>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
