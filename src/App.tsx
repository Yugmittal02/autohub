import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Minus, Search, X, Trash2, ArrowLeft, Book, Car, 
  ChevronRight, Mic, Settings, AlertTriangle, Languages, 
  Lock, Bell, Volume2, Save, LogOut
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
  "universal": "यूनिवर्सल", "page": "पेज", "qty": "मात्रा", "car": "गाड़ी",
  "search": "खोजें", "index": "विषय सूची", "settings": "सेटिंग्स"
};

const translateText = (text) => {
  if (!text) return "";
  return text.split(' ').map(word => {
    const lower = word.toLowerCase();
    return dictionary[lower] ? dictionary[lower] : word; // Agar dictionary me h to hindi, nahi to english
  }).join(' ');
};

// --- DATA LOAD ---
const loadData = () => {
  if (typeof window === 'undefined') return { pages: [], entries: [], settings: { limit: 5, theme: 'light', password: '123' } };
  const saved = localStorage.getItem('ultra-register-data');
  if (saved) return JSON.parse(saved);
  return {
    pages: [],
    entries: [],
    settings: { limit: 5, theme: 'light', password: '123' } // Default Password: 123
  };
};

// --- VOICE COMPONENT ---
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
    <button onClick={startListening} className={`p-3 rounded-full ${isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-black'}`}>
      <Mic size={20}/>
    </button>
  );
};

export default function UltraRegister() {
  const [data, setData] = useState(loadData);
  const [view, setView] = useState('generalIndex'); // Default: General Index
  const [activePage, setActivePage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isHindi, setIsHindi] = useState(false);
  
  // Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false); // For settings
  const [passInput, setPassInput] = useState('');
  const [showPassModal, setShowPassModal] = useState(false);
  const [newPass, setNewPass] = useState('');

  // Modals
  const [isNewPageOpen, setIsNewPageOpen] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [input, setInput] = useState({ itemName: '', carName: '', qty: '' });

  // Audio Ref
  const audioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ultra-register-data', JSON.stringify(data));
    
    // Check for Low Stock Alert
    const lowStock = data.entries.filter(e => e.qty < data.settings.limit);
    if (lowStock.length > 0) {
      // Notification Logic
      if ("Notification" in window && Notification.permission === "granted") {
        // Debounce logic can be added, currently sends on every render if low
      }
    }
  }, [data]);

  // Request Notification Permission
  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
  }, []);

  // Play Sound Function
  const playAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed", e));
    }
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Stock Alert!", { body: "Kuch items khatam hone wale hain!" });
    }
  };

  const isDark = data.settings.theme === 'dark';
  const t = (txt) => isHindi ? translateText(txt) : txt;

  // --- ACTIONS ---

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
        // Check if just dropped below limit
        if (newQty < data.settings.limit && e.qty >= data.settings.limit) {
          playAlertSound();
        }
        return { ...e, qty: newQty };
      }
      return e;
    });
    setData({ ...data, entries: updatedEntries });
  };

  // --- SECURE SETTINGS ---
  const unlockSettings = () => {
    if (passInput === data.settings.password) {
      setIsAuthenticated(true);
      setShowPassModal(false);
      setPassInput('');
      setView('settings');
    } else {
      alert("Wrong Password!");
    }
  };

  const changeSettingSecurely = (key, value) => {
    if (window.confirm("Permission 1: Kya aap sach mein setting badalna chahte hain?")) {
      if (window.confirm("Permission 2: Confirm karein?")) {
        setData({ ...data, settings: { ...data.settings, [key]: value } });
      }
    }
  };

  const changePassword = () => {
    if (window.confirm("Permission 1: Password change karna hai?")) {
      if (window.confirm("Permission 2: Purana password hat jayega. Confirm?")) {
        setData({ ...data, settings: { ...data.settings, password: newPass } });
        setNewPass('');
        alert("Password Changed Successfully!");
      }
    }
  };

  // --- VIEWS ---

  // 1. GENERAL INDEX (The "Copy" Index Page)
  const renderGeneralIndex = () => (
    <div className="pb-24">
      {/* Index Header like a Physical Register */}
      <div className={`p-6 border-b-4 border-double ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-yellow-100 border-yellow-400'}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className={`text-3xl font-extrabold uppercase tracking-widest ${isDark ? 'text-white' : 'text-yellow-900'} underline decoration-2 decoration-red-400`}>
            {t("General Index")}
          </h1>
          <button onClick={() => setIsHindi(!isHindi)} className="bg-white/30 p-2 rounded-full border border-black/10">
            <Languages size={24}/>
          </button>
        </div>
        <p className="font-mono text-sm font-bold opacity-70">Authorized Register • Page 1 to {data.pages.length}</p>
      </div>

      {/* Index Table */}
      <div className={`m-2 border-2 ${isDark ? 'border-slate-700 bg-slate-900' : 'border-black bg-white'}`}>
        {/* Table Header */}
        <div className={`flex border-b-2 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-black bg-gray-100'} p-2`}>
          <div className="w-16 font-bold text-center border-r border-gray-400">S.No.</div>
          <div className="flex-1 font-bold pl-3 border-r border-gray-400">{t("Particulars (Item Name)")}</div>
          <div className="w-20 font-bold text-center">{t("Page No")}</div>
        </div>

        {/* Rows */}
        <div className="min-h-[60vh]">
          {data.pages.map((page, idx) => (
            <div 
              key={page.id}
              onClick={() => { setActivePage(page); setView('page'); }}
              className={`flex border-b border-gray-300 cursor-pointer hover:bg-blue-50 transition-colors h-12 items-center ${isDark ? 'text-white hover:bg-slate-800' : 'text-black'}`}
            >
              <div className="w-16 text-center font-bold text-red-600 border-r border-gray-300 h-full flex items-center justify-center">
                {idx + 1}
              </div>
              <div className="flex-1 pl-3 font-semibold text-lg border-r border-gray-300 h-full flex items-center truncate">
                {t(page.itemName)}
              </div>
              <div className="w-20 text-center font-bold text-blue-700 h-full flex items-center justify-center underline">
                {page.pageNo}
              </div>
            </div>
          ))}
          
          {/* Empty Lines for aesthetics */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-10 border-b ${isDark ? 'border-slate-800' : 'border-gray-200'}`}></div>
          ))}
        </div>
      </div>

      <button onClick={() => setIsNewPageOpen(true)} className="fixed bottom-24 right-6 bg-yellow-500 text-black w-16 h-16 rounded-full shadow-xl border-4 border-white flex items-center justify-center active:scale-95 z-20">
        <Plus size={32} strokeWidth={3}/>
      </button>
    </div>
  );

  // 2. PAGE VIEW
  const renderPage = () => {
    const pageEntries = data.entries.filter(e => e.pageId === activePage.id);
    // Filter on Page
    const filtered = pageEntries.filter(e => e.car.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className={`pb-24 min-h-screen ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-black'}`}>
        {/* Notebook Header */}
        <div className={`sticky top-0 z-10 border-b-2 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-red-200'}`}>
           <div className={`flex items-center p-3 ${isDark ? 'bg-slate-800' : 'bg-red-50'}`}>
              <button onClick={() => setView('generalIndex')} className="mr-2"><ArrowLeft/></button>
              <div className="flex-1">
                 <p className="text-xs font-bold uppercase text-red-400">{t("Page No")}: {activePage.pageNo}</p>
                 <h2 className="text-2xl font-black uppercase">{t(activePage.itemName)}</h2>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => {if(window.confirm("Delete Page?")) {
                    setData({...data, pages: data.pages.filter(p=>p.id!==activePage.id)});
                    setView('generalIndex');
                 }}} className="text-red-400"><Trash2/></button>
              </div>
           </div>
           
           {/* Search & Translate */}
           <div className={`p-2 flex gap-2 border-t ${isDark ? 'border-slate-700' : 'border-gray-100'}`}>
              <div className="relative flex-1">
                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                 <input 
                   className={`w-full pl-8 py-2 rounded border outline-none ${isDark ? 'bg-slate-900 border-slate-600' : 'bg-gray-50 border-gray-300'}`}
                   placeholder={t("Search Item...")}
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
              <VoiceInput onResult={setSearchTerm} isDark={isDark}/>
           </div>

           {/* Columns */}
           <div className={`flex p-2 text-xs font-bold uppercase ${isDark ? 'bg-slate-700' : 'bg-red-100 text-red-900'}`}>
             <div className="flex-[2]">{t("Car Name")}</div>
             <div className="flex-[1] text-center">{t("Qty")}</div>
           </div>
        </div>

        {/* Lines */}
        <div style={isDark ? {} : { backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '100% 3.5rem' }}>
          {filtered.map(entry => (
             <div key={entry.id} className={`flex items-center px-4 h-14 border-b ${isDark ? 'border-slate-800' : 'border-transparent'}`}>
                <div className="flex-[2] text-lg font-bold">
                   {t(entry.car)}
                </div>
                <div className="flex-[1] flex items-center justify-center gap-3">
                   <button onClick={() => updateQty(entry.id, -1)} className="w-8 h-8 rounded-full border bg-gray-100 text-red-600 flex items-center justify-center"><Minus size={16}/></button>
                   <span className={`text-xl font-mono font-bold ${entry.qty < data.settings.limit ? 'text-red-500 animate-pulse' : ''}`}>{entry.qty}</span>
                   <button onClick={() => updateQty(entry.id, 1)} className="w-8 h-8 rounded-full border bg-gray-100 text-green-600 flex items-center justify-center"><Plus size={16}/></button>
                </div>
             </div>
          ))}
        </div>

        <button onClick={() => setIsNewEntryOpen(true)} className="fixed bottom-24 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg border-2 border-white flex items-center justify-center z-20">
           <Plus size={28}/>
        </button>
      </div>
    );
  };

  // 3. SETTINGS VIEW (Protected)
  const renderSettings = () => (
    <div className={`p-4 pb-24 min-h-screen ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-50 text-black'}`}>
       <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Settings/> {t("Settings")}</h2>
       
       {/* Limit */}
       <div className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'}`}>
          <label className="font-bold block mb-2">{t("Low Stock Limit Alert")}</label>
          <div className="flex items-center gap-4">
             <input 
               type="range" min="1" max="20" 
               value={data.settings.limit}
               onChange={(e) => changeSettingSecurely('limit', parseInt(e.target.value))}
               className="flex-1"
             />
             <span className="text-2xl font-bold">{data.settings.limit}</span>
          </div>
       </div>

       {/* Theme */}
       <div className={`p-4 rounded-xl border mb-4 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-300'}`}>
          <label className="font-bold block mb-2">{t("Theme")}</label>
          <div className="flex gap-2">
             <button onClick={() => changeSettingSecurely('theme', 'light')} className="flex-1 py-2 border rounded font-bold">Light</button>
             <button onClick={() => changeSettingSecurely('theme', 'dark')} className="flex-1 py-2 border bg-slate-700 text-white rounded font-bold">Dark</button>
          </div>
       </div>

       {/* Password Change */}
       <div className={`p-4 rounded-xl border mb-4 border-red-300 ${isDark ? 'bg-slate-800' : 'bg-red-50'}`}>
          <label className="font-bold block mb-2 text-red-600">{t("Change Password")}</label>
          <input 
             type="text" 
             placeholder="New Password" 
             className="w-full p-2 border rounded mb-2 text-black"
             value={newPass}
             onChange={e => setNewPass(e.target.value)}
          />
          <button onClick={changePassword} className="w-full py-2 bg-red-600 text-white font-bold rounded">Update Password</button>
       </div>

       <button onClick={() => { setIsAuthenticated(false); setView('generalIndex'); }} className="w-full py-3 border-2 border-gray-400 rounded-lg font-bold text-gray-500 flex items-center justify-center gap-2">
         <LogOut size={20}/> Lock Settings
       </button>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
      
      {/* Hidden Audio Element for Alerts */}
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" preload="auto"></audio>

      {/* VIEW SWITCHER */}
      {view === 'generalIndex' && renderGeneralIndex()}
      {view === 'page' && renderPage()}
      {view === 'settings' && renderSettings()}
      
      {/* ALERTS TAB (Combined with Render logic to save space) */}
      {view === 'alerts' && (
         <div className={`p-4 pb-24 ${isDark ? 'text-white' : ''}`}>
            <h2 className="text-2xl font-bold text-red-500 mb-4 flex items-center gap-2"><AlertTriangle/> {t("Low Stock")}</h2>
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
      )}

      {/* BOTTOM NAV */}
      <div className={`fixed bottom-0 w-full border-t flex justify-around p-2 pb-safe z-50 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-300'}`}>
         <button onClick={() => setView('generalIndex')} className={`flex flex-col items-center p-2 rounded ${view === 'generalIndex' ? 'text-blue-600' : 'text-gray-400'}`}>
            <Book size={24}/><span className="text-[10px] font-bold">{t("Index")}</span>
         </button>
         <button onClick={() => setView('alerts')} className={`flex flex-col items-center p-2 rounded ${view === 'alerts' ? 'text-red-600' : 'text-gray-400'}`}>
            <div className="relative"><Bell size={24}/>{data.entries.some(e => e.qty < data.settings.limit) && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>}</div>
            <span className="text-[10px] font-bold">{t("Alerts")}</span>
         </button>
         <button onClick={() => setShowPassModal(true)} className={`flex flex-col items-center p-2 rounded ${view === 'settings' ? 'text-blue-600' : 'text-gray-400'}`}>
            <Settings size={24}/><span className="text-[10px] font-bold">{t("Settings")}</span>
         </button>
      </div>

      {/* PASSWORD MODAL */}
      {showPassModal && (
         <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-6">
            <div className="bg-white p-6 rounded-xl w-full max-w-xs text-center">
               <Lock className="mx-auto mb-4 text-blue-600" size={32}/>
               <h3 className="text-lg font-bold mb-2">Enter Password</h3>
               <input type="password" value={passInput} onChange={e => setPassInput(e.target.value)} className="border-2 border-black rounded p-2 text-center text-xl w-full mb-4 text-black"/>
               <div className="flex gap-2">
                  <button onClick={() => setShowPassModal(false)} className="flex-1 bg-gray-200 py-2 rounded font-bold text-black">Cancel</button>
                  <button onClick={unlockSettings} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Unlock</button>
               </div>
            </div>
         </div>
      )}

      {/* NEW PAGE MODAL */}
      {isNewPageOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-black">{t("New Item Page")}</h3>
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

      {/* NEW ENTRY MODAL */}
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
