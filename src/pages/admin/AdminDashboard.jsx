import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useERP } from '../../context/ERPContext';
import './AdminPages.css';

const data = [
  { name: 'Mon', sales: 4000, profit: 2400 },
  { name: 'Tue', sales: 3000, profit: 1398 },
  { name: 'Wed', sales: 2000, profit: 9800 },
  { name: 'Thu', sales: 2780, profit: 3908 },
  { name: 'Fri', sales: 1890, profit: 4800 },
  { name: 'Sat', sales: 2390, profit: 3800 },
  { name: 'Sun', sales: 3490, profit: 4300 },
];

const StatCard = ({ title, value, icon, trend, trendValue, color }) => (
  <div className="admin-card stat-card">
    <div className="stat-header">
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
        {icon}
      </div>
      <div className={`stat-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
        {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {trendValue}
      </div>
    </div>
    <div className="stat-body">
      <p className="stat-title">{title}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { products, transactions, customers } = useERP();

  const totalSales = transactions
    .filter(t => t.type === 'sale')
    .reduce((acc, t) => acc + t.amount, 0);
  
  const lowStockCount = products.filter(p => p.stock < 100).length;

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <StatCard 
          title="Total Sales" 
          value={`₹${totalSales.toLocaleString()}`} 
          icon={<TrendingUp />} 
          trend="up" 
          trendValue="+12.5%" 
          color="#ff7a00"
        />
        <StatCard 
          title="Total Customers" 
          value={customers.length} 
          icon={<Users />} 
          trend="up" 
          trendValue="+3" 
          color="#10b981"
        />
        <StatCard 
          title="Total Products" 
          value={products.length} 
          icon={<Package />} 
          trend="up" 
          trendValue="+2" 
          color="#f59e0b"
        />
        <StatCard 
          title="Low Stock Items" 
          value={lowStockCount} 
          icon={<AlertCircle />} 
          trend="down" 
          trendValue="-1" 
          color="#ef4444"
        />
      </div>

      <div className="dashboard-grid">
        <div className="admin-card chart-container">
          <div className="card-header">
            <h3>Revenue Overview</h3>
            <select className="glass-select">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff7a00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff7a00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="sales" stroke="#ff7a00" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card recent-activity">
          <div className="card-header">
            <h3>Recent Transactions</h3>
            <button className="text-btn">View All</button>
          </div>
          <div className="activity-list">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="activity-item">
                <div className={`activity-icon ${tx.type}`}>
                  {tx.type === 'sale' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <div className="activity-info">
                  <p className="activity-title">{tx.customer || tx.seller}</p>
                  <p className="activity-date">{tx.date}</p>
                </div>
                <div className="activity-amount">
                  <span className={tx.type}>{tx.type === 'sale' ? '+' : '-'} ₹{tx.amount}</span>
                  <span className={`status-badge ${tx.status}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
