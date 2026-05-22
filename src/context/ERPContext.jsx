import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const ERPContext = createContext();

export const CATEGORIES = ['Dabbi', 'bags', 'cards', 'plastic box', 'paper boxes', 'Tap'];

export const ERPProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('erp_customers');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'John Doe', phone: '9876543210', email: 'john@example.com', credit: 5000, interestEnabled: false },
      { id: 2, name: 'Tech Solutions', phone: '9988776655', email: 'info@techsol.com', credit: 0, interestEnabled: false },
    ];
  });
  const [sellers, setSellers] = useState(() => {
    const saved = localStorage.getItem('erp_sellers');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Kraft Materials Inc', phone: '9123456789', email: 'sales@kraft.com', balance: 12000 },
    ];
  });
  const [transactions, setTransactions] = useState([]);
  const [accounting, setAccounting] = useState({
    receipts: [],
    payments: [],
    expenses: [],
    income: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // Save to local storage when state changes
  useEffect(() => {
    localStorage.setItem('erp_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('erp_sellers', JSON.stringify(sellers));
  }, [sellers]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Products
      const { data: prodData } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
      setProducts(prodData || []);

      // Fetch Transactions
      const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      setTransactions(txData || []);

      // Fetch Accounting
      const { data: accData } = await supabase.from('accounting').select('*').order('date', { ascending: false });
      if (accData) {
        const organized = accData.reduce((acc, entry) => {
          acc[entry.type].push(entry);
          return acc;
        }, { receipts: [], payments: [], expenses: [], income: [] });
        setAccounting(organized);
      }

    } catch (err) {
      console.error('Error fetching ERP data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const addProduct = async (product) => {
    const { data, error } = await supabase
      .from('inventory')
      .insert([product])
      .select();
    
    if (!error && data) {
      setProducts(prev => [data[0], ...prev]);
    }
    return { success: !error, error };
  };

  const updateProduct = async (id, updates) => {
    const { data, error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (!error && data) {
      setProducts(prev => prev.map(p => p.id === id ? data[0] : p));
    }
    return { success: !error, error };
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
    return { success: !error, error };
  };

  const toggleOutOfStock = async (id) => {
    const product = products.find(p => p.id === id);
    return updateProduct(id, { out_of_stock: !product.out_of_stock });
  };

  const updateStock = async (id, quantity) => {
    const product = products.find(p => p.id === id);
    return updateProduct(id, { stock: (product.stock || 0) + quantity });
  };

  const addTransaction = async (tx) => {
    // Robust mapping for DB schema
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dbTx = {
      id: tx.id || `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: tx.type,
      date: tx.date || today,
      customer: tx.type === 'sale' ? (tx.customer || 'Walk-in Customer') : null,
      seller: tx.type === 'purchase' ? (tx.customer || 'Main Supplier') : null,
      amount: Number(tx.amount),
      status: tx.status,
      payment_mode: tx.paymentMode || tx.payment_mode || 'cash',
      items: tx.items || []
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([dbTx])
      .select();
    
    if (error) {
      console.error("Supabase transaction insert error:", error);
    }
    
    if (!error && data) {
      setTransactions(prev => [data[0], ...prev]);
    }
    return { success: !error, error };
  };

  const addAccountingEntry = async (type, entry) => {
    const { data, error } = await supabase
      .from('accounting')
      .insert([{ ...entry, type }])
      .select();
    
    if (!error && data) {
      setAccounting(prev => ({
        ...prev,
        [type]: [data[0], ...prev[type]]
      }));
    }
    return { success: !error, error };
  };

  const updateTransactionStatus = async (id, status) => {
    return updateTransaction(id, { status });
  };

  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
    return { success: !error, error };
  };

  const updateTransaction = async (id, updates) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (!error && data) {
      setTransactions(prev => prev.map(t => t.id === id ? data[0] : t));
    }
    return { success: !error, error };
  };

  const clearInventory = async () => {
    // Dangerous operation, handle with care
    const { error: err1 } = await supabase.from('inventory').delete().neq('id', 0);
    const { error: err2 } = await supabase.from('transactions').delete().neq('id', '');
    if (!err1 && !err2) {
      setProducts([]);
      setTransactions([]);
    }
  };

  return (
    <ERPContext.Provider value={{
      products, addProduct, updateProduct, deleteProduct, updateStock, toggleOutOfStock, clearInventory,
      customers, setCustomers,
      sellers, setSellers,
      transactions, addTransaction, updateTransactionStatus, deleteTransaction, updateTransaction,
      accounting, addAccountingEntry,
      loading,
      CATEGORIES
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => useContext(ERPContext);
