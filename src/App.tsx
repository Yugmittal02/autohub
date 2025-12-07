import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Minus, Search, X, Trash2, ArrowLeft, Book, Car, 
  ChevronRight, Mic, Settings, AlertTriangle, Languages, 
  Lock, Bell, Volume2, Save, LogOut, Grid, Download, ShieldCheck
} from 'lucide-react';

// --- DICTIONARY FOR TRANSLATION ---
const dictionary = {
  "brake": "ब्रेक", "pads": "पैड्स", "shoe": "शू", "oil": "तेल", "filter": "फिल्टर",
  "light": "लाइट", "headlight": "हेडलाइट", "bumper": "बम्पर", "cover": "कवर",
  "seat": "सीट", "mat": "मैट", "guard": "गार्ड", "horn": "हॉर्न", "mirror": "शीशा",
  "glass": "कांच", "clutch": "क्लच", "wire": "तार", "battery": "बैटरी", "tyre": "टायर",
  "tube": "ट्यूब", "alloy": "अलॉय", "wheel": "व्हील", "cap": "कैप", "door": "दरवाजा",
  "handle": "हैंडल", "lock": "लॉक", "key": "चाबी", "sensor": "सेंसर", "screen": "स्क्रीन",
  "android": "एंड्रॉइड", "speaker": "स्पीकर", "bass": "बास", "tube": "ट्यूब",
  "swift": "स्विफ्ट", "thar": "थार", "creta": "क्रेटा", "alto": "आल्टो",
  "universal": "यूनिवर्सल", "page": "पेज", "qty": "मात्रा", "car": "गाड़ी",
  "search": "खोजें", "index": "विषय सूची", "settings": "सेटिंग्स",
  "pages": "पेज लिस्ट", "arvind index": "अरविन्द इंडेक्स",
  "total": "कुल", "delete": "हटाएं", "confirm": "पुष्टि करें"
};

const translateText = (text) => {
  if (!text) return "";
  return text.split(' ').map(word => {
    const lower = word.toLowerCase();
    return dictionary[lower] ? dictionary[lower] : word;
  }).join(' ');
};

const loadData = () => {
  if (typeof window === 'undefined') return { pages: [], entries: [], settings: { limit: 5, theme: 'light', password: '123' } };
  const saved = localStorage.getItem('arvind-register-data');
  if (saved) return JSON.parse(saved);
  return {
    pages: [],
    entries: [],
    settings: { limit: 5, theme: 'light', password: '123' }
  };
};

const VoiceInput = ({ onResult, isDark }) => {
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN'; 
      recognition.onresult = (e) => onResult(e.results[0][0].transcript);
      try { recognition.start(); } catch (e) { console.error(e); }
    } else { alert("Mic Error"); }
  };
  return (
    <button onClick={startListening} className={`p-3 rounded-full shrink-0 ${isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-black hover:bg-gray-200'}`}>
      <Mic size={20}/>
    </button>
  );
};

export default function ArvindRegister() {
  const [data, setData] = useState(loadData);
  const [view, setView] = useState('generalIndex'); 
  const [activePage, setActivePage] = useState(null);
  const [pageSearchTerm, setPageSearchTerm] = useState(''); 
  const [indexSearchTerm, setIndexSearchTerm] = useState(''); 
  const [isHindi, setIsHindi] = useState(false);
  
  // --- NEW: App Lock State ---
  const [isAppUnlocked, setIsAppUnlocked] = useState(false); 
  const [loginPassInput, setLoginPassInput] = useState('');
  
  const [passInput, setPassInput] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [isNewPageOpen, setIsNewPageOpen] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [input, setInput] = useState({ itemName: '', carName: '', qty: '' });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('arvind-register-data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        setDeferredPrompt(null);
      });
    } else {
        alert("Tap 'Share' > 'Add to Home Screen' to install.");
    }
  };

  // --- NOTIFICATION & SOUND LOGIC ---
  const requestNotificationPermission = () => {
    if (!("Notification" in window)) {
      alert("This browser does not support system notifications");
    } else {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Notifications Enabled", { body: "You will now receive low stock alerts." });
          playAlertSound();
        }
      });
    }
  };

  const playAlertSound = () => {
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Stock Alert!", { 
            body: "Inventory is running low!",
            icon: "/icon.png"
        });
    }
  };

  const isDark = data.settings.theme === 'dark';
  const t = (txt) => isHindi ? translateText(txt) : txt;

  // --- APP UNLOCK HANDLER ---
  const handleAppUnlock = () => {
    if (loginPassInput === data.settings.password) {
        setIsAppUnlocked(true);
        setLoginPassInput('');
    } else {
        alert("Wrong Password! Try again.");
        setLoginPassInput('');
    }
  };

  // --- NEW: DELETE LOGIC WITH DOUBLE PERMISSION ---
  const handleDeletePage = (e, pageId) => {
    e.stopPropagation(); // Stop click from opening the page
    if (window.confirm(t("Delete this page?"))) {
        if (window.confirm(t("Double Check: This will delete ALL items in this page permanently. Are you sure?"))) {
            const updatedPages = data.pages.filter(p => p.id !== pageId);
            const updatedEntries = data.entries.filter(ent => ent.pageId !== pageId);
            setData({ ...data, pages: updatedPages, entries: updatedEntries });
            if(activePage && activePage.id === pageId) {
                setView('generalIndex');
                setActivePage(null);
            }
        }
    }
  };

  const handleAddPage = () => {
    if (!input.itemName) return;
    const nextPageNo = data.pages.length + 1;
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
    const updatedEntries = data.entries.map(e => {
      if (e.id === id) {
        const newQty = Math.max(0, e.qty + amount);
        if (newQty < data.settings.limit && e.qty >= data.settings.limit) {
            playAlertSound();
        }
        return { ...e, qty: newQty };
      }
      return e;
    });
    setData({ ...data, entries: updatedEntries });
  };

  const filteredPages = useMemo(() => {
    if (!indexSearchTerm) return data.pages;
    return data.pages.filter(p => p.itemName.toLowerCase().includes(indexSearchTerm.toLowerCase()));
  }, [data.pages, indexSearchTerm]);

  // --- HELPER: Common Header Button for Translation ---
  const TranslateBtn = () => (
    <button onClick={() => setIsHindi(!isHindi)} className={`p-2 rounded-full border ${isDark ? 'bg-slate-700 border-slate-500' : 'bg-white/50 border-black/10'}`}>
      <Languages size={20}/>
    </button>
  );

  // --- RENDER LOCK SCREEN ---
  if (!isAppUnlocked) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-6 text-white">
            <div className="w-full max-w-sm text-center">
                <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-900/50">
                    <Lock size={40} />
                </div>
                <h1 className="text-3xl font-bold mb-2">Arvind Register</h1>
                <p className="text-slate-400 mb-8">Enter password to access</p>
                
                <input 
                    type="password" 
                    placeholder="Password"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-center text-2xl tracking-widest outline-none focus:border-blue-500 mb-4 transition-all"
                    value={loginPassInput}
                    onChange={(e) => setLoginPassInput(e.target.value)}
                />
                
                <button 
                    onClick={handleAppUnlock}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-lg transition-all active:scale-95"
                >
                    UNLOCK APP
                </button>
                <p className="mt-6 text-xs text-slate-600">Default Password: 123</p>
            </div>
        </div>
    );
  }

  // --- COMPONENT VIEWS ---
  const renderGeneralIndex = () => (
    <div className="pb-24">
      <div className={`p-6 border-b-4 border-double sticky top-0 z-10 ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-yellow-100 border-yellow-400'}`}>
        <div className="flex justify-between items-center mb-2">
          <h1 className={`text-2xl font-extrabold uppercase tracking-widest ${isDark ? 'text-white' : 'text-yellow-900'} underline decoration-2 decoration-red-400`}>
            {t("Arvind Index")}
          </h1>
          {/* Translation Toggle Here */}
          <TranslateBtn />
        </div>
        <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
                <input 
                  className={`w-full pl-9 p-2 rounded border outline-none ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-yellow-500 text-black'}`}
                  placeholder={t("Search Index...")}
                  value={indexSearchTerm}
                  onChange={e => setIndexSearchTerm(e.target.value)}
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                {indexSearchTerm && <button onClick={() => setIndexSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X size={16}/></button>}
            </div>
            <VoiceInput onResult={setIndexSearchTerm} isDark={isDark} />
        </div>
      </div>

      <div className={`m-2 border-2 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-black bg-white'}`}>
        <div className={`flex border-b-2 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-black bg-gray-100'} p-2`}>
          <div className="w-12 font-bold text-center border-r border-gray-400">No.</div>
          <div className="flex-1 font-bold pl-3 border-r border-gray-400">{t("Particulars")}</div>
          <div className="w-16 font-bold text-center border-r border-gray-400">{t("Page")}</div>
          <div className="w-10 font-bold text-center">Del</div>
        </div>
        <div className="min-h-[60vh]">
          {filteredPages.map((page, idx) => (
            <div 
              key={page.id}
              onClick={() => { setActivePage(page); setView('page'); setPageSearchTerm(''); }}
              className={`flex border-b border-gray-300 cursor-pointer hover:bg-blue-50 transition-colors h-14 items-center ${isDark ? 'text-white hover:bg-slate-800' : 'text-black'}`}
            >
              <div className="w-12 text-center font-bold text-red-600 border-r border-gray-300 h-full flex items-center justify-center text-sm">{idx + 1}</div>
              <div className="flex-1 pl-3 font-semibold text-lg border-r border-gray-300 h-full flex items-center truncate">{t(page.itemName)}</div>
              <div className="w-16 text-center font-bold text-blue-700 h-full flex items-center justify-center underline border-r border-gray-300">{page.pageNo}</div>
              
              {/* DELETE BUTTON IN INDEX */}
              <div className="w-10 flex items-center justify-center h-full">
                <button 
                    onClick={(e) => handleDeletePage(e, page.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full"
                >
                    <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {filteredPages.length === 0 && <div className="p-4 text-center text-gray-400">Not Found</div>}
        </div>
      </div>

      <button onClick={() => setIsNewPageOpen(true)} className="fixed bottom-24 right-6 bg-yellow-500 text-black w-16 h-16 rounded-full shadow-xl border-4 border-white flex items-center justify-center active:scale-95 z-20">
        <Plus size={32} strokeWidth={3}/>
      </button>
    </div>
  );

  const renderPagesGrid = () => (
    <div className={`pb-24 min-h-screen p-4 ${isDark ? 'bg-slate-950' : 'bg-gray-100'}`}>
        <div className="mb-4 sticky top-0 z-10 pt-2 pb-2 backdrop-blur-sm flex justify-between items-center">
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                <Grid/> {t("All Pages")}
            </h1>
            {/* Translation Toggle Here */}
            <TranslateBtn />
        </div>
        <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
                <input className={`w-full pl-9 p-3 rounded-xl border outline-none shadow-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-gray-300 text-black'}`} placeholder={t("Find Page...")} value={indexSearchTerm} onChange={e => setIndexSearchTerm(e.target.value)}/>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            </div>
            <VoiceInput onResult={setIndexSearchTerm} isDark={isDark} />
        </div>
        <div className="grid grid-cols-2 gap-3">
            {filteredPages.map(page => {
                 const totalItems = data.entries.filter(e => e.pageId === page.id).reduce((a,b)=>a+b.qty,0);
                 return (
                    <div key={page.id} onClick={() => { setActivePage(page); setView('page'); setPageSearchTerm(''); }} className={`relative p-4 rounded-xl border-2 shadow-sm cursor-pointer active:scale-95 transition-all flex flex-col justify-between h-36 ${isDark ? 'bg-slate-800 border-slate-600 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-500'}`}>
                        <div>
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold px-2 py-1 rounded bg-gray-200 text-gray-800">Pg {page.pageNo}</span>
                                {/* DELETE BUTTON IN GRID */}
                                <button onClick={(e) => handleDeletePage(e, page.id)} className="p-1 text-red-300 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                            </div>
                            <h3 className={`font-bold text-lg mt-2 leading-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>{t(page.itemName)}</h3>
                        </div>
                        <div className="text-right"><span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{totalItems} Pcs</span></div>
                    </div>
                 )
            })}
        </div>
        <button onClick={() => setIsNewPageOpen(true)} className="fixed bottom-24 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-xl border-2 border-white flex items-center justify-center active:scale-95 z-20">
            <Plus size={28}/>
        </button>
    </div>
  );

  const renderPage = () => {
    const pageEntries = data.entries.filter(e => e.pageId === activePage.id);
    const filtered = pageEntries.filter(e => e.car.toLowerCase().includes(pageSearchTerm.toLowerCase()));
    
    // --- NEW: Calculate Total Quantity for the whole page ---
    const grandTotal = pageEntries.reduce((acc, curr) => acc + curr.qty, 0);

    return (
      <div className={`pb-24 min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-black'}`}>
        <div className={`sticky top-0 z-10 border-b-2 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-red-200'}`}>
           <div className={`flex items-center p-3 ${isDark ? 'bg-slate-800' : 'bg-red-50'}`}>
              <button onClick={() => setView('generalIndex')} className="mr-2 p-2"><ArrowLeft/></button>
              <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <p className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-red-400'}`}>{t("Page No")}: {activePage.pageNo}</p>
                    {/* Translation Toggle Here */}
                    <TranslateBtn />
                 </div>
                 <h2 className="text-2xl font-black uppercase">{t(activePage.itemName)}</h2>
                 
                 {/* SHOW GRAND TOTAL HERE */}
                 <div className="text-xs font-bold opacity-70 mt-1">
                    {t("Total")} {t("Items")}: {grandTotal}
                 </div>
              </div>
           </div>
           <div className={`p-2 flex gap-2 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
              <div className="relative flex-1">
                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                 <input className={`w-full pl-8 py-2 rounded border outline-none ${isDark ? 'bg-slate-900 border-slate-600' : 'bg-gray-50 border-gray-300'}`} placeholder={t("Search Item...")} value={pageSearchTerm} onChange={e => setPageSearchTerm(e.target.value)}/>
              </div>
              <VoiceInput onResult={setPageSearchTerm} isDark={isDark}/>
           </div>
           <div className={`flex p-2 text-xs font-bold uppercase ${isDark ? 'bg-slate-700' : 'bg-red-100 text-red-900'}`}>
             <div className="flex-[2]">{t("Car Name")}</div>
             <div className="flex-[1] text-center">{t("Qty")}</div>
           </div>
        </div>
        <div style={isDark ? {} : { backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '100% 3.5rem' }}>
          {filtered.map(entry => (
             <div key={entry.id} className={`flex items-center px-4 h-14 border-b ${isDark ? 'border-slate-800' : 'border-transparent'}`}>
                <div className="flex-[2] text-lg font-bold">{t(entry.car)}</div>
                <div className="flex-[1] flex items-center justify-center gap-3">
                   <button onClick={() => updateQty(entry.id, -1)} className="w-8 h-8 rounded-full border bg-gray-100 text-red-600 flex items-center justify-center"><Minus size={16}/></button>
                   <span className={`text-xl font-mono font-bold ${entry.qty < data.settings.limit ? 'text-red-500 animate-pulse' : ''}`}>{entry.qty}</span>
                   <button onClick={() => updateQty(entry.id, 1)} className="w-8 h-8 rounded-full border bg-gray-100 text-green-600 flex items-center justify-center"><Plus size={16}/></button>
                </div>
             </div>
          ))}
        </div>
        <button onClick={() => setIsNewEntryOpen(true)} className="fixed bottom-24 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg border-2 border-white flex items-center justify-center z-20"><Plus size={28}/></button>
      </div>
    );
  };

  const renderAlerts = () => (
     <div className={`p-4 pb-24 min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-black'}`}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-red-500 flex items-center gap-2"><AlertTriangle/> {t("Low Stock")}</h2>
            <TranslateBtn />
        </div>
        {data.entries.filter(e => e.qty < data.settings.limit).length === 0 && <div className="text-center mt-10 opacity-50">Stock Full</div>}
        {data.entries.filter(e => e.qty < data.settings.limit).map(e => {
           const p = data.pages.find(page => page.id === e.pageId);
           return (
              <div key={e.id} className="p-4 border-l-4 border-red-500 bg-white text-black shadow mb-2 rounded flex justify-between items-center" onClick={() => {setActivePage(p); setView('page')}}>
                 <div><h3 className="font-bold">{t(e.car)}</h3><p className="text-xs">{t(p?.itemName)}</p></div>
                 <span className="text-2xl font-bold text-red-600">{e.qty}</span>
              </div>
           )
        })}
     </div>
  );

  const renderSettings = () => (
    <div className={`p-4 pb-24 min-h-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-black'}`}>
       <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Settings/> {t("Settings")}</h2>
            <TranslateBtn />
       </div>
       
       {/* App Install Button */}
       <div className={`p-4 rounded-xl border mb-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white`}>
          <div className="flex justify-between items-center">
             <div><h3 className="font-bold text-lg">Download App</h3><p className="text-xs opacity-80">Install on Home Screen</p></div>
             <button onClick={handleInstallClick} className="bg-white text-blue-800 px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Download size={18}/> Install</button>
          </div>
       </div>

       {/* Notification Permission Button */}
       <div className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'}`}>
          <div className="flex justify-between items-center">
             <div><h3 className="font-bold">Notifications</h3><p className="text-xs opacity-70">Allow sound & popups</p></div>
             <button onClick={requestNotificationPermission} className="bg-green-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2"><Bell size={18}/> Enable</button>
          </div>
       </div>

       <div className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'}`}>
          <label className="font-bold block mb-2">{t("Low Stock Limit Alert")}</label>
          <div className="flex items-center gap-4">
             <input type="range" min="1" max="20" value={data.settings.limit} onChange={(e) => { if(window.confirm("Change limit?")) setData({...data, settings: {...data.settings, limit: parseInt(e.target.value)}})}} className="flex-1"/>
             <span className="text-2xl font-bold">{data.settings.limit}</span>
          </div>
       </div>
       <div className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'}`}>
          <label className="font-bold block mb-2">{t("Theme")}</label>
          <div className="flex gap-2">
             <button onClick={() => { if(window.confirm("Change Theme?")) setData({...data, settings: {...data.settings, theme: 'light'}})}} className="flex-1 py-2 border rounded font-bold">Light</button>
             <button onClick={() => { if(window.confirm("Change Theme?")) setData({...data, settings: {...data.settings, theme: 'dark'}})}} className="flex-1 py-2 border bg-slate-700 text-white rounded font-bold">Dark</button>
          </div>
       </div>
       <div className={`p-4 rounded-xl border mb-4 border-red-300 ${isDark ? 'bg-slate-800' : 'bg-red-50'}`}>
          <label className="font-bold block mb-2 text-red-600">{t("Change Password")}</label>
          <input type="text" placeholder="New Password" className="w-full p-2 border rounded mb-2 text-black" value={newPass} onChange={e => setNewPass(e.target.value)}/>
          <button onClick={() => { 
            if(window.confirm("Change Password?")) { 
                setData({...data, settings: {...data.settings, password: newPass}}); 
                setNewPass(''); 
                alert("Password Updated! Next time use new password."); 
            }
          }} className="w-full py-2 bg-red-600 text-white font-bold rounded">Update Password</button>
       </div>
       <button onClick={() => { setIsAppUnlocked(false); }} className="w-full py-3 border-2 border-gray-400 rounded-lg font-bold text-gray-500 flex items-center justify-center gap-2"><LogOut size={20}/> Lock App Now</button>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" preload="auto"></audio>

      {view === 'generalIndex' && renderGeneralIndex()}
      {view === 'pagesGrid' && renderPagesGrid()}
      {view === 'page' && renderPage()}
      {view === 'alerts' && renderAlerts()}
      {view === 'settings' && renderSettings()}
      
      <div className={`fixed bottom-0 w-full border-t flex justify-around p-2 pb-safe z-50 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-300'}`}>
         <NavBtn icon={Book} label={t("Index")} active={view === 'generalIndex'} onClick={() => setView('generalIndex')} isDark={isDark}/>
         <NavBtn icon={Grid} label={t("Pages")} active={view === 'pagesGrid'} onClick={() => { setView('pagesGrid'); setIndexSearchTerm(''); }} isDark={isDark}/>
         <NavBtn icon={AlertTriangle} label={t("Alerts")} active={view === 'alerts'} onClick={() => setView('alerts')} alert={data.entries.some(e => e.qty < data.settings.limit)} isDark={isDark}/>
         <NavBtn icon={Settings} label={t("Settings")} active={view === 'settings'} onClick={() => setView('settings')} isDark={isDark}/>
      </div>

      {isNewPageOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-black">{t("New Page")}</h3>
            <div className="flex gap-2 mb-4">
                <input autoFocus className="flex-1 border-2 border-black rounded-lg p-3 text-lg font-bold text-black" placeholder="Item Name" value={input.itemName} onChange={e => setInput({...input, itemName: e.target.value})} />
                <VoiceInput onResult={(txt) => setInput(prev => ({...prev, itemName: txt}))} isDark={false} />
            </div>
            <div className="flex gap-3">
               <button onClick={() => setIsNewPageOpen(false)} className="flex-1 py-3 bg-gray-200 rounded font-bold text-black">Cancel</button>
               <button onClick={handleAddPage} className="flex-1 py-3 bg-yellow-500 text-black rounded font-bold">Add</button>
            </div>
          </div>
        </div>
      )}

      {isNewEntryOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-6">
            <h3 className="text-xl font-bold mb-1 text-black">{t("New Entry")}</h3>
            <p className="text-sm font-bold opacity-50 mb-4 text-black">{activePage?.itemName}</p>
            <div className="space-y-4">
              <div className="flex gap-2">
                 <input autoFocus className="flex-1 border-2 border-black rounded p-3 text-lg font-bold text-black" placeholder="Car Name" value={input.carName} onChange={e => setInput({...input, carName: e.target.value})} />
                 <VoiceInput onResult={(txt) => setInput(prev => ({...prev, carName: txt}))} isDark={false} />
              </div>
              
              {/* NEW: SHOW EXISTING STOCK IF AVAILABLE */}
              {input.carName && (() => {
                const existing = data.entries
                   .filter(e => e.pageId === activePage.id && e.car.toLowerCase().includes(input.carName.toLowerCase()))
                   .reduce((a,b) => a+b.qty, 0);
                return existing > 0 ? (
                    <div className="p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-sm font-bold text-center">
                        Already have {existing} in stock!
                    </div>
                ) : null;
              })()}

              <input type="number" className="w-full border-2 border-black rounded p-3 text-lg font-bold text-black" placeholder="Qty" value={input.qty} onChange={e => setInput({...input, qty: e.target.value})} />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsNewEntryOpen(false)} className="flex-1 py-3 bg-gray-200 rounded font-bold text-black">Cancel</button>
              <button onClick={handleAddEntry} className="flex-1 py-3 bg-blue-600 text-white rounded font-bold">Save</button>
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
