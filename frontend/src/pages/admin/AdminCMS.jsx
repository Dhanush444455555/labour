import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { api } from '../../services/api';
import { FileText, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export default function AdminCMS() {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    type: 'ANNOUNCEMENT',
    title: '',
    content: '',
    is_active: 1
  });

  const fetchContent = async () => {
    try {
      const res = await api.admin.getCMS(user.uid);
      setContent(res);
    } catch (err) {
      console.error("Failed to fetch CMS content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [user]);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item.id);
      setFormData({ type: item.type, title: item.title, content: item.content, is_active: item.is_active });
    } else {
      setEditingItem(null);
      setFormData({ type: 'ANNOUNCEMENT', title: '', content: '', is_active: 1 });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.admin.updateCMS(user.uid, editingItem, formData);
      } else {
        await api.admin.createCMS(user.uid, formData);
      }
      setModalOpen(false);
      fetchContent();
    } catch (err) {
      alert('Failed to save content');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      await api.admin.deleteCMS(user.uid, id);
      fetchContent();
    } catch (err) {
      alert('Failed to delete content');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">Content Management (CMS)</h3>
            <p className="text-sm text-gray-500">Manage announcements, notices, and categories</p>
          </div>
        </div>
        <button 
          onClick={() => openModal()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> New Content
        </button>
      </div>
      
      {loading ? (
        <div className="p-10 text-center text-gray-500">Loading content...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {content.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium border border-gray-200">
                      {c.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{c.title}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {c.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => openModal(c)} className="text-blue-600 hover:text-blue-800 p-1 mr-2" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {content.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No content found. Click 'New Content' to create some.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Content Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">{editingItem ? 'Edit Content' : 'Create Content'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="ANNOUNCEMENT">Announcement</option>
                    <option value="NOTICE">App Notice</option>
                    <option value="CATEGORY">Work Category</option>
                    <option value="PAGE">Custom Page</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value={1}>Active / Published</option>
                    <option value={0}>Draft / Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="e.g. Welcome to FarmConnect"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Content</label>
                <textarea 
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm h-40"
                  placeholder="Enter HTML or plain text content here..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 rounded-md text-sm font-medium text-white hover:bg-purple-700 flex items-center gap-2"
                >
                  <Check size={16} /> Save Content
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
