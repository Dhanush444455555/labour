import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Hand, CheckCircle2, LogOut, X } from 'lucide-react';

export default function LaborerDashboard() {
  const { user, setUser } = useContext(AuthContext);
  const [raised, setRaised] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/availability', {
        headers: { 'x-user-uid': user.uid }
      });
      const data = await response.json();
      if (data.status === 'available') {
        setRaised(true);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleRaiseHand = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/availability', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-uid': user.uid
        }
      });
      
      if (response.ok) {
        setRaised(true);
      } else {
        alert('Failed to set availability');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    }
    setLoading(false);
  };

  const handleLowerHand = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/availability', {
        method: 'DELETE',
        headers: { 'x-user-uid': user.uid }
      });
      
      if (response.ok) {
        setRaised(false);
      } else {
        alert('Failed to cancel availability');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full space-y-6 animate-in slide-in-from-bottom-4 duration-500 relative">
      <button 
        onClick={() => setUser(null)}
        className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600"
      >
        <LogOut className="w-5 h-5" />
      </button>

      <div className="text-center space-y-2 mt-4">
        <h2 className="text-2xl font-bold text-gray-800">Hi, {user.name}</h2>
        <p className="text-gray-500 text-sm">Laborer Dashboard</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {!raised ? (
          <>
            <div className="bg-white p-8 rounded-full shadow-lg border-4 border-green-100 animate-pulse">
              <Hand className="w-20 h-20 text-green-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-gray-800">Free for tomorrow?</h3>
              <p className="text-gray-500 text-sm max-w-[250px]">Raise your hand to let farm owners know you are available to work tomorrow.</p>
            </div>
            <button 
              onClick={handleRaiseHand}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transition-all active:scale-95 text-lg"
            >
              Raise Hand for Tomorrow
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-8 animate-in zoom-in duration-500 w-full">
            <div className="flex flex-col items-center space-y-6">
              <div className="bg-green-100 p-6 rounded-full">
                <CheckCircle2 className="w-24 h-24 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-800">Hand Raised!</h3>
                <p className="text-gray-500 max-w-[250px]">Farm owners can now see your availability. They will call you if they need help.</p>
              </div>
            </div>
            
            <button 
              onClick={handleLowerHand}
              disabled={loading}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-4 px-6 rounded-2xl shadow-sm border border-red-200 transition-all active:scale-95 text-lg flex items-center justify-center space-x-2"
            >
              <X className="w-5 h-5" />
              <span>Lower Hand (Cancel)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
