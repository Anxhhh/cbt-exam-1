import { Coffee, BookOpen, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function BuyMeCoffeeBtn({ screen = 'start', score = 0 }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [showTooltip, setShowTooltip] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            // Collapse when scrolled down > 100px
            setIsScrolled(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Dismiss tooltip after 8 seconds automatically
    useEffect(() => {
        const t = setTimeout(() => setShowTooltip(false), 8000);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-row items-end gap-3 sm:gap-4 pointer-events-none">
            {/* Pointer events none on container so it doesn't block clicks, but auto on children */}

            {/* === LEFT: E-BOOK BUTTON === */}
            <div className="relative flex flex-col items-end pointer-events-auto max-w-[90vw] sm:max-w-auto">
                {/* Tooltip */}
                <AnimatePresence>
                    {showTooltip && !isScrolled && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="absolute bottom-full mb-3 right-0 w-48 bg-white text-slate-800 text-xs p-3 rounded-xl shadow-xl border border-slate-100 dark:bg-[#1a1c23] dark:text-slate-200 dark:border-white/10 z-50 origin-bottom-right"
                        >
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
                                    className="absolute -top-1 -right-1 p-1 hover:bg-black/5 rounded-full"
                                    aria-label="Close Tooltip"
                                >
                                    <X className="w-3 h-3 text-slate-400" />
                                </button>
                                <p className="font-bold mb-1 flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                    <Sparkles className="w-3 h-3" /> Patwari Exam Special
                                </p>
                                <p className="leading-relaxed opacity-90">
                                    Get the ultimate preparation guide. <span className="font-bold text-rose-500">80% OFF</span> today!
                                </p>
                                <div className="absolute -bottom-[18px] right-6 w-3 h-3 bg-white dark:bg-[#1a1c23] border-b border-r border-slate-100 dark:border-white/10 rotate-45" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.a
                    href="https://matlotia.gumroad.com/l/klofb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative touch-manipulation block"
                    aria-label="Get Ultimate HPGK E-Book"
                    initial={{ scale: 0, x: 20 }}
                    animate={{ scale: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.5 }}
                >
                    {/* Collapsed State (Mobile Scroll) */}
                    <div className={isScrolled ? "block sm:hidden" : "hidden"}>
                        <div className="relative bg-gradient-to-r from-orange-500 to-rose-600 p-3 rounded-full shadow-lg border-2 border-white/20">
                            <BookOpen className="w-5 h-5 text-white" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
                        </div>
                    </div>

                    {/* Full State (Desktop or Mobile Top) */}
                    <div className={!isScrolled ? "block" : "hidden sm:block"}>
                        {/* Pulsing Backing */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-600 rounded-xl blur opacity-30 group-hover:opacity-60 animate-pulse transition-opacity duration-500" />

                        <div className="relative flex items-center gap-2.5 bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-[0_8px_30px_-8px_rgba(225,29,72,0.5)] border-t border-white/20 overflow-hidden">
                            {/* Shimmer */}
                            <motion.div
                                className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-30deg]"
                                animate={{ x: [-100, 300] }}
                                transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 4, ease: "easeInOut" }}
                            />

                            <div className="bg-white/20 p-1 rounded-lg backdrop-blur-sm shadow-inner shrink-0 leading-none">
                                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white/20" />
                            </div>

                            <div className="flex flex-col">
                                <span className="font-black text-[10px] sm:text-xs tracking-wide flex items-center gap-1.5 shadow-black drop-shadow-sm leading-tight">
                                    ULTIMATE HPGK
                                    <span className="hidden sm:inline">E-BOOK</span>
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[8px] sm:text-[9px] font-bold bg-black/20 px-1 py-px rounded text-white/90 line-through decoration-rose-300/80">₹499</span>
                                    <span className="text-[9px] sm:text-[10px] font-extrabold bg-white text-rose-600 px-1.5 py-px rounded shadow-sm">₹99 ONLY</span>
                                </div>
                            </div>

                            <motion.div className="pl-1 opacity-60 hidden xs:block">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                            </motion.div>
                        </div>
                    </div>
                </motion.a>
            </div>
        </div>
    );
}
