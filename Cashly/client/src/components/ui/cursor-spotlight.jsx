"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CursorSpotlight({ inputFocused }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            // Use requestAnimationFrame to throttle updates if needed, 
            // but for a simple state update it might be fine on modern browsers.
            // Still, separating this to a small component prevents the heavy parent from re-rendering.
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (!inputFocused) return null;

    return (
        <motion.div
            className="fixed w-[40rem] h-[40rem] rounded-full pointer-events-none z-0 opacity-[0.03] bg-indigo-500 mix-blend-screen blur-[100px]"
            animate={{
                x: mousePosition.x - 320,
                y: mousePosition.y - 320,
            }}
            transition={{ type: "spring", damping: 40, stiffness: 200 }}
        />
    );
}
