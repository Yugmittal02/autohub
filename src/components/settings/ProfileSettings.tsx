import React, { useState, useEffect } from 'react';
import { Store, User as UserIcon, Copy, Package, ShieldCheck, Download, ChevronRight, Save, AlertCircle } from 'lucide-react';
import { AppData, User } from '../../types';
import { ProfileSchema } from '../../schemas';

interface ProfileSettingsProps {
    isDark: boolean;
    t: (key: string) => string;
    data: AppData;
    user: User;
    pushToFirebase: (data: AppData) => void;
    showToast: (msg: string, type?: string) => void;
    setView: (view: string) => void;
    setPreviousView: (view: string) => void;
    deferredPrompt: any;
    setDeferredPrompt: (prompt: any) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
    isDark, t, data, user, pushToFirebase, showToast, setView, setPreviousView, deferredPrompt, setDeferredPrompt
}) => {
    // Local state for form handling
    const [shopDetails, setShopDetails] = useState(data.settings || {});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isDirty, setIsDirty] = useState(false);

    // Sync local state when external data changes (only if not dirty/editing)
    useEffect(() => {
        if (!isDirty && data.settings) {
            setShopDetails(data.settings);
        }
    }, [data.settings, isDirty]);

    const handleChange = (field: string, value: string) => {
        setShopDetails(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
        // Clear error for this field when user types
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSave = () => {
        const result = ProfileSchema.safeParse(shopDetails);

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                const path = issue.path[0];
                if (typeof path === 'string') {
                    fieldErrors[path] = issue.message;
                }
            });
            setErrors(fieldErrors);
            showToast("Please fix the validation errors", "error");
            return;
        }

        // If valid
        setErrors({});
        const updatedData = { ...data, settings: { ...data.settings, ...shopDetails } };
        pushToFirebase(updatedData);
        setIsDirty(false);
        showToast(t("Profile Saved Successfully"), "success");
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl shadow-lg">
                            <Store size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{t("Shop Profile")}</h3>
                            <p className="text-xs opacity-60">{t("Your business information")}</p>
                        </div>
                    </div>
                    {isDirty && (
                        <button
                            onClick={handleSave}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all animate-in zoom-in"
                        >
                            <Save size={18} />
                            {t("Save Changes")}
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold opacity-60 mb-1 block">{t("Shop Name")}</label>
                        <input
                            type="text"
                            className={`w-full p-3 rounded-xl border font-bold ${errors.shopName ? 'border-red-500 focus:ring-red-500' : isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-purple-500/50`}
                            value={shopDetails.shopName || ''}
                            onChange={e => handleChange('shopName', e.target.value)}
                            placeholder={t("Enter Shop Name")}
                        />
                        {errors.shopName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.shopName}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-bold opacity-60 mb-1 block">{t("Owner Name")}</label>
                        <input
                            type="text"
                            className={`w-full p-3 rounded-xl border ${errors.ownerName ? 'border-red-500 focus:ring-red-500' : isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-purple-500/50`}
                            value={shopDetails.ownerName || ''}
                            onChange={e => handleChange('ownerName', e.target.value)}
                            placeholder={t("Owner Name")}
                        />
                        {errors.ownerName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.ownerName}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-bold opacity-60 mb-1 block">{t("Shop Address")}</label>
                        <input
                            type="text"
                            placeholder={t("Shop Address")}
                            value={shopDetails.shopAddress || ''}
                            onChange={e => handleChange('shopAddress', e.target.value)}
                            className={`w-full p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-purple-500/50`}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-bold opacity-60 mb-1 block">{t("City")}</label>
                            <input
                                type="text"
                                placeholder={t("City")}
                                value={shopDetails.shopCity || ''}
                                onChange={e => handleChange('shopCity', e.target.value)}
                                className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-purple-500/50`}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold opacity-60 mb-1 block">{t("PIN Code")}</label>
                            <input
                                type="text"
                                placeholder={t("PIN Code")}
                                value={shopDetails.shopPincode || ''}
                                onChange={e => handleChange('shopPincode', e.target.value)}
                                className={`w-full p-2 rounded-lg border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-purple-500/50`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold opacity-60 mb-1 block">{t("GST Number (Optional)")}</label>
                        <input
                            type="text"
                            placeholder={t("GST Number")}
                            value={shopDetails.gstNumber || ''}
                            onChange={e => handleChange('gstNumber', e.target.value)}
                            className={`w-full p-3 rounded-xl border ${errors.gstNumber ? 'border-red-500 focus:ring-red-500' : isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-purple-500/50`}
                        />
                        {errors.gstNumber && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.gstNumber}</p>}
                    </div>

                    <div>
                        <label className="text-xs font-bold opacity-60 mb-1 block">{t("Phone Number")}</label>
                        <input
                            type="tel"
                            placeholder={t("e.g., 9876543210")}
                            value={shopDetails.mobile || ''}
                            onChange={e => handleChange('mobile', e.target.value)}
                            className={`w-full p-3 rounded-xl border ${errors.mobile ? 'border-red-500 focus:ring-red-500' : isDark ? 'bg-slate-700 border-slate-600' : 'bg-gray-50 border-gray-200'} outline-none focus:ring-2 focus:ring-purple-500/50`}
                        />
                        {errors.mobile && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.mobile}</p>}
                    </div>
                </div>

                {/* Customer ID */}
                <div className={`p-3 rounded-xl border mt-4 ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <UserIcon size={18} className="text-orange-500" />
                        <span className="font-bold">{t("Your Customer ID")}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <code className={`flex-1 p-2 rounded-lg font-mono text-xs break-all select-all ${isDark ? 'bg-slate-700' : 'bg-white'}`}>
                            {user.uid}
                        </code>
                        <button aria-label={t("Copy Customer ID")} onClick={() => { navigator.clipboard.writeText(user.uid); showToast("ID Copied!"); }} className="p-2 bg-orange-500 text-white rounded-lg active:scale-95 transition-transform shadow">
                            <Copy size={18} />
                        </button>
                    </div>
                    <p className="text-[10px] opacity-50 mt-2">{t("Share this ID for support")}</p>
                </div>
            </div>

            {/* Business Tools */}
            <button aria-label={t("Go to Business Tools")} onClick={() => { setPreviousView('settings'); setView('tools'); }} className={`w-full p-4 rounded-2xl flex items-center justify-between gap-2 shadow-sm border ${isDark ? 'bg-gradient-to-r from-slate-800 to-blue-900/30 border-blue-500/30' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'}`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow"><Package size={20} className="text-white" /></div>
                    <div className="text-left">
                        <span className="font-bold block">{t("Business Tools")}</span>
                        <span className="text-xs opacity-60">{t("GST, Invoice, Calculator")}</span>
                    </div>
                </div>
                <ChevronRight size={20} className="opacity-50" />
            </button>

            {/* Business Achievements */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-gradient-to-br from-slate-800 to-yellow-900/30 border-yellow-500/30' : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={18} className="text-yellow-500" />
                    <span className="font-bold">{t("Business Achievements")}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                        { label: t('Days'), value: '30+' },
                        { label: t('Products'), value: (data.entries?.length || 0).toString() },
                        { label: t('Bills'), value: (data.bills?.length || 0).toString() },
                    ].map((stat, i) => (
                        <div key={i} className={`p-2 rounded-xl text-center ${isDark ? 'bg-slate-700/50' : 'bg-white/80'}`}>
                            <p className="text-lg font-bold">{stat.value}</p>
                            <p className="text-[9px] opacity-60">{stat.label}</p>
                        </div>
                    ))}
                </div>
                <div className={`p-2 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-yellow-100/50'}`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span>{t("Level")}</span>
                        <span className="font-bold">{(data.entries?.length || 0) > 100 ? t('Gold') : (data.entries?.length || 0) > 50 ? t('Silver') : t('Bronze')}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full" style={{ width: `${Math.min(100, ((data.entries?.length || 0) / 100) * 100)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Install App Button */}
            <button
                onClick={() => {
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                        deferredPrompt.userChoice.then((choiceResult: any) => {
                            if (choiceResult.outcome === 'accepted') setDeferredPrompt(null);
                            showToast(choiceResult.outcome === 'accepted' ? t("App Installed!") : t("Installation cancelled"));
                        });
                    } else {
                        showToast(t("Use browser menu ? Add to Home Screen"));
                    }
                }}
                className={`w-full p-4 rounded-2xl flex items-center justify-between gap-2 shadow-sm border ${deferredPrompt ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400' : isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shadow ${deferredPrompt ? 'bg-white/20' : 'bg-gradient-to-br from-green-500 to-emerald-600'}`}>
                        <Download size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                        <span className="font-bold block">{t("Install App")}</span>
                        <span className={`text-xs ${deferredPrompt ? 'text-white/80' : 'opacity-60'}`}>
                            {deferredPrompt ? t("Tap to install on your device") : t("Already installed or use browser menu")}
                        </span>
                    </div>
                </div>
                {deferredPrompt && <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>}
            </button>
        </div>
    );
};

export default ProfileSettings;
