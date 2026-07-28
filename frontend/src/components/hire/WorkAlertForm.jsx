import { useState, useContext } from 'react';
import { api } from '../../services/api';
import { AuthContext } from '../../App';
import { Send, CheckCircle2, Megaphone } from 'lucide-react';

export default function WorkAlertForm({ onJobCreated }) {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    location: user?.location || '',
    workDate: 'Tomorrow',
    workTime: '08:00 AM',
    laborersRequired: '2',
    wage: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createWorkAlert(user.uid, formData);
      setSuccess(true);
      if (onJobCreated) onJobCreated();
      // Reset form after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        setFormData({ ...formData, title: '', wage: '' });
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to create work alert');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300 pb-10">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Megaphone className="w-5 h-5 mr-2 text-green-600" />
          Offer Job to Laborers
        </h2>
        <p className="text-gray-500 text-xs mt-0.5">Broadcast a work alert to all available laborers</p>
      </div>

      {success && (
        <div className="bg-green-600 text-white p-4 rounded-xl shadow-md flex items-center space-x-3 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Job Posted Successfully!</p>
            <p className="text-xs text-green-100">Laborers will be notified immediately.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Work Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Tomato Harvesting"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Laborers Required *</label>
          <input
            type="number"
            required
            min="1"
            value={formData.laborersRequired}
            onChange={e => setFormData({ ...formData, laborersRequired: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Daily Wage (₹) *</label>
          <input
            type="text"
            required
            value={formData.wage}
            onChange={e => setFormData({ ...formData, wage: e.target.value })}
            placeholder="e.g. 700"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-bold text-green-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Location *</label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium"
          />
        </div>
        
        <div className="flex space-x-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
            <input
              type="text"
              value={formData.workDate}
              onChange={e => setFormData({ ...formData, workDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
            <input
              type="text"
              value={formData.workTime}
              onChange={e => setFormData({ ...formData, workTime: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-base active:scale-95 mt-4 disabled:bg-gray-400"
        >
          <Send className="w-5 h-5" />
          <span>{loading ? 'Posting...' : 'Post Job to Laborers'}</span>
        </button>
      </form>
    </div>
  );
}
