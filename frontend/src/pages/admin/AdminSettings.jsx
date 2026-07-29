import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { api } from '../../services/api';
import { Save, Settings as SettingsIcon } from 'lucide-react';

export default function AdminSettings() {
  const { user } = useContext(AuthContext);
  const [settings, setSettings] = useState({});
  const [descriptions, setDescriptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.admin.getSettings(user.uid);
        const map = {};
        const descMap = {};
        data.forEach(s => {
          map[s.key] = s.value;
          descMap[s.key] = s.description;
        });
        setSettings(map);
        setDescriptions(descMap);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [user]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.admin.updateSettings(user.uid, settings);
      alert('Settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">Application Settings</h3>
          <p className="text-sm text-gray-500">Manage global configuration for the platform</p>
        </div>
      </div>
      
      <form onSubmit={handleSave} className="p-6 space-y-6">
        <div className="space-y-6">
          {Object.keys(settings).map(key => (
            <div key={key} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </label>
                <p className="text-xs text-gray-500">{descriptions[key]}</p>
              </div>
              
              <div className="w-full md:w-96">
                {settings[key] === 'true' || settings[key] === 'false' ? (
                  <select 
                    value={settings[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="true">Enabled (True)</option>
                    <option value="false">Disabled (False)</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={settings[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button 
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
