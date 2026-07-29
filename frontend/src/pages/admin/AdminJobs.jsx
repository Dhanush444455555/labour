import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { api } from '../../services/api';

export default function AdminJobs() {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.admin.getJobs(user.uid);
        setJobs(res);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [user]);

  const filteredJobs = jobs.filter(j => 
    (j.title && j.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (j.hirer_name && j.hirer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-800 text-lg">Job Posts</h3>
        <input
          type="text"
          placeholder="Search jobs..."
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
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Hirer</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Date/Time</th>
                <th className="p-4 font-medium">Wage</th>
                <th className="p-4 font-medium">Workers</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredJobs.map(j => (
                <tr key={j.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{j.title}</td>
                  <td className="p-4 text-gray-600">{j.hirer_name}<br/><span className="text-xs text-gray-400">{j.hirer_phone}</span></td>
                  <td className="p-4 text-gray-600">{j.location}</td>
                  <td className="p-4 text-gray-600">{new Date(j.work_date).toLocaleDateString()}<br/><span className="text-xs text-gray-400">{j.work_time}</span></td>
                  <td className="p-4 text-gray-600 text-green-600 font-medium">{j.wage}</td>
                  <td className="p-4 text-gray-600">{j.laborers_required}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      j.status === 'OPEN' ? 'bg-green-100 text-green-700' : 
                      j.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {j.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No jobs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
