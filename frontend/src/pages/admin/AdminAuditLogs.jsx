import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { api } from '../../services/api';

export default function AdminAuditLogs() {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.admin.getAuditLogs(user.uid);
        setLogs(res);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user]);

  const filteredLogs = logs.filter(l => 
    (l.action && l.action.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.target && l.target.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.admin_id && l.admin_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-800 text-lg">System Audit Logs</h3>
        <input
          type="text"
          placeholder="Search logs..."
          className="border border-gray-300 rounded-md px-4 py-2 w-64 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="p-10 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Admin ID</th>
                <th className="p-4 font-medium">Action</th>
                <th className="p-4 font-medium">Target ID</th>
                <th className="p-4 font-medium">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredLogs.map(l => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="p-4 text-gray-500">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="p-4 font-mono text-xs text-gray-600">{l.admin_id}</td>
                  <td className="p-4 font-medium text-gray-800">{l.action}</td>
                  <td className="p-4 font-mono text-xs text-gray-600">{l.target}</td>
                  <td className="p-4 text-gray-500 font-mono text-xs">
                    {l.metadata ? JSON.stringify(JSON.parse(l.metadata)) : '-'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
