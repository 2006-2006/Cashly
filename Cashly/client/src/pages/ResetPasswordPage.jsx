import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Lock, ArrowRight, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '../lib/supabase';

const ResetPasswordPage = () => {
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [sessionEvent, setSessionEvent] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSessionEvent(event);
            if (event === 'PASSWORD_RECOVERY') {
                // User is ready to update password
            }
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage("Password must be at least 6 characters");
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            setStatus('success');
            setMessage('Your password has been reset successfully.');

            // Auto redirect after delay
            setTimeout(() => navigate('/login'), 1000);

        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(error.message || 'Failed to reset password.');
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Ambient Background */}
            <div className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px]" />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                {/* Brand */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                        <div className="bg-indigo-500 rounded p-1">
                            <TrendingUp className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-sm tracking-wide">Cashly</span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white/5 border border-white/10 rounded-[20px] p-8 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">New Password</h1>
                        <p className="text-white/40 text-sm">Secure your account with a strong password.</p>
                    </div>

                    {status === 'success' ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-white font-bold mb-2">Password Reset!</h3>
                            <p className="text-white/50 text-sm mb-6">Redirecting you to login in a moment...</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-3 rounded-xl transition-all"
                            >
                                Sign In Now
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {status === 'error' && (
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex items-center gap-3 text-rose-400 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{message}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">New Password</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-white/30 group-focus-within/input:text-indigo-400 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-black/30 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={status === 'loading'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus:outline-none z-10 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Confirm New Password</label>
                                <div className="relative group/input">
                                    <CheckCircle className="absolute left-4 top-3.5 w-4 h-4 text-white/30 group-focus-within/input:text-indigo-400 transition-colors" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-black/30 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={status === 'loading'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors focus:outline-none z-10 cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className={cn(
                                    "w-full bg-white text-black font-bold py-3.5 rounded-xl mt-6 flex items-center justify-center gap-2 hover:bg-white/90 transition-all active:scale-[0.98]",
                                    status === 'loading' && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                {status === 'loading' ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Reset Password <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPasswordPage;
