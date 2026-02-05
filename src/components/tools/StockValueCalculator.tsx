import React, { useState } from 'react';
import { Activity, Plus, Package, Trash2 } from 'lucide-react';

interface StockValueCalculatorProps {
    // No external props needed
}

const StockValueCalculator: React.FC<StockValueCalculatorProps> = () => {
    const [stockCalc, setStockCalc] = useState<{ items: any[], newItem: any }>({ items: [], newItem: { name: '', qty: 0, rate: 0 } });

    // Shared Styles
    const cardClass = "bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all";

    const stockTotal = stockCalc.items.reduce((acc: number, item: any) => acc + (item.qty * item.rate), 0);

    return (
        <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                    <Activity className="text-cyan-500" size={24} />
                    Stock Value Calculator
                </h3>
                <div className="text-right">
                    <p className="text-xs text-gray-500 font-bold">TOTAL VALUE</p>
                    <p className="text-2xl font-black text-cyan-600">₹{stockTotal.toFixed(2)}</p>
                </div>
            </div>
            <div className="bg-cyan-50 p-3 rounded-xl mb-4 border border-cyan-100">
                <div className="grid grid-cols-6 gap-2 mb-2">
                    <input
                        className="col-span-3 p-2 border rounded-lg text-sm bg-white"
                        placeholder="Item Name"
                        value={stockCalc.newItem.name}
                        onChange={e => setStockCalc({ ...stockCalc, newItem: { ...stockCalc.newItem, name: e.target.value } })}
                    />
                    <input
                        type="number"
                        className="col-span-1 p-2 border rounded-lg text-sm bg-white"
                        placeholder="Qty"
                        value={stockCalc.newItem.qty || ''}
                        onChange={e => setStockCalc({ ...stockCalc, newItem: { ...stockCalc.newItem, qty: parseFloat(e.target.value) } })}
                    />
                    <input
                        type="number"
                        className="col-span-1 p-2 border rounded-lg text-sm bg-white"
                        placeholder="Rate"
                        value={stockCalc.newItem.rate || ''}
                        onChange={e => setStockCalc({ ...stockCalc, newItem: { ...stockCalc.newItem, rate: parseFloat(e.target.value) } })}
                    />
                    <button
                        onClick={() => {
                            if (stockCalc.newItem.name && stockCalc.newItem.qty && stockCalc.newItem.rate) {
                                setStockCalc({
                                    items: [...stockCalc.items, { ...stockCalc.newItem, id: Date.now() }],
                                    newItem: { name: '', qty: 0, rate: 0 }
                                });
                            }
                        }}
                        className="col-span-1 bg-cyan-500 text-white rounded-lg flex items-center justify-center hover:bg-cyan-600 transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px]">
                {stockCalc.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg"><Package size={16} className="text-gray-400" /></div>
                            <div>
                                <p className="font-bold text-sm">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.qty} × ₹{item.rate}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-700 dark:text-gray-300">₹{(item.qty * item.rate).toFixed(2)}</span>
                            <button onClick={() => setStockCalc({ ...stockCalc, items: stockCalc.items.filter((i: any) => i.id !== item.id) })} className="text-red-400 hover:text-red-600">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
                {stockCalc.items.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        <Package size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Add items to calculate stock value</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockValueCalculator;
