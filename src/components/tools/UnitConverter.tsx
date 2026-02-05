import React, { useState } from 'react';
import { RefreshCcw } from 'lucide-react';

interface UnitConverterProps {
    // No props needed for now
}

const UnitConverter: React.FC<UnitConverterProps> = () => {
    const [convInput, setConvInput] = useState({ val: '', type: 'kgToTon' });

    // Shared Styles
    const cardClass = "bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all";
    const commonInputClass = "w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 font-bold text-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all mb-4";

    const convert = (val: number, type: string) => {
        const rates: any = {
            kgToTon: val / 1000, tonToKg: val * 1000, ftToM: val / 3.28084, mToFt: val * 3.28084,
            ltrToGal: val * 0.264172, galToLtr: val / 0.264172, sqftToSqm: val / 10.764, sqmToSqft: val * 10.764
        };
        return rates[type] || val;
    };
    const result = convInput.val ? convert(Number(convInput.val), convInput.type).toFixed(4) : '0';

    return (
        <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                    <RefreshCcw className="text-green-500" size={24} />
                    Unit Converter Pro
                </h3>
            </div>
            <select
                className={`${commonInputClass} mb-4`}
                value={convInput.type}
                onChange={e => setConvInput({ ...convInput, type: e.target.value })}
            >
                <option value="kgToTon">KG ↔ Ton</option>
                <option value="tonToKg">Ton ↔ KG</option>
                <option value="ftToM">Feet ↔ Meters</option>
                <option value="mToFt">Meters ↔ Feet</option>
                <option value="ltrToGal">Liters ↔ Gallons</option>
                <option value="galToLtr">Gallons ↔ Liters</option>
                <option value="sqftToSqm">Sq. Ft ↔ Sq. Meters</option>
                <option value="sqmToSqft">Sq. Meters ↔ Sq. Ft</option>
            </select>
            <input
                type="number"
                placeholder="Enter Value"
                className={`${commonInputClass} text-center text-2xl`}
                value={convInput.val}
                onChange={e => setConvInput({ ...convInput, val: e.target.value })}
            />
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 text-center">
                <p className="text-sm font-bold text-green-600 mb-2">CONVERTED VALUE</p>
                <p className="text-4xl font-black text-green-800">{result}</p>
                <p className="text-xs text-green-600 mt-2 opacity-70">
                    {convInput.type.includes('To') ? convInput.type.split('To')[1].toUpperCase() : ''}
                </p>
            </div>
        </div>
    );
};

export default UnitConverter;
