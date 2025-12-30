import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap,
    Search,
    User,
    Phone,
    Mail,
    MessageSquare,
    ArrowRight,
    Sparkles,
    Wallet,
    AlertTriangle,
    TrendingUp,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import api from '../api/axios';
import { supabase } from '../lib/supabase';
import AuthContext from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { cn } from '@/lib/utils';

const ReceivablesPage = () => {
    const { selectedBusiness } = useContext(AuthContext);
    const navigate = useNavigate();
    const [receivables, setReceivables] = useState([]);
    const [stats, setStats] = useState({ total: 0, overdue: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dailyBurn, setDailyBurn] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            if (!selectedBusiness) return;
            try {
                // Parallel fetch from Supabase
                const [recRes, expRes] = await Promise.all([
                    supabase.from('receivables').select('*').eq('business_id', selectedBusiness.id),
                    supabase.from('expenses').select('*').eq('business_id', selectedBusiness.id)
                ]);

                if (recRes.error) throw recRes.error;
                if (expRes.error) throw expRes.error;

                const receivablesData = recRes.data || [];
                const expensesData = expRes.data || [];

                setReceivables(receivablesData);

                // Stats calculation
                const total = receivablesData.reduce((sum, r) => sum + r.amount_due, 0); // Note: check column name: amount_due
                // wait, sql schema said amount_due. JS used amountDue. Let's assume Supabase returns snake_case by default 
                // BUT commonly js client might NOT convert unless configured.
                // Let's standardise on what the schema said: amount_due. 
                // However, the React code uses `amountDue`.
                // I should map snake_case to camelCase OR update the React code.
                // Updating React code is safer.

                // Let's map it here to avoid changing all JSX
                const mappedReceivables = receivablesData.map(r => ({
                    ...r,
                    amountDue: r.amount_due || r.amountDue,
                    customerName: r.customer_name || r.customerName,
                    customerPhoto: r.customer_photo || r.customerPhoto,
                    customerEmail: r.customer_email || r.customerEmail,
                    customerPhone: r.customer_phone || r.customerPhone,
                    invoiceDate: r.invoice_date || r.invoiceDate,
                    status: r.status
                }));

                setReceivables(mappedReceivables);

                const recTotal = mappedReceivables.reduce((sum, r) => sum + Number(r.amountDue), 0);
                const overdue = mappedReceivables.filter(r => r.status === 'Overdue').reduce((sum, r) => sum + Number(r.amountDue), 0);
                const pending = mappedReceivables.filter(r => r.status === 'Pending').reduce((sum, r) => sum + Number(r.amountDue), 0);

                setStats({ total: recTotal, overdue, pending });

                // Daily burn calculation (last 30 days)
                const totalExp = expensesData.reduce((sum, e) => sum + e.amount, 0);
                setDailyBurn(totalExp / 30 || 2500);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
            setLoading(false);
        };
        fetchData();
    }, [selectedBusiness]);

    const filteredReceivables = receivables.filter(r =>
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateRunwayBoost = (amount) => {
        if (dailyBurn <= 0) return 0;
        return Math.round(amount / dailyBurn);
    };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans selection:bg-indigo-500/30">
            <Sidebar />

            <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
                {/* Ambient Background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px]" />
                </div>

                <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                                    Liquidity Injector
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
                                Due Payers Hub
                            </h1>
                            <p className="text-white/50 text-sm">Monitor and recover outstanding invoices.</p>
                        </div>

                        <div className="relative w-full md:w-80 group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-20 group-hover:opacity-40 transition overflow-hidden blur-sm" />
                            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center px-4 py-3">
                                <Search className="w-4 h-4 text-white/40 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Filter clients..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm text-white placeholder-white/30 w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <Wallet className="w-12 h-12 text-blue-500" />
                            </div>
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Total Receivable</h3>
                            <div className="text-3xl font-bold text-white mb-1">₹{stats.total.toLocaleString()}</div>
                            <div className="flex items-center gap-2 mt-4 text-xs text-blue-400 bg-blue-500/10 w-fit px-2 py-1 rounded-lg">
                                <Zap className="w-3 h-3" />
                                <span>+{calculateRunwayBoost(stats.total)} Days Runway Boost</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                            </div>
                            <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">Overdue Assets</h3>
                            <div className="text-3xl font-bold text-white mb-1">₹{stats.overdue.toLocaleString()}</div>
                            <div className="mt-4 text-xs text-white/40">Immediate reclamation advised.</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 backdrop-blur-md relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-12 h-12 text-indigo-400" />
                            </div>
                            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">Collection Velocity</h3>
                            <div className="text-3xl font-bold text-white mb-3">84% <span className="text-sm font-normal text-white/50">Yield</span></div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "84%" }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-indigo-500 rounded-full"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-64 rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
                                ))}
                            </motion.div>
                        ) : filteredReceivables.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl bg-white/5 border border-dashed border-white/10 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                    <Search className="w-8 h-8 text-white/20" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">No Matching Records</h2>
                                <p className="text-white/40 mb-8 max-w-md">We couldn't find any receivables matching your criteria. Try adjusting your search filters definition.</p>
                                <button
                                    onClick={() => navigate('/upload')}
                                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                                >
                                    Upload New Ledger
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="content"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredReceivables.map((r, idx) => {
                                    const runwayBoost = calculateRunwayBoost(r.amountDue);
                                    const isOverdue = r.status === 'Overdue';

                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            whileHover={{ y: -5 }}
                                            className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/30 backdrop-blur-sm transition-all shadow-lg hover:shadow-indigo-500/10 overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <div className="relative z-10">
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                                                            {r.customerPhoto ? (
                                                                <img src={r.customerPhoto} alt={r.customerName} className="w-full h-full object-cover opacity-80" />
                                                            ) : (
                                                                <User className="w-5 h-5 text-white/40" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-white text-lg truncate max-w-[120px]">{r.customerName}</h3>
                                                            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                                                                Inv: {r.invoiceDate ? new Date(r.invoiceDate).toLocaleDateString() : 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                                        isOverdue
                                                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                                                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                    )}>
                                                        {r.status}
                                                    </div>
                                                </div>

                                                <div className="bg-black/20 rounded-2xl p-4 mb-6 border border-white/5">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Amount Due</span>
                                                        <span className="text-2xl font-bold text-white tracking-tight">₹{r.amountDue.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-6 group-hover:bg-indigo-500/20 transition-colors">
                                                    <div>
                                                        <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest mb-0.5">Runway Impact</p>
                                                        <p className="text-xs font-bold text-white">+{runwayBoost} Days Surplus</p>
                                                    </div>
                                                    <Zap className="w-4 h-4 text-indigo-400" />
                                                </div>

                                                <div className="grid grid-cols-3 gap-2">
                                                    <a href={`tel:${r.customerPhone || '#'}`} className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-white/60 hover:text-white">
                                                        <Phone className="w-4 h-4 mb-1" />
                                                        <span className="text-[8px] font-bold uppercase tracking-widest">Call</span>
                                                    </a>
                                                    <a href={`mailto:${r.customerEmail || '#'}`} className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-white/60 hover:text-white">
                                                        <Mail className="w-4 h-4 mb-1" />
                                                        <span className="text-[8px] font-bold uppercase tracking-widest">Email</span>
                                                    </a>
                                                    <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-white/60 hover:text-white">
                                                        <MessageSquare className="w-4 h-4 mb-1" />
                                                        <span className="text-[8px] font-bold uppercase tracking-widest">Chat</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* AI Prompt */}
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 backdrop-blur-xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-700">
                            <Sparkles className="w-32 h-32 text-indigo-400" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-indigo-500/20">
                                        <Sparkles className="w-5 h-5 text-indigo-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">AI Capital Recovery</h3>
                                </div>
                                <p className="text-white/60 leading-relaxed text-sm">
                                    Our autonomous agents can engage with high-risk debtors using polite yet firm settlement protocols.
                                    Initialize the recovery engine to start the automated negotiation process for overdue accounts.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/ai-analysis')}
                                className="whitespace-nowrap px-8 py-4 rounded-xl bg-white text-black font-bold uppercase text-xs tracking-widest hover:bg-white/90 transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            >
                                Initialize Script Engine
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default ReceivablesPage;
