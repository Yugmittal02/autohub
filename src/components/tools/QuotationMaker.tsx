import React, { useState, useEffect } from 'react';
import { FileText, FileCheck, MessageCircle, Download, Trash2, Plus, Search, X } from 'lucide-react';
import { QuotationSchema } from '../../schemas';

interface QuotationMakerProps {
    t: (key: string) => string;
    shopDetails: any;
    data: any;
    isDark: boolean;
}

const QuotationMaker: React.FC<QuotationMakerProps> = ({ t, shopDetails, data, isDark }) => {
    // State
    const [quoteCust, setQuoteCust] = useState({ name: '', phone: '', address: '' });
    const [quoteItems, setQuoteItems] = useState<any[]>([]);
    const [quoteDiscount, setQuoteDiscount] = useState(0);
    const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
    const [quoteSettings, setQuoteSettings] = useState({ terms: '1. Goods once sold will not be taken back.\n2. Warranty as per manufacturer policy.', shopAddress: '' });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // UI State
    const [showItemSelector, setShowItemSelector] = useState(false);
    const [quoteSearch, setQuoteSearch] = useState('');

    // Shared Styles
    const cardClass = "bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all";

    // Load Draft
    useEffect(() => {
        const saved = localStorage.getItem('quote_draft');
        if (saved) {
            try {
                const parse = JSON.parse(saved);
                setQuoteCust(parse.cust || { name: '', phone: '', address: '' });
                setQuoteItems(parse.items || []);
                setQuoteDiscount(parse.discount || 0);
                if (parse.settings) setQuoteSettings(prev => ({ ...prev, ...parse.settings }));
            } catch (e) {
                console.error("Failed to load draft");
            }
        }
    }, []);

    // Save Draft
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (quoteItems.length > 0 || quoteCust.name) {
                localStorage.setItem('quote_draft', JSON.stringify({
                    cust: quoteCust,
                    items: quoteItems,
                    discount: quoteDiscount,
                    settings: quoteSettings
                }));
            }
        }, 1000);
        return () => clearTimeout(timeout);
    }, [quoteCust, quoteItems, quoteDiscount, quoteSettings]);

    // Logic
    const addToQuote = (item: any) => {
        setQuoteItems([...quoteItems, {
            id: Date.now(),
            name: item.itemName || "Custom Item",
            qty: 1,
            rate: item.sellPrice || 0,
            desc: ''
        }]);
        setShowItemSelector(false);
        setQuoteSearch('');
    };

    const updateQuoteItem = (id: number, field: string, val: any) => {
        setQuoteItems(quoteItems.map(i => i.id === id ? { ...i, [field]: val } : i));
    };

    const removeQuoteItem = (id: number) => setQuoteItems(quoteItems.filter(i => i.id !== id));

    const quoteSubTotal = quoteItems.reduce((acc, i) => acc + (i.qty * i.rate), 0);
    const quoteFinalTotal = Math.max(0, quoteSubTotal - quoteDiscount);

    // Function to Validate and Print
    const handlePrint = () => {
        const payload = {
            cust: quoteCust,
            items: quoteItems,
            discount: quoteDiscount || 0
        };
        const result = QuotationSchema.safeParse(payload);
        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.issues.forEach(issue => {
                errors[issue.path.join('.')] = issue.message;
            });
            setValidationErrors(errors);
            alert("Please fix errors: " + result.error.issues.map(i => i.message).join(', '));
            return;
        }
        setValidationErrors({});
        window.print();
    };

    // Updated Share Function
    const shareViaWhatsapp = () => {
        const payload = {
            cust: quoteCust,
            items: quoteItems,
            discount: quoteDiscount || 0
        };
        const result = QuotationSchema.safeParse(payload);
        if (!result.success) {
            alert("Please complete the quotation before sharing. " + result.error.issues[0].message);
            return;
        }

        const separator = "━━━━━━━━━━━━━━━━━━";
        const text = `*📄 QUOTATION*` +
            `\n*${shopDetails.shopName?.toUpperCase() || "MY SHOP"}*` +
            `\n_${shopDetails.address || ''}_` +
            `\n📞 ${shopDetails.mobile || ''}\n` +
            `\n${separator}` +
            `\n📅 *Date:* ${new Date(quoteDate).toLocaleDateString()}` +
            `\n👤 *To:* ${quoteCust.name} (${quoteCust.phone})` +
            `\n${separator}\n` +
            `\n*📦 ITEMS:*` +
            quoteItems.map((i, idx) => `\n${idx + 1}. *${i.name}*` + (i.desc ? `\n   _${i.desc}_` : '') + `\n   ${i.qty} x ₹${i.rate} = *₹${(i.qty * i.rate).toLocaleString()}*`).join('') +
            `\n\n${separator}` +
            `\n💰 *Subtotal: ₹${quoteSubTotal.toLocaleString()}*` +
            (quoteDiscount > 0 ? `\n🏷️ *Discount: -₹${quoteDiscount.toLocaleString()}*` : '') +
            `\n💵 *TOTAL PAYABLE: ₹${quoteFinalTotal.toLocaleString()}*` +
            `\n${separator}` +
            `\n\n📝 _Terms: ${quoteSettings.terms.split('\n')[0]}..._` +
            `\n\nGenerated by Autonex`;
        const url = `https://wa.me/${quoteCust.phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div className={`${cardClass} overflow-y-auto relative bg-gray-50 dark:bg-slate-900 !p-0 md:!p-6 border-0 md:border`}>
            {/* TOOLBAR */}
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-slate-800 z-10 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div>
                    <h3 className="font-bold text-xl flex items-center gap-2 text-indigo-600">
                        <FileText size={24} /> {t("Quotation Maker")}
                    </h3>
                </div>
                <div className="flex gap-2">
                    <button aria-label={t("Start New Quotation")} onClick={() => {
                        if (confirm("Start new quotation? Current draft will be cleared.")) {
                            setQuoteItems([]);
                            setQuoteCust({ name: '', phone: '', address: '' });
                            setQuoteDiscount(0);
                            localStorage.removeItem('quote_draft');
                        }
                    }} className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold text-sm">
                        <FileCheck size={18} /> <span className="hidden sm:inline">New</span>
                    </button>
                    <button aria-label={t("Share via WhatsApp")} onClick={shareViaWhatsapp} className="p-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md flex items-center gap-1 font-bold text-sm">
                        <MessageCircle size={18} /> <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                    <button aria-label={t("Print Quotation")} onClick={handlePrint} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 flex items-center gap-1 font-bold text-sm">
                        <Download size={18} /> <span className="hidden sm:inline">{t("Print")}</span>
                    </button>
                </div>
            </div>

            {/* ENTERPRISE PAPER LAYOUT */}
            <div id="print-area" className="bg-white text-black p-3 md:p-6 rounded-none md:rounded-xl shadow-none md:shadow-lg border-0 md:border border-gray-200 min-h-[600px] flex flex-col relative max-w-4xl mx-auto">

                {/* BRANDING HEADER */}
                <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase text-indigo-800 tracking-wide">{shopDetails.shopName || "MY SHOP"}</h1>
                        <input className="text-xs text-gray-500 w-full outline-none bg-transparent placeholder-gray-300 mt-1" placeholder="Add Shop Address & Mobile..." value={quoteSettings.shopAddress} onChange={e => setQuoteSettings({ ...quoteSettings, shopAddress: e.target.value })} />
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest">{t("QUOTATION")}</h2>
                        <p className="font-bold text-indigo-600">#{Date.now().toString().slice(-6)}</p>
                        <input type="date" className="text-xs text-right bg-transparent outline-none font-medium mt-1" value={quoteDate} onChange={e => setQuoteDate(e.target.value)} />
                    </div>
                </div>

                {/* CUSTOMER SECTION */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">QUOTATION FOR:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input className="bg-transparent border-b border-gray-300 p-1 font-bold outline-none focus:border-indigo-500 text-lg w-full" placeholder="Customer Name *" value={quoteCust.name} onChange={e => setQuoteCust({ ...quoteCust, name: e.target.value })} />
                        <input className="bg-transparent border-b border-gray-300 p-1 outline-none focus:border-indigo-500 w-full" placeholder="Mobile Number" type="tel" value={quoteCust.phone} onChange={e => setQuoteCust({ ...quoteCust, phone: e.target.value })} />
                        <input className="bg-transparent border-b border-gray-300 p-1 outline-none focus:border-indigo-500 w-full md:col-span-2 text-sm" placeholder="Billing Address (Optional)" value={quoteCust.address} onChange={e => setQuoteCust({ ...quoteCust, address: e.target.value })} />
                    </div>
                </div>

                {/* ITEMS TABLE */}
                <div className="flex-1">
                    <div className="grid grid-cols-12 gap-2 bg-indigo-600 text-white p-2 text-xs font-bold uppercase rounded-t-lg">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-6">Item Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-3 text-right">Amount</div>
                    </div>

                    <div className="border-x border-b border-gray-200 rounded-b-lg mb-6">
                        {quoteItems.map((item, idx) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border-b last:border-0 hover:bg-gray-50 items-center text-sm">
                                <div className="col-span-1 text-center font-bold text-gray-400">{idx + 1}</div>
                                <div className="col-span-6">
                                    <input className="w-full font-bold outline-none bg-transparent" value={item.name} onChange={e => updateQuoteItem(item.id, 'name', e.target.value)} />
                                    <input className="w-full text-xs text-gray-500 outline-none bg-transparent" placeholder="Add description..." value={item.desc} onChange={e => updateQuoteItem(item.id, 'desc', e.target.value)} />
                                </div>
                                <div className="col-span-2 flex items-center justify-center px-1">
                                    <input className="w-full text-center border border-gray-300 rounded p-1 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white font-bold text-sm placeholder-gray-200" placeholder="" type="number" value={item.qty === 0 ? '' : item.qty} onChange={e => updateQuoteItem(item.id, 'qty', parseInt(e.target.value) || 0)} />
                                </div>
                                <div className="col-span-3 flex items-center justify-end gap-1 px-1">
                                    <div className="flex flex-col items-end w-full">
                                        <span className="font-bold text-sm">₹{(item.qty * item.rate).toLocaleString()}</span>
                                        <input className="text-xs text-right text-gray-600 outline-none w-full border border-gray-300 rounded p-1 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none mt-1 placeholder-gray-200" placeholder="Rate" value={item.rate === 0 ? '' : item.rate} onChange={e => updateQuoteItem(item.id, 'rate', parseFloat(e.target.value) || 0)} type="number" />
                                    </div>
                                    <button aria-label={t("Remove Item")} onClick={() => removeQuoteItem(item.id)} className="text-red-300 hover:text-red-500 print:hidden"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}

                        {/* ADD ITEM BUTTON (Print Hidden) */}
                        <div className="p-3 print:hidden">
                            <button aria-label={t("Add Product")} onClick={() => setShowItemSelector(true)} className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-500 rounded-lg hover:bg-indigo-50 font-bold flex items-center justify-center gap-2">
                                <Plus size={18} /> {t("Add Product")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* FOOTER & TOTALS */}
                <div className="flex justify-end mb-8">
                    <div className="w-1/2 md:w-1/3">
                        <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-bold">₹{quoteSubTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200 text-sm items-center">
                            <span className="text-gray-500 text-xs">Discount (₹)</span>
                            <input className="w-20 text-right font-bold text-red-500 outline-none border-b border-dashed border-red-200 focus:border-red-500 bg-transparent" placeholder="0" type="number" value={quoteDiscount === 0 ? '' : quoteDiscount} onChange={e => setQuoteDiscount(parseFloat(e.target.value) || 0)} />
                        </div>
                        <div className="flex justify-between py-3 border-b-2 border-indigo-600 text-xl font-black text-indigo-900 bg-indigo-50 px-2 mt-2 rounded">
                            <span>TOTAL</span>
                            <span>₹{quoteFinalTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mt-auto pt-8 border-t border-gray-200">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Terms & Conditions</p>
                        <textarea className="w-full text-xs text-gray-600 bg-transparent resize-none h-20 outline-none border border-transparent hover:border-gray-200 rounded p-1" value={quoteSettings.terms} onChange={e => setQuoteSettings({ ...quoteSettings, terms: e.target.value })} />
                    </div>
                    <div className="text-right flex flex-col justify-end items-end">
                        <div className="h-16 w-32 border-b border-gray-300 mb-2"></div>
                        <p className="text-xs font-bold text-gray-500 uppercase">{t("Authorized Signatory")}</p>
                        <p className="text-[10px] text-gray-400">{shopDetails.shopName}</p>
                    </div>
                </div>
            </div>

            {/* MOBILE OPTIMIZED ITEM SELECTOR */}
            {showItemSelector && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
                        <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
                            <h3 className="font-bold text-lg">{t("Select Product")}</h3>
                            <button onClick={() => setShowItemSelector(false)} className="p-2 bg-gray-200 dark:bg-slate-800 rounded-full hover:bg-gray-300"><X size={20} /></button>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input autoFocus className="w-full pl-10 p-3.5 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 outline-none bg-gray-50 dark:bg-slate-800 dark:border-slate-700 text-lg" placeholder={t("Search by name...")} value={quoteSearch} onChange={e => setQuoteSearch(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-slate-950">
                            <button onClick={() => addToQuote({ itemName: '', sellPrice: 0 })} className="w-full p-4 rounded-xl bg-indigo-50 dark:bg-slate-800 border-indigo-200 text-indigo-700 font-bold flex items-center justify-between shadow-sm active:scale-95 transition-all mb-2">
                                <div className="flex items-center gap-3"><Plus size={20} /> <span>{t("Add Custom Item")}</span></div>
                            </button>

                            {(data?.pages || [])
                                .filter((p: any) => p.itemName.toLowerCase().includes(quoteSearch.toLowerCase()))
                                .map((p: any) => (
                                    <button key={p.id} onClick={() => addToQuote(p)} className="w-full text-left p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700 active:scale-95 transition-all flex justify-between items-center group">
                                        <div>
                                            <span className="font-bold text-lg block group-hover:text-indigo-600 transition-colors">{p.itemName}</span>
                                            <span className="text-xs text-gray-400">Inventory Item</span>
                                        </div>
                                        <span className="text-green-600 font-black text-lg bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-lg">₹{p.sellPrice}</span>
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuotationMaker;
