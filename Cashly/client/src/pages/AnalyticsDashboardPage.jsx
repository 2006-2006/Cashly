import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnalyticsDashboard from '../components/ui/analytics-dashboard';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const AnalyticsDashboardPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans selection:bg-indigo-500/30">
            <Sidebar />

            <main className="flex-1 relative overflow-hidden flex flex-col">
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/50 backdrop-blur-xl z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 -ml-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="font-bold text-white tracking-tight flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-purple-400" />
                                Comprehensive Analysis
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-black">
                    <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[500px]">
                        <AnalyticsDashboard />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AnalyticsDashboardPage;
