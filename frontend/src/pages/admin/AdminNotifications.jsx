import { useState, useContext } from 'react';
import { AuthContext } from '../../App';
import { api } from '../../services/api';
import { Bell, Send } from 'lucide-react';

export default function AdminNotifications() {
  const { user } = useContext(AuthContext);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    target_users: 'ALL',
    type: 'SYSTEM',
    title: '',
    message: ''
  });

  const handleSend = async (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to push this notification?')) return;
    
    setSending(true);
    try {
      const res = await api.admin.sendNotification(user.uid, formData);
      alert(`Successfully sent notification to ${res.count} users!`);
      setFormData({ ...formData, title: '', message: '' }); // reset form
    } catch (err) {
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-3xl mx-auto">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
        <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
          <Bell size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">Push Notifications</h3>
          <p className="text-sm text-gray-500">Send real-time alerts to users' devices</p>
        </div>
      </div>
      
      <form onSubmit={handleSend} className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Target Audience</label>
            <select 
              value={formData.target_users}
              onChange={e => setFormData({...formData, target_users: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Users (Laborers & Hirers)</option>
              <option value="LABORERS">All Laborers Only</option>
              <option value="HIRERS">All Hirers (Farm Owners) Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Notification Type</label>
            <select 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="SYSTEM">System Alert</option>
              <option value="UPDATE">App Update</option>
              <option value="WARNING">Important Warning</option>
              <option value="PROMO">Promotion / News</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Notification Title</label>
          <input 
            type="text" 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Server Maintenance Notice"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Message Body</label>
          <textarea 
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm h-32 focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message here..."
            required
          />
          <p className="text-xs text-gray-400 mt-2">This message will be sent in real-time to active users and saved in their notification inbox.</p>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button 
            type="submit"
            disabled={sending || !formData.title || !formData.message}
            className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-sm font-medium text-white flex items-center gap-2 disabled:opacity-50 shadow-sm transition-colors"
          >
            <Send size={18} /> {sending ? 'Sending...' : 'Dispatch Notification'}
          </button>
        </div>
      </form>
    </div>
  );
}
