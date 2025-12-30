import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock, ArrowRight, Loader2, AlertCircle, Sparkles, Cpu, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassButton, BlurFade } from '../components/ui/sign-up.tsx';
import HolographicCard from '../components/ui/holographic-card';

const StaticBackground = () => (
    <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15)_0%,_transparent_25%)] animate-[spin_60s_linear_infinite]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
    </div>
);

const LoginPage = () => {
    const { login, loading: authLoading, error: authError } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [localError, setLocalError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/dashboard');
        } catch (err) {
            console.error("Login failed", err);
            setLocalError(err.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30">
            <StaticBackground />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md relative z-10"
            >
                {/* Brand */}
                <BlurFade delay={0.1}>
                    <div className="flex justify-center mb-10">
                        <div
                            className="flex items-center gap-3 px-5 py-2.5 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl cursor-pointer group hover:border-indigo-500/50 transition-all shadow-lg shadow-indigo-500/10"
                            onClick={() => navigate('/')}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="relative bg-gradient-to-br from-indigo-500 to-violet-600 p-1.5 rounded-lg text-white">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white">Cashly</span>
                        </div>
                    </div>
                </BlurFade>

                {/* Card */}
                <BlurFade delay={0.2}>
                    <HolographicCard className="p-0 border-0 bg-transparent shadow-2xl">
                        <div className="p-10 bg-white/5 backdrop-blur-2xl rounded-[20px] h-full w-full border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <div className="text-center mb-10">
                                <h1 className="text-4xl font-bold mb-3 tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">Welcome Back</h1>
                                <p className="text-white/60 text-sm font-medium uppercase tracking-[0.2em]">Sign in to your account</p>
                            </div>

                            {(localError || authError) && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 mb-8 flex items-center gap-3 text-rose-400 text-sm"
                                >
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <span>{localError || 'Authentication failed. Please verify your credentials.'}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Email Address</label>
                                    </div>
                                    <div className="relative group/input">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within/input:text-indigo-300 transition-colors" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-black/30 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                            placeholder="name@company.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Password</label>
                                        <Link to="/forgot-password" weights="medium" className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300/60 hover:text-indigo-300 transition-colors">Forgot Password?</Link>
                                    </div>
                                    <div className="relative group/input">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within/input:text-indigo-300 transition-colors" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-black/30 focus:ring-1 focus:ring-indigo-500/50 transition-all font-sans"
                                            placeholder="••••••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                                <GlassButton
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-[0_0_40px_-5px_rgba(99,102,241,0.3)] transition-all active:scale-[0.98] mt-4"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Syncing...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-3">
                                            Sign In <ArrowRight className="w-5 h-5" />
                                        </div>
                                    )}
                                </GlassButton>
                            </form>

                            <div className="mt-10 pt-8 border-t border-white/5 text-center">
                                <p className="text-white/30 text-xs font-medium tracking-wide">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-white hover:text-indigo-400 font-bold transition-all underline underline-offset-4 decoration-indigo-500/30">
                                        Create one
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </HolographicCard>
                </BlurFade>

                <BlurFade delay={0.4}>
                    <div className="flex items-center justify-center gap-4 mt-8 opacity-20">
                        <div className="flex items-center gap-1 text-[10px] font-mono"><Cpu className="w-3 h-3" /> SECURE_LOGIN</div>
                        <div className="h-1 w-1 rounded-full bg-white/50" />
                        <div className="flex items-center gap-1 text-[10px] font-mono"><Sparkles className="w-3 h-3" /> ENCRYPTED</div>
                    </div>
                </BlurFade>
            </motion.div>
        </div>
    );
};

export default LoginPage;
