import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Package, AlertTriangle } from 'lucide-react';
import { AppData } from '../../types';

interface NotificationSettingsProps {
    isDark: boolean;
    t: (key: string) => string;
    data: AppData;
    pushToFirebase: (data: AppData) => void;
    notifPermission: string;
    requestNotificationPermission: () => void;
    triggerConfirm: (title: string, msg: string, isDanger: boolean, onConfirm: () => void) => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
    isDark, t, data, pushToFirebase, notifPermission, requestNotificationPermission, triggerConfirm
}) => {
    const [tempLimit, setTempLimit] = useState(data.settings?.limit || 5);

    useEffect(() => {
        if (data.settings?.limit) {
            setTempLimit(data.settings.limit);
        }
    }, [data.settings?.limit]);

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                        <Bell size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{t("Notifications")}</h3>
                        <p className="text-xs opacity-60">{t("Stay informed")}</p>
                    </div>
                </div>

                {/* Permission Status */}
                <div className={`p-3 rounded-xl border mb-4 flex items-center justify-between ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div>
                        <p className="font-bold">{t("Push Notifications")}</p>
                        <p className="text-xs opacity-60">{notifPermission === 'granted' ? t("Enabled") : t("Allow popups & alerts")}</p>
                    </div>
                    {notifPermission === 'granted'
                        ? <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-xs flex items-center gap-1"><CheckCircle size={14} /> Active</span>
                        : <button onClick={requestNotificationPermission} className="px-3 py-1.5 bg-green-600 text-white rounded-lg font-bold text-xs flex items-center gap-1"><Bell size={14} /> Enable</button>
                    }
                </div>

                {/* Notification Types */}
                <p className="text-xs font-bold opacity-60 mb-2">{t("Alert Types")}</p>
                <div className="space-y-2">
                    {[
                        { id: 'lowStockAlert', icon: Package, label: t('Low Stock Alerts'), color: 'text-orange-500' },
                        { id: 'expiryAlert', icon: AlertTriangle, label: t('Expiry Reminders'), color: 'text-yellow-500' },
                    ].map(item => (
                        <div key={item.id} className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <item.icon size={18} className={item.color} />
                                <p className="text-sm font-semibold">{item.label}</p>
                            </div>
                            <button
                                onClick={() => pushToFirebase({ ...data, settings: { ...data.settings, notifications: { ...(data.settings?.notifications || {}), [item.id]: !data.settings?.notifications?.[item.id] } } })}
                                className={`relative w-10 h-5 rounded-full transition-all duration-300 ${data.settings?.notifications?.[item.id] ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${data.settings?.notifications?.[item.id] ? 'left-5' : 'left-0.5'}`}></div>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Low Stock Limit */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={18} className="text-red-500" />
                    <span className="font-bold">{t("Low Stock Limit")}</span>
                </div>
                <div className="flex items-center gap-4 mb-3">
                    <input
                        type="range" min="1" max="20"
                        value={tempLimit}
                        onChange={(e) => setTempLimit(parseInt(e.target.value))}
                        className="flex-1 accent-red-500 h-2 bg-gray-200 rounded-lg"
                    />
                    <span className="text-2xl font-bold w-10 text-center">{tempLimit}</span>
                </div>
                <button
                    onClick={() => { triggerConfirm("Update?", `Set limit to ${tempLimit}?`, false, () => pushToFirebase({ ...data, settings: { ...data.settings, limit: tempLimit } })) }}
                    className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold text-sm"
                >
                    {t("Save Limit")}
                </button>
            </div>
        </div>
    );
};

export default NotificationSettings;
