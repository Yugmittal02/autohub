import React, { useState } from 'react';
import { Percent, Copy } from 'lucide-react';

interface GstCalculatorProps {
    t: (key: string) => string;
}

const GstCalculator: React.FC<GstCalculatorProps> = ({ t }) => {
    const [gstInput, setGstInput] = useState({ price: '', rate: 18, isReverse: false });

    // Shared Styles
    const cardClass = "bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all";
    const commonInputClass = "w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all mb-4";

    const price = parseFloat(gstInput.price) || 0;
    let gstAmt = 0, finalAmt = 0, baseAmt = 0, cgst = 0, sgst = 0, igst = 0;

    if (gstInput.isReverse) {
        baseAmt = (price * 100) / (100 + gstInput.rate);
        gstAmt = price - baseAmt;
        finalAmt = price;
    } else {
        baseAmt = price;
        gstAmt = (price * gstInput.rate) / 100;
        finalAmt = price + gstAmt;
    }

    cgst = sgst = gstAmt / 2;
    igst = gstAmt;

    return (
        <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                    <Percent className="text-blue-500" size={24} />
                    GST Pro Calculator
                </h3>
            </div>
            <div className="flex gap-2 mb-4 bg-blue-50 p-1 rounded-xl">
                <button
                    onClick={() => setGstInput({ ...gstInput, isReverse: false })}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${!gstInput.isReverse ? 'bg-blue-600 text-white shadow' : 'text-blue-600 hover:bg-blue-100'}`}
                >
                    Add GST
                </button>
                <button
                    onClick={() => setGstInput({ ...gstInput, isReverse: true })}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${gstInput.isReverse ? 'bg-green-600 text-white shadow' : 'text-green-600 hover:bg-green-100'}`}
                >
                    Reverse GST
                </button>
            </div>

            <input
                type="number"
                placeholder={gstInput.isReverse ? "Enter GST Inclusive Amount (₹)" : "Enter Base Amount (₹)"}
                className={`${commonInputClass} text-center text-2xl`}
                value={gstInput.price}
                onChange={e => setGstInput({ ...gstInput, price: e.target.value })}
            />

            <div className="grid grid-cols-5 gap-2 mb-4">
                {[5, 12, 18, 28, 'custom'].map(r => (
                    <button
                        key={r}
                        onClick={() => r !== 'custom' && setGstInput({ ...gstInput, rate: Number(r) })}
                        className={`py-3 rounded-xl font-bold border-2 transition-all ${gstInput.rate === r ? 'bg-blue-600 text-white border-blue-600 scale-105' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}
                    >
                        {r === 'custom' ? t('Custom') : `${r}%`}
                    </button>
                ))}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border-2 border-blue-100 mb-4">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-blue-100">
                        <span className="text-gray-600">Base Amount</span>
                        <span className="font-bold">₹{baseAmt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-100">
                        <span className="text-gray-600">GST ({gstInput.rate}%)</span>
                        <span className="font-bold text-blue-600">₹{gstAmt.toFixed(2)}</span>
                    </div>

                    <div className="bg-white/50 rounded-xl p-3 my-2">
                        <p className="text-xs text-gray-500 font-bold mb-2">TAX BREAKDOWN (Intra-State)</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="text-center p-2 bg-blue-100/50 rounded-lg">
                                <p className="text-xs text-blue-600">CGST ({gstInput.rate / 2}%)</p>
                                <p className="font-bold text-blue-800">₹{cgst.toFixed(2)}</p>
                            </div>
                            <div className="text-center p-2 bg-indigo-100/50 rounded-lg">
                                <p className="text-xs text-indigo-600">SGST ({gstInput.rate / 2}%)</p>
                                <p className="font-bold text-indigo-800">₹{sgst.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="mt-2 text-center p-2 bg-purple-100/50 rounded-lg">
                            <p className="text-xs text-purple-600">IGST (Inter-State) ({gstInput.rate}%)</p>
                            <p className="font-bold text-purple-800">₹{igst.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="flex justify-between text-2xl font-bold pt-2">
                        <span>Final Amount</span>
                        <span className="text-green-600">₹{finalAmt.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={() => navigator.clipboard.writeText(`GST Calculation\n---------------\nBase: ₹${baseAmt.toFixed(2)}\nGST @${gstInput.rate}%: ₹${gstAmt.toFixed(2)}\n  CGST: ₹${cgst.toFixed(2)}\n  SGST: ₹${sgst.toFixed(2)}\n---------------\nTotal: ₹${finalAmt.toFixed(2)}`)}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
                <Copy size={16} /> Copy Full Breakdown
            </button>
        </div>
    );
};

export default GstCalculator;
