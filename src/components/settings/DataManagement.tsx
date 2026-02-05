import React from 'react';
import { Download, CheckCircle, SaveAll, FileText, RefreshCcw, ExternalLink, Zap, Vibrate, Wifi, WifiOff } from 'lucide-react';
import { AppData } from '../../types';

interface DataManagementProps {
    isDark: boolean;
    t: (key: string) => string;
    data: AppData;
    setData: (data: AppData) => void;
    pushToFirebase: (data: AppData) => void;
    showToast: (msg: string, type?: string) => void;
    triggerConfirm: (title: string, msg: string, isDanger: boolean, onConfirm: () => void) => void;
}

const DataManagement: React.FC<DataManagementProps> = ({
    isDark, t, data, setData, pushToFirebase, showToast, triggerConfirm
}) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl shadow-lg">
                        <Download size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg">{t("Cloud & Backup")}</h3>
                        <p className="text-xs opacity-60">{t("Never lose your data")}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle size={10} /> Synced
                    </span>
                </div>

                <div className="space-y-2">
                    {/* Auto Backup Frequency */}
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <SaveAll size={18} className="text-cyan-500" />
                            <div>
                                <p className="text-sm font-semibold">{t("Auto Backup")}</p>
                                <p className="text-[10px] opacity-50">{t("Schedule backups")}</p>
                            </div>
                        </div>
                        <select
                            value={data.settings?.autoBackup || 'daily'}
                            onChange={e => pushToFirebase({ ...data, settings: { ...data.settings, autoBackup: e.target.value } })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-gray-100 border-gray-300'}`}
                        >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="manual">Manual</option>
                        </select>
                    </div>

                    {/* Export Data */}
                    <button
                        onClick={() => {
                            const exportData = JSON.stringify(data, null, 2);
                            const blob = new Blob([exportData], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${data.settings?.shopName || 'shop'}_backup_${new Date().toISOString().split('T')[0]}.json`;
                            a.click();
                            showToast(t("Backup Downloaded!"));
                        }}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <FileText size={18} className="text-green-500" />
                            <div className="text-left">
                                <p className="text-sm font-semibold">{t("Export Data")}</p>
                                <p className="text-[10px] opacity-50">{t("Download JSON backup")}</p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold flex items-center gap-1">
                            <Download size={12} /> Export
                        </div>
                    </button>

                    {/* Import Data */}
                    <button
                        onClick={() => document.getElementById('restore-input')?.click()}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            <RefreshCcw size={18} className="text-blue-500" />
                            <div className="text-left">
                                <p className="text-sm font-semibold">{t("Restore Data")}</p>
                                <p className="text-[10px] opacity-50">{t("Import from backup")}</p>
                            </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold flex items-center gap-1">
                            <ExternalLink size={12} /> Import
                        </div>
                    </button>
                    <input
                        id="restore-input"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            triggerConfirm(
                                "Restore Backup?",
                                "This will OVERWRITE all current data. Are you sure?",
                                true,
                                () => {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        try {
                                            const json = JSON.parse(event.target?.result as string);
                                            // Basic validation
                                            if (json && typeof json === 'object' && Array.isArray(json.entries)) {
                                                setData(json);
                                                pushToFirebase(json);
                                                showToast(t("Data Restored Successfully!"));
                                            } else {
                                                showToast(t("Invalid Backup File"), "error");
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            showToast(t("Failed to parse backup"), "error");
                                        }
                                    };
                                    reader.readAsText(file);
                                }
                            );
                            // Reset input
                            e.target.value = '';
                        }}
                    />

                    {/* Last Backup Info */}
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-cyan-900/30' : 'bg-cyan-50'} flex items-center justify-between`}>
                        <span className="text-xs opacity-70">{t("Last Backup")}</span>
                        <span className="text-xs font-bold">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>

            {/* Performance Mode */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                    <Zap size={18} className="text-amber-500" />
                    <span className="font-bold">{t("Performance")}</span>
                </div>
                <div className="space-y-2">
                    {[
                        { id: 'batterySaver', icon: Vibrate, label: t('Battery Saver'), desc: t('Reduce animations'), color: 'text-green-500' },
                        { id: 'lowDataMode', icon: Wifi, label: t('Low Data Mode'), desc: t('Compress images'), color: 'text-blue-500' },
                        { id: 'offlineFirst', icon: WifiOff, label: t('Offline First'), desc: t('Work without internet'), color: 'text-purple-500' },
                    ].map(item => (
                        <div key={item.id} className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className={item.color} />
                                <div>
                                    <p className="text-sm font-semibold">{item.label}</p>
                                    <p className="text-[10px] opacity-50">{item.desc}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => pushToFirebase({ ...data, settings: { ...data.settings, performance: { ...(data.settings?.performance || {}), [item.id]: !data.settings?.performance?.[item.id] } } })}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${data.settings?.performance?.[item.id] ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${data.settings?.performance?.[item.id] ? 'left-5' : 'left-0.5'}`}></div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DataManagement;
