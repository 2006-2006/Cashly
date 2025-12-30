import { useRef, MouseEvent, ReactNode } from 'react';
import './holographic-card.css';

interface HolographicCardProps {
    children?: ReactNode;
    className?: string;
}

const HolographicCard = ({ children, className }: HolographicCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20; // Reduced rotation for better usability with forms
        const rotateY = (centerX - x) / 20;

        card.style.setProperty('--x', `${x}px`);
        card.style.setProperty('--y', `${y}px`);
        card.style.setProperty('--bg-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--bg-y', `${(y / rect.height) * 100}%`);
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        const card = cardRef.current;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        card.style.setProperty('--x', `50%`);
        card.style.setProperty('--y', `50%`);
        card.style.setProperty('--bg-x', '50%');
        card.style.setProperty('--bg-y', '50%');
    };

    return (
        <div
            className={`component-card holographic-card ${className || ''}`}
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ width: '100%', height: 'auto', minHeight: '400px' }}
        >
            <div className="holo-content" style={{ width: '100%', height: '100%' }}>
                {children || (
                    <div className="text-center p-10">
                        <h3 className="component-title" style={{ fontWeight: 700, fontSize: '1.25rem', color: '#ffffff', letterSpacing: '-0.025em' }}>
                            Holographic Card
                        </h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                            Move your mouse over me!
                        </p>
                    </div>
                )}
            </div>
            <div className="holo-glow"></div>
        </div>
    );
};

export default HolographicCard;
