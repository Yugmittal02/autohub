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
  Filter,
  MoreHorizontal
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

// --- VOICE INPUT COMPONENT ---
const VoiceInput = ({ onResult, isDark }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const startListening = () => {
    setError(null);
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'hi-IN'; 
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      
      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Voice error:", event.error);
        setIsListening(false);
        setError("Error");
        setTimeout(() => setError(null), 2000);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if(transcript) {
            onResult(transcript);
        }
      };
      
      try {
        recognition.start();
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("Voice search not supported in this browser.");
    }
  };

  return (
    <div className="relative">
        <button
        onClick={startListening}
        className={`p-3 rounded-xl transition-all duration-200 border ${
            isListening 
            ? 'bg-red-500 text-white border-red-500 animate-pulse' 
            : (isDark ? 'text-slate-400 bg-slate-800 border-slate-700 hover:text-white' : 'text-slate-500 bg-white border-slate-300 hover:text-blue-600')
        }`}
        title="Speak"
        >
        <Mic size={20} />
        </button>
    </div>
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/20">
             <span className="text-white font-bold text-2xl">AH</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to AutoHub Enterprise</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-base"
                placeholder="Enter username"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-bold mb-2 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-base"
                placeholder="Enter password"
              />
            </div>
          </div>
          
          {error && <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-900/50">{error}</div>}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 text-lg">
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

// --- AI ASSISTANT COMPONENT ---
const AIChatBot = ({ products, transactions, isDark, businessName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Namaste! Main ${businessName} ka AI Assistant hu.` }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const processQuery = (text) => {
    const lowerText = text.toLowerCase();
    let response = "Maaf kijiye, mujhe samajh nahi aaya.";

    if (lowerText.includes('total stock') || lowerText.includes('kitne item')) {
      const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
      response = `Kul ${products.length} products aur total ${totalStock} units stock mein hain.`;
    } 
    else if (lowerText.includes('sale') || lowerText.includes('kamai')) {
      const totalSales = transactions.filter(t => t.type === 'Sale').reduce((acc, t) => acc + t.amount, 0);
      response = `Total sales: ₹${totalSales.toLocaleString()}.`;
    }
    else {
      const foundProduct = products.find(p => lowerText.includes(p.name.toLowerCase().split(' ')[0].toLowerCase()));
      if (foundProduct) {
        response = `${foundProduct.name}: ₹${foundProduct.price}, Stock: ${foundProduct.stock}`;
      }
    }
    return response;
  };

  const handleSend = () => {
    if (!query.trim()) return;
    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');

    setTimeout(() => {
      const aiResponse = processQuery(userMsg.text);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    }, 600);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 rounded-full shadow-2xl text-white hover:scale-110 transition-transform active:scale-90"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isOpen && (
        <div className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in border h-[450px] ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center shrink-0">
             <h3 className="font-bold">AI Assistant</h3>
             <button onClick={() => setIsOpen(false)}><X size={20}/></button>
          </div>
          
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : (isDark ? 'bg-slate-700 text-slate-200' : 'bg-white border border-slate-200 text-slate-700')}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={`p-3 border-t flex items-center gap-2 shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <VoiceInput onResult={setQuery} isDark={isDark} />
            <input 
              type="text" 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Type or Speak..."
              className={`flex-1 bg-transparent border-none outline-none text-sm px-2 ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800'}`}
            />
            <button onClick={handleSend} className="text-blue-600 p-2"><Send size={20}/></button>
          </div>
        </div>
      )}
    </>
  );
};

// --- RESPONSIVE INVENTORY CARD (Mobile/Tablet) ---
const InventoryCard = ({ product, isDark, onStockChange, onView }) => (
    <div className={`p-4 rounded-xl border shadow-sm relative overflow-hidden group ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-start mb-3">
            <div className="flex-1 pr-2">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    {product.category}
                </span>
                <h3 className={`text-base font-bold mt-2 leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{product.name}</h3>
                <p className="text-xs text-slate-500 mt-1">₹{product.price.toLocaleString()}</p>
            </div>
            <button onClick={() => onView(product)} className={`p-2 rounded-lg border shrink-0 ${isDark ? 'border-slate-600 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
                <FileText size={18}/>
            </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-2">
                <p className={`text-sm font-bold ${product.stock < 5 ? 'text-red-500' : (isDark ? 'text-emerald-400' : 'text-emerald-600')}`}>
                   {product.stock} <span className="text-[10px] font-normal text-slate-500 uppercase">In Stock</span>
                </p>
             </div>
             
             <div className="flex items-center gap-1">
                 <button 
                    onClick={() => onStockChange(product.id, -1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                 >
                    <Minus size={14}/>
                 </button>
                 <button 
                    onClick={() => onStockChange(product.id, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400"
                 >
                    <Plus size={14}/>
                 </button>
             </div>
        </div>
    </div>
);

const ProductDetailModal = ({ product, onClose, onStockChange, isDark }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className={`rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border animate-scale-in flex flex-col max-h-[90vh] ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
          <h3 className={`text-lg font-bold truncate pr-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>{product.name}</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors shrink-0 ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className={`p-4 rounded-xl border ${isDark ? 'bg-blue-900/10 border-blue-800/30' : 'bg-blue-50/50 border-blue-100'}`}>
                <p className="text-blue-500 text-xs font-bold uppercase mb-1">Price</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-blue-100' : 'text-slate-800'}`}>₹{product.price.toLocaleString()}</p>
             </div>
             <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`text-xs font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Stock</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${product.stock < 5 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {product.stock}
                  </p>
                  <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>units</span>
                </div>
             </div>
          </div>

          <div>
            <p className={`text-xs font-bold uppercase mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Compatible With</p>
            <div className="flex flex-wrap gap-2">
              {product.compatibleCars.map((car, idx) => (
                <span key={idx} className={`px-3 py-1.5 text-sm font-medium rounded-lg border capitalize flex items-center gap-2 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}>
                  <Car size={14} className="text-slate-400"/> {car}
                </span>
              ))}
            </div>
          </div>

          <div className={`p-5 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-center text-xs font-bold uppercase mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Adjust Stock</p>
            <div className="flex items-center justify-center gap-6">
               <button onClick={() => onStockChange(product.id, -1)} className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-sm active:scale-95 ${isDark ? 'bg-slate-800 border-slate-600 text-red-400' : 'bg-white border-slate-300 text-red-500'}`}>
                 <Minus size={24}/>
               </button>
               <span className={`font-mono text-3xl font-bold w-20 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>{product.stock}</span>
               <button onClick={() => onStockChange(product.id, 1)} className={`w-12 h-12 rounded-xl border flex items-center justify-center shadow-md active:scale-95 ${isDark ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-800 text-white'}`}>
                 <Plus size={24}/>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button onClick={onClick} className={`flex items-center w-full py-3.5 my-1 rounded-lg transition-all duration-200 group ${collapsed ? 'justify-center px-2' : 'px-4 space-x-3'} ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    <Icon size={22} className={`shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
    {!collapsed && <span className="text-sm font-medium tracking-wide whitespace-nowrap">{label}</span>}
  </button>
);

const StatCard = ({ title, value, icon: Icon, color, onClick, clickable, isDark }) => {
  const colorClasses = {
    blue: isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600',
    red: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600',
    green: isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div onClick={onClick} className={`p-5 rounded-xl border shadow-sm relative overflow-hidden group transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} ${clickable ? 'cursor-pointer active:scale-98' : ''}`}>
      <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color]} z-10`}><Icon size={24} /></div>
      </div>
      <div className="z-10 relative">
        <h3 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</h3>
        <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
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
  const [notes, setNotes] = useState(() => loadFromStorage('notes', "• Order new mats for Swift"));
  const [businessName, setBusinessName] = useState(() => loadFromStorage('businessName', 'AutoHub Enterprise'));
  const [lowStockThreshold, setLowStockThreshold] = useState(() => loadFromStorage('threshold', 5));
  const [currency, setCurrency] = useState('₹');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [dashboardView, setDashboardView] = useState('overview');
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', stock: '', compatibleCars: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [carModelSearch, setCarModelSearch] = useState('');
  const [selectedCarCategory, setSelectedCarCategory] = useState(null);

  // Auth & Persistence Effects
  useEffect(() => { const authStatus = localStorage.getItem('isAuthenticated'); if (authStatus === 'true') setIsAuthenticated(true); }, []);
  const handleLogin = () => { setIsAuthenticated(true); localStorage.setItem('isAuthenticated', 'true'); };
  const handleLogout = () => { setIsAuthenticated(false); localStorage.removeItem('isAuthenticated'); };
  useEffect(() => localStorage.setItem('products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('categories', JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem('transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('notes', JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem('theme', JSON.stringify(theme)), [theme]);
  useEffect(() => localStorage.setItem('businessName', JSON.stringify(businessName)), [businessName]);
  useEffect(() => localStorage.setItem('threshold', JSON.stringify(lowStockThreshold)), [lowStockThreshold]);

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
      return currentProducts.map(p => {
        if (p.id === id) { return { ...p, stock: Math.max(0, p.stock + amount) }; }
        return p;
      });
    });
  };

  const handleAddCategory = (e) => { e.preventDefault(); if (newCategoryName && !categories.includes(newCategoryName)) { setCategories([...categories, newCategoryName]); setNewCategoryName(''); setIsCategoryModalOpen(false); } };
  const handleDeleteCategory = (catName, e) => { e.stopPropagation(); if (catName === 'All Items') return; if (window.confirm(`Delete category "${catName}"?`)) { setCategories(categories.filter(c => c !== catName)); if (selectedCategory === catName) setSelectedCategory('All Items'); setProducts(products.filter(p => p.category !== catName)); } };
  const handleAddProduct = (e) => { e.preventDefault(); if (!newProduct.name || !newProduct.price) return; const carsArray = newProduct.compatibleCars.split(',').map(car => car.trim().toLowerCase()).filter(i => i); if (carsArray.length === 0) carsArray.push('universal'); const newItem = { id: Date.now(), name: newProduct.name, category: newProduct.category || 'General', price: parseFloat(newProduct.price), stock: parseInt(newProduct.stock) || 0, compatibleCars: carsArray }; setProducts([...products, newItem]); setNewProduct({ name: '', category: '', price: '', stock: '', compatibleCars: '' }); setIsAddModalOpen(false); };

  // --- RENDERERS ---

  const renderDashboard = () => {
    if (dashboardView === 'transactions') {
      return (
        <div className="animate-fade-in flex flex-col h-full max-w-7xl mx-auto w-full">
           <div className="flex items-center justify-between mb-4 shrink-0">
             <button onClick={() => setDashboardView('overview')} className="flex items-center text-slate-500 hover:text-blue-600 font-medium">
               <ArrowLeft size={18} className="mr-2"/> Back
             </button>
             <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Transactions</h2>
           </div>
           <div className={`rounded-xl shadow-sm border flex-1 overflow-hidden flex flex-col ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
             <div className="overflow-x-auto flex-1">
               <table className="w-full text-left text-sm min-w-[500px]">
                 <thead className={`font-semibold sticky top-0 z-10 border-b ${isDark ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                   <tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Product</th><th className="px-4 py-3 text-right">Value</th></tr>
                 </thead>
                 <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
                   {transactions.map(t => (
                     <tr key={t.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                       <td className="px-4 py-3 text-xs opacity-70">{t.date}</td>
                       <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${t.type === 'Sale' ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-blue-400' : 'text-blue-700')}`}>{t.type}</span></td>
                       <td className="px-4 py-3 font-medium">{t.productName}</td>
                       <td className="px-4 py-3 text-right">{t.amount > 0 ? `+₹${t.amount}` : '-'}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      );
    }
    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          <StatCard isDark={isDark} title="Inventory" value={products.length} icon={Package} color="blue" clickable onClick={() => setActiveTab('inventory')} />
          <StatCard isDark={isDark} title="Critical" value={lowStockItems.length} icon={AlertTriangle} color="red" clickable onClick={() => setShowNotifications(true)} />
          <StatCard isDark={isDark} title="Valuation" value={`₹${totalValue.toLocaleString()}`} icon={TrendingUp} color="green" clickable onClick={() => setDashboardView('transactions')} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`rounded-xl shadow-sm border overflow-hidden h-80 lg:h-96 flex flex-col ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}><h3 className="font-bold text-sm uppercase">Notes</h3></div>
            <textarea className={`flex-1 w-full p-4 resize-none outline-none text-sm ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700'}`} placeholder="Notes..." value={notes} onChange={(e) => setNotes(e.target.value)}/>
          </div>
          <div className={`rounded-xl shadow-sm border overflow-hidden h-80 lg:h-96 flex flex-col ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`p-4 border-b flex justify-between ${isDark ? 'border-slate-700' : 'border-slate-100'}`}><h3 className="font-bold text-sm uppercase">Live Activity</h3></div>
            <div className="overflow-y-auto flex-1">{transactions.slice(0, 8).map(t => (<div key={t.id} className={`flex items-center justify-between p-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-50'}`}><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${t.type === 'Sale' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{t.type[0]}</div><div><p className="text-sm font-bold">{t.productName}</p><p className="text-xs opacity-50">{t.date}</p></div></div><span className="text-sm font-bold text-emerald-500">{t.amount > 0 && `+${t.amount}`}</span></div>))}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderInventory = () => (
    <div className="flex flex-col h-full animate-fade-in w-full overflow-hidden">
      {/* Search Header */}
      <div className={`p-4 border-b flex flex-col gap-3 shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex gap-2 w-full">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search..." className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-slate-900 border-slate-600 text-white' : 'bg-white border-slate-300'}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <VoiceInput onResult={setSearchTerm} isDark={isDark} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
             <button onClick={() => setIsCategoryModalOpen(true)} className={`px-4 py-2 border rounded-lg text-sm font-bold whitespace-nowrap flex items-center gap-2 ${isDark ? 'bg-slate-800 border-slate-600 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}><FolderPlus size={16}/> Category</button>
             <button onClick={() => setIsAddModalOpen(true)} className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap text-white flex items-center gap-2 ${isDark ? 'bg-blue-600' : 'bg-slate-900'}`}><Plus size={16}/> Add Item</button>
        </div>
        {/* Mobile Filter */}
        <div className="lg:hidden">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={`w-full p-2 border rounded-lg text-sm ${isDark ? 'bg-slate-800 border-slate-600 text-white' : 'bg-white border-slate-300'}`}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Filter (Laptop only) */}
        <div className={`hidden lg:block w-64 border-r overflow-y-auto p-4 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
             <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Filters</h3>
             {categories.map(cat => (
                 <div key={cat} className="flex items-center justify-between group mb-1">
                   <button onClick={() => setSelectedCategory(cat)} className={`flex-1 text-left px-3 py-2 rounded-lg text-sm font-medium ${selectedCategory === cat ? (isDark ? 'bg-slate-800 text-blue-400' : 'bg-white text-blue-700 shadow-sm') : 'opacity-70 hover:opacity-100'}`}>{cat}</button>
                   {cat !== 'All Items' && <button onClick={(e) => handleDeleteCategory(cat, e)} className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>}
                 </div>
             ))}
        </div>

        {/* Product List Area */}
        <div className={`flex-1 overflow-y-auto p-4 ${isDark ? 'bg-slate-950' : 'bg-slate-50/50'}`}>
           <div className="flex justify-between items-center mb-4">
              <h3 className={`font-bold text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{selectedCategory} ({filteredProducts.length})</h3>
           </div>
           
           {/* Mobile & Tablet Grid View */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden pb-20">
              {filteredProducts.map(product => (
                  <InventoryCard key={product.id} product={product} isDark={isDark} onStockChange={handleStockChange} onView={setSelectedProductForDetail}/>
              ))}
           </div>

           {/* Laptop Table View */}
           <div className="hidden lg:block w-full rounded-xl border overflow-hidden shadow-sm bg-white dark:bg-slate-900 dark:border-slate-700">
                <table className="w-full text-left text-sm">
                    <thead className={`text-xs uppercase font-bold border-b ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                        <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4 text-right">Price</th><th className="px-6 py-4 text-center">Stock</th><th className="px-6 py-4 text-center">Action</th></tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                        {filteredProducts.map((p) => (
                            <tr key={p.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50`}>
                                <td className="px-6 py-4"><div className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{p.name}</div><div className="text-xs opacity-50">{p.category}</div></td>
                                <td className="px-6 py-4 text-right font-mono">₹{p.price.toLocaleString()}</td>
                                <td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${p.stock < lowStockThreshold ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>{p.stock}</span></td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleStockChange(p.id, -1)} className="p-1 border rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Minus size={14}/></button>
                                        <button onClick={() => setSelectedProductForDetail(p)} className="px-3 py-1 border rounded text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700">View</button>
                                        <button onClick={() => handleStockChange(p.id, 1)} className="p-1 border rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Plus size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
           </div>
           
           {filteredProducts.length === 0 && <div className="text-center p-10 opacity-50">No items found.</div>}
        </div>
      </div>
    </div>
  );

  const renderCarSearch = () => (
     <div className="p-4 h-full overflow-y-auto">
        {!selectedCarCategory ? (
            <div className="max-w-xl mx-auto text-center mt-10">
                <Car className="w-16 h-16 mx-auto mb-4 text-blue-500"/>
                <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Part Finder</h2>
                <div className="flex gap-2 mb-8">
                    <input type="text" placeholder="Enter Car Model (e.g. Swift)..." className={`flex-1 p-4 rounded-xl border-2 text-lg outline-none focus:border-blue-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`} value={carModelSearch} onChange={(e) => { setCarModelSearch(e.target.value); setSelectedCarCategory(null); }} />
                    <div className="flex items-center"><VoiceInput onResult={setCarModelSearch} isDark={isDark} /></div>
                </div>
                {carModelSearch.length > 2 && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{Object.keys(carMatchCategories).map(cat => (<button key={cat} onClick={() => setSelectedCarCategory(cat)} className={`p-4 rounded-xl border font-bold flex justify-between ${isDark ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white hover:border-blue-500'}`}><span>{cat}</span><span className="bg-blue-100 text-blue-600 px-2 rounded text-xs py-1">{carMatchCategories[cat].length}</span></button>))}</div>}
            </div>
        ) : (
            <div className="max-w-4xl mx-auto">
                <button onClick={() => setSelectedCarCategory(null)} className="mb-4 flex items-center text-blue-500 font-bold"><ArrowLeft size={18} className="mr-2"/> Back</button>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedCarCategory} for "{carModelSearch}"</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {carMatchCategories[selectedCarCategory].map(p => (
                        <div key={p.id} onClick={() => setSelectedProductForDetail(p)} className={`p-4 rounded-xl border cursor-pointer hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{p.name}</h4>
                            <div className="flex justify-between items-end"><span className="text-xl font-bold">₹{p.price}</span><span className={`text-xs px-2 py-1 rounded ${p.stock > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{p.stock > 0 ? 'In Stock' : 'Out'}</span></div>
                        </div>
                    ))}
                </div>
            </div>
        )}
     </div>
  );

  const renderSettings = () => (
    <div className="p-4 max-w-3xl mx-auto pb-20 overflow-y-auto h-full">
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Settings</h2>
        <div className={`p-6 rounded-xl border mb-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className="font-bold mb-4 flex items-center gap-2"><Sun size={20}/> Appearance</h3>
            <div className="flex gap-4"><button onClick={() => setTheme('light')} className={`flex-1 py-3 rounded-lg border font-bold ${!isDark ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-slate-700'}`}>Light</button><button onClick={() => setTheme('dark')} className={`flex-1 py-3 rounded-lg border font-bold ${isDark ? 'bg-slate-700 border-blue-500 text-blue-400' : 'hover:bg-slate-50'}`}>Dark</button></div>
        </div>
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className="font-bold mb-4">Data</h3>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"><FileText size={18}/> Backup Data (JSON)</button>
        </div>
    </div>
  );

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}/>}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} ${isDark ? 'bg-slate-900 border-r border-slate-800' : 'bg-slate-900 text-slate-300'}`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-800">{isSidebarCollapsed ? <span className="font-bold text-white text-xl">AH</span> : <span className="font-bold text-white text-xl">{businessName}</span>}</div>
        <nav className="p-2 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} collapsed={isSidebarCollapsed} onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false);}}/>
          <SidebarItem icon={Package} label="Inventory" active={activeTab === 'inventory'} collapsed={isSidebarCollapsed} onClick={() => {setActiveTab('inventory'); setIsMobileMenuOpen(false);}}/>
          <SidebarItem icon={Car} label="Finder" active={activeTab === 'related'} collapsed={isSidebarCollapsed} onClick={() => {setActiveTab('related'); setIsMobileMenuOpen(false);}}/>
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} collapsed={isSidebarCollapsed} onClick={() => {setActiveTab('settings'); setIsMobileMenuOpen(false);}}/>
        </nav>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800"><button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full text-slate-400 hover:text-white"><LogOut size={20}/> {!isSidebarCollapsed && <span>Logout</span>}</button></div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className={`h-16 border-b flex items-center justify-between px-4 shrink-0 z-30 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
           <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1"><Menu/></button>
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:block p-1 text-slate-400 hover:text-blue-500"><Menu size={20}/></button>
              <h1 className="font-bold capitalize truncate">{activeTab}</h1>
           </div>
           <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2"><Bell size={22}/>{lowStockItems.length > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>}</button>
           {showNotifications && (
               <>
               <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
               <div className={`absolute top-14 right-2 w-80 rounded-xl shadow-xl border z-50 overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <div className="p-3 border-b font-bold text-sm">Alerts ({lowStockItems.length})</div>
                  <div className="max-h-60 overflow-y-auto">{lowStockItems.map(i => <div key={i.id} onClick={() => {setSelectedProductForDetail(i); setShowNotifications(false);}} className="p-3 border-b text-sm hover:opacity-70 cursor-pointer flex justify-between"><span>{i.name}</span><span className="text-red-500 font-bold">{i.stock} left</span></div>)}</div>
               </div>
               </>
           )}
        </header>

        <div className="flex-1 overflow-hidden relative">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'inventory' && renderInventory()}
            {activeTab === 'related' && renderCarSearch()}
            {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      <AIChatBot products={products} transactions={transactions} isDark={isDark} businessName={businessName} />
      <ProductDetailModal product={selectedProductForDetail} onClose={() => setSelectedProductForDetail(null)} onStockChange={handleStockChange} isDark={isDark} />
      
      {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setIsAddModalOpen(false)}>
              <div className={`w-full max-w-sm rounded-xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                  <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>Add Item</h3>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                      <input className={`w-full border rounded-lg p-3 outline-none ${isDark ? 'bg-slate-800 border-slate-700' : ''}`} placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required/>
                      <input className={`w-full border rounded-lg p-3 outline-none ${isDark ? 'bg-slate-800 border-slate-700' : ''}`} placeholder="Price" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required/>
                      <input className={`w-full border rounded-lg p-3 outline-none ${isDark ? 'bg-slate-800 border-slate-700' : ''}`} placeholder="Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})}/>
                      <input className={`w-full border rounded-lg p-3 outline-none ${isDark ? 'bg-slate-800 border-slate-700' : ''}`} placeholder="Car (e.g. Swift)" value={newProduct.compatibleCars} onChange={e => setNewProduct({...newProduct, compatibleCars: e.target.value})}/>
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Save</button>
                  </form>
              </div>
          </div>
      )}
      
      {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setIsCategoryModalOpen(false)}>
               <div className={`w-full max-w-sm rounded-xl p-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                  <h3 className="font-bold text-lg mb-4">New Category</h3>
                  <form onSubmit={handleAddCategory}>
                      <input className={`w-full border rounded-lg p-3 mb-4 outline-none ${isDark ? 'bg-slate-800 border-slate-700' : ''}`} placeholder="Name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required autoFocus/>
                      <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">Add</button>
                  </form>
               </div>
          </div>
      )}
    </div>
  );
}
