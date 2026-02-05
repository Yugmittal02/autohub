import React from 'react';
import { PenTool, CheckCircle, Type, Vibrate, AlertCircle, Zap } from 'lucide-react';
import { AppData, ThemeOption } from '../../types';

interface AppearanceSettingsProps {
    isDark: boolean;
    t: (key: string) => string;
    data: AppData;
    pushToFirebase: (data: AppData) => void;
    themeOptions: ThemeOption[];
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
    isDark, t, data, pushToFirebase, themeOptions
}) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Theme Selection */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl shadow-lg">
                        <PenTool size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{t("Theme")}</h3>
                        <p className="text-xs opacity-60">{t("Choose your style")}</p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                    {themeOptions.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => pushToFirebase({ ...data, settings: { ...data.settings, theme: theme.id } })}
                            className={`p-2 rounded-xl border-2 transition-all ${(data.settings?.theme || 'light') === theme.id
                                ? 'border-blue-500 scale-105 shadow-lg'
                                : isDark ? 'border-slate-600 hover:border-slate-500' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                            <div className="flex justify-center gap-0.5 mb-1.5">
                                {theme.colors.map((color: string, i: number) => (
                                    <div key={i} className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: color }}></div>
                                ))}
                            </div>
                            <p className="text-[10px] font-semibold text-center">{theme.name}</p>
                            {(data.settings?.theme || 'light') === theme.id && <CheckCircle size={12} className="text-blue-500 mx-auto mt-1" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Font Size */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                    <Type size={18} className="text-pink-500" />
                    <span className="font-bold">{t("Font Size")}</span>
                </div>
                <div className="flex gap-2">
                    {['Small', 'Medium', 'Large'].map(size => (
                        <button
                            key={size}
                            onClick={() => pushToFirebase({ ...data, settings: { ...data.settings, fontSize: size } })}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${(data.settings?.fontSize || 'Medium') === size
                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                                : isDark ? 'bg-slate-700' : 'bg-gray-100'}`}
                        >
                            {t(size)}
                        </button>
                    ))}
                </div>
            </div>

            {/* More Options */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <p className="text-xs font-bold opacity-60 mb-3">{t("More Options")}</p>
                <div className="space-y-2">
                    {[
                        { id: 'soundEffects', icon: Vibrate, label: t('Sound Effects'), desc: t('Button sounds') },
                        { id: 'highContrast', icon: AlertCircle, label: t('High Contrast'), desc: t('Better visibility') },
                        { id: 'reducedMotion', icon: Zap, label: t('Reduced Motion'), desc: t('Less animations') },
                    ].map(item => (
                        <div key={item.id} className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className="text-purple-500" />
                                <div>
                                    <p className="text-sm font-semibold">{item.label}</p>
                                    <p className="text-[10px] opacity-50">{item.desc}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => pushToFirebase({ ...data, settings: { ...data.settings, [item.id]: item.id === 'soundEffects' ? data.settings?.soundEffects === false : !data.settings?.[item.id] } })}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${(item.id === 'soundEffects' ? data.settings?.soundEffects !== false : data.settings?.[item.id]) ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${(item.id === 'soundEffects' ? data.settings?.soundEffects !== false : data.settings?.[item.id]) ? 'left-5' : 'left-0.5'}`}></div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AppearanceSettings;
