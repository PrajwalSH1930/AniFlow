import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-5 left-5 z-40 p-3 rounded-full bg-slate-900/90 hover:bg-brand-primary text-slate-300 hover:text-white border border-slate-700/80 hover:border-brand-primary shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in"
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}