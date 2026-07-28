import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Phone, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { joinUserRoom } from '../socket';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.login(cleanPhone);
      setUser(data);
      joinUserRoom(data.uid);

      if (data.role === 'laborer') navigate('/laborer');
      else if (data.role === 'farmowner') navigate('/owner');
      else navigate('/role');
    } catch (err) {
      setError(err.message || 'Cannot connect to server. Is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full text-center space-y-6">
        <div className="mx-auto bg-green-100 p-4 rounded-full inline-block">
          <Phone className="w-10 h-10 text-green-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome</h2>
          <p className="text-gray-500 text-sm mt-1">Enter your phone number to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 font-semibold">+91</span>
            <input
              type="tel"
              placeholder="9876543210"
              maxLength={10}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all text-lg tracking-wider"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:bg-gray-400"
          >
            <span>{loading ? 'Logging in...' : 'Continue'}</span>
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
