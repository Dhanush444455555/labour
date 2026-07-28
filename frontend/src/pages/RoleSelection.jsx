import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Users, Tractor } from 'lucide-react';
import { api } from '../services/api';

export default function RoleSelection() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSelectRole = async (role) => {
    if (!name.trim()) {
      alert("Please enter your name first");
      return;
    }
    setLoading(true);
    try {
      const data = await api.updateProfile(user.uid, { role, name });
      setUser(data);

      if (role === 'laborer') navigate('/laborer');
      else navigate('/owner');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col flex-1 w-full space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 mt-4">
        <h2 className="text-2xl font-bold text-gray-800">Complete Profile</h2>
        <p className="text-gray-500 text-sm">Tell us who you are</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <label className="block text-sm font-semibold text-gray-700">Full Name</label>
        <input 
          type="text" 
          placeholder="e.g. Raju Kumar"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <p className="text-center font-medium text-gray-600">I want to...</p>

        <button 
          onClick={() => handleSelectRole('laborer')}
          disabled={loading}
          className="w-full bg-white hover:bg-green-50 border-2 border-transparent hover:border-green-200 p-6 rounded-2xl shadow-md transition-all flex items-center space-x-4 active:scale-95 group"
        >
          <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
            <Users className="w-8 h-8 text-green-700" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-800">Work as Laborer</h3>
            <p className="text-gray-500 text-sm">Find farm work for tomorrow</p>
          </div>
        </button>

        <button 
          onClick={() => handleSelectRole('farmowner')}
          disabled={loading}
          className="w-full bg-white hover:bg-amber-50 border-2 border-transparent hover:border-amber-200 p-6 rounded-2xl shadow-md transition-all flex items-center space-x-4 active:scale-95 group"
        >
          <div className="bg-amber-100 p-3 rounded-full group-hover:bg-amber-200 transition-colors">
            <Tractor className="w-8 h-8 text-amber-700" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-800">Hire Laborers</h3>
            <p className="text-gray-500 text-sm">Find workers for your farm</p>
          </div>
        </button>
      </div>
    </div>
  );
}
