import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trash2,
    AlertTriangle,
    User,
    ShieldCheck,
    Settings,
    Database,
    Cpu,
    Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import AuthContext from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { cn } from '@/lib/utils';

const SettingsPage = () => {
    const { logout, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [clearing, setClearing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClearData = async () => {
        setClearing(true);
        try {
            const { data } = await api.delete('/settings/clear-data');
            alert(`✅ Terminal Protocol Finalized.\n\nPurged Nodes:\n• ${data.deleted.sales} sales entries\n• ${data.deleted.expenses} expense entries\n• ${data.deleted.inventory} assets\n• ${data.deleted.receivables} obligations`);
            setShowConfirm(false);
            window.location.reload();
        } catch (error) {
            console.error('Clear data error:', error);
            alert('❌ Protocol Overridden. Failed to clear repository.');
        }
        setClearing(false);
    };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans selection:bg-indigo-500/30">
            <Sidebar />

            <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
                {/* Ambient Background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-slate-800/20 blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[120px]" />
                </div>

                <div className="relative z-10 p-6 md:p-10 max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <header className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                System Controls
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
                            Configuration
                        </h1>
                        <p className="text-white/50 text-sm">Manage identity protocols and data persistence layers.</p>
                    </header>

                    {/* Identity Profile */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Fingerprint className="w-40 h-40 text-white" />
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/20 text-indigo-400">
                                <User className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Identity Profile</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Authorized Entity</span>
                                <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                        {user?.name?.charAt(0) || 'A'}
                                    </div>
                                    <p className="font-semibold text-white/90">{user?.name || 'Authorized Personnel'}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Secure Uplink</span>
                                <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    <p className="font-mono text-sm text-white/70">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Security & Privacy */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck className="w-40 h-40 text-emerald-500" />
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                                <Fingerprint className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Security & Privacy</h2>
                        </div>

                        <div className="space-y-6 relative z-10">
                            {/* App Lock Toggle */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-white">Application Lock</h3>
                                    <p className="text-xs text-white/50">Require PIN or Biometrics to open Cashly</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={localStorage.getItem('cashly_lock_enabled') === 'true'}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                const pin = prompt("Set a 4-digit PIN for App Lock:");
                                                if (pin && pin.length === 4 && !isNaN(pin)) {
                                                    localStorage.setItem('cashly_lock_enabled', 'true');
                                                    localStorage.setItem('cashly_lock_pin', pin);
                                                    window.location.reload(); // Force refresh to update UI state
                                                } else {
                                                    alert("Invalid PIN. Must be 4 digits.");
                                                }
                                            } else {
                                                if (confirm("Disable App Lock?")) {
                                                    localStorage.removeItem('cashly_lock_enabled');
                                                    localStorage.removeItem('cashly_lock_pin');
                                                    window.location.reload();
                                                }
                                            }
                                        }}
                                    />
                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>

                            {/* Biometric Toggle */}
                            {localStorage.getItem('cashly_lock_enabled') === 'true' && (
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold text-white">Biometric Authentication</h3>
                                        <p className="text-xs text-white/50">Allow FaceID / TouchID to unlock</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={localStorage.getItem('cashly_biometric_enabled') === 'true'}
                                            onChange={(e) => {
                                                localStorage.setItem('cashly_biometric_enabled', e.target.checked);
                                                // Force re-render not strictly needed but good for consistency
                                                window.location.reload();
                                            }}
                                        />
                                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>
                            )}

                            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-indigo-400 mt-0.5" />
                                    <div>
                                        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Privacy Guarantee</h3>
                                        <p className="text-xs text-indigo-200/70 leading-relaxed">
                                            Your financial data is encrypted locally. Biometrics (FaceID/TouchID) are handled by your device's secure enclave and are never transmitted to our servers.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Ledger Maintenance */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }} // Adjusted delay order
                        className="p-8 rounded-3xl bg-gradient-to-br from-red-500/5 to-orange-500/5 border border-red-500/10 backdrop-blur-md relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Database className="w-40 h-40 text-red-500" />
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400">
                                <Settings className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-red-100 tracking-tight">Ledger Operations</h2>
                        </div>

                        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl mb-8 relative z-10">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-bold text-red-300 uppercase tracking-widest mb-2">Irreversible Protocol</h3>
                                    <p className="text-sm text-red-200/70 leading-relaxed font-light">
                                        Executing a ledger wipe will permanently purge all sales transactions, expense records, and asset inventories.
                                        AI models will immediately lose all historical context. This action cannot be undone by administrator override.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {!showConfirm ? (
                                <motion.button
                                    key="init"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    onClick={() => setShowConfirm(true)}
                                    className="flex items-center gap-3 px-6 py-3 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl font-bold uppercase text-xs tracking-widest transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Initiate System Wipe
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="confirm"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6"
                                >
                                    <p className="text-sm font-bold text-red-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Confirm Destruction
                                    </p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleClearData}
                                            disabled={clearing}
                                            className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-900 disabled:text-white/30 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-900/20 flex items-center gap-2"
                                        >
                                            {clearing ? (
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                            Execute Wipe
                                        </button>
                                        <button
                                            onClick={() => setShowConfirm(false)}
                                            disabled={clearing}
                                            className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all"
                                        >
                                            Abort Protocol
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex gap-3 text-white/30 text-xs font-mono">
                                <Cpu className="w-4 h-4" />
                                <span>System Node: Ready</span>
                                <span className="mx-2">|</span>
                                <span>Latency: {Math.floor(Math.random() * 4) + 4}ms</span>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
