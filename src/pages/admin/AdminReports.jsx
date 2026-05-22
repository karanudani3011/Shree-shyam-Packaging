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

// Robust date extractor: prefer t.date, then created_at, then today
const getDateStr = (t) => {
  if (t.date) return t.date.slice(0, 10);
  if (t.created_at) return new Date(t.created_at).toISOString().split('T')[0];
  return new Date().toISOString().split('T')[0];
};

// Format "2026-05-22" → "22 May"
const formatLabel = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const AdminReports = () => {
  const { transactions, products } = useERP();

  // ── Sales by Date (Bar Chart) ──────────────────────────────
  const salesByDate = transactions
    .filter(t => t.type === 'sale')
    .reduce((acc, t) => {
      const dateStr = getDateStr(t);
      acc[dateStr] = (acc[dateStr] || 0) + Number(t.amount || 0);
      return acc;
    }, {});

  const chartData = Object.keys(salesByDate)
    .map(date => ({ date, label: formatLabel(date), amount: salesByDate[date] }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ── Inventory Distribution (Pie Chart) ────────────────────
  const categoryData = products.reduce((acc, p) => {
    const existing = acc.find(item => item.name === p.category);
    if (existing) {
      existing.value += p.stock;
    } else {
      acc.push({ name: p.category, value: p.stock });
    }
    return acc;
  }, []);

  const COLORS = ['#ff7a00', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // ── Daily Profit Analysis (Table) ─────────────────────────
  const dailyData = transactions.reduce((acc, t) => {
    const dateStr = getDateStr(t);
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, sales: 0, purchases: 0, cogs: 0 };
    }
    if (t.type === 'sale') {
      acc[dateStr].sales += Number(t.amount || 0);
      const txCogs = (t.items || []).reduce((sum, item) => {
        const prod = products.find(p => p.id === Number(item.productId));
        const cost = prod ? (prod.cost || 0) : 0;
        return sum + (cost * Number(item.quantity || 0));
      }, 0);
      acc[dateStr].cogs += txCogs;
    } else if (t.type === 'purchase') {
      acc[dateStr].purchases += Number(t.amount || 0);
    }
    return acc;
  }, {});

  const dailyReport = Object.values(dailyData).sort((a, b) => b.date.localeCompare(a.date));

  // Totals
  const totals = dailyReport.reduce((acc, d) => {
    acc.sales += d.sales;
    acc.purchases += d.purchases;
    acc.cogs += d.cogs;
    return acc;
  }, { sales: 0, purchases: 0, cogs: 0 });

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
        {/* ── Sales Bar Chart ── */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Sales Performance (Daily)</h3>
          </div>
          <div style={{ height: '350px' }}>
            {chartData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)', gap: '0.5rem' }}>
                <BarChartIcon size={40} opacity={0.3} />
                <p>No sales recorded yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tickFormatter={v => `₹${v.toLocaleString()}`} width={70} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Sales']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="amount" name="Sales (₹)" fill="#ff7a00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Inventory Pie Chart ── */}
        <div className="admin-card">
          <div className="card-header">
            <h3>Inventory Distribution</h3>
          </div>
          <div style={{ height: '350px' }}>
            {categoryData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-dim)', gap: '0.5rem' }}>
                <PieChartIcon size={40} opacity={0.3} />
                <p>No inventory data</p>
              </div>
            ) : (
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
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Daily Profit Table ── */}
      <div className="admin-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h3>Daily Profit Analysis</h3>
          {dailyReport.length > 0 && (
            <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-dim)' }}>
              {dailyReport.length} day{dailyReport.length > 1 ? 's' : ''} of data
            </span>
          )}
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
              {dailyReport.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--admin-text-dim)', padding: '2rem' }}>
                    No sales or purchases recorded yet.
                  </td>
                </tr>
              ) : (
                <>
                  {dailyReport.map(day => {
                    const grossProfit = day.sales - day.cogs;
                    const margin = day.sales > 0 ? ((grossProfit / day.sales) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={day.date}>
                        <td>
                          <strong>{formatLabel(day.date)}</strong>{' '}
                          <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.8rem' }}>{day.date}</span>
                        </td>
                        <td style={{ color: '#10b981', fontWeight: '600' }}>₹{day.sales.toLocaleString()}</td>
                        <td style={{ color: '#f59e0b', fontWeight: '600' }}>₹{day.purchases.toLocaleString()}</td>
                        <td style={{ color: grossProfit >= 0 ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                          ₹{grossProfit.toLocaleString()}
                        </td>
                        <td style={{ color: Number(margin) >= 20 ? '#10b981' : Number(margin) >= 0 ? '#f59e0b' : '#ef4444', fontWeight: '700' }}>
                          {margin}%
                        </td>
                      </tr>
                    );
                  })}
                  {/* Totals Row */}
                  <tr style={{ borderTop: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}>
                    <td><strong>TOTAL</strong></td>
                    <td style={{ color: '#10b981', fontWeight: '800' }}>₹{totals.sales.toLocaleString()}</td>
                    <td style={{ color: '#f59e0b', fontWeight: '800' }}>₹{totals.purchases.toLocaleString()}</td>
                    <td style={{ color: (totals.sales - totals.cogs) >= 0 ? '#10b981' : '#ef4444', fontWeight: '800' }}>
                      ₹{(totals.sales - totals.cogs).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--admin-text-dim)', fontWeight: '800' }}>
                      {totals.sales > 0 ? (((totals.sales - totals.cogs) / totals.sales) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
