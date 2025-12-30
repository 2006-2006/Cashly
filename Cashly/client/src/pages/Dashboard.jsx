import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import {
    AlertTriangle, TrendingDown, Zap, LogOut, LayoutDashboard, Wallet,
    ArrowUpCircle, ArrowDownCircle, Upload, Sparkles, Settings,
    Users, Bot, ArrowRight, X, Lightbulb, Info, Edit2, Check,
    TrendingUp, Calendar, Activity, Clock, Target, Bell, Flame, Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { supabase } from '../lib/supabase';
import { calculateForecast } from '../lib/forecast';
import AuthContext from '../contexts/AuthContext';

import HealthScore from '../components/HealthScore';
import ChatBot from '../components/ChatBot';
import AnalyticsDashboard from '../components/ui/analytics-dashboard';
import { Component as RealTimeAnalytics } from '../components/ui/real-time-analytics';
import { NotificationPanel } from '../components/ui/notification-panel';
import { Sidebar } from '../components/Sidebar';

const Dashboard = () => {
    const { logout, user, selectedBusiness } = useContext(AuthContext);
    const navigate = useNavigate();
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentCash, setCurrentCash] = useState(() => {
        // Try to get from localStorage, fallback to 100k
        const saved = localStorage.getItem(`cashly_balance_${selectedBusiness?.id || 'default'}`);
        return saved ? Number(saved) : 100000;
    });

    // Update localStorage when currentCash changes
    useEffect(() => {
        if (selectedBusiness?.id) {
            localStorage.setItem(`cashly_balance_${selectedBusiness.id}`, currentCash.toString());
        }
    }, [currentCash, selectedBusiness]);

    // Data states
    const [topDebtors, setTopDebtors] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [revenueVsExpenses, setRevenueVsExpenses] = useState([]);
    const [expenseBreakdown, setExpenseBreakdown] = useState([]);
    const [dailyProfit, setDailyProfit] = useState([]);
    const [metrics, setMetrics] = useState({
        totalReceivables: 0,
        totalExpenses: 0,
        totalSales: 0,
        netProfit: 0,
        burnRate: 0,
        salesTrend: 0,
        expensesTrend: 0,
        salesCount: 0,
        expensesCount: 0
    });
    const [alerts, setAlerts] = useState([]);

    // Feature states
    const [weeklyComparison, setWeeklyComparison] = useState({ thisWeek: 0, lastWeek: 0, change: 0 });
    const [healthScore, setHealthScore] = useState(0);
    const [anomalies, setAnomalies] = useState([]);
    const [monthlyGoal, setMonthlyGoal] = useState({ target: 500000, current: 0, percentage: 0 });

    // UI States
    const [showRunwayModal, setShowRunwayModal] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [expandedCard, setExpandedCard] = useState(null);
    const [isEditingCash, setIsEditingCash] = useState(false);
    const [tempCash, setTempCash] = useState(currentCash);

    // Simulation states
    const [simInventoryDelay, setSimInventoryDelay] = useState(0);
    const [simReceivablesPercent, setSimReceivablesPercent] = useState(0);
    const [healthDetails, setHealthDetails] = useState(null);

    const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

    const toggleCard = (id) => setExpandedCard(expandedCard === id ? null : id);

    const runForecast = async () => {
        if (!selectedBusiness) return;
        setLoading(true);
        try {
            let modifications = {};
            if (simInventoryDelay > 0) modifications.globalInventoryDelayDays = simInventoryDelay;
            if (simReceivablesPercent > 0) modifications.globalReceivablesAcceleratePercent = simReceivablesPercent;

            // Determine date range for data fetching if needed, but for forecast we likely need future data?
            // Actually, we need historical data for averages AND future data (receivables due date).
            // Let's fetch all relevant data. Limiting to recent/future might be better optimization later.

            const [salesRes, expRes, recRes, invRes] = await Promise.all([
                supabase.from('sales').select('*').eq('business_id', selectedBusiness.id).order('date', { ascending: false }).limit(2000),
                supabase.from('expenses').select('*').eq('business_id', selectedBusiness.id).order('date', { ascending: false }).limit(2000),
                supabase.from('receivables').select('*').eq('business_id', selectedBusiness.id),
                supabase.from('inventory').select('*').eq('business_id', selectedBusiness.id)
            ]);

            if (salesRes.error) throw salesRes.error;

            const salesData = salesRes.data || [];
            const expensesData = expRes.data || [];
            const receivablesData = recRes.data || [];
            const inventoryData = invRes.data || [];

            // Run Local Forecast
            const result = calculateForecast(
                currentCash,
                salesData,
                expensesData,
                receivablesData,
                inventoryData,
                [], // recurring - add table if exists
                modifications
            );

            setForecast(result);
            if (result.healthDetails) {
                setHealthDetails(result.healthDetails);
                setHealthScore(result.healthDetails.score);
            }

        } catch (error) {
            console.error("Forecast error:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        runForecast();
    }, [simInventoryDelay, simReceivablesPercent, currentCash, selectedBusiness]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!selectedBusiness) return;
            try {
                // 1. Fetch headline metrics from server for 100% accuracy
                const { data: serverMetrics } = await api.get('/data/metrics', { params: { businessId: selectedBusiness.id } });

                // 2. Fetch recent transaction data for Charts & Lists (Limited to stable subset)
                const [salesRes, expRes, recRes] = await Promise.all([
                    supabase.from('sales').select('*').eq('business_id', selectedBusiness.id).order('date', { ascending: false }).limit(2000),
                    supabase.from('expenses').select('*').eq('business_id', selectedBusiness.id).order('date', { ascending: false }).limit(2000),
                    supabase.from('receivables').select('*').eq('business_id', selectedBusiness.id)
                ]);

                if (salesRes.error) throw salesRes.error;

                const salesArr = salesRes.data || [];
                const expensesArr = expRes.data || [];
                const recArr = recRes.data || [];

                // Recent transactions
                const sales = salesArr.map(s => ({ ...s, type: 'income' }));
                const expenses = expensesArr.map(e => ({ ...e, type: 'expense' }));
                const allTxns = [...sales, ...expenses]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5);
                setRecentTransactions(allTxns);

                // Top Debtors
                const now = new Date();
                const debtors = recArr
                    .filter(r => r.status !== 'Paid')
                    .map(r => {
                        const dueDate = new Date(r.expected_payment_date || r.expectedPaymentDate || r.invoice_date || r.invoiceDate);
                        const diffTime = now - dueDate;
                        const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                        const amount = r.amount_due || r.amountDue;
                        return {
                            name: r.customer_name || r.customerName,
                            amount: amount,
                            daysOverdue: diffDays,
                            status: r.status
                        };
                    })
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 4);
                setTopDebtors(debtors);

                // Revenue vs Expenses Chart
                const dailyData = {};
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                for (let i = 0; i < 30; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() - (29 - i));
                    const dateKey = d.toISOString().split('T')[0];
                    dailyData[dateKey] = { date: dateKey, revenue: 0, expenses: 0 };
                }

                salesArr.forEach(s => {
                    const sDate = new Date(s.date);
                    if (sDate >= thirtyDaysAgo) {
                        const dateKey = sDate.toISOString().split('T')[0];
                        if (dailyData[dateKey]) {
                            dailyData[dateKey].revenue += (Number(s.amount) || 0);
                        }
                    }
                });
                expensesArr.forEach(e => {
                    const eDate = new Date(e.date);
                    if (eDate >= thirtyDaysAgo) {
                        const dateKey = eDate.toISOString().split('T')[0];
                        if (dailyData[dateKey]) {
                            dailyData[dateKey].expenses += (Number(e.amount) || 0);
                        }
                    }
                });
                const chartData = Object.values(dailyData)
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(d => ({
                        ...d,
                        date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                        profit: d.revenue - d.expenses
                    }));
                setRevenueVsExpenses(chartData);
                setDailyProfit(chartData.slice(-14));

                // Expense Breakdown
                const categoryTotals = {};
                expensesArr.forEach(e => {
                    const cat = e.category || 'Other';
                    categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
                });
                setExpenseBreakdown(Object.entries(categoryTotals)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 6));

                // Metrics
                // Metrics - Hybrid approach: Server for Totals (Accuracy), Local for Trends (Responsiveness)
                const totalReceivables = serverMetrics.totalReceivables || recArr.filter(r => r.status !== 'Paid').reduce((sum, r) => sum + (r.amount_due || r.amountDue), 0);
                const totalExp = serverMetrics.totalExpenses;
                const totalSales = serverMetrics.totalSales;

                // Trends (Local calc is fine for relative change)
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const fourteenDaysAgo = new Date();
                fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

                const recentSales = salesArr.filter(s => new Date(s.date) >= sevenDaysAgo).reduce((sum, s) => sum + s.amount, 0);
                const prevSales = salesArr.filter(s => new Date(s.date) >= fourteenDaysAgo && new Date(s.date) < sevenDaysAgo).reduce((sum, s) => sum + s.amount, 0);
                const salesTrend = prevSales > 0 ? ((recentSales - prevSales) / prevSales) * 100 : 0; // Don't round yet

                const recentExp = expensesArr.filter(e => new Date(e.date) >= sevenDaysAgo).reduce((sum, e) => sum + e.amount, 0);
                const prevExp = expensesArr.filter(e => new Date(e.date) >= fourteenDaysAgo && new Date(e.date) < sevenDaysAgo).reduce((sum, e) => sum + e.amount, 0);
                const expensesTrend = prevExp > 0 ? ((recentExp - prevExp) / prevExp) * 100 : 0;

                setMetrics({
                    totalReceivables,
                    totalExpenses: totalExp,
                    totalSales,
                    netProfit: serverMetrics.netProfit,
                    burnRate: serverMetrics.burnRate, // Use server accurate burn
                    salesTrend: Math.round(salesTrend),
                    expensesTrend: Math.round(expensesTrend),
                    salesCount: serverMetrics.salesCount,
                    expensesCount: serverMetrics.expensesCount
                });

                // Anomalies
                const overdue = recArr.filter(r => r.status === 'Overdue');
                const detectedAnomalies = [];
                const avgExpense = expensesArr.length > 0 ? totalExp / expensesArr.length : 0;

                // Expense anomalies
                const largeExpenses = expensesArr.filter(e => e.amount > avgExpense * 2.5);
                if (largeExpenses.length > 0) {
                    detectedAnomalies.push({
                        type: 'expense',
                        icon: '💸',
                        title: 'Unusual Large Expenses',
                        message: `${largeExpenses.length} expense${largeExpenses.length > 1 ? 's' : ''} above average detected`,
                        amount: largeExpenses.reduce((s, e) => s + e.amount, 0),
                        severity: 'warning',
                        solution: 'Review these expenses to ensure they are necessary. Consider negotiating with vendors.'
                    });
                }

                // Sales anomalies
                const rollingNow = new Date();
                const rolling7DaysAgo = new Date(rollingNow);
                rolling7DaysAgo.setDate(rollingNow.getDate() - 7);
                const rolling14DaysAgo = new Date(rollingNow);
                rolling14DaysAgo.setDate(rollingNow.getDate() - 14);

                const currentPeriodSales = salesArr
                    .filter(s => new Date(s.date) >= rolling7DaysAgo)
                    .reduce((sum, s) => sum + s.amount, 0);

                const previousPeriodSales = salesArr
                    .filter(s => new Date(s.date) >= rolling14DaysAgo && new Date(s.date) < rolling7DaysAgo)
                    .reduce((sum, s) => sum + s.amount, 0);

                const rollingTrend = previousPeriodSales > 0
                    ? Math.round(((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100)
                    : 0;

                if (rollingTrend < -25) {
                    detectedAnomalies.push({
                        type: 'sales',
                        icon: '📉',
                        title: 'Sales Decline Alert',
                        message: `Revenue dropped ${Math.abs(rollingTrend)}% in the last 7 days`,
                        amount: Math.max(0, previousPeriodSales - currentPeriodSales),
                        severity: 'danger',
                        solution: 'Analyze which products had reduced sales. Consider promotional offers.'
                    });
                }

                setWeeklyComparison({
                    thisWeek: currentPeriodSales,
                    lastWeek: previousPeriodSales,
                    change: rollingTrend
                });

                setAnomalies(detectedAnomalies);

                // Monthly Goal - Strict Number Casting
                const today = new Date();
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

                const thisMonthSales = salesArr
                    .filter(s => new Date(s.date) >= startOfMonth)
                    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0); // Fix: Cast to Number

                const monthlyTarget = 500000;
                setMonthlyGoal({
                    target: monthlyTarget,
                    current: thisMonthSales,
                    percentage: monthlyTarget > 0 ? Math.min(100, Math.round((thisMonthSales / monthlyTarget) * 100)) : 0
                });

            } catch (error) {
                console.error("Dashboard data error:", error);
            }
        };
        fetchDashboardData();
    }, [currentCash, selectedBusiness]);

    const formatCurrency = (value) => {
        if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
        if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
        if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
        return `₹${value.toLocaleString()}`;
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        if (hour < 21) return "Good Evening";
        return "Good Night";
    };

    const runwayDays = forecast?.runwayDays !== undefined ? (forecast.runwayDays > 100 ? '365+' : forecast.runwayDays) : (metrics.burnRate > 0 ? Math.floor(currentCash / metrics.burnRate) : '365+');

    // Non-blocking loader removed for better UX
    // if (loading && !forecast) return ( ... );

    return (
        <div className="min-h-screen w-full bg-black text-white flex selection:bg-indigo-500/30 font-sans">
            <Sidebar onLogout={logout} />

            <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#050505] to-[#020202]">
                <div className="max-w-7xl mx-auto space-y-8 pb-20">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 backdrop-blur-sm sticky top-0 z-30 py-4 -mx-4 px-4 md:-mx-8 md:px-8 bg-black/50 border-b border-white/5">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Dashboard</h1>
                            <p className="text-sm text-indigo-300/60 mt-1 font-medium">{getGreeting()}, {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Cash Balance</p>
                                {isEditingCash ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-white">₹</span>
                                        <input
                                            type="number"
                                            value={tempCash}
                                            onChange={(e) => setTempCash(Number(e.target.value))}
                                            className="w-32 text-xl font-bold bg-white/5 text-white border border-white/20 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') { setCurrentCash(tempCash); setIsEditingCash(false); }
                                            }}
                                        />
                                        <button onClick={() => { setCurrentCash(tempCash); setIsEditingCash(false); }} className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"><Check className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setTempCash(currentCash); setIsEditingCash(true); }}>
                                        <p className="text-3xl font-bold text-white tracking-tight">₹{currentCash.toLocaleString()}</p>
                                        <Edit2 className="w-3.5 h-3.5 text-white/10 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setShowNotifications(true)}
                                className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl shadow-lg border border-white/5 relative group transition-all"
                            >
                                <Bell className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
                                {anomalies.length > 0 && (
                                    <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                                )}
                            </button>
                            <button onClick={() => navigate('/upload')} className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95">
                                <Upload className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </header>

                    {/* AI Agent Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="group relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-indigo-900/40 p-[1px] rounded-2xl cursor-pointer transition-all hover:shadow-2xl hover:shadow-indigo-500/10"
                        onClick={() => navigate('/ai-analysis')}
                    >
                        <div className="bg-black/80 backdrop-blur-xl p-5 rounded-2xl flex items-center justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="p-3 bg-indigo-500/10 rounded-xl ring-1 ring-inset ring-indigo-500/30 group-hover:bg-indigo-500/20 transition-colors">
                                    <Bot className="w-6 h-6 text-indigo-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-200 transition-colors">Ask Cashly Intelligence</h3>
                                    <p className="text-sm text-indigo-200/50">Deep analysis of your cash flow & risks • v2.0 Live</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 relative z-10">
                                <span className="text-sm font-bold text-white/90">Initialize</span>
                                <ArrowRight className="w-4 h-4 text-indigo-400" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Revenue */}
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                            className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:bg-white/[0.07] transition-all group relative overflow-hidden cursor-pointer"
                            onClick={() => toggleCard('revenue')}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <TrendingUp className="w-24 h-24 text-green-500/5 rotate-12" />
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><TrendingUp className="w-5 h-5" /></div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${metrics.salesTrend >= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                    {metrics.salesTrend > 0 ? '+' : ''}{metrics.salesTrend}%
                                </span>
                            </div>
                            <p className="text-sm text-white/40 font-medium">Total Revenue</p>
                            <h2 className="text-3xl font-bold text-white mt-1 mb-1 tracking-tight">{formatCurrency(metrics.totalSales)}</h2>
                            <p className="text-xs text-white/20 capitalize">{metrics.salesCount} transactions</p>
                        </motion.div>

                        {/* Expenses */}
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}
                            className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:bg-white/[0.07] transition-all group relative overflow-hidden cursor-pointer"
                            onClick={() => toggleCard('expenses')}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <TrendingDown className="w-24 h-24 text-red-500/5 rotate-12" />
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><TrendingDown className="w-5 h-5" /></div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${metrics.expensesTrend <= 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                    {metrics.expensesTrend > 0 ? '+' : ''}{metrics.expensesTrend}%
                                </span>
                            </div>
                            <p className="text-sm text-white/40 font-medium">Total Expenses</p>
                            <h2 className="text-3xl font-bold text-white mt-1 mb-1 tracking-tight">{formatCurrency(metrics.totalExpenses)}</h2>
                            <p className="text-xs text-white/20 capitalize">{metrics.expensesCount} transactions</p>
                        </motion.div>

                        {/* Net Profit */}
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                            className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:bg-white/[0.07] transition-all group relative overflow-hidden cursor-pointer"
                            onClick={() => toggleCard('profit')}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Activity className="w-5 h-5" /></div>
                                <span className="text-xs font-bold px-2 py-1 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">
                                    {((metrics.netProfit / (metrics.totalSales || 1)) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-sm text-white/40 font-medium">Net Profit</p>
                            <h2 className="text-3xl font-bold text-white mt-1 mb-1 tracking-tight">{formatCurrency(metrics.netProfit)}</h2>
                            <p className="text-xs text-white/20 capitalize">{metrics.netProfit >= 0 ? 'Profitable' : 'Loss'}</p>
                        </motion.div>

                        {/* Cash Runway (Interactive) */}
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
                            className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/20 border border-indigo-500/20 p-6 rounded-3xl hover:border-indigo-500/40 transition-all cursor-pointer relative overflow-hidden"
                            onClick={() => setShowRunwayModal(true)}
                        >
                            <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Clock className="w-5 h-5" /></div>
                                <Info className="w-4 h-4 text-indigo-400/50" />
                            </div>
                            <p className="text-sm text-indigo-200/60 font-medium relative z-10">Cash Runway</p>
                            <h2 className="text-3xl font-bold text-white mt-1 mb-1 tracking-tight relative z-10">{runwayDays} <span className="text-base font-normal text-white/40">days</span></h2>
                            <div className="w-full bg-black/40 h-1.5 rounded-full mt-3 overflow-hidden border border-white/5">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (runwayDays / 90) * 100)}%` }} />
                            </div>
                        </motion.div>

                        {/* Health Score (Double Size) */}
                        <div className="lg:col-span-2 lg:row-span-2">
                            <HealthScore
                                score={healthScore}
                                status={healthScore >= 70 ? 'Healthy' : healthScore >= 40 ? 'Warning' : 'Critical'}
                                components={healthDetails?.components}
                                insights={healthDetails?.insights}
                                isExpanded={expandedCard === 'health'}
                                onToggle={() => toggleCard('health')}
                            />
                        </div>

                        {/* Monthly Goal */}
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
                            className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:bg-white/[0.07] transition-all group relative overflow-hidden lg:col-span-2"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Target className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-sm text-white/40 font-medium">Monthly Goal</p>
                                        <h3 className="text-xl font-bold text-white">{monthlyGoal.percentage}% <span className="text-sm font-normal text-white/40">achieved</span></h3>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-white/40">Target</p>
                                    <p className="text-sm font-bold text-white">{formatCurrency(monthlyGoal.target)}</p>
                                </div>
                            </div>
                            <div className="relative pt-2">
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${monthlyGoal.percentage}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue vs Expenses */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Financial Performance</h3>
                                <div className="flex gap-2 text-xs">
                                    <span className="flex items-center gap-1 text-white/50"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Revenue</span>
                                    <span className="flex items-center gap-1 text-white/50"><div className="w-2 h-2 rounded-full bg-red-500" /> Expenses</span>
                                </div>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueVsExpenses}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} separator=": " />
                                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
                                        <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpenses)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Forecast Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                            className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white">AI Cash Forecast</h3>
                                    <p className="text-xs text-white/40">30-Day Projection</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setSimInventoryDelay(prev => prev === 0 ? 7 : 0)} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all ${simInventoryDelay > 0 ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'}`}>Delay Pay</button>
                                    <button onClick={() => setSimReceivablesPercent(prev => prev === 0 ? 20 : 0)} className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all ${simReceivablesPercent > 0 ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'}`}>Collect Fast</button>
                                </div>
                            </div>
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={forecast?.data}>
                                        <defs>
                                            <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }} />
                                        <Area type="monotone" dataKey="predictedCashBalance" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCash)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>
                    </div>

                    {/* Integrated Analytics & Recents */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl">
                            <AnalyticsDashboard
                                data={[
                                    { title: 'Transactions', value: metrics.salesCount.toString(), change: 'Live', changeType: 'neutral', icon: Zap, chartData: [] },
                                    { title: 'Burn', value: formatCurrency(metrics.burnRate), change: '/day', changeType: 'negative', icon: Flame, chartData: [] }
                                ]}
                            />
                        </div>
                        <div className="bg-[#0A0A0B]/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-white">Recent Activity</h3>
                                <button onClick={() => navigate('/income')} className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
                            </div>
                            <div className="space-y-4">
                                {recentTransactions.map((txn, idx) => (
                                    <div key={idx} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl transition-colors ${txn.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20'}`}>
                                                {txn.type === 'income' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white truncate max-w-[120px]">{txn.description || 'Transaction'}</p>
                                                <p className="text-[10px] text-white/40">{new Date(txn.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-bold ${txn.type === 'income' ? 'text-emerald-400' : 'text-white/60'}`}>
                                            {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} notifications={anomalies} />
            <ChatBot
                forecastData={forecast}
                currentCash={currentCash}
                metrics={metrics}
            />

            {showRunwayModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowRunwayModal(false)}>
                    <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl max-w-lg w-full p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Stress Test Analysis</h2>
                            <button onClick={() => setShowRunwayModal(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                <p className="text-sm text-indigo-200">Current runway is <strong>{runwayDays} days</strong>. If revenue drops by 20%, legal runway drops to <strong>{Math.floor(runwayDays * 0.8)} days</strong>.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => { setSimInventoryDelay(30); setShowRunwayModal(false); }}
                                    className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/50 transition-all text-left group"
                                >
                                    <p className="text-xs text-white/40 uppercase mb-1">Simulate</p>
                                    <p className="font-bold text-white group-hover:text-indigo-400">Loss of Top Client</p>
                                </button>
                                <button
                                    onClick={() => { setSimReceivablesPercent(-50); setShowRunwayModal(false); }}
                                    className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/50 transition-all text-left group"
                                >
                                    <p className="text-xs text-white/40 uppercase mb-1">Simulate</p>
                                    <p className="font-bold text-white group-hover:text-indigo-400">Late Payments</p>
                                </button>
                            </div>
                            <button onClick={() => { setShowRunwayModal(false); navigate('/ai-analysis'); }} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/30">
                                Ask AI to Run Simulation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
