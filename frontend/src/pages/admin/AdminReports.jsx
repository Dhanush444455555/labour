import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { api } from '../../services/api';
import { CheckCircle } from 'lucide-react';

export default function AdminReports() {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      const res = await api.admin.getReports(user.uid);
      setReports(res);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    if (!window.confirm('Mark this report as resolved?')) return;
    try {
      await api.admin.resolveReport(user.uid, id);
      setReports(reports.map(r => r.id === id ? { ...r, status: 'RESOLVED', resolved_at: new Date().toISOString() } : r));
    } catch (err) {
      alert("Failed to resolve report");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-800 text-lg">User Reports & Complaints</h3>
      </div>
      
      {loading ? (
        <div className="p-10 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Reporter ID</th>
                <th className="p-4 font-medium">Reported ID</th>
                <th className="p-4 font-medium">Reason</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs text-gray-600">{r.reporter_id}</td>
                  <td className="p-4 font-mono text-xs text-gray-600">{r.reported_id || '-'}</td>
                  <td className="p-4 font-medium text-gray-800">{r.reason}</td>
                  <td className="p-4 text-gray-600 max-w-xs truncate" title={r.description}>{r.description || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    {r.status === 'OPEN' && (
                      <button onClick={() => handleResolve(r.id)} className="text-green-600 hover:text-green-800 flex items-center justify-end w-full">
                        <CheckCircle size={18} className="mr-1"/> Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No reports found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
