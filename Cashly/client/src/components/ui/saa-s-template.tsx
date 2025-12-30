import React, { forwardRef, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Menu, X, Shield, Zap, Sparkles,
    Activity, CheckCircle, Layers,
    Cpu, AlertTriangle, Clock,
    Search, Lock
} from "lucide-react";
import {
    motion, useScroll, useTransform, useSpring, useMotionValue,
    useMotionTemplate, AnimatePresence, useInView
} from "framer-motion";

// --- Utility Components ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "secondary" | "ghost" | "gradient" | "outline" | "glass";
    size?: "default" | "sm" | "lg" | "xl";
    children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "default", size = "default", className = "", children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95";

        const variants = {
            default: "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]",
            secondary: "bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800",
            ghost: "hover:bg-white/5 text-white/70 hover:text-white",
            gradient: "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-white/10 hover:shadow-[0_0_40px_rgba(99,102,241,0.7)]",
            outline: "border border-white/20 text-white hover:bg-white/5",
            glass: "bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 shadow-lg hover:border-white/20"
        };

        const sizes = {
            default: "h-10 px-5 text-sm",
            sm: "h-9 px-4 text-xs",
            lg: "h-12 px-8 text-base",
            xl: "h-14 px-10 text-lg"
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

// --- Components ---

const Ticker = () => (
    <div className="w-full bg-black border-b border-white/5 overflow-hidden py-1.5 z-50 relative">
        <div className="flex animate-marquee gap-8 whitespace-nowrap text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
            {[...Array(6)].map((_, i) => (
                <React.Fragment key={i}>
                    <span className="flex items-center gap-2 text-emerald-500"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> SYSTEM ONLINE</span>
                    <span className="text-zinc-800">///</span>
                    <span className="flex items-center gap-2">REALITY CHECK: ACTIVE</span>
                    <span className="text-zinc-800">///</span>
                    <span className="flex items-center gap-2">NO BS FORECASTING</span>
                    <span className="text-zinc-800">///</span>
                    <span className="flex items-center gap-2">DATA INTEGRITY: 100%</span>
                    <span className="text-zinc-800">///</span>
                </React.Fragment>
            ))}
        </div>
        <style>{`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-marquee {
                animation: marquee 60s linear infinite;
            }
        `}</style>
    </div>
);

const TextReveal = ({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) => {
    return (
        <span className={`inline-block ${className}`}>
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{
                        delay: delay + i * 0.05,
                        duration: 0.4,
                        type: "spring",
                        damping: 12,
                        stiffness: 100
                    }}
                    className="inline-block"
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </span>
    );
};

const Navigation = React.memo(() => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className={`fixed top-0 w-full z-40 transition-all duration-500 border-b ${scrolled ? 'bg-black/80 backdrop-blur-xl border-white/5 top-0' : 'bg-transparent border-transparent top-8'
                }`}
        >
            <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
                    <div className="relative w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-xl border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:border-indigo-500/50 transition-colors duration-500">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-500/10 to-transparent"
                        />
                        <Activity className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform duration-500 relative z-10" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight text-white leading-none">
                            CASHLY
                        </span>
                        <span className="text-[9px] font-bold tracking-[0.2em] text-zinc-500 uppercase leading-none mt-1">
                            Intelligence
                        </span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-10">
                    {['Truth', 'System', 'Science', 'Security'].map((item, i) => (
                        <motion.a
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i }}
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-xs font-medium tracking-widest text-muted-foreground hover:text-foreground transition-colors uppercase relative group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                        </motion.a>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                        Log In
                    </Button>
                    <Button variant="default" size="sm" onClick={() => navigate('/register')}>
                        Get Started
                    </Button>
                </div>

                <button
                    className="md:hidden text-foreground"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-black border-b border-white/10 overflow-hidden"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            {['Truth', 'System', 'Science'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} className="text-lg font-medium text-foreground/80" onClick={() => setMobileMenuOpen(false)}>
                                    {item}
                                </a>
                            ))}
                            <div className="h-px bg-white/10 my-2" />
                            <Button variant="secondary" className="w-full justify-center" onClick={() => navigate('/login')}>
                                Log In
                            </Button>
                            <Button variant="default" className="w-full justify-center" onClick={() => navigate('/register')}>
                                Start Now
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
});
Navigation.displayName = "Navigation";

const Hero = () => {
    const navigate = useNavigate();
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);
    // Removed opacity fade-out to keep graph visible
    const scale = useTransform(scrollY, [0, 500], [1, 0.95]);

    // Mouse parallax effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        mouseX.set((clientX - centerX) / 50);
        mouseY.set((clientY - centerY) / 50);
    };

    return (
        <section
            className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            <div className="absolute inset-0 bg-black -z-20" />

            {/* Cinematic Background with flowing movement */}
            <motion.div
                animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black/50 to-black -z-10 bg-[length:200%_200%]"
            />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />

            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary/20 rounded-full"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight
                    }}
                    animate={{
                        y: [null, Math.random() * -100],
                        opacity: [0, 0.5, 0]
                    }}
                    transition={{
                        duration: Math.random() * 5 + 5,
                        repeat: Infinity,
                        delay: Math.random() * 5
                    }}
                />
            ))}

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-8"
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-white/10 backdrop-blur-md text-[10px] font-bold tracking-[0.2em] text-indigo-400 uppercase hover:bg-white/5 transition-colors cursor-default">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            System v2.4 Live
                        </span>
                    </motion.div>

                    <h1 className="flex flex-col items-center justify-center font-bold tracking-tighter mb-8 text-white z-20">
                        <div className="block text-sm md:text-xl tracking-[0.5em] text-zinc-500 mb-2 md:mb-4 uppercase font-medium">
                            <TextReveal text="THE HONEST" delay={0.2} />
                        </div>
                        <div className="block relative text-7xl md:text-[140px] leading-[0.9] md:leading-[0.8] text-white filter drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                            <TextReveal text="TRUTH" delay={0.5} />
                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 1.2, duration: 0.8, ease: "anticipate" }}
                                className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm origin-center"
                            />
                        </div>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed"
                    >
                        Your bank balance is a liar. It doesn't know about next week's payroll or tomorrow's big bill.
                        We do. Stop guessing and start knowing <span className="text-white font-semibold">exactly</span> where you stand.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-6 mb-24"
                    >
                        <Button variant="default" size="xl" onClick={() => navigate('/register')} className="rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                            Get the Truth
                        </Button>
                        <Button variant="glass" size="xl" onClick={() => document.getElementById('science')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full">
                            See How It Works
                        </Button>
                    </motion.div>
                </div>

                <motion.div
                    style={{ y: y1, scale, x: mouseX, rotateY: mouseX, rotateX: mouseY }}
                    className="relative max-w-6xl mx-auto perspective-[2000px]"
                >
                    <div className="relative aspect-[16/9] rounded-2xl bg-[#0F0F16] border border-white/20 shadow-[0_0_50px_rgba(99,102,241,0.15)] overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-transparent to-violet-500/20" />

                        {/* Fake UI Header */}
                        <div className="absolute top-0 w-full h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2 z-20">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                            </div>
                            <div className="ml-4 h-6 w-96 bg-white/5 rounded-md flex items-center px-3 text-[10px] text-white/20 font-mono">
                                cashly://system/dashboard/predictive-view
                            </div>
                        </div>

                        {/* Content Placeholder - Abstract Representation of Dashboard */}
                        <div className="absolute inset-0 top-12 p-8 grid grid-cols-12 gap-6 z-10">
                            <div className="col-span-3 space-y-4">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className="h-32 rounded-xl bg-white/5 border border-white/5"
                                />
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1, delay: 0.7 }}
                                    className="h-24 rounded-xl bg-white/5 border border-white/5"
                                />
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1, delay: 0.9 }}
                                    className="h-64 rounded-xl bg-white/5 border border-white/5"
                                />
                            </div>
                            <div className="col-span-9 space-y-6">
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="h-16 w-full max-w-sm bg-indigo-500/10 rounded-lg border border-indigo-500/20 flex items-center px-6 justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full relative z-10" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-mono text-indigo-400 font-bold tracking-wider">SYSTEM PREDICTION</span>
                                            <span className="text-[10px] text-indigo-300/70 font-mono">LIVE DATA FEED ACTIVE</span>
                                        </div>
                                    </div>
                                    <div className="text-emerald-400 font-mono text-xs font-bold tabular-nums">
                                        +24.8%
                                    </div>
                                </motion.div>
                                <div className="h-96 rounded-xl bg-gradient-to-b from-indigo-900/10 to-transparent border border-indigo-500/10 relative overflow-hidden backdrop-blur-sm">
                                    {/* Grid Background */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

                                    {/* Scanner Line */}
                                    <motion.div
                                        animate={{ left: ["0%", "100%"] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-indigo-400 to-transparent z-10 opacity-50"
                                    >
                                        <div className="absolute top-0 w-full h-full bg-indigo-500/20 blur-sm" />
                                    </motion.div>

                                    {/* Chart Line Animation */}
                                    <svg className="absolute bottom-0 left-0 w-full h-[80%] overflow-visible" preserveAspectRatio="none">
                                        <motion.path
                                            d="M0,350 L50,340 L100,345 L150,320 L200,330 L250,290 L300,300 L350,250 L400,260 L450,200 L500,210 L550,150 L600,160 L650,120 L700,130 L750,90 L800,100 L850,60 L900,70 L950,40 L1000,50 L1050,20 L1100,30 L1150,10 L1200,0"
                                            fill="none"
                                            stroke="url(#gradient)"
                                            strokeWidth="3"
                                            filter="drop-shadow(0 0 8px rgba(99,102,241,0.6))"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 2, ease: "easeInOut", delay: 1 }}
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                                                <stop offset="50%" stopColor="#818cf8" />
                                                <stop offset="100%" stopColor="#c084fc" />
                                            </linearGradient>
                                        </defs>

                                        {/* Area under curve */}
                                        <motion.path
                                            d="M0,350 L50,340 L100,345 L150,320 L200,330 L250,290 L300,300 L350,250 L400,260 L450,200 L500,210 L550,150 L600,160 L650,120 L700,130 L750,90 L800,100 L850,60 L900,70 L950,40 L1000,50 L1050,20 L1100,30 L1150,10 L1200,0 L1200,400 L0,400 Z"
                                            fill="url(#areaGradient)"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.3 }}
                                            transition={{ delay: 2, duration: 1 }}
                                        />
                                        <defs>
                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                                                <stop offset="100%" stopColor="transparent" />
                                            </linearGradient>
                                        </defs>

                                        {/* Safety Threshold Line */}
                                        <motion.line
                                            x1="0" y1="300" x2="1200" y2="300"
                                            stroke="#ef4444"
                                            strokeWidth="1"
                                            strokeDasharray="4 4"
                                            strokeOpacity="0.5"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ delay: 1.5, duration: 2 }}
                                        />
                                        <motion.text
                                            x="20" y="290"
                                            fill="#ef4444"
                                            fontSize="10"
                                            fontFamily="monospace"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 0.7 }}
                                            transition={{ delay: 2.5 }}
                                        >
                                            SAFETY THRESHOLD ($10k)
                                        </motion.text>

                                        {/* Pulsing Data Points & Details */}
                                        {[
                                            { cx: 350, cy: 250, val: "$24.5k", label: "Invoice #902" },
                                            { cx: 750, cy: 90, val: "$82.1k", label: "Q3 Revenue" },
                                            { cx: 1050, cy: 20, val: "$114.2k", label: "Projected" }
                                        ].map((point, i) => (
                                            <g key={i}>
                                                {/* Vertical Guide */}
                                                <motion.line
                                                    x1={point.cx} y1={point.cy} x2={point.cx} y2="400"
                                                    stroke="#6366f1"
                                                    strokeWidth="1"
                                                    strokeDasharray="2 2"
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    animate={{ pathLength: 1, opacity: 0.3 }}
                                                    transition={{ delay: 2 + i * 0.5, duration: 1 }}
                                                />
                                                {/* Pulse Ring */}
                                                <motion.circle
                                                    cx={point.cx}
                                                    cy={point.cy}
                                                    r="8"
                                                    stroke="#818cf8"
                                                    strokeWidth="1"
                                                    fill="none"
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: [0, 1, 0], scale: [1, 2, 2.5] }}
                                                    transition={{ delay: 2.5 + i * 0.5, duration: 2, repeat: Infinity }}
                                                />
                                                {/* Solid Dot */}
                                                <motion.circle
                                                    cx={point.cx}
                                                    cy={point.cy}
                                                    r="4"
                                                    fill="#fff"
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 2.5 + i * 0.5, type: "spring" }}
                                                />
                                                {/* Data Label */}
                                                <motion.g
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 2.8 + i * 0.5 }}
                                                >
                                                    <rect x={point.cx + 10} y={point.cy - 15} width="80" height="34" rx="4" fill="#0f172a" stroke="#ffffff20" />
                                                    <text x={point.cx + 20} y={point.cy} fill="#fff" fontSize="12" fontWeight="bold" fontFamily="monospace">
                                                        {point.val}
                                                    </text>
                                                    <text x={point.cx + 20} y={point.cy + 12} fill="#94a3b8" fontSize="9" fontFamily="monospace">
                                                        {point.label}
                                                    </text>
                                                </motion.g>
                                            </g>
                                        ))}
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Floating Notifications */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 2.5 }}
                            whileHover={{ scale: 1.05 }}
                            className="absolute top-32 right-12 bg-zinc-900/90 backdrop-blur-xl border border-red-500/30 p-4 rounded-xl shadow-2xl max-w-xs z-30 cursor-pointer"
                        >
                            <div className="flex gap-3">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-red-400 mb-1">CASH CRUNCH DETECTED</div>
                                    <div className="text-xs text-zinc-400">Payroll in 12 days exceeds projected balance by $2,400.</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 2.8 }}
                            whileHover={{ scale: 1.05 }}
                            className="absolute bottom-12 left-12 bg-zinc-900/90 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-xl shadow-2xl max-w-xs z-30 cursor-pointer"
                        >
                            <div className="flex gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-emerald-400 mb-1">RECOVERY PLAN</div>
                                    <div className="text-xs text-zinc-400">Delay Vendor Payment A by 5 days relative to Invoice #992.</div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const HonestFact = ({ title, desc, icon: Icon, delay = 0 }: any) => {
    const divRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = ({ clientX, clientY }: React.MouseEvent) => {
        if (!divRef.current) return;
        const { left, top } = divRef.current.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    };

    return (
        <motion.div
            ref={divRef}
            onMouseMove={handleMouseMove}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay, duration: 0.6, type: "spring" }}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
            className="relative flex flex-col gap-4 p-8 rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden group shadow-lg"
        >
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300"
                style={{
                    background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(99,102,241,0.1), transparent 40%)`
                }}
            />
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300"
                style={{
                    background: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgba(99,102,241,0.3), transparent 40%)`,
                    maskImage: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
                    WebkitMaskImage: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`
                }}
            />

            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors duration-300 relative z-10">
                <Icon className="w-6 h-6 text-zinc-400 group-hover:text-indigo-400 transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors duration-300 relative z-10">{title}</h3>
            <p className="text-zinc-400 leading-relaxed group-hover:text-white/80 transition-colors duration-300 relative z-10">
                {desc}
            </p>
        </motion.div>
    );
};

const TruthSection = () => {
    return (
        <section id="truth" className="py-32 bg-black relative z-10 border-t border-white/5 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight"
                    >
                        Why rely on <span className="text-indigo-500 relative inline-block">
                            luck?
                            <svg className="absolute w-full h-2 bottom-1 left-0 text-indigo-500 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <motion.path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="2"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                />
                            </svg>
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg"
                    >
                        Most small businesses fail because they run out of cash, not because they lack profit.
                        Profit is a theory. Cash is a fact. We focus on the facts.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <HonestFact
                        title="The Payroll Panic"
                        desc="That sinking feeling when payroll is due on Friday and you're waiting for a check? We eliminate that by showing you the gap 3 weeks in advance."
                        icon={Clock}
                        delay={0.1}
                    />
                    <HonestFact
                        title="The 'Profit' Trap"
                        desc="Your P&L says you made money, but your bank account is empty. Why? Inventory and unpaid invoices. We track actual cash movement."
                        icon={AlertTriangle}
                        delay={0.2}
                    />
                    <HonestFact
                        title="Blind Decisions"
                        desc="Hiring someone new because you 'feel' like you can afford it? Don't guess. Run a scenario and see exactly how it impacts your runway."
                        icon={Search}
                        delay={0.3}
                    />
                </div>
            </div>
        </section>
    );
};

const SystemSection = () => {
    return (
        <section id="system" className="py-32 bg-black relative overflow-hidden">
            <motion.div
                animate={{ backgroundPosition: ["0px 0px", "100px 100px"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20"
            />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 mb-8 uppercase tracking-widest"
                        >
                            <Cpu className="w-3 h-3" />
                            Core Logic
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight"
                        >
                            It's not AI Magic.<br />
                            It's <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Structured Intelligence.</span>
                        </motion.h2>
                        <div className="space-y-8">
                            {[
                                { title: "Data Ingestion", desc: "We pull raw transactions. No manual entry errors.", icon: Layers },
                                { title: "Pattern Recog", desc: "We identify recurring bills you forgot about.", icon: Search },
                                { title: "Scenario Testing", desc: "Simulate 'What if I lose this client?' instantly.", icon: Sparkles }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="flex gap-4 group"
                                >
                                    <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/50 transition-all duration-300">
                                        <item.icon className="w-5 h-5 text-white group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                                        <p className="text-zinc-400 max-w-md">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <motion.div
                            animate={{ opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full"
                        />
                        <div className="relative bg-zinc-900 border border-white/5 rounded-3xl p-8 shadow-2xl overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500" />
                            <div className="flex border-b border-border pb-4 mb-4 justify-between items-center">
                                <span className="text-xs font-mono text-zinc-500">TERMINAL OUTPUT</span>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                </div>
                            </div>
                            <div className="font-mono text-sm space-y-2 h-[300px] overflow-hidden">
                                <TypingEffect />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// Animated typing component for the "Terminal"
const TypingEffect = () => {
    const [lines, setLines] = useState<string[]>([]);

    useEffect(() => {
        const sequence = [
            { text: "$ analyzing_expenses...", color: "text-emerald-500", delay: 0 },
            { text: "Found recurring: 'AWS Server Costs' ($245/mo)", color: "text-zinc-600 dark:text-zinc-300 ml-4", delay: 800 },
            { text: "Found recurring: 'Office Rent' ($1200/mo)", color: "text-zinc-600 dark:text-zinc-300 ml-4", delay: 1600 },
            { text: "$ checking_invoices...", color: "text-emerald-500", delay: 2500 },
            { text: "Invoice #1023 overdue by 14 days", color: "text-red-500 dark:text-red-400 ml-4", delay: 3500 },
            { text: "Invoice #1025 due in 3 days", color: "text-zinc-600 dark:text-zinc-300 ml-4", delay: 4500 },
            { text: "$ calc_runway...", color: "text-emerald-500", delay: 5500 },
            { text: "WARNING: Cash dip projected for Oct 14th", color: "text-white bg-indigo-500/20 inline-block px-2 rounded ml-4", delay: 6500 },
            { text: "$ generating_suggestions...", color: "text-emerald-500", delay: 7800 },
            { text: "> Suggest delaying payment to Vendor X", color: "text-indigo-300 ml-4", delay: 9000 },
        ];

        let timeouts: NodeJS.Timeout[] = [];

        // Reset and play
        const playSequence = () => {
            setLines([]);
            sequence.forEach(({ text, color, delay }) => {
                const timeout = setTimeout(() => {
                    setLines(prev => [...prev, `<div class="${color}">${text}</div>`]);
                }, delay);
                timeouts.push(timeout);
            });
        };

        playSequence();
        const interval = setInterval(playSequence, 12000); // Replay loop

        return () => {
            timeouts.forEach(clearTimeout);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="flex flex-col gap-1">
            {lines.map((line, i) => (
                <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
            ))}
            <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-4 bg-emerald-500 mt-1"
            />
        </div>
    );
};

const ScienceSection = () => {
    return (
        <section id="science" className="py-32 bg-black relative z-10 overflow-hidden border-t border-white/5">
            <div className="container mx-auto px-6 relative z-10">
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-xs font-bold text-fuchsia-400 mb-8 uppercase tracking-widest"
                    >
                        <Sparkles className="w-3 h-3" />
                        The Methodology
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight"
                    >
                        Forecasts based on <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-indigo-500">math, not feelings.</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { title: "Linear Regression Analysis", desc: "We analyze your past 12 months of revenue to find your baseline growth trajectory." },
                        { title: "Seasonal Adjustment", desc: "Our algorithms detect cyclic dips (like Jan/Feb slumps) and adjust predictions automatically." },
                        { title: "Expense Correlation", desc: "We link variable expenses to revenue. If you sell more, we know your shipping costs will go up too." },
                        { title: "Anomaly Detection", desc: "We flag unusual one-time expenses so they don't skew your long-term averages." }
                    ].map((item, i) => {
                        const divRef = useRef<HTMLDivElement>(null);
                        const mouseX = useMotionValue(0);
                        const mouseY = useMotionValue(0);

                        const handleMouseMove = ({ clientX, clientY }: React.MouseEvent) => {
                            if (!divRef.current) return;
                            const { left, top } = divRef.current.getBoundingClientRect();
                            mouseX.set(clientX - left);
                            mouseY.set(clientY - top);
                        };

                        return (
                            <motion.div
                                key={i}
                                ref={divRef}
                                onMouseMove={handleMouseMove}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative p-8 rounded-2xl bg-zinc-900/30 border border-white/5 overflow-hidden group hover:bg-zinc-900/60 transition-all duration-300"
                            >
                                <motion.div
                                    className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300"
                                    style={{
                                        background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(232,121,249,0.1), transparent 40%)`
                                    }}
                                />
                                <div className="relative z-10 flex items-start gap-4">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-fuchsia-500 group-hover:animate-ping" />
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-300 transition-colors">{item.title}</h3>
                                        <p className="text-zinc-400">{item.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

const SecuritySection = () => {
    return (
        <section id="security" className="py-32 bg-[#050505] relative z-10 border-t border-white/5 overflow-hidden">
            <div className="container mx-auto px-6 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-zinc-900/50 rounded-3xl p-8 md:p-16 border border-white/10 relative overflow-hidden group"
                >
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
                    <motion.div
                        animate={{ top: ["0%", "100%"] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[1px] bg-emerald-500/30 blur-[2px]"
                    />

                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none transition-opacity duration-500 group-hover:opacity-70" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 mb-8 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                            >
                                <Shield className="w-3 h-3" />
                                Bank-Grade Defense
                            </motion.div>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                Your data is <span className="text-emerald-500 inline-block relative">
                                    yours.
                                    <motion.span
                                        initial={{ width: "0%" }}
                                        whileInView={{ width: "100%" }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                        className="absolute bottom-0 left-0 h-1 bg-emerald-500/50"
                                    />
                                </span><br />Period.
                            </h2>
                            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                                We use the same encryption standards as major financial institutions.
                                We never sell your data, and our staff cannot access your financial records without your explicit permission.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "256-bit AES Encryption",
                                    "SOC 2 Type II Compliant Infrastructure",
                                    "Auto-wiping of temporary sessions"
                                ].map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        className="flex items-center gap-3 text-white group/item"
                                    >
                                        <div className="p-1 rounded-full bg-emerald-500/20 group-hover/item:bg-emerald-500/40 transition-colors">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex justify-center relative">
                            {/* Animated Lock Assembly */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                className="w-64 h-64 md:w-80 md:h-80 relative flex items-center justify-center"
                            >
                                {/* Outer Rotating Shield */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border border-emerald-500/20 rounded-full border-t-emerald-500/60"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-8 border border-emerald-500/20 rounded-full border-b-emerald-500/60"
                                />

                                {/* Pulse Effect */}
                                <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-pulse blur-2xl" />

                                {/* Lock Icon */}
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className="relative z-10 w-24 h-24 bg-gradient-to-br from-zinc-900 to-black rounded-3xl border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] transition-all duration-500"
                                >
                                    <Lock className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const SimpleCTA = () => (
    <section className="py-32 relative bg-black border-t border-white/5 overflow-hidden">
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px]"
        />

        <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter"
            >
                Stop flying <span className="text-zinc-600">blind.</span>
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto"
            >
                Join hundreds of smart business owners using Cashly to secure their future.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row justify-center gap-6"
            >
                <Button variant="default" size="xl" onClick={() => window.location.href = '/register'} className="rounded-full">
                    Create Free Account
                </Button>
                <Button variant="outline" size="xl" onClick={() => window.location.href = '/login'} className="rounded-full">
                    Log In
                </Button>
            </motion.div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="py-12 border-t border-white/5 bg-black text-center md:text-left">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-zinc-900 rounded-md border border-white/10">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-zinc-300 tracking-widest">CASHLY SYSTEMS</span>
                </div>
                <div className="flex gap-8">
                    <a href="#" className="text-zinc-500 hover:text-white transition-colors text-xs uppercase tracking-widest">Privacy</a>
                    <a href="#" className="text-zinc-500 hover:text-white transition-colors text-xs uppercase tracking-widest">Terms</a>
                    <a href="#" className="text-zinc-500 hover:text-white transition-colors text-xs uppercase tracking-widest">Status</a>
                </div>
                <div className="text-xs text-zinc-600 font-mono">
                    ALL SYSTEMS NOMINAL • 2024
                </div>
            </div>
        </div>
    </footer>
);


export default function SaaSTemplate() {
    return (
        <main className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">
            <Ticker />
            <Navigation />
            <Hero />
            <TruthSection />
            <SystemSection />
            <ScienceSection />
            <SecuritySection />
            <SimpleCTA />
            <Footer />
        </main>
    );
}
