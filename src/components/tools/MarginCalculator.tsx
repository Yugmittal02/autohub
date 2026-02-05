import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

interface MarginCalculatorProps {
    // No props needed for now as state is local
}

const MarginCalculator: React.FC<MarginCalculatorProps> = () => {
    const [marginInput, setMarginInput] = useState({ cost: '', sell: '', discount: 0, mode: 'profit', markup: '' });

    // Shared Styles
    const cardClass = "bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all";
    const commonInputClass = "w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all mb-4";


    const cost = parseFloat(marginInput.cost) || 0;
    const sell = parseFloat(marginInput.sell) || 0;
    const markup = parseFloat(marginInput.markup) || 0;
    const profit = sell - cost;
    const marginPercent = sell > 0 ? ((profit / sell) * 100) : 0;
    const markupPercent = cost > 0 ? ((profit / cost) * 100) : 0;
    const sellFromMarkup = cost + (cost * markup / 100);
    const breakEvenQty = cost > 0 && profit > 0 ? Math.ceil(cost / profit) : 0;

    return (
        <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                    <Calculator className="text-purple-500" size={24} />
                    Profit Analyzer Pro
                </h3>
                <button
                    onClick={() => setMarginInput({ cost: '', sell: '', discount: 0, mode: marginInput.mode, markup: '' })}
                    className="text-xs text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full"
                >
                    RESET
                </button>
            </div>

            <div className="flex gap-2 mb-4 bg-purple-50 p-1.5 rounded-xl">
                <button onClick={() => setMarginInput({ ...marginInput, mode: 'profit' })} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${marginInput.mode === 'profit' ? 'bg-white shadow-md text-purple-600' : 'text-gray-500 hover:text-purple-400'}`}>
                    📈 Profit Analysis
                </button>
                <button onClick={() => setMarginInput({ ...marginInput, mode: 'markup' })} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${marginInput.mode === 'markup' ? 'bg-white shadow-md text-purple-600' : 'text-gray-500 hover:text-purple-400'}`}>
                    🏷️ Markup Pricing
                </button>
                <button onClick={() => setMarginInput({ ...marginInput, mode: 'discount' })} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${marginInput.mode === 'discount' ? 'bg-white shadow-md text-purple-600' : 'text-gray-500 hover:text-purple-400'}`}>
                    ✂️ Discount
                </button>
            </div>

            {marginInput.mode === 'profit' ? (
                <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">BUYING COST</label>
                            <input
                                type="number"
                                placeholder="₹0"
                                className={`${commonInputClass} mb-0 text-center text-xl`}
                                value={marginInput.cost}
                                onChange={e => setMarginInput({ ...marginInput, cost: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block">SELLING PRICE</label>
                            <input
                                type="number"
                                placeholder="₹0"
                                className={`${commonInputClass} mb-0 text-center text-xl`}
                                value={marginInput.sell}
                                onChange={e => setMarginInput({ ...marginInput, sell: e.target.value })}
                            />
                        </div>
                    </div>

                    {cost > 0 && sell > 0 && (
                        <div className={`p-4 rounded-2xl border-2 ${profit >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'}`}>
                            <div className="text-center mb-4">
                                <p className={`text-xs font-bold mb-1 ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {profit >= 0 ? '✅ PROFIT' : '❌ LOSS'}
                                </p>
                                <p className={`text-4xl font-black ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ₹{Math.abs(profit).toFixed(2)}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="bg-white/60 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-500 font-medium">Profit Margin</p>
                                    <p className={`text-2xl font-bold ${marginPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {marginPercent.toFixed(1)}%
                                    </p>
                                </div>
                                <div className="bg-white/60 rounded-xl p-3 text-center">
                                    <p className="text-xs text-gray-500 font-medium">Markup %</p>
                                    <p className={`text-2xl font-bold ${markupPercent >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                                        {markupPercent.toFixed(1)}%
                                    </p>
                                </div>
                            </div>

                            {profit > 0 && (
                                <div className="bg-blue-100/50 rounded-xl p-3 text-center">
                                    <p className="text-xs text-blue-600 font-medium">Break-even Quantity</p>
                                    <p className="text-lg font-bold text-blue-800">
                                        Sell {breakEvenQty} units to recover cost
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : marginInput.mode === 'markup' ? (
                <>
                    <div className="mb-4">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">BUYING COST</label>
                        <input
                            type="number"
                            placeholder="₹0"
                            className={`${commonInputClass} mb-0 text-center text-xl`}
                            value={marginInput.cost}
                            onChange={e => setMarginInput({ ...marginInput, cost: e.target.value })}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-bold text-gray-500 mb-2 block">SELECT MARKUP %</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[10, 15, 20, 25, 30, 40, 50, 100].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMarginInput({ ...marginInput, markup: m.toString() })}
                                    className={`py-2 rounded-lg font-bold text-sm transition-all ${parseFloat(marginInput.markup) === m ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-purple-100'}`}
                                >
                                    {m}%
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            placeholder="Or enter custom markup %"
                            className={`${commonInputClass} mb-0 mt-3`}
                            value={marginInput.markup}
                            onChange={e => setMarginInput({ ...marginInput, markup: e.target.value })}
                        />
                    </div>

                    {cost > 0 && markup > 0 && (
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-2xl border-2 border-purple-200">
                            <div className="text-center">
                                <p className="text-xs font-bold text-purple-600 mb-1">RECOMMENDED SELLING PRICE</p>
                                <p className="text-4xl font-black text-purple-700">₹{sellFromMarkup.toFixed(2)}</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Profit per unit: <span className="font-bold text-green-600">₹{(sellFromMarkup - cost).toFixed(2)}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div className="mb-4">
                        <label className="text-xs font-bold text-gray-500 mb-1 block">ORIGINAL PRICE (MRP)</label>
                        <input
                            type="number"
                            placeholder="₹0"
                            className={`${commonInputClass} mb-0 text-center text-xl`}
                            value={marginInput.cost}
                            onChange={e => setMarginInput({ ...marginInput, cost: e.target.value })}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="text-xs font-bold text-gray-500 mb-2 block">DISCOUNT %</label>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                            {[5, 10, 15, 20, 25].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setMarginInput({ ...marginInput, discount: d })}
                                    className={`py-2 rounded-lg font-bold text-sm transition-all ${marginInput.discount === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-100'}`}
                                >
                                    {d}%
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            placeholder="Or enter custom discount %"
                            className={commonInputClass}
                            value={marginInput.discount || ''}
                            onChange={e => setMarginInput({ ...marginInput, discount: parseFloat(e.target.value) || 0 })}
                        />
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-2xl border-2 border-orange-200">
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-orange-200">
                            <span className="text-gray-600">You Save</span>
                            <span className="text-xl font-bold text-orange-600">
                                ₹{((cost * marginInput.discount) / 100).toFixed(2)}
                            </span>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-green-600 mb-1">FINAL PAYABLE AMOUNT</p>
                            <p className="text-4xl font-black text-green-700">
                                ₹{(cost - (cost * marginInput.discount / 100)).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MarginCalculator;
