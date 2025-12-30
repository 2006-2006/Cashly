import React from 'react';
import { useNavigate } from 'react-router-dom';
import AreaChart from '../components/ui/area-chart';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const AreaChartPage = () => {
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
                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                Growth Analytics
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-black">
                    <div className="max-w-6xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <AreaChart
                            className="w-full h-[400px]"
                            dark
                            stacked
                            index="Month"
                            categories={["Sales", "Returns", "Profit"]}
                            data={[
                                { Month: "Jan", Sales: 120, Returns: 10, Profit: 60 },
                                { Month: "Feb", Sales: 140, Returns: 12, Profit: 72 },
                                { Month: "Mar", Sales: 160, Returns: 11, Profit: 78 },
                                { Month: "Apr", Sales: 180, Returns: 15, Profit: 90 },
                                { Month: "May", Sales: 210, Returns: 13, Profit: 110 },
                                { Month: "Jun", Sales: 230, Returns: 17, Profit: 118 },
                                { Month: "Jul", Sales: 240, Returns: 16, Profit: 122 },
                                { Month: "Aug", Sales: 250, Returns: 18, Profit: 128 },
                                { Month: "Sep", Sales: 220, Returns: 14, Profit: 112 },
                                { Month: "Oct", Sales: 200, Returns: 12, Profit: 100 },
                                { Month: "Nov", Sales: 260, Returns: 19, Profit: 132 },
                                { Month: "Dec", Sales: 300, Returns: 20, Profit: 150 },
                            ]}
                            colors={["#0c6d62", "#12a594", "#10b3a3"]}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AreaChartPage;
