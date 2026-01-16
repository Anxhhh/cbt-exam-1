import { Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BuyMeCoffeeBtn() {
    return (
        <motion.a
            href="https://buymeacoffee.com/anshmatlotla"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 group"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
        >
            {/* Animated Glow Ref */}
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-40 group-hover:opacity-75 transition-opacity duration-500 animate-pulse" />

            <motion.div
                className="relative flex items-center gap-3 bg-[#FFDD00] text-black px-5 py-3 rounded-full shadow-2xl border-2 border-[#FFDD00] group-hover:bg-[#ffea00] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="relative">
                    <Coffee className="w-5 h-5 fill-black/20 stroke-black stroke-2" />
                    <motion.div
                        className="absolute -top-3 -right-2 text-xs"
                        animate={{ y: [0, -4, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    >
                        ☕
                    </motion.div>
                </div>
                <span className="font-bold text-sm tracking-wide hidden sm:block">Buy me a coffee</span>
            </motion.div>
        </motion.a>
    );
}
