import { useState, useRef, useEffect, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import api from '../api/axios';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, ChevronDown, ChevronUp, Zap, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils exists

// Typewriter Effect Component
const Typewriter = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const indexRef = useRef(0);

    useEffect(() => {


        const intervalId = setInterval(() => {
            setDisplayedText((prev) => {
                if (indexRef.current >= text.length) {
                    clearInterval(intervalId);
                    if (onComplete) onComplete();
                    return text;
                }
                const nextChar = text.charAt(indexRef.current);
                indexRef.current++;
                return prev + nextChar;
            });
        }, 2); // Speed of typing (Ultra Fast)

        return () => clearInterval(intervalId);
    }, [text]);

    return <ReactMarkdown components={{
        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-semibold text-indigo-300" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
        li: ({ node, ...props }) => <li className="text-white/90" {...props} />,
    }}>{displayedText}</ReactMarkdown>;
};

const ChatBot = ({ forecastData, currentCash, metrics, situation }) => {
    const { selectedBusiness } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: 'Hello! I am **Cashly Agent v2**. I can analyze your cash flow, predict risks, and simulate scenarios.\n\nHow can I help you today?',
            timestamp: new Date().toISOString()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [showThinking, setShowThinking] = useState(null); // ID of message to show thinking for

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        const userMsgObj = {
            type: 'user',
            text: userMessage,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };
        setMessages(prev => [...prev, userMsgObj]);
        setIsLoading(true);

        try {
            // --- CLIENT-SIDE FASTPATH REMOVED FOR ACCURACY ---
            // Delegating all logic to the server which now has sub-10ms accurate fast path.

            const { data } = await api.post('/ai/ask', {
                query: userMessage,
                businessId: selectedBusiness?._id || selectedBusiness?.id,
                forecastData,
                currentCash,
                metrics,
                situation
            });

            const botMsgObj = {
                type: 'bot',
                text: data.response,
                classification: data.classification,
                steps: data.steps || [],
                timestamp: new Date().toISOString(),
                id: Date.now() + 1,
                isFastPath: data.isFastPath
            };

            setMessages(prev => [...prev, botMsgObj]);
            // Auto open reasoning if steps exist
            if (data.steps && data.steps.length > 0) {
                setShowThinking(botMsgObj.id);
            }

        } catch (error) {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: '⚠️ **Connection Error**: I could not reach the neural engine. Please try again.',
                timestamp: new Date().toISOString(),
                id: Date.now() + 2
            }]);
        } finally {
            // Only toggle off here if we didn't fastpath return earlier
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 transition-colors flex items-center justify-center group"
                >
                    <div className="absolute inset-0 rounded-full animate-ping bg-indigo-500 opacity-20 duration-1000"></div>
                    <Sparkles className="w-6 h-6" />
                </motion.button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] flex flex-col bg-[#0A0A0B] border border-white/10 rounded-3xl shadow-2xl overflow-hidden font-sans"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-900/50 to-violet-900/50 border-b border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                    <Bot className="w-5 h-5 text-indigo-300" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Cashly Agent</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-white/50 font-medium tracking-wide uppercase">Online • v2.0</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex gap-3",
                                        msg.type === 'user' ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    {/* Avatar */}
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                        msg.type === 'user' ? "bg-white/10" : "bg-indigo-600/20 border border-indigo-500/30"
                                    )}>
                                        {msg.type === 'user' ? <User className="w-4 h-4 text-white/70" /> : <Sparkles className="w-4 h-4 text-indigo-400" />}
                                    </div>

                                    {/* Content Bubble */}
                                    <div className={cn(
                                        "max-w-[85%] rounded-2xl p-4 text-sm relative group",
                                        msg.type === 'user'
                                            ? "bg-white/10 text-white border border-white/5 ml-auto"
                                            : "bg-[#18181B] border border-white/10 text-white/90 shadow-xl"
                                    )}>
                                        {/* Thinking Process Accordion */}
                                        {msg.steps && msg.steps.length > 0 && (
                                            <div className="mb-3">
                                                <button
                                                    onClick={() => setShowThinking(showThinking === msg.id ? null : msg.id)}
                                                    className="flex items-center gap-2 text-xs font-medium text-emerald-400/80 hover:text-emerald-300 transition-colors w-full p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10"
                                                >
                                                    <Zap className="w-3 h-3" />
                                                    {showThinking === msg.id ? 'Hide Reasoning' : `View Reasoning (${msg.steps.length} steps)`}
                                                    {showThinking === msg.id ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
                                                </button>

                                                <AnimatePresence>
                                                    {showThinking === msg.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="mt-2 pl-3 border-l pb-1 border-white/10 space-y-2">
                                                                {msg.steps.map((step, idx) => (
                                                                    <motion.div
                                                                        key={idx}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: idx * 0.1 }}
                                                                        className="text-xs text-white/50"
                                                                    >
                                                                        <span className="font-mono text-indigo-400/60 mr-2">0{idx + 1}</span>
                                                                        {step.message || step.step}
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}

                                        {/* Message Text */}
                                        <div className="markdown-body leading-relaxed">
                                            {msg.type === 'bot' ? (
                                                msg.isFastPath ? (
                                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                ) : (
                                                    <Typewriter key={msg.id} text={msg.text} />
                                                )
                                            ) : (
                                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                            )}
                                        </div>

                                        <div className={cn(
                                            "text-[10px] mt-2 opacity-50 font-mono",
                                            msg.type === 'user' ? "text-right text-white/40" : "text-left text-white/30"
                                        )}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 bg-indigo-600/20 border border-indigo-500/30">
                                        <Sparkles className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <div className="bg-[#18181B] border border-white/10 rounded-2xl p-4 flex items-center gap-1.5 h-10">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[#0A0A0B] border-t border-white/10">
                            {messages.length < 3 && (
                                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none pb-1">
                                    {['Risk check', 'Forecast cash', 'Analyze Expenses'].map((q) => (
                                        <button
                                            key={q}
                                            onClick={() => setInput(q)}
                                            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/70 hover:text-white transition-colors"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ask anything..."
                                    className="w-full bg-white/5 hover:bg-white/[0.07] focus:bg-white/10 transition-colors border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder:text-white/20"
                                    disabled={isLoading}
                                    autoFocus
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg transition-all shadow-lg shadow-indigo-600/20"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatBot;
