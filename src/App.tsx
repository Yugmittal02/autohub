import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, Search, X, Trash2, Save, Book, Car, ChevronRight, Home, ArrowLeft } from 'lucide-react';

// --- DATA SAVE/LOAD ---
const loadData = () => {
  if (typeof window === 'undefined') return { pages: [], items: [] };
  const saved = localStorage.getItem('register-stock-data');
  if (saved) return JSON.parse(saved);
  
  // Dummy Data (Example ke liye)
  return {
    pages: [
      { id: 1, name: 'Page 1 (Rack A)' },
      { id: 2, name: 'Page 2 (Drawers)' },
      { id: 3, name: 'Godown' }
    ],
    items: [
      { id: 101, pageId: 1, name: 'Brake Pads', cars: 'Swift, Dzire', qty: 10 },
      { id: 102, pageId: 1, name: 'Air Filter', cars: 'Creta, Seltos', qty: 5 },
      { id: 103, pageId: 2, name: '9" Android', cars: 'Universal, Swift, Thar', qty: 4 },
      { id: 104, pageId: 3, name: 'Bumper', cars: 'Thar', qty: 2 }
    ]
  };
};

export default function RegisterApp() {
  const [data, setData] = useState(loadData);
  const [currentView, setCurrentView] = useState('index'); // 'index', 'page', 'finder'
  const [selectedPage, setSelectedPage] = useState(null);
  const [carSearch, setCarSearch] = useState('');
  
  // Modals State
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [inputs, setInputs] = useState({ pageName: '', itemName: '', itemCars: '', itemQty: '' });

  // Save on Change
  useEffect(() => {
    localStorage.setItem('register-stock-data', JSON.stringify(data));
  }, [data]);

  // --- ACTIONS ---

  // 1. Add Page
  const handleAddPage = (e) => {
    e.preventDefault();
    if (!inputs.pageName) return;
    const newPage = { id: Date.now(), name: inputs.pageName };
    setData({ ...data, pages: [...data.pages, newPage] });
    setInputs({ ...inputs, pageName: '' });
    setIsAddPageOpen(false);
  };

  // 2. Add Item
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!inputs.itemName) return;
    const newItem = {
      id: Date.now(),
      pageId: selectedPage.id,
      name: inputs.itemName,
      cars: inputs.itemCars || 'Universal', // Kis gadi ka hai
      qty: parseInt(inputs.itemQty) || 0
    };
    setData({ ...data, items: [newItem, ...data.items] }); // Naya item upar
    setInputs({ ...inputs, itemName: '', itemCars: '', itemQty: '' });
    setIsAddItemOpen(false);
  };

  // 3. Update Stock
  const updateStock = (itemId, amount) => {
    const updatedItems = data.items.map(item => {
      if (item.id === itemId) {
        return { ...item, qty: Math.max(0, item.qty + amount) };
      }
      return item;
    });
    setData({ ...data, items: updatedItems });
  };

  // 4. Delete
  const deletePage = (id, e) => {
    e.stopPropagation();
    if(window.confirm("Pura Page delete ho jayega aur uska maal bhi. Kar du?")) {
      setData({
        pages: data.pages.filter(p => p.id !== id),
        items: data.items.filter(i => i.pageId !== id)
      });
    }
  };

  const deleteItem = (id) => {
    if(window.confirm("Item hata du?")) {
      setData({ ...data, items: data.items.filter(i => i.id !== id) });
    }
  };

  // --- FILTERS ---
  const pageItems = selectedPage ? data.items.filter(i => i.pageId === selectedPage.id) : [];
  
  const carFinderResults = useMemo(() => {
    if (!carSearch) return [];
    return data.items.filter(i => 
      i.cars.toLowerCase().includes(carSearch.toLowerCase()) || 
      i.name.toLowerCase().includes(carSearch.toLowerCase())
    );
  }, [data.items, carSearch]);

  // --- RENDERERS ---

  // VIEW 1: INDEX PAGE (Registers List)
  const renderIndex = () => (
    <div className="p-4 pb-24">
      <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <Book size={24}/> Index / Pages
      </h2>
      <div className="grid gap-3">
        {data.pages.map(page => {
           const itemCount = data.items.filter(i => i.pageId === page.id).length;
           return (
            <div 
              key={page.id} 
              onClick={() => { setSelectedPage(page); setCurrentView('page'); }}
              className="bg-white p-5 rounded-lg border-2 border-gray-300 shadow-sm flex justify-between items-center active:bg-blue-50 cursor-pointer"
            >
              <div>
                <h3 className="font-bold text-lg text-black">{page.name}</h3>
                <span className="text-sm text-gray-500">{itemCount} Items</span>
              </div>
              <div className="flex items-center gap-3">
                <ChevronRight size={24} className="text-gray-400"/>
                <button onClick={(e) => deletePage(page.id, e)} className="p-2 text-red-400"><Trash2 size={18}/></button>
              </div>
            </div>
           )
        })}
      </div>
      
      {data.pages.length === 0 && <div className="text-center text-gray-400 mt-10">Koi Page nahi hai. Naya Page banayein.</div>}

      <button onClick={() => setIsAddPageOpen(true)} className="fixed bottom-24 right-6 bg-blue-700 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2">
        <Plus size={20}/> New Page
      </button>
    </div>
  );

  // VIEW 2: PAGE DETAILS (Item List)
  const renderPageDetail = () => (
    <div className="pb-24 bg-white min-h-screen">
      {/* Page Header */}
      <div className="bg-gray-100 p-4 border-b border-gray-300 sticky top-0 z-10 flex items-center justify-between">
        <button onClick={() => setCurrentView('index')} className="flex items-center gap-1 font-bold text-blue-700">
          <ArrowLeft size={20}/> Index
        </button>
        <h2 className="font-bold text-lg truncate max-w-[200px]">{selectedPage.name}</h2>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Excel Table Header */}
      <div className="flex bg-gray-200 p-2 text-xs font-bold uppercase border-b border-gray-400">
        <div className="flex-[2]">Item Name</div>
        <div className="flex-[1.5]">Cars</div>
        <div className="flex-[1.5] text-center">Qty</div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-gray-200">
        {pageItems.map((item, idx) => (
          <div key={item.id} className={`flex items-center p-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="flex-[2] pr-2">
              <div className="font-bold text-base text-black leading-tight">{item.name}</div>
              <button onClick={() => deleteItem(item.id)} className="text-[10px] text-red-500 mt-1 flex gap-1"><Trash2 size={10}/> Del</button>
            </div>
            <div className="flex-[1.5] text-xs text-gray-600 pr-1 border-l border-gray-300 pl-2">
              {item.cars}
            </div>
            <div className="flex-[1.5] flex items-center justify-center gap-2 border-l border-gray-300 pl-2">
              <button onClick={() => updateStock(item.id, -1)} className="w-8 h-8 bg-red-100 border border-red-300 text-red-700 rounded flex items-center justify-center"><Minus size={16}/></button>
              <span className="font-bold text-lg w-6 text-center">{item.qty}</span>
              <button onClick={() => updateStock(item.id, 1)} className="w-8 h-8 bg-green-100 border border-green-300 text-green-700 rounded flex items-center justify-center"><Plus size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      {pageItems.length === 0 && <div className="text-center p-8 text-gray-400">Is page par koi item nahi hai.</div>}

      <button onClick={() => setIsAddItemOpen(true)} className="fixed bottom-24 right-6 bg-blue-700 text-white w-14 h-14 rounded-full font-bold shadow-lg flex items-center justify-center border-2 border-white">
        <Plus size={28}/>
      </button>
    </div>
  );

  // VIEW 3: CAR FINDER (Search)
  const renderCarFinder = () => (
    <div className="p-4 pb-24 min-h-screen bg-white">
      <div className="sticky top-0 bg-white z-10 pb-4 border-b">
        <h2 className="text-xl font-bold mb-4 text-black flex items-center gap-2">
          <Car size={24} className="text-blue-600"/> Car Part Finder
        </h2>
        <div className="relative">
          <input 
            autoFocus
            type="text" 
            placeholder="Type Car Name (e.g. Swift)..." 
            className="w-full border-2 border-black rounded-lg p-3 pl-10 text-lg outline-none focus:border-blue-600"
            value={carSearch}
            onChange={e => setCarSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          {carSearch && <button onClick={() => setCarSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={20}/></button>}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {carSearch.length > 1 ? (
          carFinderResults.length > 0 ? (
            carFinderResults.map(item => {
              // Find Page Name
              const pageName = data.pages.find(p => p.id === item.pageId)?.name || 'Unknown Page';
              return (
                <div key={item.id} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-black">{item.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.qty > 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {item.qty} Qty
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <span className="font-bold text-gray-500 uppercase text-[10px]">Location:</span><br/>
                    {pageName}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <span className="font-bold text-gray-500 uppercase text-[10px]">Compatible:</span><br/>
                    {item.cars}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 mt-10">Is gadi ka koi item nahi mila.</div>
          )
        ) : (
          <div className="text-center text-gray-400 mt-10">Gadi ka naam likhein...</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      
      {/* MAIN CONTENT AREA */}
      {currentView === 'index' && renderIndex()}
      {currentView === 'page' && renderPageDetail()}
      {currentView === 'finder' && renderCarFinder()}

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 flex justify-around p-3 pb-safe z-50">
        <button 
          onClick={() => setCurrentView('index')} 
          className={`flex flex-col items-center gap-1 ${currentView === 'index' || currentView === 'page' ? 'text-blue-700' : 'text-gray-400'}`}
        >
          <Book size={24} strokeWidth={currentView === 'index' ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase">Register</span>
        </button>
        
        <button 
          onClick={() => setCurrentView('finder')} 
          className={`flex flex-col items-center gap-1 ${currentView === 'finder' ? 'text-blue-700' : 'text-gray-400'}`}
        >
          <Car size={24} strokeWidth={currentView === 'finder' ? 3 : 2} />
          <span className="text-[10px] font-bold uppercase">Car Finder</span>
        </button>
      </div>

      {/* --- MODAL: ADD PAGE --- */}
      {isAddPageOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Naya Page/Rack Banayein</h3>
            <input 
              autoFocus
              className="w-full border-2 border-black rounded p-3 mb-4 text-lg" 
              placeholder="Page Name (e.g. Rack 1)"
              value={inputs.pageName}
              onChange={e => setInputs({...inputs, pageName: e.target.value})}
            />
            <div className="flex gap-2">
              <button onClick={() => setIsAddPageOpen(false)} className="flex-1 bg-gray-200 py-3 rounded font-bold">Cancel</button>
              <button onClick={handleAddPage} className="flex-1 bg-blue-700 text-white py-3 rounded font-bold">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD ITEM --- */}
      {isAddItemOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4">Add Item to {selectedPage?.name}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                <input 
                  autoFocus
                  className="w-full border border-gray-400 rounded p-2 text-lg text-black" 
                  placeholder="e.g. Brake Shoe"
                  value={inputs.itemName}
                  onChange={e => setInputs({...inputs, itemName: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Gadi Ka Naam (Compatible Cars)</label>
                <input 
                  className="w-full border border-gray-400 rounded p-2 text-lg text-black" 
                  placeholder="e.g. Swift, Alto, Universal"
                  value={inputs.itemCars}
                  onChange={e => setInputs({...inputs, itemCars: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Quantity</label>
                <input 
                  type="number"
                  className="w-full border border-gray-400 rounded p-2 text-lg text-black" 
                  placeholder="0"
                  value={inputs.itemQty}
                  onChange={e => setInputs({...inputs, itemQty: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setIsAddItemOpen(false)} className="flex-1 bg-gray-200 py-3 rounded font-bold">Cancel</button>
              <button onClick={handleAddItem} className="flex-1 bg-blue-700 text-white py-3 rounded font-bold">Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
