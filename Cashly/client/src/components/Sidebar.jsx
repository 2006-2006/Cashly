import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, Wallet, TrendingUp, TrendingDown, Upload, Sparkles, Settings, Zap, Activity } from 'lucide-react';
import AuthContext from '../contexts/AuthContext';

export const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const handleLogoutClick = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            navigate('/login');
        }
    };

    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/income', icon: TrendingUp, label: 'Income' },
        { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
        { path: '/receivables', icon: Zap, label: 'Due Payers' },
        { path: '/upload', icon: Upload, label: 'Upload Data' },
        { path: '/ai-analysis', icon: Sparkles, label: 'AI Analysis' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <aside className="w-64 h-screen bg-black flex flex-col justify-between px-4 py-6 sticky top-0 border-r border-white/5 font-sans z-[100] overflow-hidden">

            {/* Header / Logo */}
            <div className="flex items-center gap-3 px-2 mb-8">
                <div onClick={() => navigate('/dashboard')} className="cursor-pointer group flex items-center gap-3">
                    <div className="relative w-8 h-8 flex items-center justify-center bg-black rounded-lg border border-white/10 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.8)] transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <Activity className="w-5 h-5 text-white relative z-10 transform group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-white leading-none group-hover:text-indigo-200 transition-colors">
                            CASHLY
                        </span>
                        <span className="text-[8px] font-bold tracking-[0.3em] text-indigo-400 uppercase leading-none opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                            Enterprise
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation - Vertical List */}
            <nav className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar pb-6">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    const isSpecial = item.path === '/situation';

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${active
                                ? 'bg-[#3E50F3] text-white shadow-[0_0_20px_rgba(62,80,243,0.3)] z-10'
                                : 'bg-transparent text-white/40 hover:bg-[#121212] hover:text-white'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'fill-current' : 'opacity-70 group-hover:opacity-100'}`} strokeWidth={active ? 2.5 : 2} />
                            <span className={`text-sm tracking-wide ${active ? 'font-bold' : 'font-medium'}`}>
                                {item.label}
                            </span>
                            {isSpecial && (
                                <span className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : 'bg-[#818CF8]'} animate-pulse shadow-[0_0_8px_#818CF8]`} />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile - Bottom */}
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between px-2">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/settings')}>
                    <div className="w-9 h-9 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm shadow-lg cursor-pointer hover:bg-[#7c3aed] transition-colors">
                        {user?.name?.[0]?.toLowerCase() || 'y'}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-none group-hover:text-indigo-400 transition-colors">{user?.name || 'yogi'}</span>
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Online</span>
                    </div>
                </div>

                <button
                    onClick={handleLogoutClick}
                    className="w-8 h-8 rounded-full bg-[#121212] flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    title="Sign Out"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
