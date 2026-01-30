import { BookOpen, ChevronRight, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface BuyMeCoffeeBtnProps {
    screen?: 'start' | 'result';
    score?: number;
    targetRef?: React.RefObject<HTMLDivElement>;
}

export default function BuyMeCoffeeBtn({ screen = 'start', score = 0, targetRef }: BuyMeCoffeeBtnProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);

    useEffect(() => {
        const target = targetRef?.current || window;
        const handleScroll = () => {
            const scrollTop = target instanceof Window ? target.scrollY : (target as HTMLElement).scrollTop;
            setIsScrolled(scrollTop > 100);
        };

        target.addEventListener('scroll', handleScroll);
        // Initial check
        handleScroll();

        return () => target.removeEventListener('scroll', handleScroll);
    }, [targetRef]); // Re-run if ref changes (though usually stable)

    const isCollapsed = isScrolled || isManuallyCollapsed;

    return (
        <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 z-50 flex flex-row items-end gap-3 sm:gap-4 pointer-events-none font-sans">
            <div className="relative flex flex-col items-end pointer-events-auto max-w-[90vw] sm:max-w-auto">
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
                    {/* Collapsed State */}
                    <div className={isCollapsed ? "block sm:hidden" : "hidden"}>
                        <div className="relative bg-blue-600 p-2.5 rounded-full shadow-lg border border-blue-400 shadow-blue-500/40">
                            <BookOpen className="w-4 h-4 text-white" />
                            <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                        </div>
                    </div>

                    {/* Full State */}
                    <div className={!isCollapsed ? "block" : "hidden sm:block"}>
                        {/* Glow */}
                        <div className="absolute inset-0 bg-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-40 animate-pulse transition-opacity duration-500" />

                        <div className="relative flex items-center gap-2.5 bg-[#0f172a] border border-blue-500/30 hover:border-blue-400/50 text-white px-3 py-2 rounded-xl shadow-xl overflow-hidden transition-all">
                            {/* Collapse Button (Mobile Only) */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsManuallyCollapsed(true);
                                }}
                                className="absolute top-0 right-0 p-1.5 opacity-50 hover:opacity-100 sm:hidden z-20"
                            >
                                <Minimize2 className="w-3 h-3 text-slate-400" />
                            </button>

                            {/* Shimmer */}
                            <motion.div
                                className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent skew-x-[-30deg]"
                                animate={{ x: [-100, 300] }}
                                transition={{ repeat: Infinity, duration: 3, repeatDelay: 2, ease: "easeInOut" }}
                            />

                            <div className="bg-blue-600/20 p-1.5 rounded-lg border border-blue-500/20 text-cyan-400">
                                <BookOpen className="w-4 h-4" />
                            </div>

                            <div className="flex flex-col pr-4 sm:pr-0">
                                <span className="font-bold text-[11px] tracking-wide text-slate-200 leading-tight">
                                    Ultimate HP GK E-Book
                                </span>
                                <span className="font-extrabold text-[9px] text-cyan-400 tracking-wider flex items-center gap-2 leading-tight">
                                    Concise & Updated Notes!
                                </span>
                            </div>

                            <div className="pl-1.5 border-l border-white/10 flex flex-col items-end gap-0">
                                <span className="text-[8px] text-slate-500 line-through decoration-slate-500 leading-none">₹499</span>
                                <div className="flex items-center gap-0.5 bg-cyan-500/10 px-1 py-px rounded border border-cyan-500/20 mt-0.5">
                                    <span className="text-[9px] font-bold text-cyan-300">₹99</span>
                                    <ChevronRight className="w-2.5 h-2.5 text-cyan-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.a>
            </div>
        </div>
    );
}
