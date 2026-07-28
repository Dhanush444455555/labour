import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Phone, ArrowRight, Users, Tractor, User, MapPin, Navigation, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { joinUserRoom } from '../socket';

export default function Login() {
  const [step, setStep] = useState('form'); // 'form' | 'location'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(null); // 'laborer' | 'farmowner'
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    
    if (!role) {
      setError('Please select a role.');
      return;
    }

    setLoading(true);
    try {
      let userData = await api.login(cleanPhone);
      
      if (!userData.role) {
        userData = await api.updateProfile(userData.uid, { name: name.trim(), role });
      }
      
      setTempUserData(userData);
      setStep('location');
    } catch (err) {
      setError(err.message || 'Cannot connect to server. Is the backend running?');
    }
    setLoading(false);
  };

  const finalizeLogin = (userData) => {
    setUser(userData);
    joinUserRoom(userData.uid);
    if (userData.role === 'laborer') navigate('/laborer', { replace: true });
    else navigate('/owner', { replace: true });
  };

  const handleDetectLocation = () => {
    setLocating(true);
    setLocError('');

    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          // Reverse geocoding via OpenStreetMap (Free, no API key required)
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
          const data = await res.json();
          
          const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown Location';
          
          await api.updateProfile(tempUserData.uid, { location: city });
          
          // Finalize with updated location
          finalizeLogin({ ...tempUserData, location: city });
        } catch (err) {
          setLocError('Could not resolve your location details.');
          setLocating(false);
        }
      },
      (error) => {
        setLocError('Location permission denied or unavailable.');
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Automatically trigger location detection when step changes to 'location'
  useEffect(() => {
    if (step === 'location') {
      handleDetectLocation();
    }
  }, [step]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full space-y-6 animate-in fade-in zoom-in duration-500 py-6">
      
      {step === 'form' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome to Farm Connect</h2>
            <p className="text-gray-500 text-sm mt-1">Enter your details to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Mobile Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500 font-bold">+91</span>
                <input
                  type="tel"
                  placeholder="Enter your 10-digit mobile number"
                  maxLength={10}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition-all font-medium tracking-wide"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">Select Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setRole('laborer')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all active:scale-95 ${
                    role === 'laborer' 
                      ? 'border-green-600 bg-green-50 shadow-sm' 
                      : 'border-gray-100 bg-white hover:border-green-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full mb-2 ${role === 'laborer' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Work as Laborer</h3>
                  <p className="text-[10px] text-gray-500 text-center mt-1">Find farm work</p>
                </button>

                <button 
                  type="button"
                  onClick={() => setRole('farmowner')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl transition-all active:scale-95 ${
                    role === 'farmowner' 
                      ? 'border-amber-600 bg-amber-50 shadow-sm' 
                      : 'border-gray-100 bg-white hover:border-amber-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-full mb-2 ${role === 'farmowner' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-700'}`}>
                    <Tractor className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Hire Laborers</h3>
                  <p className="text-[10px] text-gray-500 text-center mt-1">Find workers for your farm</p>
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 mt-2 disabled:bg-gray-400"
            >
              <span>{loading ? 'Processing...' : 'Continue'}</span>
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        </div>
      )}

      {step === 'location' && (
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full text-center space-y-6 animate-in slide-in-from-right-8 duration-500">
          <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center relative">
            {locating ? (
              <Loader2 className="w-10 h-10 text-green-600 animate-spin absolute" />
            ) : (
              <Navigation className="w-10 h-10 text-green-600" />
            )}
            {!locating && <MapPin className="w-5 h-5 text-green-800 absolute bottom-4 right-4 bg-white rounded-full p-0.5" />}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">Detecting Location</h2>
            <p className="text-gray-500 text-sm mt-2">
              We need your location to show you relevant farm work and laborers in your area.
            </p>
          </div>

          {locating && (
            <p className="text-green-600 font-bold animate-pulse text-sm">
              Please allow location access when prompted by your browser...
            </p>
          )}

          {locError && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="text-red-600 text-sm font-semibold">{locError}</p>
            </div>
          )}

          <div className="pt-4 space-y-3">
            <button
              onClick={handleDetectLocation}
              disabled={locating}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:bg-green-400"
            >
              <Navigation className="w-5 h-5" />
              <span>{locating ? 'Detecting...' : 'Try Again'}</span>
            </button>
            
            {!locating && (
              <button
                onClick={() => finalizeLogin(tempUserData)}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all active:scale-95"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
