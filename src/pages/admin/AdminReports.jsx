import React from 'react';
import { 
  BarChart as BarChartIcon, 
  Download, 
  FileSpreadsheet, 
  FileText,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import * as XLSX from 'xlsx';
import { useERP } from '../../context/ERPContext';
import './AdminPages.css';

const AdminReports = () => {
  const { transactions, products } = useERP();

  const salesByDate = transactions
    .filter(t => t.type === 'sale')
    .reduce((acc, t) => {
      acc[t.date] = (acc[t.date] || 0) + t.amount;
      return acc;
    }, {});

  const chartData = Object.keys(salesByDate).map(date => ({
    date,
    amount: salesByDate[date]
  }));

  const categoryData = products.reduce((acc, p) => {
    const existing = acc.find(item => item.name === p.category);
    if (existing) {
      existing.value += p.stock;
    } else {
      acc.push({ name: p.category, value: p.stock });
    }
    return acc;
  }, []);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, `Business_Report_${Date.now()}.xlsx`);
  };

  return (
    <div className="admin-reports">
      <div className="reports-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div className="report-types" style={{ display: 'flex', gap: '1rem' }}>
          <button className="glass-btn"><BarChartIcon size={18} /> Sales Report</button>
          <button className="glass-btn" style={{ background: 'rgba(255,255,255,0.05)' }}><PieChartIcon size={18} /> Inventory Analysis</button>
        </div>
        <div className="export-btns" style={{ display: 'flex', gap: '1rem' }}>
          <button className="glass-btn" onClick={exportToExcel} style={{ background: '#10b981' }}>
            <FileSpreadsheet size={18} /> Export Excel
          </button>
          <button className="glass-btn" style={{ background: '#ef4444' }}>
            <FileText size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="admin-card">
          <div className="card-header">
            <h3>Sales Performance (Daily)</h3>
          </div>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Legend />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <div className="card-header">
            <h3>Inventory Distribution</h3>
          </div>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3>Daily Profit Analysis</h3>
        </div>
        <div className="profit-table admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Sales</th>
                <th>Total Purchases</th>
                <th>Gross Profit</th>
                <th>Margin (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2024-05-10</td>
                <td>₹12,450</td>
                <td>₹8,200</td>
                <td style={{ color: '#10b981', fontWeight: '700' }}>₹4,250</td>
                <td>34.1%</td>
              </tr>
              <tr>
                <td>2024-05-09</td>
                <td>₹8,900</td>
                <td>₹5,100</td>
                <td style={{ color: '#10b981', fontWeight: '700' }}>₹3,800</td>
                <td>42.7%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
