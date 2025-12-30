import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles, Send, Bot, Terminal, Activity, Clock, Search, BarChart3,
    AlertTriangle, DollarSign, PiggyBank, TrendingUp, TrendingDown,
    CheckCircle2, Cpu, Zap, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import AuthContext from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const AIAnalysisPage = () => {
    const navigate = useNavigate();
    const { selectedBusiness } = useContext(AuthContext);
    const [userQuery, setUserQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [activeSteps, setActiveSteps] = useState([]);
    const [toolsUsed, setToolsUsed] = useState([]);
    const [duration, setDuration] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [situation, setSituation] = useState(null);
    const [telemetryHistory, setTelemetryHistory] = useState(Array(20).fill(30));
    const [classification, setClassification] = useState(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (selectedBusiness) {
            fetchMetrics();
            fetchSituation();
        }
    }, [selectedBusiness]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, loading]);

    const fetchMetrics = async () => {
        try {
            const businessId = selectedBusiness?._id || selectedBusiness?.id;
            const params = { businessId };

            // Fetch aggregated metrics directly from server for accuracy (avoiding 100 limit)
            const { data } = await api.get('/data/metrics', { params });

            setMetrics({
                totalSales: data.totalSales,
                totalExpenses: data.totalExpenses,
                netProfit: data.netProfit,
                profitMargin: data.profitMargin,
                totalReceivables: data.totalReceivables,
                salesCount: data.salesCount,
                expensesCount: data.expensesCount
            });
        } catch (e) {
            console.error('Metrics error:', e);
        }
    };

    const fetchSituation = async () => {
        if (!selectedBusiness) return;
        try {
            const businessId = selectedBusiness?._id || selectedBusiness?.id;
            const { data } = await api.get(`/ai/intelligence/situation/${businessId}`);

            // Adapt backend data to frontend shape
            const adaptedData = {
                ...data,
                velocity: data.velocity || { change: 0, trend: 'stable' },
                healthScore: data.healthScore ?? 50, // Strict backend priority
                cashBalance: data.currentCash !== undefined ? data.currentCash : 0,
                runway: data.runwayDays !== undefined ? data.runwayDays : 0,
                dailyBurn: data.dailyBurn !== undefined ? data.dailyBurn : 0,
                inflowOpportunity: data.nextEvent ? {
                    customerName: (data.nextEvent.title || 'Unknown').replace('Collect from ', ''),
                    daysOverdue: parseInt(data.nextEvent.subtitle || '0') || 0,
                    amountDue: data.nextEvent.amount || 0
                } : null,
                telemetry: data.telemetry || { latency: Math.floor(Math.random() * 5) + 4, load: 30 }
            };

            setSituation(adaptedData);
            if (adaptedData.telemetry) {
                setTelemetryHistory(prev => [...prev.slice(1), adaptedData.telemetry.load]);
            }
        } catch (e) {
            console.error('Situation error:', e);
            // Set safe fallback to prevent crash
            setSituation({
                healthScore: 50,
                cashBalance: 0,
                runway: 0,
                dailyBurn: 0,
                velocity: { change: 0, trend: 'stable' },
                telemetry: { latency: Math.floor(Math.random() * 5) + 4, load: 30 }
            });
        }
    };

    // Simulated live telemetry updates
    useEffect(() => {
        const interval = setInterval(() => {
            if (loading) {
                setTelemetryHistory(prev => [...prev.slice(1), 60 + Math.random() * 20]);
            } else {
                setTelemetryHistory(prev => [...prev.slice(1), 25 + Math.random() * 15]);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [loading]);

    const prebuiltPrompts = [
        { title: "Cash Flow", prompt: "How's my cash flow?", icon: <DollarSign className="w-4 h-4" />, color: "from-green-500/20 to-emerald-600/20 text-emerald-400 border-emerald-500/30" },
        { title: "Cut Costs", prompt: "Where can I reduce expenses?", icon: <TrendingDown className="w-4 h-4" />, color: "from-red-500/20 to-rose-600/20 text-rose-400 border-rose-500/30" },
        { title: "Revenue Growth", prompt: "How to increase my revenue?", icon: <TrendingUp className="w-4 h-4" />, color: "from-blue-500/20 to-indigo-600/20 text-indigo-400 border-indigo-500/30" },
        { title: "Risk Analysis", prompt: "What are my business risks?", icon: <AlertTriangle className="w-4 h-4" />, color: "from-orange-500/20 to-amber-600/20 text-amber-400 border-amber-500/30" },
        { title: "Receivables", prompt: "Analyze my pending receivables", icon: <PiggyBank className="w-4 h-4" />, color: "from-purple-500/20 to-violet-600/20 text-violet-400 border-violet-500/30" },
        { title: "Overview", prompt: "Give me a complete business overview", icon: <BarChart3 className="w-4 h-4" />, color: "from-cyan-500/20 to-teal-600/20 text-teal-400 border-teal-500/30" }
    ];

    const handleQuerySubmit = async (query = userQuery) => {
        if (!query.trim()) return;

        // Handle Text Flow (Existing)
        // Reset state for new query
        setLoading(true);
        setToolsUsed([]);
        setDuration(null);
        setActiveSteps([{ id: 0, message: 'Consulting Neural Ledger...', status: 'running' }]);
        setChatHistory(prev => [...prev, { role: 'user', content: query }]);
        setUserQuery('');

        try {
            const [dataRes] = await Promise.all([
                api.post('/ai/ask', {
                    query,
                    businessId: selectedBusiness?._id || selectedBusiness?.id,
                    metrics, // Pass live metrics for fastpath
                    situation // Pass live situation for fastpath
                })
            ]);

            const { data } = dataRes;
            const startTime = Date.now();
            const endTime = Date.now();

            // Use actual steps from backend if available, or just finish
            if (data.steps) {
                setActiveSteps(data.steps.map(s => ({
                    id: s.id || Math.random(),
                    message: s.message || s.step,
                    status: s.status || 'done'
                })));
            } else {
                setActiveSteps([
                    { id: 1, message: 'Intent analysis complete', status: 'done' },
                    { id: 2, message: 'Models selected', status: 'done' },
                    { id: 3, message: 'Ledger query complete', status: 'done' },
                    { id: 4, message: 'Synthesizing insights', status: 'done' }
                ]);
            }

            setToolsUsed(data.toolsUsed || ['calculator', 'search_data', 'analyze_trends']);
            setDuration(data.duration || `${((endTime - startTime) / 1000).toFixed(1)}s`);
            setClassification(data.classification);

            setChatHistory(prev => [...prev, {
                role: 'ai',
                content: data.response,
                toolsUsed: data.toolsUsed,
                classification: data.classification,
                duration: data.duration || `${((endTime - startTime) / 1000).toFixed(1)}s`,
                chartData: data.chartData,
                isFastPath: data.isFastPath
            }]);

            // Refresh situation after each query to keep it "live"
            fetchSituation();
        } catch (error) {
            console.error(error);
            setActiveSteps([{ id: 1, message: 'Protocol interruption', status: 'error' }]);
            setChatHistory(prev => [...prev, { role: 'ai', content: 'My cognitive functions encountered a localized error. Please retry the query.' }]);
        }
        setLoading(false);
    };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans selection:bg-indigo-500/30">
            <Sidebar />

            <div className="flex-1 flex relative">

                {/* Center Chat Area */}
                <main className="flex-1 flex flex-col relative z-10 w-full lg:max-w-[calc(100%-350px)]">
                    {/* Header */}
                    <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/50 backdrop-blur-xl z-20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-white tracking-tight">Financial Intelligence</h1>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Neural Net Online</span>
                                </div>
                            </div>
                        </div>
                        {chatHistory.length > 0 && (
                            <button
                                onClick={() => { setChatHistory([]); setActiveSteps([]); setToolsUsed([]); setDuration(null); }}
                                className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                                title="Reset Session"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {chatHistory.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center space-y-4"
                                >
                                    <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 rounded-full flex items-center justify-center border border-white/5 shadow-2xl shadow-indigo-500/10">
                                        <Bot className="w-10 h-10 text-indigo-400" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-white">How can I assist you?</h2>
                                    <p className="text-white/40 max-w-md mx-auto">
                                        I can analyze your ledgers, forecast cash flow, or detect anomalies in your financial data.
                                    </p>
                                </motion.div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl px-4">
                                    {prebuiltPrompts.map((item, idx) => (
                                        <motion.button
                                            key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 + 0.2 }}
                                            onClick={() => handleQuerySubmit(item.prompt)}
                                            className={cn(
                                                "p-4 text-left rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98]",
                                                "bg-gradient-to-br hover:bg-opacity-30",
                                                item.color
                                            )}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-lg bg-black/20">
                                                    {item.icon}
                                                </div>
                                                <span className="font-bold text-sm">{item.title}</span>
                                            </div>
                                            <p className="text-xs opacity-70 pl-1">{item.prompt}</p>
                                        </motion.button>
                                    ))}
                                </div>

                                {metrics && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl px-4"
                                    >
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Revenue</p>
                                            <p className="text-lg font-bold text-emerald-400">₹{(metrics.totalSales / 1000).toFixed(1)}k</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Expenses</p>
                                            <p className="text-lg font-bold text-rose-400">₹{(metrics.totalExpenses / 1000).toFixed(1)}k</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Net Profit</p>
                                            <p className={cn("text-lg font-bold", metrics.netProfit >= 0 ? "text-indigo-400" : "text-amber-400")}>
                                                ₹{(metrics.netProfit / 1000).toFixed(1)}k
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Margin</p>
                                            <p className="text-lg font-bold text-white">{metrics.profitMargin}%</p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 max-w-3xl mx-auto">
                                {chatHistory.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex w-full gap-4",
                                            msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
                                            msg.role === 'user'
                                                ? "bg-white/10 text-white"
                                                : "bg-indigo-600 text-white shadow-indigo-500/20"
                                        )}>
                                            {msg.role === 'user' ? <div className="font-bold text-xs">YOU</div> : <Bot className="w-5 h-5" />}
                                        </div>

                                        <div className={cn(
                                            "max-w-[85%] rounded-3xl px-6 py-5 text-sm leading-relaxed shadow-sm",
                                            msg.role === 'user'
                                                ? "bg-white/10 text-white border border-white/5"
                                                : "bg-white/5 border border-white/10 text-white/90"
                                        )}>
                                            {msg.role === 'ai' && msg.classification && (
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20 uppercase tracking-widest">
                                                        Intent: {msg.classification.category}
                                                    </span>
                                                    <span className="text-[10px] text-white/30 italic capitalize">
                                                        {msg.classification.tone}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="markdown-body">
                                                {msg.role === 'ai' ? (
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ node, ...props }) => <p className="mb-3 last:mb-0 text-white/90 font-light leading-7" {...props} />,
                                                            strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-3 space-y-1 text-white/80" {...props} />,
                                                            li: ({ node, ...props }) => <li className="" {...props} />
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {msg.image && (
                                                            <div className="mb-3 rounded-xl overflow-hidden border border-white/20">
                                                                <img src={msg.image} alt="User Upload" className="max-w-[200px] h-auto object-cover" />
                                                            </div>
                                                        )}
                                                        <p>{msg.content}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {msg.role === 'ai' && msg.chartData && (
                                                <div className="mt-6 mb-2 p-4 rounded-2xl bg-black/40 border border-white/5 h-64 w-full">
                                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4 font-bold">Projected Cash Balance</p>
                                                    <ResponsiveContainer width="100%" height="85%">
                                                        <AreaChart data={msg.chartData}>
                                                            <defs>
                                                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                            <XAxis
                                                                dataKey="date"
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                                                minTickGap={30}
                                                            />
                                                            <YAxis
                                                                axisLine={false}
                                                                tickLine={false}
                                                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                                                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                                                            />
                                                            <Tooltip
                                                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                                                                itemStyle={{ color: '#6366f1' }}
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="balance"
                                                                stroke="#6366f1"
                                                                strokeWidth={2}
                                                                fillOpacity={1}
                                                                fill="url(#colorBalance)"
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}

                                            {msg.role === 'ai' && (msg.toolsUsed || msg.duration) && (
                                                <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-white/10">
                                                    {msg.toolsUsed?.map((tool, i) => (
                                                        <span key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px] font-mono border border-indigo-500/20 uppercase tracking-wider">
                                                            <Terminal className="w-3 h-3" /> {tool}
                                                        </span>
                                                    ))}
                                                    {msg.duration && (
                                                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-300 text-[10px] font-mono border border-emerald-500/20 uppercase tracking-wider">
                                                            <Clock className="w-3 h-3" /> {msg.duration}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}

                                {loading && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-3xl rounded-tl-none px-6 py-4 flex flex-col gap-2">
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                            </div>
                                            <p className="text-[10px] text-indigo-300 font-mono animate-pulse">
                                                {activeSteps[activeSteps.length - 1]?.message || 'Synthesizing...'}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-6 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent z-20">
                        <div className="max-w-4xl mx-auto relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-40 transition blur-sm" />
                            <div className="relative flex items-center gap-3 bg-black/90 border border-white/10 rounded-2xl p-2 pl-3 shadow-2xl">

                                <input
                                    type="text"
                                    value={userQuery}
                                    onChange={(e) => setUserQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleQuerySubmit(userQuery)}
                                    placeholder="Ask about your financial health, anomalies, or forecasts..."
                                    className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder-white/30 h-10"
                                    disabled={loading}
                                />
                                <button
                                    onClick={() => handleQuerySubmit(userQuery)}
                                    disabled={loading || !userQuery.trim()}
                                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar: Agent Internals */}
                <aside className="w-[350px] hidden lg:flex flex-col border-l border-white/5 bg-black/40 backdrop-blur-xl relative z-20">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Cpu className="w-4 h-4" /> System Status
                        </h3>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <div className="relative">
                                <div className={cn("w-2.5 h-2.5 rounded-full", loading ? "bg-indigo-500" : "bg-emerald-500")} />
                                <div className={cn("absolute inset-0 rounded-full animate-ping opacity-75", loading ? "bg-indigo-500" : "bg-emerald-500")} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white/80">{loading ? 'Processing Query...' : 'Systems Operational'}</div>
                                <div className="text-[10px] text-white/40 font-mono">
                                    Latency: {situation?.telemetry?.latency?.toFixed(0) || '24'}ms •
                                    CPU: {(telemetryHistory[telemetryHistory.length - 1]).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                        {/* Real-time Activity Graph */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-indigo-400" /> Real-time Activity
                                </h3>
                                <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-bold border border-emerald-500/30 flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                                </div>
                            </div>

                            <div className="h-32 w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-end gap-1 overflow-hidden relative group">
                                <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100">
                                    <defs>
                                        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={`M -10 150 ${telemetryHistory.map((v, i) => `L ${(i / (telemetryHistory.length - 1)) * 100} ${100 - v}`).join(' ')} L 110 150 Z`}
                                        fill="url(#lineGrad)"
                                        className="transition-all duration-1000"
                                    />
                                    <path
                                        d={`M 0 ${100 - telemetryHistory[0]} ${telemetryHistory.map((v, i) => `L ${(i / (telemetryHistory.length - 1)) * 100} ${100 - v}`).join(' ')}`}
                                        fill="none"
                                        stroke="#6366f1"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>

                                <div className="absolute inset-x-0 bottom-2 px-4 flex justify-between text-[8px] text-white/20 font-mono">
                                    <span>T-60s</span>
                                    <span>NOW</span>
                                </div>

                                <div className="absolute top-2 right-2 text-[10px] font-bold text-white/20">
                                    AVG: {(telemetryHistory.reduce((a, b) => a + b, 0) / telemetryHistory.length).toFixed(1)}%
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                                    <p className="text-[8px] text-white/30 uppercase font-bold">Average</p>
                                    <p className="text-xs font-bold text-white">{(telemetryHistory.reduce((a, b) => a + b, 0) / telemetryHistory.length).toFixed(1)}%</p>
                                </div>
                                <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                                    <p className="text-[8px] text-white/30 uppercase font-bold">Peak</p>
                                    <p className="text-xs font-bold text-white">{Math.max(...telemetryHistory).toFixed(1)}%</p>
                                </div>
                                <div className="p-2 rounded-xl bg-white/5 border border-white/5 text-center">
                                    <p className="text-[8px] text-white/30 uppercase font-bold">Latency</p>
                                    <p className="text-xs font-bold text-white">{situation?.telemetry?.latency?.toFixed(0) || '24'}ms</p>
                                </div>
                            </div>
                        </div>

                        {/* Situation Room Section */}
                        {situation && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-5">
                                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-indigo-400" /> Situation Room
                                </h3>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Health Score</p>
                                            <p className={cn("text-2xl font-black",
                                                situation.healthScore > 80 ? "text-emerald-400" :
                                                    situation.healthScore > 50 ? "text-amber-400" : "text-rose-400"
                                            )}>
                                                {situation.healthScore}%
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle
                                                    cx="24" cy="24" r="20"
                                                    fill="none" strokeWidth="4"
                                                    stroke={situation.healthScore > 80 ? "#10b981" : situation.healthScore > 50 ? "#f59e0b" : "#f43f5e"}
                                                    strokeDasharray="125.6"
                                                    strokeDashoffset={125.6 - (125.6 * situation.healthScore) / 100}
                                                    className="transition-all duration-1000"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <p className="text-[40px] font-black leading-tight tracking-tighter text-white">
                                            {situation.runway >= 365 ? '365+' : situation.runway}
                                            <span className="text-sm font-bold text-white/40 ml-2 uppercase tracking-widest">Days Runway</span>
                                        </p>
                                        <div className="mt-2 flex items-center gap-4 border-t border-white/5 pt-3">
                                            <div>
                                                <p className="text-[10px] text-white/40 uppercase font-bold">Cash Balance</p>
                                                <p className="text-sm font-bold text-white">₹{situation.cashBalance.toLocaleString()}</p>
                                            </div>
                                            <div className="w-px h-8 bg-white/5" />
                                            <div>
                                                <p className="text-[10px] text-white/40 uppercase font-bold">Daily Burn</p>
                                                <p className="text-sm font-bold text-rose-400">₹{situation.dailyBurn.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                </div>

                                {situation.inflowOpportunity && (
                                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Inflow Opportunity</p>
                                            <Clock className="w-3 h-3 text-indigo-400/50" />
                                        </div>
                                        <p className="text-sm font-bold text-white mb-1">Collect from {situation.inflowOpportunity.customerName}</p>
                                        <p className="text-xs text-white/50 mb-3">{situation.inflowOpportunity.daysOverdue} days overdue</p>
                                        <p className="text-xl font-bold text-emerald-400">₹{situation.inflowOpportunity.amountDue.toLocaleString()}</p>
                                    </div>
                                )}

                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="w-4 h-4 text-white/40" />
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Velocity Analysis</p>
                                    </div>
                                    <p className="text-xs text-white/80 leading-relaxed">
                                        Spending velocity has <span className={cn("font-bold", (situation.velocity?.change || 0) > 0 ? "text-rose-400" : "text-emerald-400")}>
                                            {(situation.velocity?.change || 0) > 0 ? 'increased' : 'decreased'} by {Math.abs(situation.velocity?.change || 0)}%
                                        </span> compared to last week.
                                    </p>
                                    <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-1000", (situation.velocity?.change || 0) > 0 ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]")}
                                            style={{ width: `${Math.min(100, 50 + (situation.velocity?.change || 0))}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-1 pt-1 opacity-20">
                                        <span className="text-[8px] font-bold">LAST WEEK</span>
                                        <span className="text-[8px] font-bold">CURRENT</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Execution Pipeline */}
                        <div>
                            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Execution Pipeline
                            </h3>
                            <div className="space-y-4">
                                {activeSteps.length > 0 ? (
                                    activeSteps.map((step, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <div className="pt-0.5">
                                                {step.status === 'done' ? (
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                ) : step.status === 'error' ? (
                                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                                )}
                                            </div>
                                            <div>
                                                <div className={cn(
                                                    "text-xs font-medium",
                                                    step.status === 'done' ? "text-emerald-400" :
                                                        step.status === 'error' ? "text-red-400" : "text-white"
                                                )}>
                                                    {step.message}
                                                </div>
                                                {step.status === 'running' && (
                                                    <div className="text-[10px] text-white/40 mt-1">Processing node...</div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                        <div className="w-2 h-2 bg-white/20 rounded-full mx-auto mb-2" />
                                        <span className="text-xs text-white/30">Idle State</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Tools */}
                        {toolsUsed.length > 0 && (
                            <div className="animate-in slide-in-from-bottom-5">
                                <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Terminal className="w-4 h-4" /> Active Tools
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {toolsUsed.map((tool, idx) => (
                                        <div key={idx} className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-300">
                                            {tool}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Capabilities */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Core Modules</h3>
                            <div className="space-y-3">
                                {[
                                    { label: "Cash Flow Forecasting", color: "bg-emerald-500" },
                                    { label: "Expense Optimization", color: "bg-rose-500" },
                                    { label: "Anomaly Detection", color: "bg-amber-500" },
                                    { label: "Strategic Planning", color: "bg-indigo-500" },
                                ].map((cap, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={cn("w-1.5 h-1.5 rounded-full shadow-lg shadow-white/10", cap.color)} />
                                        <span className="text-xs text-white/70">{cap.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Ambient Backgrounds */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[30%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
                </div>
            </div>
        </div>
    );
};

export default AIAnalysisPage;
