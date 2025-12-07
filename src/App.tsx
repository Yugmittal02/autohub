import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, Search, X, Trash2, Save, MapPin, Package } from 'lucide-react';

// --- DATA SAVE/LOAD HELPER (Taaki refresh karne per data na ude) ---
const loadData = () => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('simple-stock-data');
  // Agar purana data hai to load karo, nahi to ye dummy data dikhao
  return saved ? JSON.parse(saved) : [
    { id: 1, name: 'Swift Seat Cover', location: 'Rack 1', qty: 12 },
    { id: 2, name: '9" Android Screen', location: 'Box 5', qty: 4 },
    { id: 3, name: 'Thar Alloy 16"', location: 'Godown A', qty: 2 },
    { id: 4, name: 'Body Cover (Sedan)', location: 'Rack 2', qty: 20 },
    { id: 5, name: 'H4 LED Light', location: 'Shelf B', qty: 8 },
  ];
};

export default function MobileStockRegister() {
  const [products, setProducts] = useState(loadData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Naya item add karne ke liye state
  const [newItem, setNewItem] = useState({ name: '', location: '', qty: '' });

  // Jab bhi products change ho, save kar lo
  useEffect(() => {
    localStorage.setItem('simple-stock-data', JSON.stringify(products));
  }, [products]);

  // Search Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Stock Badhana/Ghatana
  const updateStock = (id, amount) => {
    setProducts(products.map(p => {
      if (p.id === id) {
        const newQty = Math.max(0, p.qty + amount);
        return { ...p, qty: newQty };
      }
      return p;
    }));
  };

  // Naya Item Jodna
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name) return;
    
    const item = {
      id: Date.now(),
      name: newItem.name,
      location: newItem.location || 'Gen',
      qty: parseInt(newItem.qty) || 0
    };

    setProducts([item, ...products]); // Naya item sabse upar
    setNewItem({ name: '', location: '', qty: '' }); // Form clear
    setIsAddModalOpen(false); // Modal band
  };

  // Item Delete karna
  const handleDelete = (id) => {
    if(window.confirm("Is item ko list se hata du?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      
      {/* --- HEADER --- */}
      <div className="bg-blue-700 p-4 sticky top-0 z-20 shadow-md">
        <h1 className="text-white text-xl font-bold flex items-center gap-2">
          <Package size={24}/> Stock Register
        </h1>
        
        {/* Search Bar */}
        <div className="mt-3 relative">
          <input 
            type="text" 
            placeholder="Search Item or Rack No..." 
            className="w-full pl-10 pr-4 py-3 rounded-lg text-lg outline-none text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <X size={20}/>
            </button>
          )}
        </div>
      </div>

      {/* --- EXCEL STYLE LIST --- */}
      <div className="p-2">
        {/* Table Header */}
        <div className="flex bg-gray-200 p-2 font-bold text-xs uppercase border-b-2 border-gray-400 sticky top-[130px]">
          <div className="flex-[2]">Item Name</div>
          <div className="flex-1 text-center">Loc/Rack</div>
          <div className="flex-[1.5] text-center">Qty (+/-)</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-300 border-x border-b border-gray-300">
          {filteredProducts.map((p, index) => (
            <div key={p.id} className={`flex items-center p-2 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              
              {/* Item Name & Delete */}
              <div className="flex-[2] pr-2">
                <div className="font-bold text-base leading-tight">{p.name}</div>
                <button onClick={() => handleDelete(p.id)} className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                  <Trash2 size={10}/> Remove
                </button>
              </div>

              {/* Location (Index) */}
              <div className="flex-1 text-center border-l border-gray-300 px-1">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-bold border border-yellow-200 block truncate">
                  {p.location}
                </span>
              </div>

              {/* Quantity Controls */}
              <div className="flex-[1.5] flex items-center justify-center gap-2 border-l border-gray-300 pl-2">
                <button 
                  onClick={() => updateStock(p.id, -1)}
                  className="w-10 h-10 bg-red-100 border border-red-300 text-red-700 rounded flex items-center justify-center active:bg-red-200"
                >
                  <Minus size={20}/>
                </button>
                
                <span className={`text-xl font-bold w-8 text-center ${p.qty === 0 ? 'text-red-500' : 'text-black'}`}>
                  {p.qty}
                </span>

                <button 
                  onClick={() => updateStock(p.id, 1)}
                  className="w-10 h-10 bg-green-100 border border-green-300 text-green-700 rounded flex items-center justify-center active:bg-green-200"
                >
                  <Plus size={20}/>
                </button>
              </div>

            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No items found.
            </div>
          )}
        </div>
      </div>

      {/* --- FLOATING ADD BUTTON --- */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center border-4 border-white active:scale-95"
      >
        <Plus size={32}/>
      </button>

      {/* --- ADD ITEM MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-lg p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Item Entry</h2>
              <button onClick={() => setIsAddModalOpen(false)}><X size={24}/></button>
            </div>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Item Name</label>
                <input 
                  autoFocus
                  className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg outline-none focus:border-blue-500"
                  placeholder="e.g. Break Pads"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Rack/Page No.</label>
                  <input 
                    className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg outline-none focus:border-blue-500"
                    placeholder="e.g. A-1"
                    value={newItem.location}
                    onChange={e => setNewItem({...newItem, location: e.target.value})}
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-bold text-gray-600 mb-1">Qty</label>
                  <input 
                    type="number"
                    className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg outline-none focus:border-blue-500"
                    placeholder="0"
                    value={newItem.qty}
                    onChange={e => setNewItem({...newItem, qty: e.target.value})}
                  />
                </div>
              </div>

              <button className="w-full bg-blue-700 text-white py-4 rounded-lg text-lg font-bold flex items-center justify-center gap-2 mt-4 active:bg-blue-800">
                <Save size={20}/> Save to List
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
