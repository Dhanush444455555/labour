import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { api } from '../../services/api';
import { Users, Briefcase, CalendarCheck, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, activeRes, loginRes] = await Promise.all([
          api.admin.getDashboard(user.uid),
          api.admin.getActiveUsers(user.uid),
          api.admin.getLoginActivity(user.uid)
        ]);
        setData({ ...dashRes, activeUsers: activeRes, loginActivity: loginRes });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  if (loading) return <div className="text-center py-10">Loading Dashboard...</div>;
  if (!data) return <div className="text-center text-red-500 py-10">Failed to load data.</div>;

  const { stats, recentUsers, recentJobs, activeUsers, loginActivity } = data;

  const statCards = [
    { title: 'Currently Active', value: activeUsers.length, icon: <Users className="text-emerald-500" size={32} />, bg: 'bg-emerald-50' },
    { title: 'Total Users', value: stats.totalUsers, icon: <Users className="text-blue-500" size={32} />, bg: 'bg-blue-50' },
    { title: 'Total Laborers', value: stats.totalLaborers, icon: <Users className="text-green-500" size={32} />, bg: 'bg-green-50' },
    { title: 'Total Hirers', value: stats.totalHirers, icon: <Users className="text-purple-500" size={32} />, bg: 'bg-purple-50' },
    { title: 'Total Jobs', value: stats.totalJobs, icon: <Briefcase className="text-yellow-500" size={32} />, bg: 'bg-yellow-50' },
    { title: 'Active Jobs', value: stats.activeJobs, icon: <Briefcase className="text-orange-500" size={32} />, bg: 'bg-orange-50' },
    { title: 'Total Bookings', value: stats.totalBookings, icon: <CalendarCheck className="text-indigo-500" size={32} />, bg: 'bg-indigo-50' },
    { title: 'Pending Bookings', value: stats.pendingBookings, icon: <CalendarCheck className="text-orange-500" size={32} />, bg: 'bg-orange-50' },
    { title: 'Accepted Bookings', value: stats.acceptedBookings, icon: <CalendarCheck className="text-green-500" size={32} />, bg: 'bg-green-50' },
    { title: 'Completed Bookings', value: stats.completedBookings, icon: <CalendarCheck className="text-blue-500" size={32} />, bg: 'bg-blue-50' },
    { title: 'Pending Reports', value: stats.pendingReports, icon: <AlertTriangle className="text-red-500" size={32} />, bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 flex items-center border border-gray-100">
            <div className={`p-4 rounded-full ${card.bg} mr-4`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Recent Registrations</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.map(u => (
              <div key={u.uid} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{u.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500 capitalize">{u.role}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {recentUsers.length === 0 && <div className="p-6 text-center text-gray-500 text-sm">No recent users.</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">Recent Job Posts</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {recentJobs.map(j => (
              <div key={j.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{j.title}</p>
                  <p className="text-sm text-gray-500">by {j.hirer_name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${j.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {j.status}
                </span>
              </div>
            ))}
            {recentJobs.length === 0 && <div className="p-6 text-center text-gray-500 text-sm">No recent jobs.</div>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between">
            <h3 className="font-semibold text-gray-800">Recent Login Activity</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {loginActivity.map(l => (
              <div key={l.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{l.name || 'Unknown User'}</p>
                  <p className="text-sm text-gray-500">{l.phone_number}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${l.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {l.success ? 'Success' : 'Failed'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{new Date(l.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {loginActivity.length === 0 && <div className="p-6 text-center text-gray-500 text-sm">No login activity yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
