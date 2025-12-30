import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, AlertTriangle, ShieldCheck, Info, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this exists, if not, standard template literals work too

const HealthScore = ({ score = 0, status = 'Healthy', insights = [], components = {}, isExpanded, onToggle }) => {

    // Determine color scheme based on score
    const getColor = (s) => {
        if (s === 0) return { primary: '#64748b', secondary: '#475569', bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-400' };
        if (s >= 80) return { primary: '#10b981', secondary: '#059669', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' };
        if (s >= 50) return { primary: '#f59e0b', secondary: '#d97706', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' };
        return { primary: '#ef4444', secondary: '#b91c1c', bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' };
    };

    const theme = getColor(score);
    const circumference = 2 * Math.PI * 40; // reduced radius slightly for better padding
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <motion.div
            layout
            onClick={onToggle}
            className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-500 ease-out border backdrop-blur-xl group",
                isExpanded
                    ? `col-span-2 row-span-2 bg-[#0A0A0B]/90 ${theme.border} shadow-[0_0_50px_-10px] shadow-${theme.primary}/20 z-20`
                    : "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10"
            )}
            style={{ borderRadius: '1.5rem' }} // rounded-2xl
        >
            {/* Background Gradient Pulse */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-1000 bg-gradient-to-br from-${theme.primary} to-transparent`} />

            <div className="relative p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.text}`}>
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <span className={`text-sm font-medium ${isExpanded ? theme.text : 'text-white/60'}`}>Health Score</span>
                            {isExpanded && <p className="text-[10px] text-white/40 uppercase tracking-wider">AI Calculated</p>}
                        </div>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${theme.bg} ${theme.border} ${theme.text}`}>
                        {score >= 80 ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {status}
                    </div>
                </div>

                {/* Gauge & Value Area */}
                <div className="flex-1 flex flex-col items-center justify-center py-2">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        {/* Glowing Background Ring */}
                        <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 bg-${theme.primary}`} />

                        <svg className="w-full h-full transform -rotate-90">
                            {/* Track */}
                            <circle
                                cx="50%"
                                cy="50%"
                                r="40"
                                fill="none"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                            {/* Progress Indicator */}
                            <motion.circle
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                cx="50%"
                                cy="50%"
                                r="40"
                                fill="none"
                                stroke={theme.primary}
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                            />
                        </svg>

                        {/* Center Value */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-4xl font-black text-white tracking-tighter"
                            >
                                {score}
                            </motion.span>
                            <span className="text-xs text-white/40 font-medium">/ 100</span>
                        </div>
                    </div>

                    {!isExpanded && (
                        <p className="mt-4 text-xs text-white/30 font-medium tracking-wide uppercase group-hover:text-white/50 transition-colors">
                            Click to analyze
                        </p>
                    )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 grid grid-cols-2 gap-3"
                    >
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[10px] text-white/40 uppercase mb-1">Cash Runway</p>
                            <p className="text-white font-bold text-sm flex items-center gap-1.5">
                                <span className={components.cashRunway > 30 ? "text-emerald-400" : "text-amber-400"}>
                                    {components.cashRunway > 100 ? '99+' : components.cashRunway} days
                                </span>
                            </p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <p className="text-[10px] text-white/40 uppercase mb-1">Volatility</p>
                            <p className="text-white font-bold text-sm">
                                {components.volatility || 0}% <span className="text-xs font-normal text-white/30">variance</span>
                            </p>
                        </div>

                        {/* Analysis List */}
                        <div className="col-span-2 mt-2 p-3 bg-[#111113] rounded-xl border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                <Activity className="w-12 h-12" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                                <span className="text-xs font-bold text-indigo-300">AI Intelligence Report</span>
                            </div>
                            <ul className="space-y-2 relative z-10">
                                {insights && insights.length > 0 ? insights.map((insight, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                        className="text-xs text-white/70 pl-2 border-l-2 border-indigo-500/30 leading-relaxed font-medium"
                                    >
                                        {insight}
                                    </motion.li>
                                )) : (
                                    <li className="text-xs text-white/40 italic">
                                        {score === 0 ? "No financial transaction history found." : "Analyzing deep patterns..."}
                                    </li>
                                )}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Disclaimer for Accuracy */}
            {isExpanded && (
                <div className="px-6 pb-4">
                    <p className="text-[9px] text-white/20 text-center leading-tight">
                        * Health score is a predictive metric based on current liquidity, burn rate, and historical variances.
                        Always verify with bank statements.
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default HealthScore;
