import React, { useState } from 'react';
import { Shield, Clock, Lock, CheckCircle } from 'lucide-react';
import { AppData } from '../../types';

interface SecuritySettingsProps {
    isDark: boolean;
    t: (key: string) => string;
    data: AppData;
    pushToFirebase: (data: AppData) => void;
    triggerConfirm: (title: string, msg: string, isDanger: boolean, onConfirm: () => void) => void;
    showToast: (msg: string, type?: string) => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({
    isDark, t, data, pushToFirebase, triggerConfirm, showToast
}) => {
    const [newProductPass, setNewProductPass] = useState('');

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl shadow-lg">
                        <Shield size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{t("Security")}</h3>
                        <p className="text-xs opacity-60">{t("Protect your data")}</p>
                    </div>
                </div>

                {/* Change Password */}
                <div className={`p-3 rounded-xl border mb-3 ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="font-bold mb-2">{t("Product Password")}</p>
                    <input
                        type="password"
                        placeholder={t("New Password")}
                        className={`w-full p-2 rounded-lg border mb-2 ${isDark ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-300'}`}
                        value={newProductPass}
                        onChange={e => setNewProductPass(e.target.value)}
                    />
                    <button
                        onClick={() => { triggerConfirm("Change?", "Update password?", false, () => { pushToFirebase({ ...data, settings: { ...data.settings, productPassword: newProductPass } }); setNewProductPass(''); showToast(t("Updated!")); }) }}
                        className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-bold text-sm"
                    >
                        {t("Update Password")}
                    </button>
                </div>

                {/* Security Features */}
                <div className="space-y-2">
                    {/* Auto Lock Timer */}
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <Clock size={18} className="text-orange-500" />
                            <div>
                                <p className="text-sm font-semibold">{t("Auto Lock")}</p>
                                <p className="text-[10px] opacity-50">{t("Lock after inactivity")}</p>
                            </div>
                        </div>
                        <select
                            value={data.settings?.autoLockTime || '5'}
                            onChange={e => pushToFirebase({ ...data, settings: { ...data.settings, autoLockTime: e.target.value } })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border ${isDark ? 'bg-slate-600 border-slate-500 text-white' : 'bg-gray-100 border-gray-300'}`}
                        >
                            <option value="1">1 min</option>
                            <option value="5">5 min</option>
                            <option value="15">15 min</option>
                            <option value="never">Never</option>
                        </select>
                    </div>

                    {/* Data Encryption - Always ON */}
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <Lock size={18} className="text-green-500" />
                            <div>
                                <p className="text-sm font-semibold">{t("Data Encryption")}</p>
                                <p className="text-[10px] opacity-50">{t("AES-256 encryption")}</p>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle size={10} /> Enabled
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
