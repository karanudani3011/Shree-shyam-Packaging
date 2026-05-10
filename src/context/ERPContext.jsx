import React, { createContext, useState, useContext, useEffect } from 'react';

const ERPContext = createContext();

export const ERPProvider = ({ children }) => {
  // Initial Mock Data
  const [products, setProducts] = useState([
    { id: 1, name: 'Premium Corrugated Mailer', category: 'Boxes', stock: 1200, price: 150, cost: 100, sku: 'BX-001' },
    { id: 2, name: 'Luxury Rigid Gift Box', category: 'Boxes', stock: 450, price: 320, cost: 220, sku: 'BX-002' },
    { id: 3, name: 'Custom Printed Kraft Bag', category: 'Bags', stock: 2500, price: 45, cost: 30, sku: 'BG-001' },
    { id: 4, name: 'Industrial Stretch Film', category: 'Polythene', stock: 80, price: 1200, cost: 950, sku: 'PL-001' },
  ]);

  const [customers, setCustomers] = useState([
    { id: 1, name: 'John Doe', phone: '9876543210', email: 'john@example.com', credit: 5000 },
    { id: 2, name: 'Tech Solutions', phone: '9988776655', email: 'info@techsol.com', credit: 0 },
  ]);

  const [sellers, setSellers] = useState([
    { id: 1, name: 'Kraft Materials Inc', phone: '9123456789', email: 'sales@kraft.com', balance: 12000 },
  ]);

  const [transactions, setTransactions] = useState([
    { id: 'INV-001', type: 'sale', date: '2024-05-01', customer: 'John Doe', amount: 1500, profit: 500, status: 'paid' },
    { id: 'PUR-001', type: 'purchase', date: '2024-05-02', seller: 'Kraft Materials Inc', amount: 8000, status: 'paid' },
  ]);

  // Actions
  const addProduct = (product) => setProducts([...products, { ...product, id: Date.now() }]);
  const updateStock = (id, quantity) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: p.stock + quantity } : p));
  };

  const addTransaction = (tx) => {
    setTransactions([{ ...tx, id: tx.id || `TX-${Date.now()}`, date: new Date().toISOString().split('T')[0] }, ...transactions]);
    if (tx.type === 'sale' && tx.customerId) {
      // Update customer credit if status is pending
    }
  };

  return (
    <ERPContext.Provider value={{
      products, setProducts, addProduct, updateStock,
      customers, setCustomers,
      sellers, setSellers,
      transactions, addTransaction
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => useContext(ERPContext);
