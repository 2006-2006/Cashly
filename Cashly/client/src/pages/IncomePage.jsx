import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Wallet, TrendingUp, TrendingDown,
    Upload, Sparkles, Menu, X, Settings, Zap, Search,
    ArrowUpDown, Filter, Download, MoreHorizontal, CheckCircle2,
    Calendar, User, Tag, Clock, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
// import api from '../api/axios';
import { supabase } from '../lib/supabase';
import AuthContext from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';

const IncomePage = () => {
    const { selectedBusiness } = useContext(AuthContext);
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'highest', 'lowest'

    useEffect(() => {
        if (selectedBusiness) fetchSales();
    }, [selectedBusiness]);

    const fetchSales = async () => {
        try {
            const { data, error } = await supabase
                .from('sales')
                .select('*')
                .eq('business_id', selectedBusiness.id)
                .order('date', { ascending: false });

            if (error) throw error;

            setSales(data || []);
            setFilteredSales(data || []);
        } catch (error) {
            console.error('Error fetching sales:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        let result = [...sales];

        // Search
        if (searchTerm) {
            result = result.filter(s =>
                (s.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (s.paymentType?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
            if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
            if (sortBy === 'highest') return b.amount - a.amount;
            if (sortBy === 'lowest') return a.amount - b.amount;
            return 0;
        });

        setFilteredSales(result);
    }, [searchTerm, sortBy, sales]);

    const totalIncome = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const avgDailyIncome = sales.length > 0 ? totalIncome / 30 : 0;
    const uniqueStreams = new Set(sales.map(s => s.paymentType)).size;

    const getPaymentColor = (type) => {
        switch (type) {
            case 'UPI': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'Cash': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Card': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Credit': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <div className="min-h-screen w-full bg-black text-white flex font-sans selection:bg-indigo-500/30">
            <Sidebar onLogout={() => { }} />

            <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#050505] to-[#020202]">
                <div className="max-w-7xl mx-auto space-y-8 pb-20">

                    {/* Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-black border border-white/5 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                            <TrendingUp className="w-40 h-40 text-indigo-500" />
                        </div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Revenue Analytics</h1>
                            <p className="text-sm text-indigo-200/60 font-medium">Tracking {sales.length} verified income sources</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Revenue</p>
                                <div className="text-3xl font-bold text-white tracking-tight">₹{totalIncome.toLocaleString()}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Daily Average</p>
                                <div className="text-3xl font-bold text-emerald-400 tracking-tight">₹{avgDailyIncome.toFixed(0).toLocaleString()}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Transactions</p>
                                <div className="text-3xl font-bold text-white tracking-tight">{sales.length}</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Channels</p>
                                <div className="text-3xl font-bold text-indigo-400 tracking-tight">{uniqueStreams}</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Controls */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col md:flex-row gap-4"
                    >
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-sm transition-all hover:bg-white/10"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-bold uppercase tracking-widest text-white/70 focus:outline-none focus:bg-black transition-all cursor-pointer hover:bg-white/10"
                            >
                                <option value="newest">Latest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Amount: High</option>
                                <option value="lowest">Amount: Low</option>
                            </select>
                            <button className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>

                    {/* Table */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#0A0A0B]/80 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl"
                    >
                        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest">Transaction Ledger</h3>
                            <button className="text-[10px] font-bold bg-white/5 hover:bg-white/10 text-white/70 px-3 py-1 rounded-full transition-colors uppercase tracking-widest border border-white/5">
                                Export CSV
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-32">
                                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Loading Data...</p>
                            </div>
                        ) : filteredSales.length === 0 ? (
                            <div className="text-center py-32">
                                <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                <h2 className="text-lg font-bold text-white mb-2">No results found</h2>
                                <p className="text-white/40 text-sm">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/[0.01]">
                                            <th className="py-4 px-6 text-[10px] font-bold text-white/30 uppercase tracking-widest">Date / ID</th>
                                            <th className="py-4 px-6 text-[10px] font-bold text-white/30 uppercase tracking-widest">Source</th>
                                            <th className="py-4 px-6 text-[10px] font-bold text-white/30 uppercase tracking-widest">Details</th>
                                            <th className="py-4 px-6 text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredSales.map((sale, idx) => (
                                            <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white/90">
                                                            {new Date(sale.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-white/30 mt-1">
                                                            ID: {sale.id?.slice(-6).toUpperCase() || `TX-${idx}`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${getPaymentColor(sale.paymentType)}`}>
                                                        {sale.paymentType || 'General'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{sale.description || 'Income Entry'}</span>
                                                        <span className="text-[10px] text-emerald-500/80 flex items-center gap-1 mt-0.5">
                                                            <CheckCircle2 className="w-3 h-3" /> Verified
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <span className="text-base font-bold text-emerald-400">
                                                        +₹{sale.amount.toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default IncomePage;
