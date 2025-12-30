import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '../lib/supabase';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setStatus('success');
            setMessage('If an account exists for this email, you will receive a password reset link shortly.');

        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(error.message || 'Failed to send reset email.');
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
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur-md shadow-lg shadow-indigo-500/10">
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
                        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Reset Password</h1>
                        <p className="text-white/40 text-sm">Enter your email to receive recovery instructions.</p>
                    </div>

                    {status === 'success' ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-white font-bold mb-2">Check your inbox</h3>
                            <p className="text-white/50 text-sm mb-6">{message}</p>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-emerald-400 text-sm font-bold hover:text-emerald-300 transition-colors"
                            >
                                Back to Sign In
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
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-white/40 group-focus-within/input:text-indigo-300 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-black/30 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                        placeholder="founder@startup.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={status === 'loading'}
                                    />
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
                                        Send Reset Link <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <Link to="/login" className="text-white/40 hover:text-white text-sm transition-colors">
                            Remember your password? Log in
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
