import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

interface EmiCalculatorProps {
    // No props needed
}

const EmiCalculator: React.FC<EmiCalculatorProps> = () => {
    const [emiInput, setEmiInput] = useState({ principal: '', rate: '', tenure: '', tenureType: 'months' });

    // Shared Styles
    const cardClass = "bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all";
    const commonInputClass = "w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all mb-4";

    const p = parseFloat(emiInput.principal) || 0;
    const r = parseFloat(emiInput.rate) || 0;
    const t = parseFloat(emiInput.tenure) || 0;
    let emi = 0, totalPay = 0, totalInt = 0;

    if (p > 0 && r > 0 && t > 0) {
        const monthlyR = r / 12 / 100;
        const months = emiInput.tenureType === 'years' ? t * 12 : t;
        emi = (p * monthlyR * Math.pow(1 + monthlyR, months)) / (Math.pow(1 + monthlyR, months) - 1);
        totalPay = emi * months;
        totalInt = totalPay - p;
    }

    return (
        <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                    <DollarSign className="text-emerald-500" size={24} />
                    EMI Calculator
                </h3>
            </div>
            <div className="space-y-3 mb-4">
                <input
                    type="number"
                    placeholder="Loan Amount (₹)"
                    className={commonInputClass}
                    value={emiInput.principal}
                    onChange={e => setEmiInput({ ...emiInput, principal: e.target.value })}
                />
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Interest Rate (%)"
                        className={`${commonInputClass} flex-1 mb-0`}
                        value={emiInput.rate}
                        onChange={e => setEmiInput({ ...emiInput, rate: e.target.value })}
                    />
                    <div className="flex-1 flex rounded-xl border border-gray-300 overflow-hidden">
                        <input
                            type="number"
                            placeholder="Tenure"
                            className="w-full p-3 font-bold text-lg outline-none"
                            value={emiInput.tenure}
                            onChange={e => setEmiInput({ ...emiInput, tenure: e.target.value })}
                        />
                        <select
                            className="bg-gray-100 p-2 font-bold text-xs"
                            value={emiInput.tenureType}
                            onChange={e => setEmiInput({ ...emiInput, tenureType: e.target.value })}
                        >
                            <option value="months">Mo</option>
                            <option value="years">Yr</option>
                        </select>
                    </div>
                </div>
            </div>
            {emi > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border-2 border-emerald-200">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-emerald-200">
                        <span className="text-sm font-bold text-gray-600">Monthly EMI</span>
                        <span className="text-3xl font-black text-emerald-700">₹{Math.round(emi).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-white/60 p-2 rounded-xl">
                            <p className="text-xs text-gray-500">Total Interest</p>
                            <p className="text-sm font-bold text-emerald-600">₹{Math.round(totalInt).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-white/60 p-2 rounded-xl">
                            <p className="text-xs text-gray-500">Total Payment</p>
                            <p className="text-sm font-bold text-emerald-600">₹{Math.round(totalPay).toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmiCalculator;
