import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import {
    Store,
    Scissors,
    Factory,
    Utensils,
    Package,
    Settings,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Building2,
    Briefcase,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import api from '../api/axios';
import { supabase } from '../lib/supabase';
import { getAllTemplates, getTemplate } from '../lib/templates';
import { cn } from '@/lib/utils';
// import './BusinessSetup.css'; // Removed, using Tailwind

const BusinessSetup = () => {
    const { fetchBusinesses, selectedBusiness, user, addLocalBusiness } = useContext(AuthContext);
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templateData, setTemplateData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Retail',
        currency: 'INR'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setTemplates(getAllTemplates());
    }, []);

    useEffect(() => {
        if (selectedBusiness) {
            navigate('/dashboard');
        }
    }, [selectedBusiness, navigate]);

    const selectTemplate = (key) => {
        setSelectedTemplate(key);
        if (key === 'custom') {
            setTemplateData(null);
            return;
        }
        const template = getTemplate(key);
        if (template) {
            setTemplateData(template);
            setFormData(prev => ({
                ...prev,
                type: template.type || 'Retail'
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!user) {
            setError('User not authenticated');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.from('businesses').insert({
                user_id: user.id,
                name: formData.name,
                type: formData.type,
                currency: formData.currency
            }).select();

            if (error) {
                if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
                    // Is Local Mode
                    const newBusiness = {
                        id: 'local-' + Math.random().toString(36).substr(2, 9),
                        user_id: user.id,
                        name: formData.name,
                        type: formData.type,
                        currency: formData.currency,
                        created_at: new Date().toISOString()
                    };
                    // Use context to add locally
                    if (addLocalBusiness) {
                        addLocalBusiness(newBusiness);
                    } else {
                        // Fallback if context refresh meant old function
                        console.warn("Context outdated, saving to LS directly");
                        const localData = JSON.parse(localStorage.getItem('local_businesses') || '[]');
                        localData.push(newBusiness);
                        localStorage.setItem('local_businesses', JSON.stringify(localData));

                        // Force update context via fetch?
                        await fetchBusinesses(user.id);
                    }
                    navigate('/dashboard');
                    return;
                }
                throw error;
            }

            await fetchBusinesses(user.id);
            navigate('/dashboard');
        } catch (err) {
            console.error('Business creation failed:', err);
            // Safety fallback for any error in setup: try local
            const newBusiness = {
                id: 'local-' + Math.random().toString(36).substr(2, 9),
                user_id: user.id,
                name: formData.name,
                type: formData.type,
                currency: formData.currency,
                created_at: new Date().toISOString()
            };
            if (addLocalBusiness) {
                addLocalBusiness(newBusiness);
                navigate('/dashboard');
            } else {
                setError(err.message || 'Failed to create business');
            }
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (key) => {
        switch (key) {
            case 'kirana': return <Store className="w-8 h-8" />;
            case 'salon': return <Scissors className="w-8 h-8" />;
            case 'manufacturer': return <Factory className="w-8 h-8" />;
            case 'restaurant': return <Utensils className="w-8 h-8" />;
            case 'trader': return <Package className="w-8 h-8" />;
            default: return <Settings className="w-8 h-8" />;
        }
    };

    return (
        <div className="min-h-screen w-full bg-black text-white flex flex-col relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
            </div>

            {/* Navbar (Minimal) */}
            <div className="relative z-10 w-full p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 text-white p-2 rounded-xl">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Cashly</span>
                </div>
            </div>

            <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-4xl"
                >
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40 mb-4">
                            Setup Your Headquarters
                        </h1>
                        <p className="text-white/50 text-lg">
                            Configure your workspace in less than 2 minutes.
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-center mb-12">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full border transition-colors",
                                step >= 1 ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20" : "bg-white/5 border-white/10 text-white/50"
                            )}>
                                <span className="text-xs font-bold uppercase tracking-widest">01. Sector</span>
                            </div>
                            <div className="w-12 h-px bg-white/10" />
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full border transition-colors",
                                step >= 2 ? "bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20" : "bg-white/5 border-white/10 text-white/50"
                            )}>
                                <span className="text-xs font-bold uppercase tracking-widest">02. Identity</span>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-2lg:grid-cols-3 gap-4">
                                    {templates.map(t => (
                                        <motion.div
                                            key={t.key}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => selectTemplate(t.key)}
                                            className={cn(
                                                "p-6 rounded-3xl border cursor-pointer transition-all flex flex-col items-center text-center gap-4 group relative overflow-hidden",
                                                selectedTemplate === t.key
                                                    ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-900/40"
                                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-4 rounded-2xl transition-colors",
                                                selectedTemplate === t.key ? "bg-white/20" : "bg-black/40"
                                            )}>
                                                {getIcon(t.key)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">{t.name}</h3>
                                                <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">{t.type}</p>
                                            </div>
                                            {selectedTemplate === t.key && (
                                                <div className="absolute top-4 right-4">
                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}

                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => { setSelectedTemplate('custom'); setTemplateData(null); }}
                                        className={cn(
                                            "p-6 rounded-3xl border cursor-pointer transition-all flex flex-col items-center text-center gap-4 group relative overflow-hidden",
                                            selectedTemplate === 'custom'
                                                ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-900/40"
                                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-4 rounded-2xl transition-colors",
                                            selectedTemplate === 'custom' ? "bg-white/20" : "bg-black/40"
                                        )}>
                                            <Settings className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold">Custom</h3>
                                            <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">Manual Setup</p>
                                        </div>
                                        {selectedTemplate === 'custom' && (
                                            <div className="absolute top-4 right-4">
                                                <CheckCircle2 className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                    </motion.div>
                                </div>

                                {/* Template Preview */}
                                {templateData && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md"
                                    >
                                        <h4 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
                                            Configuration Preview
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span className="text-sm font-bold">Income Streams</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {templateData.categories.income.slice(0, 5).map((c, i) => (
                                                        <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-medium text-emerald-400">
                                                            {c}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                                                    <span className="text-sm font-bold">Expense Channels</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {templateData.categories.expense.slice(0, 5).map((c, i) => (
                                                        <span key={i} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-medium text-rose-400">
                                                            {c}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        {templateData.tips && (
                                            <div className="mt-8 pt-6 border-t border-white/5">
                                                <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
                                                    <Globe className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                                    <div className="space-y-1">
                                                        <h5 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Industry Insight</h5>
                                                        <p className="text-sm text-indigo-200/80 leading-relaxed">
                                                            {templateData.tips[0]}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!selectedTemplate}
                                        className="group flex items-center gap-2 px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                                    >
                                        Continue Setup
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-xl mx-auto space-y-8 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md"
                            >
                                <div className="space-y-2 text-center mb-8">
                                    <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                                        <Building2 className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Business Identity</h2>
                                    <p className="text-white/50">Finalize your entity configuration.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">
                                            Registered Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Apex Innovations Ltd."
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            autoFocus
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/60 uppercase tracking-widest pl-1">
                                            Operational Model
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                        >
                                            <option value="Retail">Retail & Commerce</option>
                                            <option value="Service">Professional Services</option>
                                            <option value="Manufacturing">Manufacturing & Production</option>
                                            <option value="Trading">Trading & Distribution</option>
                                            <option value="Other">Other / Hybrid</option>
                                        </select>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium text-center"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || !formData.name}
                                            className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    Initializing...
                                                </>
                                            ) : (
                                                <>
                                                    Launch Dashboard
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
};

export default BusinessSetup;
