import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, Search, X, Trash2, ArrowLeft, Book, Car, ChevronRight, FileText } from 'lucide-react';

// --- DATA SAVE/LOAD ---
const loadData = () => {
  if (typeof window === 'undefined') return { pages: [], entries: [] };
  const saved = localStorage.getItem('notebook-stock-data');
  if (saved) return JSON.parse(saved);
  
  // Example Data (Copy Jaisa)
  return {
    pages: [
      { id: 1, pageNo: 1, itemName: '7D Floor Mats' },
      { id: 2, pageNo: 2, itemName: 'Android Screen 9 Inch' },
      { id: 3, pageNo: 3, itemName: 'LED Headlights' }
    ],
    entries: [
      { id: 101, pageId: 1, car: 'Swift', qty: 5 },
      { id: 102, pageId: 1, car: 'Creta', qty: 2 },
      { id: 103, pageId: 2, car: 'Universal', qty: 10 },
      { id: 104, pageId: 3, car: 'Thar', qty: 4 }
    ]
  };
};

export default function NotebookApp() {
  const [data, setData] = useState(loadData);
  const [view, setView] = useState('index'); // 'index', 'page', 'search'
  const [activePage, setActivePage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isNewPageOpen, setIsNewPageOpen] = useState(false);
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [input, setInput] = useState({ itemName: '', carName: '', qty: '' });

  useEffect(() => {
    localStorage.setItem('notebook-stock-data', JSON.stringify(data));
  }, [data]);

  // --- ACTIONS ---

  // 1. Naya Page Banaye (Naya Item Register Kare)
  const handleAddPage = (e) => {
    e.preventDefault();
    if (!input.itemName) return;
    const nextPageNo = data.pages.length + 1;
    const newPage = { id: Date.now(), pageNo: nextPageNo, itemName: input.itemName };
    setData({ ...data, pages: [...data.pages, newPage] });
    setInput({ ...input, itemName: '' });
    setIsNewPageOpen(false);
  };

  // 2. Page ke andar Gadi ki Entry kare
  const handleAddEntry = (e) => {
    e.preventDefault();
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

  // 3. Stock Update (+/-)
  const updateQty = (entryId, amount) => {
    setData({
      ...data,
      entries: data.entries.map(e => e.id === entryId ? { ...e, qty: Math.max(0, e.qty + amount) } : e)
    });
  };

  // 4. Delete
  const deletePage = (id) => {
    if(window.confirm("Pura Page faad du (Delete)? Sab data chala jayega.")) {
      setData({
        pages: data.pages.filter(p => p.id !== id),
        entries: data.entries.filter(e => e.pageId !== id)
      });
    }
  };

  const deleteEntry = (id) => {
    if(window.confirm("Entry hata du?")) {
      setData({ ...data, entries: data.entries.filter(e => e.id !== id) });
    }
  };

  // --- CALCULATIONS ---
  // Ek page par total kitne piece hain
  const getPageTotal = (pageId) => {
    return data.entries.filter(e => e.pageId === pageId).reduce((acc, curr) => acc + curr.qty, 0);
  };

  // Search Logic (Car Finder)
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    return data.entries.filter(e => e.car.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data.entries, searchTerm]);

  // --- VIEWS ---

  // 1. INDEX (REGISTER KA PEHLA PANNA)
  const renderIndex = () => (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-yellow-100 p-4 border-b-2 border-yellow-300 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-extrabold text-yellow-900 flex items-center gap-2">
          <Book className="text-yellow-800"/> INDEX
        </h1>
        <p className="text-yellow-800 text-sm font-bold opacity-70">Total Pages: {data.pages.length}</p>
      </div>

      {/* Index Lines */}
      <div className="p-2">
        {/* Table Head */}
        <div className="flex px-3 py-2 border-b-2 border-gray-300 text-gray-500 text-xs font-bold uppercase">
          <div className="w-12">Pg.No</div>
          <div className="flex-1">Item Name (Subject)</div>
          <div className="w-16 text-center">Total Qty</div>
        </div>

        {/* Lines */}
        <div className="bg-white min-h-[60vh] shadow-sm border border-gray-200">
          {data.pages.map((page, index) => (
            <div 
              key={page.id} 
              onClick={() => { setActivePage(page); setView('page'); }}
              className="flex items-center px-3 py-4 border-b border-blue-100 hover:bg-blue-50 cursor-pointer"
            >
              <div className="w-12 font-bold text-red-500 font-mono text-lg">{index + 1}</div>
              <div className="flex-1 font-bold text-gray-800 text-lg leading-tight">
                {page.itemName}
              </div>
              <div className="w-16 text-center">
                <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded font-bold text-sm">
                  {getPageTotal(page.id)}
                </span>
              </div>
              <ChevronRight className="text-gray-300" size={20}/>
            </div>
          ))}
          {data.pages.length === 0 && (
            <div className="text-center p-10 text-gray-400">Copy khali hai. Naya page banayein.</div>
          )}
        </div>
      </div>

      {/* FAB Button */}
      <button 
        onClick={() => setIsNewPageOpen(true)}
        className="fixed bottom-24 right-6 bg-yellow-500 text-yellow-900 w-16 h-16 rounded-full shadow-lg border-4 border-white flex items-center justify-center active:scale-95"
      >
        <Plus size={32} strokeWidth={3}/>
      </button>
    </div>
  );

  // 2. PAGE VIEW (SINGLE ITEM PAGE)
  const renderPage = () => {
    const entries = data.entries.filter(e => e.pageId === activePage.id);
    
    return (
      <div className="pb-24 bg-white min-h-screen">
        {/* Page Header (Top Margin) */}
        <div className="sticky top-0 z-10 bg-white border-b-2 border-red-200 shadow-sm">
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-900">
             <button onClick={() => setView('index')} className="p-2 -ml-2">
               <ArrowLeft size={24}/>
             </button>
             <div className="flex-1">
               <p className="text-xs font-bold uppercase text-red-400">Page No. {data.pages.indexOf(activePage) + 1}</p>
               <h2 className="text-xl font-black uppercase tracking-tight leading-none">{activePage.itemName}</h2>
             </div>
             <button onClick={() => deletePage(activePage.id)} className="text-red-300 p-2"><Trash2 size={20}/></button>
          </div>
          {/* Column Headers */}
          <div className="flex bg-red-100 p-2 text-red-900 text-xs font-bold uppercase border-t border-red-200">
            <div className="flex-[2]">Car Name (Vivran)</div>
            <div className="flex-[1.5] text-center">Quantity</div>
          </div>
        </div>

        {/* Ruled Paper Lines */}
        <div className="w-full" style={{ backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '100% 3rem' }}>
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center px-4 h-12 border-b border-transparent">
              {/* Car Name */}
              <div className="flex-[2] flex items-center justify-between pr-2">
                 <span className="text-lg font-bold text-gray-800">{entry.car}</span>
                 <button onClick={() => deleteEntry(entry.id)} className="text-gray-300"><X size={14}/></button>
              </div>

              {/* Qty Controls */}
              <div className="flex-[1.5] flex items-center justify-center gap-3">
                 <button onClick={() => updateQty(entry.id, -1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full border border-gray-300 active:bg-red-200"><Minus size={16}/></button>
                 <span className="text-xl font-bold font-mono w-6 text-center">{entry.qty}</span>
                 <button onClick={() => updateQty(entry.id, 1)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full border border-gray-300 active:bg-green-200"><Plus size={16}/></button>
              </div>
            </div>
          ))}
          {/* Empty Lines Effect */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 border-b border-gray-200 w-full"></div>
          ))}
        </div>

        {/* FAB */}
        <button 
          onClick={() => setIsNewEntryOpen(true)}
          className="fixed bottom-24 right-6 bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg border-4 border-white flex items-center justify-center active:scale-95"
        >
          <Plus size={32} strokeWidth={3}/>
        </button>
      </div>
    );
  };

  // 3. CAR FINDER (GLOBAL SEARCH)
  const renderSearch = () => (
    <div className="p-4 pb-24 min-h-screen bg-gray-50">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-4 z-10">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Car className="text-blue-600"/> Car Finder
        </h2>
        <div className="relative">
          <input 
            autoFocus
            type="text"
            placeholder="Gadi ka naam likho (e.g. Swift)..."
            className="w-full p-3 pl-10 border-2 border-gray-300 rounded-lg text-lg outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={20}/></button>}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {searchTerm && searchResults.length === 0 && (
          <div className="text-center mt-10 text-gray-400">Is gadi ka koi item nahi mila.</div>
        )}

        {searchResults.map(entry => {
          // Find Page Name
          const page = data.pages.find(p => p.id === entry.pageId);
          return (
            <div key={entry.id} onClick={() => { setActivePage(page); setView('page'); }} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer active:bg-blue-50">
              <div className="flex justify-between items-start">
                <div>
                   <h3 className="font-bold text-lg text-blue-800">{page?.itemName}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <Car size={14} className="text-gray-400"/>
                      <span className="font-bold text-gray-700">{entry.car}</span>
                   </div>
                </div>
                <div className={`px-3 py-1 rounded text-sm font-bold ${entry.qty > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  Qty: {entry.qty}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-400 text-right uppercase font-bold tracking-wider">
                Page No: {data.pages.indexOf(page) + 1}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
      
      {view === 'index' && renderIndex()}
      {view === 'page' && renderPage()}
      {view === 'search' && renderSearch()}

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 w-full bg-white border-t border-gray-300 flex justify-around p-2 pb-safe z-50">
        <button onClick={() => setView('index')} className={`flex flex-col items-center p-2 rounded-lg ${view === 'index' ? 'text-blue-700 bg-blue-50' : 'text-gray-400'}`}>
          <Book size={24}/>
          <span className="text-[10px] font-bold">Index</span>
        </button>
        <button onClick={() => setView('search')} className={`flex flex-col items-center p-2 rounded-lg ${view === 'search' ? 'text-blue-700 bg-blue-50' : 'text-gray-400'}`}>
          <Search size={24}/>
          <span className="text-[10px] font-bold">Finder</span>
        </button>
      </div>

      {/* MODAL: NEW PAGE (ITEM) */}
      {isNewPageOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl animate-scale-in">
            <h3 className="text-xl font-extrabold mb-4 text-gray-800">Naya Item (Page)</h3>
            <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
            <input 
              autoFocus
              className="w-full border-2 border-gray-300 rounded-lg p-3 text-xl font-bold text-black mb-6 mt-1" 
              placeholder="e.g. Brake Pads"
              value={input.itemName}
              onChange={e => setInput({...input, itemName: e.target.value})}
            />
            <div className="flex gap-3">
              <button onClick={() => setIsNewPageOpen(false)} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold">Cancel</button>
              <button onClick={handleAddPage} className="flex-1 py-3 bg-yellow-500 text-yellow-900 rounded-lg font-bold">Add Page</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW ENTRY (CAR) */}
      {isNewEntryOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl p-6 shadow-2xl animate-scale-in">
            <h3 className="text-xl font-extrabold mb-1 text-gray-800">New Entry</h3>
            <p className="text-sm text-gray-500 mb-6 font-bold">For: {activePage?.itemName}</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Gadi Ka Naam (Car)</label>
                <input 
                  autoFocus
                  className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg font-bold mt-1" 
                  placeholder="e.g. Swift"
                  value={input.carName}
                  onChange={e => setInput({...input, carName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Quantity (Pcs)</label>
                <input 
                  type="number"
                  className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg font-bold mt-1" 
                  placeholder="0"
                  value={input.qty}
                  onChange={e => setInput({...input, qty: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsNewEntryOpen(false)} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold">Cancel</button>
              <button onClick={handleAddEntry} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold">Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
