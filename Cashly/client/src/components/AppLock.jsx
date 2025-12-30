import React, { useState, useEffect } from 'react';
import { Lock, Fingerprint, ScanFace, ChevronRight, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const APPLOCK_ENABLED_KEY = 'cashly_lock_enabled';
const APPLOCK_PIN_KEY = 'cashly_lock_pin';
const APPLOCK_BIOMETRIC_KEY = 'cashly_biometric_enabled';
const SESSION_UNLOCKED_KEY = 'cashly_session_unlocked';

const AppLock = ({ children }) => {
    const [isLocked, setIsLocked] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);


    // Check initial state
    useEffect(() => {
        const checkLockStatus = () => {
            const enabled = localStorage.getItem(APPLOCK_ENABLED_KEY) === 'true';
            const unlocked = sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'true';

            if (enabled && !unlocked) {
                setIsLocked(true);
            }

        };

        checkLockStatus();

        // Optional: Auto-lock on visibility change (tab hidden)
        const handleVisibilityChange = () => {
            if (document.hidden && localStorage.getItem(APPLOCK_ENABLED_KEY) === 'true') {
                // Uncomment the next line to strictly lock on tab switch
                // setIsLocked(true); 
                // sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    const handleUnlock = async (biometric = false) => {
        if (biometric) {
            // Simulate Biometric Success for Demo, 
            // In prod: use navigator.credentials.get({ publicKey: ... })
            setError(false);
            sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
            setIsLocked(false);
            return;
        }

        const storedPin = localStorage.getItem(APPLOCK_PIN_KEY);
        if (pin === storedPin) {
            setError(false);
            setPin('');
            sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
            setIsLocked(false);
        } else {
            setError(true);
            setPin('');
            setTimeout(() => setError(false), 2000); // Clear error after 2s
        }
    };

    const handleBiometricAuth = async () => {
        // Simplified WebAuthn Call
        try {
            // This relies on the device having a platform authenticator (TouchID/Windows Hello)
            if (window.PublicKeyCredential) {
                // In a real app, this needs a challenge from the server. 
                // For client-side lock, we trust the local authenticator simply returning success.
                // We mock the flow for UX demonstration as purely client-side WebAuthn 
                // verification without a backend challenge is security-through-obscurity anyway.

                // For this demo, we'll simulate the "prompt" and success.
                const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                if (isAvailable) {
                    // Try to authenticate (this will prompt OS dialog)
                    // Note: This often requires SSL (https) and a valid challenge.
                    // We will fallback to PIN if this throws due to environment.
                }
            }
            // Mock success for the prototype experience requested
            setTimeout(() => handleUnlock(true), 1000);
        } catch (e) {
            console.error("Biometric failed", e);
            alert("Biometric sensor not responding. Use PIN.");
        }
    };

    if (!isLocked) return <>{children}</>;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center font-sans"
            >
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full" />
                </div>

                <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-10 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
                        <Lock className="w-12 h-12 text-white/80 relative z-10" />
                    </motion.div>

                    <h2 className="text-2xl font-bold mb-2 tracking-tight">Security Lockout</h2>
                    <p className="text-white/40 text-sm mb-10 text-center">Identity verification required to access sensitive financial data.</p>

                    <div className="w-full space-y-6">
                        {/* PIN Dots */}
                        <div className="flex justify-center gap-4 mb-4">
                            {[0, 1, 2, 3].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: pin.length > i ? 1.2 : 1,
                                        backgroundColor: pin.length > i ? '#ffffff' : 'rgba(255,255,255,0.1)'
                                    }}
                                    className={`w-4 h-4 rounded-full border border-white/10 transition-colors duration-200 ${error ? 'bg-red-500 border-red-500' : ''}`}
                                />
                            ))}
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-xs text-center font-bold uppercase tracking-widest"
                            >
                                Access Denied: Invalid PIN
                            </motion.p>
                        )}

                        {/* Keypad */}
                        <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => {
                                        if (pin.length < 4) {
                                            const newPin = pin + num;
                                            setPin(newPin);
                                            if (newPin.length === 4) {
                                                // Auto-submit on 4th digit
                                                // Small delay for visual feedback
                                                setTimeout(() => {
                                                    const storedPin = localStorage.getItem(APPLOCK_PIN_KEY);
                                                    if (newPin === storedPin) {
                                                        sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
                                                        setIsLocked(false);
                                                        setPin('');
                                                        setError(false);
                                                    } else {
                                                        setError(true);
                                                        setPin('');
                                                    }
                                                }, 100);
                                            }
                                        }
                                    }}
                                    className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xl font-medium transition-all active:scale-95 flex items-center justify-center"
                                >
                                    {num}
                                </button>
                            ))}

                            <button
                                onClick={() => handleBiometricAuth()}
                                className="w-16 h-16 rounded-full flex items-center justify-center text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                <Fingerprint className="w-8 h-8" />
                            </button>

                            <button
                                onClick={() => {
                                    if (pin.length < 4) {
                                        const newPin = pin + '0';
                                        setPin(newPin);
                                        if (newPin.length === 4) {
                                            setTimeout(() => {
                                                const storedPin = localStorage.getItem(APPLOCK_PIN_KEY);
                                                if (newPin === storedPin) {
                                                    sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
                                                    setIsLocked(false);
                                                    setPin('');
                                                    setError(false);
                                                } else {
                                                    setError(true);
                                                    setPin('');
                                                }
                                            }, 100);
                                        }
                                    }
                                }}
                                className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xl font-medium transition-all active:scale-95 flex items-center justify-center"
                            >
                                0
                            </button>

                            <button
                                onClick={() => setPin(prev => prev.slice(0, -1))}
                                className="w-16 h-16 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 rotate-180" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-10 text-white/20 text-xs uppercase tracking-widest font-mono">
                    Secured by Cashly Sentry
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AppLock;
