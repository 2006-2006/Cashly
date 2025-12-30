import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState(null);

    const fetchBusinesses = async (userId) => {
        if (!userId) {
            setBusinesses([]);
            setSelectedBusiness(null);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', userId);

            if (error) {
                if (error.code === '42P01' || error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
                    console.warn('Supabase tables missing. Using local mode.');
                    const localData = JSON.parse(localStorage.getItem('local_businesses') || '[]');
                    const userBusinesses = localData.filter(b => b.user_id === userId);
                    setBusinesses(userBusinesses);
                    if (userBusinesses.length > 0) setSelectedBusiness(userBusinesses[0]);
                    return;
                }
                throw error;
            }

            setBusinesses(data || []);
            // Cache for speed
            if (data && data.length > 0) {
                localStorage.setItem(`biz_cache_${userId}`, JSON.stringify(data));
            }

            if (data && data.length > 0) {
                const storedId = localStorage.getItem('selectedBusinessId');
                const found = data.find(b => b.id === storedId);
                if (found) {
                    setSelectedBusiness(found);
                } else {
                    setSelectedBusiness(data[0]);
                    localStorage.setItem('selectedBusinessId', data[0].id);
                }
            } else {
                setSelectedBusiness(null);
            }
        } catch (error) {
            console.error('Failed to fetch businesses', error);
            // Fallback
            const localData = JSON.parse(localStorage.getItem('local_businesses') || '[]');
            const userBusinesses = localData.filter(b => b.user_id === userId);
            setBusinesses(userBusinesses);
            if (userBusinesses.length > 0 && !selectedBusiness) {
                setSelectedBusiness(userBusinesses[0]);
            }
        }
    };

    const selectBusiness = (business) => {
        setSelectedBusiness(business);
        if (business?.id) {
            localStorage.setItem('selectedBusinessId', business.id);
        }
    };

    const addLocalBusiness = (business) => {
        const localData = JSON.parse(localStorage.getItem('local_businesses') || '[]');
        localData.push(business);
        localStorage.setItem('local_businesses', JSON.stringify(localData));
        setBusinesses(prev => [...prev, business]);
        setSelectedBusiness(business);
    };

    useEffect(() => {
        const initAuth = async () => {
            // Check active session
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            if (session?.user) {
                // Optimistic Load
                const cached = localStorage.getItem(`biz_cache_${session.user.id}`);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setBusinesses(parsed);
                    if (parsed.length > 0) {
                        const storedId = localStorage.getItem('selectedBusinessId');
                        setSelectedBusiness(parsed.find(b => b.id === storedId) || parsed[0]);
                    }
                    setLoading(false); // Instant Load
                }
                // Background Refresh
                await fetchBusinesses(session.user.id);
            }

            // Listen for changes
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    // Optimistic Load on Login
                    const cached = localStorage.getItem(`biz_cache_${session.user.id}`);
                    if (cached) {
                        const parsed = JSON.parse(cached);
                        setBusinesses(parsed);
                        if (parsed.length > 0) {
                            const storedId = localStorage.getItem('selectedBusinessId');
                            setSelectedBusiness(parsed.find(b => b.id === storedId) || parsed[0]);
                        }
                        setLoading(false); // Instant Load
                    }
                    await fetchBusinesses(session.user.id);
                } else {
                    setBusinesses([]);
                    setSelectedBusiness(null);
                }
                setLoading(false);
            });

            setLoading(false);
            return () => subscription?.unsubscribe();
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    };

    const register = async (name, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }, // Store name in user metadata
            },
        });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('selectedBusinessId');
        setUser(null);
        setBusinesses([]);
        setSelectedBusiness(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            loading,
            businesses,
            selectedBusiness,
            selectBusiness,
            fetchBusinesses,
            addLocalBusiness
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
