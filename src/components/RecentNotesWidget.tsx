import React, { useEffect, useState } from 'react';
import { StickyNote, ChevronRight, Clock } from 'lucide-react';

interface Note {
    id: number;
    title: string;
    body: string;
    date: string;
    category: string;
    sketch?: string;
}

interface RecentNotesWidgetProps {
    onNavigate: (noteId?: number) => void;
    isDark: boolean;
    t: (key: string) => string;
}

export const RecentNotesWidget: React.FC<RecentNotesWidgetProps> = ({ onNavigate, isDark, t }) => {
    const [notes, setNotes] = useState<Note[]>([]);

    useEffect(() => {
        const loadNotes = () => {
            try {
                const saved = localStorage.getItem('proNotes');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Sort by id (timestamp) descending to get most recent
                    const sorted = Array.isArray(parsed) ? parsed.sort((a: any, b: any) => b.id - a.id).slice(0, 3) : [];
                    setNotes(sorted);
                } else {
                    setNotes([]);
                }
            } catch (e) {
                console.error('Failed to load notes for widget', e);
            }
        };

        loadNotes();
        window.addEventListener('notesUpdated', loadNotes);
        window.addEventListener('storage', loadNotes);
        window.addEventListener('focus', loadNotes);
        return () => {
            window.removeEventListener('notesUpdated', loadNotes);
            window.removeEventListener('storage', loadNotes);
            window.removeEventListener('focus', loadNotes);
        };
    }, []);

    if (notes.length === 0) {
        return (
            <div className="mx-4 mt-4">
                <div className={`p-4 rounded-2xl border-l-4 border-gray-300 shadow-sm ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <div className="text-center opacity-70 italic text-sm">
                        {t('No recent notes')}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-4 mt-4">
            <div className={`p-4 rounded-2xl border-l-4 border-yellow-500 shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                            <StickyNote size={18} className="text-yellow-600" />
                        </div>
                        <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{t("Recent Notes")}</h3>
                    </div>
                    <button
                        onClick={() => onNavigate()}
                        className="text-xs font-bold text-blue-500 flex items-center gap-1 hover:underline"
                    >
                        {t("View All")} <ChevronRight size={14} />
                    </button>
                </div>

                <div className="space-y-2">
                    {notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => onNavigate(note.id)}
                            className={`p-3 rounded-xl border cursor-pointer hover:scale-[1.01] transition-transform ${isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-gray-50 border-gray-200 hover:bg-white'}`}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className={`font-bold text-sm truncate pr-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {note.title || (note.body ? note.body.replace(/<[^>]*>?/gm, '').substring(0, 20) + '...' : 'Untitled Note')}
                                </h4>
                                <span className="text-[10px] text-gray-500 whitespace-nowrap flex items-center gap-1">
                                    <Clock size={10} /> {new Date(note.id).toLocaleDateString()}
                                </span>
                            </div>
                            <p className={`text-xs mt-1 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                {note.body ? note.body.replace(/<[^>]*>?/gm, '') : (note.sketch ? 'Sketch Note' : 'Empty Note')}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
