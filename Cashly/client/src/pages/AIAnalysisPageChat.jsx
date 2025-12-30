import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedAIChat } from '../components/ui/animated-ai-chat';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const AIAnalysisPageChat = () => {
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
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-black/40">
                    {/* Ambient Background */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px]" />
                    </div>

                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                        <AnimatedAIChat />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AIAnalysisPageChat;
