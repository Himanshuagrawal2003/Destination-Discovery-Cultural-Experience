import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdPeople, MdPlace, MdRateReview, MdMap } from 'react-icons/md';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const COLORS = ['#4F46E5', '#06B6D4', '#EC4899', '#EF4444', '#10B981'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 skeleton" />
          ))}
        </div>
        <div className="h-96 skeleton w-full" />
      </div>
    );
  }

  const { stats = {}, recentUsers = [], popularDestinations = [], userGrowth = [], reviewDistribution = [] } = analytics || {};

  // Formatted chart data for user growth
  const chartData = userGrowth.map((item) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      name: months[(item._id - 1) % 12] || `M${item._id}`,
      Users: item.count,
    };
  });

  // Formatted distribution pie chart data
  const pieData = reviewDistribution.map((item) => ({
    name: `${item._id} Star`,
    value: item.count,
  }));

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">🛡️ Admin Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Platform analytics, user growth reports, and destinations feedback statistics.</p>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', val: stats.totalUsers || 0, icon: MdPeople, col: 'text-teal-600 bg-teal-50 dark:bg-teal-950/30' },
          { label: 'Destinations', val: stats.totalDestinations || 0, icon: MdPlace, col: 'text-amber-600 bg-amber-50 dark:bg-amber-955/20' },
          { label: 'Total Reviews', val: stats.totalReviews || 0, icon: MdRateReview, col: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30' },
          { label: 'Planned Trips', val: stats.totalTrips || 0, icon: MdMap, col: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-955/20' },
        ].map((item, idx) => (
          <div key={idx} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.col}`}>
              <item.icon className="text-2xl" />
            </div>
            <div>
              <p className="text-2xs text-slate-500 dark:text-dark-muted font-bold uppercase tracking-wider">{item.label}</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Line Chart */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white font-display">User Registrations (Last 6 Months)</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#0b1528', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                  <Line type="monotone" dataKey="Users" stroke="#06B6D4" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 text-center py-20">Insufficient data to display registrations chart.</p>
            )}
          </div>
        </div>

        {/* Rating Distribution Pie Chart */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white font-display">Review Rating Distribution</h3>
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-4">
            {pieData.length > 0 ? (
              <>
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-2xs font-semibold text-slate-500">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                      <span>{item.name}: {item.value} review(s)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 text-center py-20">No reviews ratings logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tables split list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular Destinations */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white font-display">Most Visited Destinations</h3>
          <div className="overflow-x-auto">
            <table className="table-cq">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Country</th>
                  <th>Views</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                {popularDestinations.map((dest) => (
                  <tr key={dest._id}>
                    <td>{dest.name}</td>
                    <td>{dest.country}</td>
                    <td>👁️ {dest.viewCount || 0}</td>
                    <td>⭐ {dest.rating?.average || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent users list */}
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white font-display">Recent Registrations</h3>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u._id} className="flex justify-between items-center gap-4 text-xs font-semibold border-b border-slate-50 dark:border-slate-800/40 pb-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}&background=4f46e5&color=fff`}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-slate-850 dark:text-white">{u.name}</h4>
                    <p className="text-slate-450 dark:text-dark-muted font-medium">{u.email}</p>
                  </div>
                </div>
                <span className="badge bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300 font-bold capitalize">{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
