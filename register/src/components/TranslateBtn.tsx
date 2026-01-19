import React from 'react';
import { Languages } from 'lucide-react';

interface TranslateBtnProps {
    isHindi: boolean;
    setIsHindi: (val: boolean) => void;
    isDark: boolean;
}

export const TranslateBtn: React.FC<TranslateBtnProps> = ({ isHindi, setIsHindi, isDark }) => (
    <button
        onClick={() => setIsHindi(!isHindi)}
        title={isHindi ? "Switch to English" : "हिंदी में बदलें"}
        aria-label={isHindi ? "Switch to English" : "Switch to Hindi"}
        className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 ${isHindi
                ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/30'
                : isDark
                    ? 'bg-slate-700 border-slate-500 hover:bg-slate-600'
                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
            }`}
    >
        <Languages size={18} className={isHindi ? 'text-white' : ''} />
    </button>
);
