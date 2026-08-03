import { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { api } from '../services/api';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function EmailVerificationBanner() {
  const { user, setUser } = useContext(AuthContext);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  if (!user || !user.email || user.email_verified === 1) {
    return null;
  }

  const handleSendOtp = async () => {
    setSending(true);
    setMsg('');
    try {
      await api.sendVerificationEmail(user.uid);
      setMsg('OTP sent to your email! Please enter it below.');
      setShowOtpInput(true);
    } catch (err) {
      setMsg(err.message || 'Failed to send OTP.');
    }
    setSending(false);
  };

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setMsg('Please enter a valid 6-digit OTP.');
      return;
    }
    setVerifying(true);
    setMsg('');
    try {
      await api.verifyEmail(user.uid, otp);
      setMsg('Email verified successfully!');
      // Update local context so banner disappears
      setUser({ ...user, email_verified: 1 });
    } catch (err) {
      setMsg(err.message || 'Failed to verify OTP.');
    }
    setVerifying(false);
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-start mb-3 sm:mb-0">
          <AlertCircle className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-orange-900">Email not verified</h4>
            <p className="text-xs text-orange-700 mt-0.5">Please verify your email ({user.email}) to secure your account.</p>
            {msg && !showOtpInput && <p className="text-xs font-semibold text-orange-800 mt-1">{msg}</p>}
          </div>
        </div>
        {!showOtpInput && (
          <button 
            onClick={handleSendOtp}
            disabled={sending}
            className="text-xs font-bold bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 transition flex items-center shadow-sm disabled:opacity-70 whitespace-nowrap"
          >
            {sending ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : null}
            {sending ? 'Sending...' : 'Send OTP'}
          </button>
        )}
      </div>

      {showOtpInput && (
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 pt-2 border-t border-orange-200/60">
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\\D/g, ''))}
            className="w-full sm:w-48 px-3 py-2 text-sm border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-center tracking-widest font-bold"
          />
          <button 
            onClick={handleVerify}
            disabled={verifying || otp.length !== 6}
            className="w-full sm:w-auto text-xs font-bold bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex justify-center items-center shadow-sm disabled:opacity-70 whitespace-nowrap"
          >
            {verifying ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : null}
            {verifying ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      )}
      
      {msg && showOtpInput && <p className="text-xs font-semibold text-orange-800">{msg}</p>}
    </div>
  );
}
