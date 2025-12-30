"use client";

import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    ImageIcon,
    FileUp,
    Figma,
    MonitorIcon,
    CircleUserRound,
    ArrowUpIcon,
    Paperclip,
    PlusIcon,
    SendIcon,
    XIcon,
    LoaderIcon,
    Sparkles,
    Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"
import ReactMarkdown from 'react-markdown';
import { CursorSpotlight } from "./cursor-spotlight";

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}) {
    const textareaRef = useRef(null);

    const adjustHeight = useCallback(
        (reset) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            textarea.style.height = `${minHeight}px`;
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

const Textarea = React.forwardRef(
    ({ className, containerClassName, showRing = true, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);

        return (
            <div className={cn(
                "relative",
                containerClassName
            )}>
                <textarea
                    className={cn(
                        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                        "transition-all duration-200 ease-in-out",
                        "placeholder:text-muted-foreground",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
                        className
                    )}
                    ref={ref}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {showRing && isFocused && (
                    <motion.span
                        className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}

                {props.onChange && (
                    <div
                        className="absolute bottom-2 right-2 opacity-0 w-2 h-2 bg-violet-500 rounded-full"
                        style={{
                            animation: 'none',
                        }}
                        id="textarea-ripple"
                    />
                )}
            </div>
        )
    }
)
Textarea.displayName = "Textarea"

// ... imports ...
import api from "../../api/axios";
import AuthContext from "../../contexts/AuthContext";
import { useContext } from "react";
// ... other imports

export function AnimatedAIChat() {
    const { selectedBusiness } = useContext(AuthContext);
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });
    const [inputFocused, setInputFocused] = useState(false);
    const commandPaletteRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const commandSuggestions = [
        {
            icon: <Sparkles className="w-4 h-4" />,
            label: "Analyze Risk",
            description: "Assess current cash flow risks",
            prefix: "/risk"
        },
        {
            icon: <MonitorIcon className="w-4 h-4" />,
            label: "Forecast",
            description: "Predict next month's cash",
            prefix: "/forecast"
        },
        {
            icon: <FileUp className="w-4 h-4" />,
            label: "Report",
            description: "Generate summary report",
            prefix: "/report"
        },
        {
            icon: <Command className="w-4 h-4" />,
            label: "General",
            description: "Ask a general question",
            prefix: "/ask"
        },
    ];

    // ... (keep useEffects for command palette, mouse move, click outside) ...





    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            const commandButton = document.querySelector('[data-command-button]');
            if (commandPaletteRef.current && !commandPaletteRef.current.contains(target) && !commandButton?.contains(target)) {
                setShowCommandPalette(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (showCommandPalette) {
            // ... (keep existing command palette navigation) ...
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => prev < commandSuggestions.length - 1 ? prev + 1 : 0);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => prev > 0 ? prev - 1 : commandSuggestions.length - 1);
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                if (activeSuggestion >= 0) {
                    const selectedCommand = commandSuggestions[activeSuggestion];
                    setValue(selectedCommand.prefix + ' ');
                    setShowCommandPalette(false);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCommandPalette(false);
            }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) handleSendMessage();
        }
    };

    const handleSendMessage = async () => {
        if (!value.trim()) return;

        const userMessage = {
            role: 'user',
            content: value.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setValue("");
        adjustHeight(true);
        setIsTyping(true);

        try {
            const response = await api.post('/ai/ask', {
                query: userMessage.content,
                businessId: selectedBusiness?._id
            });

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);

            setIsTyping(false);

        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having trouble connecting to my logic core. Please try again in a moment.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            setIsTyping(false);
        }
    };



    const selectCommandSuggestion = (index) => {
        const selectedCommand = commandSuggestions[index];
        setValue(selectedCommand.prefix + ' ');
        setShowCommandPalette(false);
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <div className="flex flex-col w-full h-[calc(100vh-80px)] items-center justify-between text-white p-6 relative overflow-hidden">

            {/* Premium Background Layer */}
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-black/90">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse pointer-events-none z-0" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700 pointer-events-none z-0" />
            </div>

            {/* Header */}
            <div className="w-full max-w-4xl mx-auto z-20 flex items-center justify-between p-4 mb-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white">Cashly Intelligence</h2>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs text-white/50">Online & Ready</span>
                        </div>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button
                        onClick={clearChat}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-white"
                        title="Clear Chat"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Chat Content Layer */}
            <div className="w-full max-w-4xl mx-auto z-10 flex-1 flex flex-col min-h-0 pointer-events-none">
                {messages.length === 0 ? (
                    /* --- EMPTY STATE --- */
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-center space-y-4"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40 pb-2">
                                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, Sir.
                            </h1>
                            <p className="text-lg text-white/50">
                                I'm ready to analyze your cash flow.
                            </p>
                        </motion.div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-none pointer-events-auto">
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "flex w-full gap-4",
                                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                                )}
                            >
                                {/* Avatar */}
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                                    msg.role === 'user'
                                        ? "bg-white/10 text-white"
                                        : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                )}>
                                    {msg.role === 'user' ? <CircleUserRound className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
                                </div>

                                {/* Message Bubble */}
                                <div className={cn(
                                    "max-w-[85%] rounded-2xl px-6 py-4 text-sm leading-relaxed",
                                    msg.role === 'user'
                                        ? "bg-white/5 backdrop-blur-sm border border-white/10 text-white"
                                        : "bg-white/5 backdrop-blur-md text-white/90 border border-white/5 shadow-xl"
                                )}>
                                    <div className="flex flex-col gap-1">
                                        {/* User name / Bot name */}
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <span className="text-xs font-semibold text-white/60">
                                                {msg.role === 'user' ? 'You' : 'Cashly Agent'}
                                            </span>
                                            <span className="text-[10px] text-white/30 font-mono">
                                                {msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="markdown-body text-white/90 font-light">
                                            {msg.role === 'user' ? (
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            ) : (
                                                <ReactMarkdown
                                                    components={{
                                                        h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-white mb-2 pb-2 border-b border-white/10" {...props} />,
                                                        h2: ({ node, ...props }) => <h2 className="text-base font-bold text-indigo-300 mt-4 mb-2" {...props} />,
                                                        h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-white/90 mt-3 mb-1" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 mb-3 text-white/80" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 mb-3 text-white/80" {...props} />,
                                                        li: ({ node, ...props }) => <li className="" {...props} />,
                                                        p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
                                                        code: ({ node, inline, className, children, ...props }) => (
                                                            inline ?
                                                                <code className="bg-black/30 px-1 py-0.5 rounded text-indigo-300 font-mono text-xs" {...props}>{children}</code> :
                                                                <pre className="bg-black/30 p-3 rounded-lg overflow-x-auto text-xs my-2 border border-white/10"><code className="text-indigo-200 font-mono" {...props}>{children}</code></pre>
                                                        ),
                                                        blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-indigo-500 pl-4 py-1 my-2 bg-indigo-500/10 rounded-r-lg italic" {...props} />
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex w-full gap-4"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-indigo-500/30">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/5 flex items-center">
                                    <TypingDots />
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>)}

                {/* --- INPUT AREA --- */}
                <div className="flex-none pt-4 pb-2 px-2 pointer-events-auto">
                    <motion.div
                        className="relative backdrop-blur-2xl bg-white/[0.03] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
                        initial={false}
                        animate={{
                            boxShadow: inputFocused ? "0 0 40px -10px rgba(99, 102, 241, 0.2)" : "0 0 20px -10px rgba(0,0,0,0.5)",
                            borderColor: inputFocused ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"
                        }}
                    >
                        <AnimatePresence>
                            {showCommandPalette && (
                                <motion.div
                                    ref={commandPaletteRef}
                                    className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-black/90 rounded-lg z-50 shadow-lg border border-white/10 overflow-hidden"
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="py-1 bg-black/95">
                                        {commandSuggestions.map((suggestion, index) => (
                                            <motion.div
                                                key={suggestion.prefix}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors cursor-pointer",
                                                    activeSuggestion === index
                                                        ? "bg-indigo-600/20 text-indigo-200"
                                                        : "text-white/70 hover:bg-white/5"
                                                )}
                                                onClick={() => selectCommandSuggestion(index)}
                                            >
                                                <div className="w-5 h-5 flex items-center justify-center opacity-70">
                                                    {suggestion.icon}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white/90">{suggestion.label}</span>
                                                    <span className="text-white/40 text-xs">{suggestion.description}</span>
                                                </div>
                                                <div className="ml-auto text-white/20 text-xs font-mono">
                                                    {suggestion.prefix}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4">
                            <Textarea
                                ref={textareaRef}
                                value={value}
                                onChange={(e) => {
                                    const newValue = e.target.value;
                                    setValue(newValue);
                                    adjustHeight();

                                    if (newValue.startsWith('/') && !newValue.includes(' ')) {
                                        setShowCommandPalette(true);
                                        const matchingSuggestionIndex = commandSuggestions.findIndex(
                                            (cmd) => cmd.prefix.startsWith(newValue)
                                        );
                                        setActiveSuggestion(matchingSuggestionIndex >= 0 ? matchingSuggestionIndex : -1);
                                    } else {
                                        setShowCommandPalette(false);
                                    }
                                }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                placeholder={messages.length === 0 ? "Ask zap a question..." : "Type a follow-up..."}
                                containerClassName="w-full"
                                className={cn(
                                    "w-full px-2 py-1",
                                    "resize-none",
                                    "bg-transparent",
                                    "border-none",
                                    "text-white/90 text-[15px] leading-relaxed",
                                    "focus:outline-none",
                                    "placeholder:text-white/20",
                                    "min-h-[24px]"
                                )}
                                style={{ overflow: "hidden" }}
                                showRing={false}
                            />
                        </div>

                        <div className="px-4 pb-4 pt-0 border-t border-white/[0.05] flex items-center justify-between gap-4 mt-2">
                            <div className="flex items-center gap-2">
                                <motion.button
                                    type="button"
                                    onClick={handleAttachFile}
                                    whileTap={{ scale: 0.94 }}
                                    className="p-2 text-white/40 hover:text-white/90 rounded-lg hover:bg-white/5 transition-colors relative group"
                                    title="Attach File"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                    type="button"
                                    data-command-button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCommandPalette(prev => !prev);
                                    }}
                                    whileTap={{ scale: 0.94 }}
                                    className={cn(
                                        "p-2 rounded-lg transition-colors relative group",
                                        showCommandPalette ? "bg-indigo-600/20 text-indigo-300" : "text-white/40 hover:text-white/90 hover:bg-white/5"
                                    )}
                                    title="Commands (/)"
                                >
                                    <Command className="w-4 h-4" />
                                </motion.button>
                            </div>

                            <motion.button
                                type="button"
                                onClick={handleSendMessage}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={isTyping || !value.trim()}
                                className={cn(
                                    "h-8 px-4 rounded-lg text-xs font-semibold transition-all flex items-center gap-2",
                                    value.trim()
                                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                        : "bg-white/5 text-white/20 cursor-not-allowed"
                                )}
                            >
                                <span>Send</span>
                                <SendIcon className="w-3 h-3" />
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Helper Chips */}
                    {messages.length === 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 pointer-events-auto">
                            {commandSuggestions.map((suggestion, index) => (
                                <motion.button
                                    key={suggestion.prefix}
                                    onClick={() => selectCommandSuggestion(index)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-medium text-white/70 hover:text-white border border-white/5 hover:border-white/10 transition-all"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (index * 0.1) }}
                                >
                                    <span className="opacity-50">{suggestion.icon}</span>
                                    <span>{suggestion.label}</span>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Background elements follow cursor */}
            <CursorSpotlight inputFocused={inputFocused} />
        </div>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center gap-1">
            <span className="text-xs text-white/50 mr-2">Agent is thinking</span>
            {[1, 2, 3].map((dot) => (
                <motion.div
                    key={dot}
                    className="w-1 h-1 bg-white/70 rounded-full"
                    initial={{ opacity: 0.3 }}
                    animate={{
                        opacity: [0.3, 1, 0.3],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: dot * 0.2,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = rippleKeyframes;
    document.head.appendChild(style);
}
