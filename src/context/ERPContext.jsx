import React, { createContext, useState, useContext, useEffect } from 'react';

const ERPContext = createContext();

// Unified product data — single source of truth for both admin and client
const defaultProducts = [
  {
    id: 1,
    name: 'Premium Corrugated Mailer',
    category: 'Boxes',
    stock: 1200,
    price: 150,
    cost: 100,
    sku: 'BX-001',
    image: '/product.png',
    dimensions: '10x8x4 inches',
    material: 'Kraft Corrugated Cardboard',
    moq: '500 pcs',
    hasVideo: false,
    outOfStock: false,
    date: '2023-10-01'
  },
  {
    id: 2,
    name: 'Luxury Rigid Gift Box',
    category: 'Boxes',
    stock: 450,
    price: 320,
    cost: 220,
    sku: 'BX-002',
    image: '/product.png',
    dimensions: '12x12x5 inches',
    material: 'Rigid Greyboard with Matte Lamination',
    moq: '200 pcs',
    hasVideo: true,
    outOfStock: false,
    date: '2023-11-15'
  },
  {
    id: 3,
    name: 'Custom Printed Kraft Bag',
    category: 'Bags',
    stock: 2500,
    price: null,
    cost: 30,
    sku: 'BG-001',
    image: '/product.png',
    dimensions: '10x5x13 inches',
    material: 'Recycled Kraft Paper',
    moq: '1000 pcs',
    hasVideo: false,
    outOfStock: false,
    date: '2024-01-10'
  },
  {
    id: 4,
    name: 'Industrial Stretch Film',
    category: 'Polythene',
    stock: 80,
    price: 1200,
    cost: 950,
    sku: 'PL-001',
    image: '/product.png',
    dimensions: '18 inches x 1500 feet',
    material: 'LLDPE',
    moq: '50 rolls',
    hasVideo: false,
    outOfStock: false,
    date: '2023-09-05'
  },
  {
    id: 5,
    name: 'Semi-Auto Strapping Machine',
    category: 'Machines',
    stock: 5,
    price: null,
    cost: 45000,
    sku: 'MC-001',
    image: '/product.png',
    dimensions: '900x580x750 mm',
    material: 'Steel Frame',
    moq: '1 unit',
    hasVideo: true,
    outOfStock: false,
    date: '2024-02-20'
  },
  {
    id: 6,
    name: 'Premium Thank You Cards',
    category: 'Cards',
    stock: 5000,
    price: 15,
    cost: 8,
    sku: 'CD-001',
    image: '/product.png',
    dimensions: '4x6 inches',
    material: '350gsm Art Paper',
    moq: '1000 pcs',
    hasVideo: false,
    outOfStock: false,
    date: '2024-03-01'
  }
];

// Load products from localStorage or use defaults
const loadProducts = () => {
  try {
    const stored = localStorage.getItem('erp_products');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load products from localStorage', e);
  }
  return defaultProducts;
};

export const CATEGORIES = ['Box', 'Bag', 'Polythene', 'Machine', 'Cards'];

export const ERPProvider = ({ children }) => {
  const [products, setProducts] = useState(loadProducts);

  const [customers, setCustomers] = useState([
    { 
      id: 1, 
      name: 'John Doe', 
      phone: '9876543210', 
      email: 'john@example.com', 
      credit: 5000,
      interestEnabled: true,
      lastInterestCalc: '2024-05-01'
    },
    { id: 2, name: 'Tech Solutions', phone: '9988776655', email: 'info@techsol.com', credit: 0, interestEnabled: false },
  ]);

  const [sellers, setSellers] = useState([
    { id: 1, name: 'Kraft Materials Inc', phone: '9123456789', email: 'sales@kraft.com', balance: 12000 },
  ]);

  const [transactions, setTransactions] = useState([
    { id: 'INV-001', type: 'sale', date: '2024-05-01', customer: 'John Doe', amount: 1500, profit: 500, status: 'paid', paymentMode: 'cash' },
    { id: 'PUR-001', type: 'purchase', date: '2024-05-02', seller: 'Kraft Materials Inc', amount: 8000, status: 'paid', paymentMode: 'cash' },
  ]);

  const [accounting, setAccounting] = useState({
    receipts: [],
    payments: [],
    expenses: [],
    income: []
  });

  // Persist products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('erp_products', JSON.stringify(products));
  }, [products]);

  // Actions
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      outOfStock: product.outOfStock || false,
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleOutOfStock = (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, outOfStock: !p.outOfStock } : p));
  };

  const updateStock = (id, quantity) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: p.stock + quantity } : p));
  };

  const addTransaction = (tx) => {
    const newTx = { 
      ...tx, 
      id: tx.id || `TX-${Date.now()}`, 
      date: new Date().toISOString().split('T')[0],
      paymentMode: tx.paymentMode || 'cash'
    };
    setTransactions(prev => [newTx, ...prev]);
    
    // Update customer/seller balance if credit
    if (newTx.paymentMode === 'credit') {
      if (newTx.type === 'sale') {
        setCustomers(prev => prev.map(c => c.name === newTx.customer ? { ...c, credit: (c.credit || 0) + newTx.amount } : c));
      } else {
        setSellers(prev => prev.map(s => s.name === newTx.seller ? { ...s, balance: (s.balance || 0) + newTx.amount } : s));
      }
    }
  };

  const addAccountingEntry = (type, entry) => {
    setAccounting(prev => ({
      ...prev,
      [type]: [{ ...entry, id: Date.now(), date: new Date().toISOString().split('T')[0] }, ...prev[type]]
    }));
  };

  const clearInventory = () => {
    setProducts([]);
    setTransactions([]);
    localStorage.removeItem('erp_products');
  };

  return (
    <ERPContext.Provider value={{
      products, setProducts, addProduct, updateProduct, deleteProduct, updateStock, toggleOutOfStock, clearInventory,
      customers, setCustomers,
      sellers, setSellers,
      transactions, addTransaction,
      accounting, addAccountingEntry,
      CATEGORIES
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => useContext(ERPContext);
