// I'll skip creating a separate layout file to avoid complex refactoring now.
// Instead I will handle the Sidebar responsiveness directly in Dashboard or create a component there.
// For now, I will let the Dashboard have the layout as implemented.
// But to ensure "entire dashboard with proper alignment", I should verify the Sidebar logic in Dashboard.jsx again.
// In the last Dashboard.jsx write, I used "hidden md:flex" for the sidebar.
// This means on mobile it is HIDDEN and there is NO trigger. This is a UX bug.
// I must add a Mobile Header + Sidebar Trigger.

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassButton } from '../components/ui/sign-up.tsx';

export const MobileSidebar = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden">
            {/* Mobile Header Trigger */}
            <div className="fixed top-0 left-0 w-full z-50 p-4 flex items-center justify-between bg-white/10 backdrop-blur-md border-b border-white/10">
                <span className="font-bold text-lg">Cashly</span>
                <GlassButton size="icon" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </GlassButton>
            </div>

            {/* Mobile Drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl pt-20 px-6">
                    {children}
                </div>
            )}
        </div>
    );
};
