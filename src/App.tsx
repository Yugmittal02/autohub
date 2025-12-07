import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Minus, Search, X, Trash2, ArrowLeft, Book, Car, 
  ChevronRight, Mic, Settings, AlertTriangle, Languages 
} from 'lucide-react';

// --- DATA & SETTINGS LOAD ---
const loadData = () => {
  if (typeof window === 'undefined') return { pages: [], entries: [], settings: { limit: 5, theme: 'light' } };
  const saved = localStorage.getItem('adv-register-data');
  if (saved) return JSON.parse(saved);
  
  // Demo Data
  return {
    pages: [
      { id: 1, pageNo: 1, itemName: 'Brake Pads' },
      { id: 2, pageNo: 2, itemName: 'Oil Filter' },
      { id: 3, pageNo: 3, itemName: 'Headlights (LED)' }
    ],
    entries: [
      { id: 101, pageId: 1, car: 'Swift', qty: 12 },
      { id: 102, pageId: 1, car: 'Thar', qty: 2 }, // Low Stock
      { id: 103, pageId: 2, car: 'Creta', qty: 20 },
      { id: 104, pageId: 3, car: 'Verna', qty: 3 } // Low Stock
    ],
    settings: { limit: 5, theme: 'light' } // Default Alert Limit 5
  };
};

// --- VOICE COMPONENT (Robust) ---
const VoiceInput = ({ onResult, isDark }) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // 'en-IN' captures Hinglish best (e.g. "Swift ka bumper" -> "Swift ka bumper")
      recognition.lang = 'en-IN'; 
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if(transcript) onResult(transcript);
      };
      
      try { recognition.start(); } catch (e) { console.error(e); }
    } else {
      alert("Mic not supported");
    }
  };

  return (
    <button 
      onClick={startListening}
      className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : (isDark ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600')}`}
    >
      <Mic size={20}/>
    </button>
  );
};

export default function AdvancedRegister() {
  const [data, setData] = useState(loadData);
  const [view, setView] = useState('index'); // index, page, finder, alert, settings
  const [activePage, setActivePage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isHindi, setIsHindi] = useState(false); // Translation Toggle

  // Modals
  const [isNewPageOpen, setIsNewPageOpen] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [input, setInput] = useState({ itemName: '', carName: '', qty: '' });

  // Save Data
  useEffect(() => {
    localStorage.setItem('adv-register-data', JSON.stringify(data));
  }, [data]);

  const isDark = data.settings.theme === 'dark';

  // --- ACTIONS ---
  const handleAddPage = () => {
    if (!input.itemName) return;
    const nextPageNo = data.pages.length + 1; // Automatic Page No
    const newPage = { id: Date.now(), pageNo: nextPageNo, itemName: input.itemName };
    setData({ ...data, pages: [...data.pages, newPage] });
    setInput({ ...input, itemName: '' });
    setIsNewPageOpen(false);
  };

  const handleAddEntry = () => {
    if (!input.carName) return;
    const newEntry = {
      id: Date.now(),
      pageId: activePage.id,
      car: input.carName,
      qty: parseInt(input.qty) || 0
    };
    setData({ ...data, entries: [newEntry, ...data.entries] });
    setInput({ ...input, carName: '', qty: '' });
    setIsNewEntryOpen(false);
  };

  const updateQty = (id, amount) => {
    setData({
      ...data,
      entries: data.entries.map(e => e.id === id ? { ...e, qty: Math.max(0, e.qty + amount) } : e)
    });
  };

  const deletePage = (id) => {
    if(window.confirm(isHindi ? "Page delete karein?" : "Delete Page?")) {
      // Re-order remaining pages logic can be added here, currently just deleting
      setData({
        ...data,
        pages: data.pages.filter(p => p.id !== id),
        entries: data.entries.filter(e => e.pageId !== id)
      });
    }
  };

  const deleteEntry = (id) => {
    if(window.confirm("Delete?")) {
      setData({ ...data, entries: data.entries.filter(e => e.id !== id) });
    }
  };

  // --- SEARCH LOGIC ---
  const filteredEntries = useMemo(() => {
    if (!searchTerm) return activePage ? data.entries.filter(e => e.pageId === activePage.id) : [];
    
    // Global Search or Page Search
    let targetEntries = activePage 
      ? data.entries.filter(e => e.pageId === activePage.id) 
      : data.entries;

    return targetEntries.filter(e => 
      e.car.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data.entries, searchTerm, activePage]);

  // Low Stock Logic
  const lowStockItems = data.entries.filter(e => e.qty < data.settings.limit);

  // --- TRANSLATION HELPER ---
  const t = (eng, hin) => isHindi ? hin : eng;

  // --- RENDERERS ---

  // 1. INDEX (REGISTER COVER)
  const renderIndex = () => (
    <div className="pb-24">
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-yellow-100 border-yellow-300'} p-4 border-b-2 sticky top-0 z-10 shadow-sm`}>
        <div className="flex justify-between items-center">
          <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-yellow-900'} flex items-center gap-2 uppercase`}>
            <Book/> {t("Index", "विषय सूची")}
          </h1>
          <button onClick={() => setIsHindi(!isHindi)} className="p-2 bg-white/20 rounded-full">
            <Languages size={20} className={isDark ? 'text-white' : 'text-yellow-900'}/>
          </button>
        </div>
        <p className={`text-xs font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-yellow-800 opacity-70'}`}>
          {t("Total Items/Pages:", "कुल पेज:")} {data.pages.length}
        </p>
      </div>

      <div className="p-2">
        <div className={`flex px-3 py-2 border-b-2 ${isDark ? 'border-slate-700 text-slate-400' : 'border-gray-300 text-gray-500'} text-xs font-bold uppercase`}>
          <div className="w-12">{t("Pg.No", "पेज नं")}</div>
          <div className="flex-1">{t("Item Name", "सामान का नाम")}</div>
          <div className="w-16 text-center">{t("Qty", "मात्रा")}</div>
        </div>

        <div className={`min-h-[60vh] shadow-sm border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
          {data.pages.map((page, index) => {
            const total = data.entries.filter(e => e.pageId === page.id).reduce((a, b) => a + b.qty, 0);
            return (
              <div 
                key={page.id} 
                onClick={() => { setActivePage(page); setView('page'); setSearchTerm(''); }}
                className={`flex items-center px-3 py-4 border-b cursor-pointer ${isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-blue-100 hover:bg-blue-50'}`}
              >
                <div className="w-12 font-bold text-red-500 font-mono text-lg">{index + 1}</div>
                <div className={`flex-1 font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {page.itemName}
                </div>
                <div className="w-16 text-center">
                  <span className={`px-2 py-1 rounded font-bold text-sm ${isDark ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {total}
                  </span>
                </div>
                <ChevronRight className="text-gray-300" size={20}/>
              </div>
            )
          })}
        </div>
      </div>

      <button onClick={() => setIsNewPageOpen(true)} className="fixed bottom-24 right-6 bg-yellow-500 text-yellow-900 w-16 h-16 rounded-full shadow-lg border-4 border-white flex items-center justify-center active:scale-95 z-20">
        <Plus size={32} strokeWidth={3}/>
      </button>
    </div>
  );

  // 2. PAGE VIEW
  const renderPage = () => (
    <div className={`pb-24 min-h-screen ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b-2 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-red-200'}`}>
        <div className={`flex items-center gap-2 p-3 ${isDark ? 'bg-slate-900' : 'bg-red-50'}`}>
           <button onClick={() => setView('index')} className="p-2 -ml-2"><ArrowLeft size={24} className={isDark ? 'text-white' : 'text-red-900'}/></button>
           <div className="flex-1">
             <p className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-red-400'}`}>
               {t("Page No.", "पेज नं.")} {data.pages.indexOf(activePage) + 1}
             </p>
             <h2 className={`text-xl font-black uppercase tracking-tight leading-none ${isDark ? 'text-white' : 'text-red-900'}`}>
               {activePage.itemName}
             </h2>
           </div>
           <button onClick={() => deletePage(activePage.id)} className="text-red-300 p-2"><Trash2 size={20}/></button>
        </div>
        
        {/* Search Bar on Page */}
        <div className={`p-2 flex gap-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder={t("Search on this page...", "इस पेज पर ढूंढें...")}
              className={`w-full pl-9 pr-2 py-2 rounded-lg border outline-none ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'border-gray-300 text-black'}`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
          </div>
          <VoiceInput onResult={setSearchTerm} isDark={isDark} />
        </div>

        {/* Column Headers */}
        <div className={`flex p-2 text-xs font-bold uppercase ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-red-100 text-red-900'}`}>
          <div className="flex-[2]">{t("Car Name", "गाड़ी का नाम")}</div>
          <div className="flex-[1.5] text-center">{t("Qty", "मात्रा")}</div>
        </div>
      </div>

      {/* Lines Grid */}
      <div className="w-full" style={isDark ? {} : { backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '100% 3.5rem' }}>
        {filteredEntries.map((entry) => (
          <div key={entry.id} className={`flex items-center px-4 h-14 border-b ${isDark ? 'border-slate-800' : 'border-transparent'}`}>
            <div className="flex-[2] flex items-center justify-between pr-2">
               <span className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{entry.car}</span>
               <button onClick={() => deleteEntry(entry.id)} className="text-gray-300 opacity-50 hover:opacity-100"><X size={16}/></button>
            </div>
            <div className="flex-[1.5] flex items-center justify-center gap-3">
               <button onClick={() => updateQty(entry.id, -1)} className={`w-8 h-8 flex items-center justify-center rounded-full border ${isDark ? 'bg-slate-800 border-slate-600 text-red-400' : 'bg-gray-100 border-gray-300 text-red-600'}`}><Minus size={16}/></button>
               <span className={`text-xl font-bold font-mono w-8 text-center ${entry.qty < data.settings.limit ? 'text-red-500 animate-pulse' : (isDark ? 'text-white' : 'text-black')}`}>{entry.qty}</span>
               <button onClick={() => updateQty(entry.id, 1)} className={`w-8 h-8 flex items-center justify-center rounded-full border ${isDark ? 'bg-slate-800 border-slate-600 text-green-400' : 'bg-gray-100 border-gray-300 text-green-600'}`}><Plus size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setIsNewEntryOpen(true)} className="fixed bottom-24 right-6 bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg border-4 border-white flex items-center justify-center active:scale-95 z-20">
        <Plus size={32} strokeWidth={3}/>
      </button>
    </div>
  );

  // 3. LOW STOCK ALERT VIEW
  const renderAlerts = () => (
    <div className="p-4 pb-24">
      <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-red-700'}`}>
        <AlertTriangle/> {t("Low Stock Alerts", "खत्म होने वाला माल")}
      </h2>
      <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        {t(`Showing items below ${data.settings.limit} qty.`, `${data.settings.limit} से कम वाले आइटम दिख रहे हैं.`)}
      </p>

      <div className="space-y-3">
        {lowStockItems.length === 0 && <div className="text-center p-10 text-gray-400">{t("All Good! Stock is full.", "सब ठीक है! स्टॉक फुल है.")}</div>}
        
        {lowStockItems.map(item => {
           const page = data.pages.find(p => p.id === item.pageId);
           return (
             <div key={item.id} onClick={() => { setActivePage(page); setView('page'); }} className={`p-4 rounded-lg border-l-4 border-red-500 shadow-sm cursor-pointer ${isDark ? 'bg-slate-800 text-white' : 'bg-white'}`}>
               <div className="flex justify-between items-start">
                 <div>
                   <h3 className="font-bold text-lg">{page?.itemName}</h3>
                   <div className="flex items-center gap-2 text-sm opacity-80 mt-1">
                     <Car size={16}/> {item.car}
                   </div>
                 </div>
                 <div className="text-right">
                   <span className="text-3xl font-bold text-red-500">{item.qty}</span>
                   <p className="text-[10px] uppercase font-bold text-red-400">Left</p>
                 </div>
               </div>
               <div className="mt-2 text-xs opacity-50 uppercase font-bold text-right">
                 {t("Page No:", "पेज नं:")} {data.pages.indexOf(page) + 1}
               </div>
             </div>
           )
        })}
      </div>
    </div>
  );

  // 4. SETTINGS VIEW
  const renderSettings = () => (
    <div className="p-4 pb-24">
      <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
        <Settings/> {t("Settings", "सेटिंग्स")}
      </h2>

      <div className={`p-5 rounded-xl border mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <label className={`block text-sm font-bold uppercase mb-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {t("Low Stock Limit (Alert)", "स्टॉक अलर्ट लिमिट")}
        </label>
        <div className="flex items-center gap-4">
          <input 
            type="range" min="1" max="20" 
            value={data.settings.limit} 
            onChange={e => setData({...data, settings: {...data.settings, limit: parseInt(e.target.value)}})}
            className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <span className={`text-2xl font-bold w-12 text-center ${isDark ? 'text-white' : 'text-black'}`}>{data.settings.limit}</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">{t("Alert when stock goes below this number.", "जब माल इस नंबर से कम होगा तो लाल रंग का अलर्ट आएगा.")}</p>
      </div>

      <div className={`p-5 rounded-xl border mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <label className={`block text-sm font-bold uppercase mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
          {t("App Theme", "थीम")}
        </label>
        <div className="flex gap-4">
          <button 
            onClick={() => setData({...data, settings: {...data.settings, theme: 'light'}})}
            className={`flex-1 py-3 rounded-lg font-bold border-2 ${!isDark ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-600 text-gray-400'}`}
          >
            Light
          </button>
          <button 
            onClick={() => setData({...data, settings: {...data.settings, theme: 'dark'}})}
            className={`flex-1 py-3 rounded-lg font-bold border-2 ${isDark ? 'border-blue-500 bg-slate-700 text-white' : 'border-gray-200 text-gray-400'}`}
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );

  // 5. CAR FINDER VIEW
  const renderFinder = () => (
    <div className="p-4 pb-24">
      <div className={`sticky top-0 p-4 border-b rounded-xl shadow-sm z-10 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
        <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <Car className="text-blue-500"/> {t("Car Finder", "गाड़ी से ढूंढें")}
        </h2>
        <div className="flex gap-2">
            <div className="relative flex-1">
                <input 
                    autoFocus
                    type="text" 
                    placeholder={t("Car Name (e.g. Swift)...", "गाड़ी का नाम...")}
                    className={`w-full p-3 pl-10 border rounded-lg outline-none ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'border-gray-300 text-black'}`}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            </div>
            <VoiceInput onResult={setSearchTerm} isDark={isDark} />
        </div>
      </div>

      <div className="mt-4 space-y-3">
         {searchTerm && filteredEntries.map(entry => {
             const page = data.pages.find(p => p.id === entry.pageId);
             return (
                <div key={entry.id} onClick={() => { setActivePage(page); setView('page'); }} className={`p-4 rounded-lg border shadow-sm flex justify-between items-center cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'}`}>
                    <div>
                        <h3 className="font-bold text-blue-500 text-lg">{page.itemName}</h3>
                        <p className="text-sm font-bold opacity-70">{entry.car}</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-3 py-1 rounded text-sm font-bold ${entry.qty < data.settings.limit ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {entry.qty}
                        </span>
                        <p className="text-[10px] uppercase font-bold mt-1 opacity-50">{t("Page", "पेज")} {data.pages.indexOf(page) + 1}</p>
                    </div>
                </div>
             )
         })}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {view === 'index' && renderIndex()}
      {view === 'page' && renderPage()}
      {view === 'alert' && renderAlerts()}
      {view === 'settings' && renderSettings()}
      {view === 'finder' && renderFinder()}

      {/* BOTTOM NAV */}
      <div className={`fixed bottom-0 w-full border-t flex justify-around p-2 pb-safe z-50 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-300'}`}>
        <NavBtn icon={Book} label={t("Index", "इंडेक्स")} active={view === 'index'} onClick={() => setView('index')} isDark={isDark}/>
        <NavBtn icon={Car} label={t("Finder", "खोजें")} active={view === 'finder'} onClick={() => {setView('finder'); setSearchTerm('')}} isDark={isDark}/>
        <NavBtn icon={AlertTriangle} label={t("Alerts", "अलर्ट")} active={view === 'alert'} onClick={() => setView('alert')} alert={lowStockItems.length > 0} isDark={isDark}/>
        <NavBtn icon={Settings} label={t("Settings", "सेटिंग")} active={view === 'settings'} onClick={() => setView('settings')} isDark={isDark}/>
      </div>

      {/* NEW PAGE MODAL */}
      {isNewPageOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-4">{t("New Page (Item)", "नया पेज (सामान)")}</h3>
            <p className="text-xs mb-2 font-bold opacity-50 uppercase">{t("Auto Page No:", "ऑटो पेज नं:")} {data.pages.length + 1}</p>
            <div className="flex gap-2 mb-4">
                <input 
                autoFocus
                className={`flex-1 border-2 rounded-lg p-3 text-lg font-bold outline-none ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'border-gray-300 text-black'}`}
                placeholder="Item Name"
                value={input.itemName}
                onChange={e => setInput({...input, itemName: e.target.value})}
                />
                <div className="flex items-center"><VoiceInput onResult={(txt) => setInput(prev => ({...prev, itemName: txt}))} isDark={isDark} /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsNewPageOpen(false)} className={`flex-1 py-3 rounded-lg font-bold ${isDark ? 'bg-slate-800' : 'bg-gray-200 text-gray-600'}`}>{t("Cancel", "रद्द करें")}</button>
              <button onClick={handleAddPage} className="flex-1 py-3 bg-yellow-500 text-yellow-900 rounded-lg font-bold">{t("Create Page", "पेज बनाएं")}</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW ENTRY MODAL */}
      {isNewEntryOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-1">{t("New Entry", "नई एंट्री")}</h3>
            <p className="text-sm font-bold opacity-50 mb-4">{activePage?.itemName}</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold opacity-50 uppercase">{t("Car Name", "गाड़ी का नाम")}</label>
                <div className="flex gap-2 mt-1">
                    <input 
                    autoFocus
                    className={`flex-1 border-2 rounded-lg p-3 text-lg font-bold outline-none ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'border-gray-300 text-black'}`}
                    placeholder="e.g. Swift"
                    value={input.carName}
                    onChange={e => setInput({...input, carName: e.target.value})}
                    />
                    <div className="flex items-center"><VoiceInput onResult={(txt) => setInput(prev => ({...prev, carName: txt}))} isDark={isDark} /></div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold opacity-50 uppercase">{t("Quantity", "मात्रा")}</label>
                <input 
                  type="number"
                  className={`w-full border-2 rounded-lg p-3 text-lg font-bold mt-1 outline-none ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'border-gray-300 text-black'}`}
                  placeholder="0"
                  value={input.qty}
                  onChange={e => setInput({...input, qty: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsNewEntryOpen(false)} className={`flex-1 py-3 rounded-lg font-bold ${isDark ? 'bg-slate-800' : 'bg-gray-200 text-gray-600'}`}>{t("Cancel", "रद्द करें")}</button>
              <button onClick={handleAddEntry} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold">{t("Save", "सेव करें")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const NavBtn = ({ icon: Icon, label, active, onClick, alert, isDark }) => (
  <button onClick={onClick} className={`relative flex flex-col items-center p-2 rounded-xl transition-all ${active ? 'text-blue-600 bg-blue-50 dark:bg-slate-800 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`}>
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-bold mt-1">{label}</span>
    {alert && <span className="absolute top-1 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>}
  </button>
);
