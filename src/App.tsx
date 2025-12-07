import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  Search,
  Bell,
  Plus,
  Minus,
  Menu,
  X,
  AlertTriangle,
  TrendingUp,
  Trash2,
  Car,
  FolderPlus,
  Folder,
  ArrowLeft,
  ChevronLeft,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  Sun,
  Moon,
  Mic,
  MessageSquare,
  Send,
  Lock,
  User,
  CheckCircle,
  MoreVertical
} from 'lucide-react';

// --- DATA PERSISTENCE HELPERS ---
const loadFromStorage = (key, initial) => {
  if (typeof window === 'undefined') return initial;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : initial;
};

const initialProducts = [
  { id: 1, name: 'Leather Seat Covers (Swift)', category: 'Interior', price: 4500, stock: 12, compatibleCars: ['swift', 'dzire'] },
  { id: 2, name: 'Android Screen 9" (Universal)', category: 'Electronics', price: 8500, stock: 4, compatibleCars: ['universal', 'swift', 'creta', 'thar'] },
  { id: 3, name: 'Alloy Wheels 16" (Thar)', category: 'Exterior', price: 22000, stock: 2, compatibleCars: ['thar', 'scorpio'] },
  { id: 4, name: 'Car Body Cover (Sedan)', category: 'Exterior', price: 1200, stock: 20, compatibleCars: ['city', 'verna', 'ciaz'] },
  { id: 5, name: 'LED Headlights H4', category: 'Electronics', price: 3200, stock: 8, compatibleCars: ['swift', 'baleno', 'i20', 'universal'] },
  { id: 6, name: '7D Floor Mats (Creta)', category: 'Interior', price: 2800, stock: 3, compatibleCars: ['creta'] },
  { id: 7, name: 'Tyre Inflator', category: 'Tools', price: 1800, stock: 15, compatibleCars: ['universal', 'swift', 'thar', 'creta', 'city'] },
  { id: 8, name: 'Bass Tube 12"', category: 'Electronics', price: 4500, stock: 6, compatibleCars: ['universal'] },
  { id: 9, name: 'Roof Rails (Thar)', category: 'Exterior', price: 3500, stock: 0, compatibleCars: ['thar'] },
];

const initialCategories = ['All Items', 'Interior', 'Exterior', 'Electronics', 'Tools'];

const initialTransactions = [
  { id: 101, type: 'Sale', productName: 'Leather Seat Covers', amount: 4500, date: 'Today, 10:00 AM' },
  { id: 102, type: 'Restock', productName: 'Car Body Cover', amount: 0, date: 'Yesterday, 6:00 PM' }
];

// --- VOICE INPUT COMPONENT (Optimized) ---
const VoiceInput = ({ onResult, isDark }) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; 
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if(transcript) onResult(transcript);
      };
      try { recognition.start(); } catch(e) { console.error(e); }
    } else {
      alert("Voice not supported.");
    }
  };

  return (
    <button
      onClick={startListening}
      className={`p-3 rounded-full transition-all active:scale-90 ${isListening ? 'bg-red-500 text-white animate-pulse' : (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600')}`}
    >
      <Mic size={20} />
    </button>
  );
};

// --- LOGIN COMPONENT ---
const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password123') {
      onLogin();
    } else {
      setError('Invalid Credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-700">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
             <span className="text-white font-bold text-xl">AH</span>
          </div>
          <h1 className="text-xl font-bold text-white">AutoHub Login</h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500" placeholder="admin" />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold mb-1 uppercase">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500" placeholder="password123" />
          </div>
          {error && <div className="text-red-400 text-xs text-center">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all active:scale-95">Login</button>
        </form>
      </div>
    </div>
  );
};

// --- AI ASSISTANT COMPONENT ---
const AIChatBot = ({ products, transactions, isDark, businessName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([{ role: 'ai', text: `Namaste! Stock ya sales ke baare mein puchiye.` }]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isOpen]);

  const processQuery = (text) => {
    const lowerText = text.toLowerCase();
    let response = "Samajh nahi aaya. Stock ya sales puchiye.";
    if (lowerText.includes('total') || lowerText.includes('stock')) {
      const total = products.reduce((a, p) => a + p.stock, 0);
      response = `Total stock: ${total} units.`;
    } else if (lowerText.includes('sale') || lowerText.includes('bikri')) {
      const total = transactions.filter(t => t.type === 'Sale').reduce((a, t) => a + t.amount, 0);
      response = `Total Sales: ₹${total.toLocaleString()}`;
    } else {
      const found = products.find(p => lowerText.includes(p.name.toLowerCase().split(' ')[0].toLowerCase()));
      if (found) response = `${found.name}: ₹${found.price}, Stock: ${found.stock}`;
    }
    return response;
  };

  const handleSend = () => {
    if (!query.trim()) return;
    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: processQuery(userMsg.text) }]);
    }, 500);
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 rounded-full shadow-lg text-white hover:scale-110 transition-transform active:scale-90">
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isOpen && (
        <div className={`fixed bottom-24 right-4 left-4 md:left-auto md:right-6 z-50 md:w-80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in border h-96 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="p-3 bg-blue-600 text-white flex justify-between items-center">
             <h3 className="font-bold text-sm">Assistant</h3>
             <button onClick={() => setIsOpen(false)}><X size={18}/></button>
          </div>
          <div className={`flex-1 overflow-y-auto p-3 space-y-2 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2 px-3 rounded-lg text-xs max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white' : (isDark ? 'bg-slate-700 text-slate-200' : 'bg-white border text-slate-700')}`}>{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className={`p-2 border-t flex items-center gap-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <VoiceInput onResult={setQuery} isDark={isDark} />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask..." className={`flex-1 bg-transparent border-none outline-none text-sm ${isDark ? 'text-white' : 'text-slate-800'}`} />
            <button onClick={handleSend} className="text-blue-500 p-2"><Send size={18}/></button>
          </div>
        </div>
      )}
    </>
  );
};

const ProductDetailModal = ({ product, onClose, onStockChange, isDark }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className={`rounded-t-2xl md:rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up md:animate-scale-in flex flex-col max-h-[85vh] ${isDark ? 'bg-slate-900' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{product.name}</h3>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>In Stock: {product.stock}</span>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-100'}`}>
                <p className="text-xs font-bold text-blue-500 uppercase">Price</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{product.price}</p>
             </div>
             <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-xs font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</p>
                <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-bold ${product.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {product.stock < 5 ? 'Low Stock' : 'Good'}
                </span>
             </div>
          </div>
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-center text-xs font-bold uppercase mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quick Actions</p>
            <div className="flex items-center justify-between gap-4">
               <button onClick={() => onStockChange(product.id, -1)} className="flex-1 py-3 rounded-lg bg-red-100 text-red-700 font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                 <Minus size={20}/> Sell
               </button>
               <div className={`text-2xl font-bold font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{product.stock}</div>
               <button onClick={() => onStockChange(product.id, 1)} className="flex-1 py-3 rounded-lg bg-green-100 text-green-700 font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                 <Plus size={20}/> Add
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ERPSystem() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // -- STATE --
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => loadFromStorage('theme', 'light'));
  const [products, setProducts] = useState(() => loadFromStorage('products', initialProducts));
  const [categories, setCategories] = useState(() => loadFromStorage('categories', initialCategories));
  const [transactions, setTransactions] = useState(() => loadFromStorage('transactions', initialTransactions));
  const [notes, setNotes] = useState(() => loadFromStorage('notes', "• Call distributor."));
  const [businessName, setBusinessName] = useState(() => loadFromStorage('businessName', 'AutoHub'));
  const [lowStockThreshold, setLowStockThreshold] = useState(() => loadFromStorage('threshold', 5));
  const [currency, setCurrency] = useState('₹');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', stock: '', compatibleCars: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [carModelSearch, setCarModelSearch] = useState('');
  const [selectedCarCategory, setSelectedCarCategory] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = () => { setIsAuthenticated(true); localStorage.setItem('isAuthenticated', 'true'); };
  const handleLogout = () => { setIsAuthenticated(false); localStorage.removeItem('isAuthenticated'); };

  // Persist
  useEffect(() => localStorage.setItem('products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('transactions', JSON.stringify(transactions)), [transactions]);

  const isDark = theme === 'dark';
  const lowStockItems = useMemo(() => products.filter(p => p.stock < lowStockThreshold), [products, lowStockThreshold]);
  const totalValue = useMemo(() => products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0), [products]);

  const filteredProducts = useMemo(() => 
    products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All Items' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }), 
  [products, searchTerm, selectedCategory]);

  const carSearchMatches = useMemo(() => {
    const searchLower = carModelSearch.toLowerCase().trim();
    if (searchLower.length <= 2) return [];
    return products.filter(p => p.compatibleCars.some(car => car === 'universal' || car.includes(searchLower)));
  }, [products, carModelSearch]);

  const carMatchCategories = useMemo(() => {
    const groups = {};
    carSearchMatches.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [carSearchMatches]);

  const handleStockChange = (id, amount) => {
    setProducts(currentProducts => {
      const product = currentProducts.find(p => p.id === id);
      if (!product) return currentProducts;
      if (amount !== 0) {
        const type = amount > 0 ? 'Restock' : 'Sale';
        const newTransaction = { id: Date.now(), type, productName: product.name, amount: amount > 0 ? 0 : product.price, date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setTransactions(prev => [newTransaction, ...prev]);
      }
      return currentProducts.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p);
    });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;
    const carsArray = newProduct.compatibleCars.split(',').map(car => car.trim().toLowerCase()).filter(i => i);
    if (carsArray.length === 0) carsArray.push('universal');
    const newItem = { id: Date.now(), name: newProduct.name, category: newProduct.category || 'General', price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock) || 0, compatibleCars: carsArray };
    setProducts([...products, newItem]);
    setNewProduct({ name: '', category: '', price: '', stock: '', compatibleCars: '' });
    setIsAddModalOpen(false);
  };

  // --- RENDER FUNCTIONS ---
  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="grid grid-cols-1 gap-4">
        {/* Mobile Friendly Stats */}
        <div className={`p-5 rounded-xl border shadow-sm flex items-center justify-between ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`} onClick={() => setActiveTab('inventory')}>
           <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Inventory</p>
              <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{products.length}</h3>
           </div>
           <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Package size={24}/></div>
        </div>

        <div className={`p-5 rounded-xl border shadow-sm flex items-center justify-between ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
           <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Valuation</p>
              <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>₹{totalValue.toLocaleString()}</h3>
           </div>
           <div className="bg-green-100 p-3 rounded-lg text-green-600"><TrendingUp size={24}/></div>
        </div>

        {lowStockItems.length > 0 && (
           <div className={`p-5 rounded-xl border shadow-sm flex items-center justify-between border-red-200 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`} onClick={() => setShowNotifications(true)}>
             <div>
                <p className="text-xs font-bold text-red-500 uppercase">Low Stock</p>
                <h3 className={`text-3xl font-bold text-red-600`}>{lowStockItems.length}</h3>
             </div>
             <div className="bg-red-200 p-3 rounded-lg text-red-600"><AlertTriangle size={24}/></div>
          </div>
        )}
      </div>

      <div className={`rounded-xl border shadow-sm overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className={`p-4 border-b font-bold ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>Recent Sales</div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
           {transactions.slice(0, 5).map(t => (
             <div key={t.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'Sale' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {t.type === 'Sale' ? <DollarSign size={16}/> : <Plus size={16}/>}
                   </div>
                   <div>
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t.productName}</p>
                      <p className="text-xs text-slate-500">{t.date}</p>
                   </div>
                </div>
                {t.type === 'Sale' && <span className="font-bold text-green-600">+₹{t.amount}</span>}
             </div>
           ))}
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="flex flex-col h-full animate-fade-in pb-20">
      {/* Mobile Sticky Header */}
      <div className={`sticky top-0 z-20 p-4 border-b space-y-3 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex gap-2">
           <div className={`flex-1 flex items-center px-3 py-2 border rounded-lg ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-200'}`}>
              <Search size={18} className="text-slate-400 mr-2"/>
              <input type="text" className="bg-transparent w-full outline-none text-sm" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
           </div>
           <VoiceInput onResult={setSearchTerm} isDark={isDark} />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           {categories.map(cat => (
             <button key={cat} onClick={() => setSelectedCategory(cat)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')}`}>
               {cat}
             </button>
           ))}
        </div>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto">
         {/* MOBILE CARD VIEW (No Table) */}
         {filteredProducts.map(p => (
           <div key={p.id} className={`p-4 rounded-xl border shadow-sm relative flex flex-col gap-3 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className={`font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{p.category}</p>
                 </div>
                 <div className={`px-2 py-1 rounded text-xs font-bold ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {p.stock} Left
                 </div>
              </div>
              
              <div className="flex justify-between items-end mt-2">
                 <p className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>₹{p.price}</p>
              </div>

              {/* BIG ACTION BUTTONS FOR MOBILE */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                 <button onClick={() => handleStockChange(p.id, -1)} className={`py-3 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700 text-red-400' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    <Minus size={20} />
                 </button>
                 <button onClick={() => setSelectedProductForDetail(p)} className={`py-3 rounded-lg flex items-center justify-center font-bold text-sm ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                    VIEW
                 </button>
                 <button onClick={() => handleStockChange(p.id, 1)} className={`py-3 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700 text-green-400' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                    <Plus size={20} />
                 </button>
              </div>
           </div>
         ))}
         
         {/* Add Button Floating */}
         <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-xl text-white flex items-center justify-center z-30 md:hidden active:scale-90 transition-transform">
            <Plus size={30} />
         </button>
      </div>
    </div>
  );

  const renderCarSearch = () => (
    <div className="p-4 flex flex-col h-full animate-fade-in">
       <div className="flex-1 flex flex-col items-center pt-10">
          <div className={`p-4 rounded-full mb-6 ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
             <Car size={40} className="text-blue-600"/>
          </div>
          <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Car Finder</h2>
          
          <div className="w-full max-w-md relative">
             <input type="text" placeholder="Enter Car Model (e.g. Swift)" className={`w-full py-4 pl-6 pr-12 rounded-xl border text-lg shadow-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'}`} value={carModelSearch} onChange={e => {setCarModelSearch(e.target.value); setSelectedCarCategory(null);}} />
             <div className="absolute right-2 top-2">
                <VoiceInput onResult={setCarModelSearch} isDark={isDark} />
             </div>
          </div>

          {carModelSearch.length > 2 && (
             <div className="w-full max-w-md mt-6 space-y-3">
                {Object.keys(carMatchCategories).map(cat => (
                   <div key={cat} onClick={() => setSelectedCarCategory(cat)} className={`p-4 rounded-xl border flex justify-between items-center active:scale-95 transition-transform ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{cat}</span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{carMatchCategories[cat].length} Parts</span>
                   </div>
                ))}
             </div>
          )}

          {selectedCarCategory && (
             <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 overflow-y-auto animate-slide-up">
                <div className="p-4 border-b sticky top-0 bg-inherit z-10 flex items-center gap-3">
                   <button onClick={() => setSelectedCarCategory(null)}><ArrowLeft size={24} className={isDark ? 'text-white' : 'text-black'}/></button>
                   <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}>{selectedCarCategory} for {carModelSearch}</h3>
                </div>
                <div className="p-4 space-y-4">
                   {carMatchCategories[selectedCarCategory].map(p => (
                      <div key={p.id} className={`p-4 rounded-xl border shadow-sm ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`} onClick={() => setSelectedProductForDetail(p)}>
                         <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{p.name}</h4>
                         <div className="flex justify-between items-center mt-3">
                            <span className={`text-xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>₹{p.price}</span>
                            <span className="text-xs text-slate-400">Tap to view</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}
       </div>
    </div>
  );

  const renderSettings = () => (
     <div className="p-4 space-y-6 animate-fade-in">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Settings</h2>
        
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
           <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Appearance</h3>
           <div className="flex gap-4">
              <button onClick={() => setTheme('light')} className={`flex-1 py-3 rounded-lg border font-bold flex items-center justify-center gap-2 ${!isDark ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-slate-600 text-slate-400'}`}><Sun size={20}/> Light</button>
              <button onClick={() => setTheme('dark')} className={`flex-1 py-3 rounded-lg border font-bold flex items-center justify-center gap-2 ${isDark ? 'bg-slate-700 border-blue-500 text-blue-400' : 'border-slate-200 text-slate-400'}`}><Moon size={20}/> Dark</button>
           </div>
        </div>

        <button onClick={() => {
           const blob = new Blob([JSON.stringify({products, transactions}, null, 2)], {type: 'application/json'});
           const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'backup.json'; a.click();
        }} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95">
           <FileText size={20}/> Download Backup
        </button>
     </div>
  );

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className={`flex h-screen font-sans overflow-hidden ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* SIDEBAR (Desktop) */}
      <aside className={`hidden md:flex flex-col w-64 border-r z-20 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 text-slate-300'}`}>
         <div className="h-16 flex items-center px-6 font-bold text-white text-xl tracking-wider">AH Enterprise</div>
         <nav className="flex-1 py-6 space-y-1 px-3">
            {[ 
               {id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard'},
               {id: 'inventory', icon: Package, label: 'Inventory'},
               {id: 'related', icon: Car, label: 'Car Finder'},
               {id: 'settings', icon: Settings, label: 'Settings'},
            ].map(item => (
               <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400'}`}>
                  <item.icon size={20}/> {item.label}
               </button>
            ))}
         </nav>
         <button onClick={handleLogout} className="m-4 flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white"><LogOut size={20}/> Sign Out</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative w-full">
         {/* HEADER */}
         <header className={`h-16 border-b flex items-center justify-between px-4 shrink-0 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3">
               <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden"><Menu size={24} className={isDark ? 'text-white' : 'text-slate-800'}/></button>
               <h1 className={`font-bold text-lg capitalize ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeTab}</h1>
            </div>
            <div className="flex gap-4">
               <button onClick={() => setShowNotifications(!showNotifications)} className="relative">
                  <Bell size={24} className={isDark ? 'text-slate-400' : 'text-slate-600'}/>
                  {lowStockItems.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>}
               </button>
            </div>
         </header>

         {/* BODY */}
         <div className="flex-1 overflow-hidden relative">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'inventory' && renderInventory()}
            {activeTab === 'related' && renderCarSearch()}
            {activeTab === 'settings' && renderSettings()}
         </div>
      </main>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
         <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className={`relative w-64 h-full shadow-2xl flex flex-col animate-slide-right ${isDark ? 'bg-slate-900' : 'bg-slate-800 text-white'}`}>
               <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700">
                  <span className="font-bold text-xl">AutoHub</span>
                  <button onClick={() => setIsMobileMenuOpen(false)}><X size={24}/></button>
               </div>
               <nav className="flex-1 py-6 space-y-2 px-3">
                  {[ 
                     {id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard'},
                     {id: 'inventory', icon: Package, label: 'Inventory'},
                     {id: 'related', icon: Car, label: 'Car Finder'},
                     {id: 'settings', icon: Settings, label: 'Settings'},
                  ].map(item => (
                     <button key={item.id} onClick={() => {setActiveTab(item.id); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${activeTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        <item.icon size={24}/> {item.label}
                     </button>
                  ))}
               </nav>
               <button onClick={handleLogout} className="m-4 flex items-center gap-3 px-4 py-4 text-red-400 font-bold"><LogOut size={24}/> Sign Out</button>
            </div>
         </div>
      )}

      {/* COMPONENTS */}
      <AIChatBot products={products} transactions={transactions} isDark={isDark} businessName={businessName} />
      
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
           <div className={`w-full md:max-w-md rounded-t-2xl md:rounded-xl p-6 animate-slide-up ${isDark ? 'bg-slate-900' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Add New Product</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                 <input type="text" placeholder="Name" required className={`w-full p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50'}`} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})}/>
                 <div className="flex gap-4">
                    <input type="number" placeholder="Price" required className={`flex-1 p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50'}`} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})}/>
                    <input type="number" placeholder="Stock" className={`flex-1 p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50'}`} value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})}/>
                 </div>
                 <select className={`w-full p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50'}`} value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
                 <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Save Product</button>
              </form>
           </div>
        </div>
      )}
      
      <ProductDetailModal product={selectedProductForDetail} onClose={() => setSelectedProductForDetail(null)} onStockChange={handleStockChange} isDark={isDark} />
    </div>
  );
}
