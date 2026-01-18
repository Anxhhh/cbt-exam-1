import { Coffee, BookOpen, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function BuyMeCoffeeBtn({ screen = 'start', score = 0 }) {
    const [showTooltip, setShowTooltip] = useState(false);

    // Dynamic Tooltip Content based on context
    const getTooltipContent = () => {
        if (screen === 'result') {
            if (score > 0 && score < 60) {
                return {
                    title: "📉 Improve your score fast!",
                    subtitle: "This PDF covers 90% of these topics."
                };
            } else if (score >= 60) {
                return {
                    title: "🚀 Target 100% next time?",
                    subtitle: "Master the advanced section with this E-Book."
                };
            }
        }
        // Default / Start Screen
        return {
            title: "🔥 80% Questions came from this PDF!",
            subtitle: "Don't miss out on the best resource."
        };
    };

    const content = getTooltipContent();

    // Auto-show tooltip with smart delay & persistence
    useEffect(() => {
        // Don't show if user already dismissed it this session
        if (sessionStorage.getItem('hpgk_ad_dismissed')) return;

        // Wait longer on result screen so user focuses on their score first
        const delay = screen === 'result' ? 4000 : 2500;

        const timer = setTimeout(() => setShowTooltip(true), delay);
        return () => clearTimeout(timer);
    }, [screen]);

    const handleDismiss = (e) => {
        e.stopPropagation(); // Prevent ensuring clicks don't bubble
        setShowTooltip(false);
        sessionStorage.setItem('hpgk_ad_dismissed', 'true');
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 sm:gap-4 pointer-events-none">
            {/* Pointer events none on container so it doesn't block clicks, but auto on children */}

            {/* E-Book Button with Tooltip */}
            <div className="relative flex flex-col items-end pointer-events-auto max-w-[90vw] sm:max-w-auto">
                <AnimatePresence>
                    {showTooltip && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, x: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white text-slate-900 px-3 py-2.5 rounded-xl rounded-br-none shadow-xl mb-2 mr-1 max-w-[200px] sm:max-w-[240px] relative z-50 border border-slate-100 flex gap-2 items-start"
                        >
                            <div className='space-y-0.5'>
                                <p className="text-[10px] sm:text-xs font-bold text-slate-800 leading-tight">{content.title}</p>
                                <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium leading-tight">{content.subtitle}</p>
                            </div>
                            <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 p-0.5">
                                <X className="w-3 h-3" />
                            </button>
                            <div className="absolute -bottom-[5px] right-4 w-2.5 h-2.5 bg-white border-b border-r border-slate-100 transform rotate-45"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.a
                    href="https://matlotia.gumroad.com/l/klofb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative touch-manipulation"
                    initial={{ scale: 0, x: 20 }}
                    animate={{ scale: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
                >
                    {/* Pulsing Backing Layer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-600 rounded-xl blur opacity-30 group-hover:opacity-60 animate-pulse transition-opacity duration-500" />

                    <div
                        className="relative flex items-center gap-3 bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-[0_8px_30px_-8px_rgba(225,29,72,0.5)] border-t border-white/20 overflow-hidden"
                    >
                        {/* Continuous Shimmer Effect */}
                        <motion.div
                            className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-30deg]"
                            animate={{ x: [-100, 300] }}
                            transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 4, ease: "easeInOut" }}
                        />

                        <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm shadow-inner shrink-0 leading-none">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white/20" />
                        </div>

                        <div className="flex flex-col">
                            <span className="font-black text-xs sm:text-sm tracking-wide flex items-center gap-1.5 shadow-black drop-shadow-sm leading-tight">
                                ULTIMATE HPGK
                                <span className="hidden sm:inline">E-BOOK</span>
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] sm:text-[10px] font-bold bg-black/20 px-1 py-px rounded text-white/90 line-through decoration-rose-300/80">₹499</span>
                                <span className="text-[10px] sm:text-xs font-extrabold bg-white text-rose-600 px-1.5 py-px rounded shadow-sm">₹99 ONLY</span>
                            </div>
                        </div>

                        {/* Arrow Icon - Hidden on very small screens to save space */}
                        <motion.div
                            className="pl-1 opacity-60 hidden xs:block"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                        </motion.div>
                    </div>
                </motion.a>
            </div>

            {/* Subtle Coffee Button - Compact */}
            <motion.a
                href="https://buymeacoffee.com/anshmatlotla"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative pointer-events-auto opacity-70 hover:opacity-100 transition-opacity"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
            >
                <div className="relative bg-[#FFDD00]/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg border border-[#f0d000]">
                    <Coffee className="w-4 h-4 text-black/80" />
                </div>
                <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 bg-white/95 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none transform translate-x-1 group-hover:translate-x-0 transition-transform">
                    Buy coffee
                </span>
            </motion.a>
        </div>
    );
}
