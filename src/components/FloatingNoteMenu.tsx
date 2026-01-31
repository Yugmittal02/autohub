import React, { useState } from 'react';
import { Plus, Image, Mic, PenTool, List, Type, X } from 'lucide-react';

interface FloatingNoteMenuProps {
  onSelect: (type: 'text' | 'list' | 'drawing' | 'image' | 'audio') => void;
}

export const FloatingNoteMenu: React.FC<FloatingNoteMenuProps> = ({ onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSelect = (type: 'text' | 'list' | 'drawing' | 'image' | 'audio') => {
    onSelect(type);
    setIsOpen(false);
  };

  const menuItems = [
    { id: 'audio', label: 'Audio', icon: <Mic size={20} />, color: 'bg-teal-600', type: 'audio' as const },
    { id: 'image', label: 'Image', icon: <Image size={20} />, color: 'bg-teal-600', type: 'image' as const },
    { id: 'drawing', label: 'Drawing', icon: <PenTool size={20} />, color: 'bg-teal-600', type: 'drawing' as const },
    { id: 'list', label: 'List', icon: <List size={20} />, color: 'bg-teal-600', type: 'list' as const },
    { id: 'text', label: 'Text', icon: <Type size={20} />, color: 'bg-teal-600', type: 'text' as const },
  ];

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
      {/* Menu Items */}
      <div className={`flex flex-col items-end gap-3 mb-4 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item.type)}
            className="flex items-center gap-3 group"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden sm:block">
              {item.label}
            </span>
            <div className={`${item.color} text-white p-3 rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center`}>
              {item.icon}
            </div>
            <span className="sm:hidden bg-slate-800 text-white text-xs px-2 py-1 rounded absolute right-14 shadow-md">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={toggleMenu}
        className={`p-4 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center ${isOpen ? 'bg-cyan-400 rotate-45' : 'bg-cyan-400 hover:bg-cyan-300'}`}
      >
        {isOpen ? <Plus size={28} className="text-black" /> : <Plus size={28} className="text-black" />} 
      </button>
    </div>
  );
};
