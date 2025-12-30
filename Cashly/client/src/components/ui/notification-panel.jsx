import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function NotificationPanel({ isOpen, onClose, notifications = [] }) {
    const [readIds, setReadIds] = useState([]);

    const handleMarkAsRead = (id) => {
        setReadIds(prev => [...prev, id]);
    };

    const handleMarkAllRead = () => {
        setReadIds(notifications.map((_, i) => i));
    };

    // Filter out read notifications if desired, or just dim them
    // For now, let's keep them but dim them

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-transparent" // Transparent backdrop to close on click outside
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-16 right-4 md:right-8 z-50 w-full max-w-sm md:max-w-md bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Bell className="w-5 h-5 text-indigo-400" />
                                    {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
                                </div>
                                <h3 className="font-semibold text-white">Notifications</h3>
                                <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">{notifications.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleMarkAllRead}
                                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    title="Mark all as read"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 scrollbar-none">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-white/30">
                                    <Bell className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="text-sm">No new notifications</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {notifications.map((n, idx) => {
                                        const isRead = readIds.includes(idx);
                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={cn(
                                                    "p-4 rounded-xl border transition-all relative group",
                                                    n.severity === 'danger'
                                                        ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
                                                        : "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20",
                                                    isRead && "opacity-50 grayscale-[0.5]"
                                                )}
                                            >
                                                {!isRead && (
                                                    <span className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
                                                )}

                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "p-2 rounded-lg h-fit",
                                                        n.severity === 'danger' ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
                                                    )}>
                                                        {n.icon === '📉' ? <AlertTriangle className="w-4 h-4" /> :
                                                            n.icon === '💸' ? <AlertTriangle className="w-4 h-4" /> :
                                                                <Info className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className={cn("text-sm font-bold mb-1", n.severity === 'danger' ? "text-red-200" : "text-amber-200")}>
                                                            {n.title}
                                                        </h4>
                                                        <p className="text-xs text-white/70 leading-relaxed mb-2">
                                                            {n.message}
                                                        </p>
                                                        {n.amount && (
                                                            <div className="mb-2">
                                                                <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded text-white/90">
                                                                    Impact: ₹{n.amount.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {n.solution && (
                                                            <div className="mt-2 text-xs bg-white/5 p-2 rounded-lg border border-white/5 flex gap-2">
                                                                <Lightbulb className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                                                                <span className="text-white/60">{n.solution}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
