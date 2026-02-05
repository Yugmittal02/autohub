import React from 'react';
import { CreditCard, Share2, Phone, Store } from 'lucide-react';

interface DigitalBusinessCardProps {
    shopDetails: any;
}

const DigitalBusinessCard: React.FC<DigitalBusinessCardProps> = ({ shopDetails }) => {
    // Shared Styles
    const cardClass = "bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-all";

    return (
        <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                    <CreditCard className="text-orange-500" size={24} />
                    Digital Business Card
                </h3>
                <button onClick={() => alert('Sharing not available in preview')} className="p-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200">
                    <Share2 size={20} />
                </button>
            </div>
            <div id="biz-card" className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl aspect-video relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">{shopDetails.shopName || "My Business"}</h2>
                        <p className="text-orange-400 text-sm">{shopDetails.ownerName || "Business Owner"}</p>
                    </div>
                    <div className="space-y-2 text-sm opacity-90">
                        <p className="flex items-center gap-2"><Phone size={14} className="text-orange-400" /> {shopDetails.mobile || "+91 98765 43210"}</p>
                        <p className="flex items-center gap-2"><Store size={14} className="text-orange-400" /> {shopDetails.address || "Business Address"}</p>
                    </div>
                </div>
            </div>
            <p className="text-center text-xs text-gray-500">
                This is a live preview of your digital business card. Share it with customers to expand your reach.
            </p>
        </div>
    );
};

export default DigitalBusinessCard;
