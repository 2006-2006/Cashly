import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { LayoutDashboard, UploadCloud } from 'lucide-react';
import AuthContext from '../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useContext(AuthContext);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-[100] flex items-center justify-between px-8 py-3 bg-black border-b border-white/10 shadow-sm">
            <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate('/')}
            >
                <div className="flex items-center gap-2 text-indigo-500 font-bold text-2xl">
                    <span className="text-lg bg-indigo-500/10 px-2 py-1 rounded text-indigo-500">CL</span>
                    <span className="text-white">Cashly</span>
                </div>
            </div>

            <div className="flex gap-8">
                <NavItem
                    icon={<LayoutDashboard size={20} />}
                    text="Dashboard"
                    active={isActive('/dashboard')}
                    onClick={() => navigate('/dashboard')}
                />
                <NavItem
                    icon={<UploadCloud size={20} />}
                    text="Upload Data"
                    active={isActive('/upload')}
                    onClick={() => navigate('/upload')}
                />
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <span className="text-sm font-medium text-zinc-400 hidden md:block">
                            {user.name}
                        </span>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="px-4 py-1.5 text-sm border border-zinc-800 rounded hover:bg-zinc-900 transition-colors text-white"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors"
                    >
                        Sign In
                    </button>
                )}
            </div>
        </nav>
    );
};

const NavItem = ({ icon, text, active, onClick }) => (
    <div
        onClick={onClick}
        className={`
            flex items-center gap-2 cursor-pointer relative py-2 font-medium transition-colors
            ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
        `}
    >
        {icon}
        <span>{text}</span>
        {active && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-sm" />
        )}
    </div>
);

export default Navbar;
