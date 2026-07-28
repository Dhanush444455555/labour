import { useState } from 'react';
import { ArrowLeft, MapPin, IndianRupee, Send, CheckCircle2, User } from 'lucide-react';

export default function BookingForm({ laborer, onBack, onSubmitBooking }) {
  const [workTitle, setWorkTitle] = useState('');
  const [cost, setCost] = useState(laborer?.dailyWage || '');
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg(true);
    if (onSubmitBooking) {
      onSubmitBooking({
        laborerId: laborer?.id,
        laborerName: laborer?.name || 'Laborer',
        laborerPhone: laborer?.phone || '',
        workType: workTitle,
        title: workTitle,
        workDate: 'Tomorrow',
        location: laborer?.location || '',
        wage: cost.startsWith('₹') ? cost : `₹${cost}`,
        status: 'Pending'
      });
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300 pb-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-sm font-semibold text-gray-600 hover:text-green-700 transition-colors py-1"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Back to Profile</span>
      </button>

      {/* Selected Laborer Summary Header */}
      <div className="bg-green-50 p-5 rounded-2xl border border-green-200 shadow-sm space-y-2">
        <span className="text-xs font-semibold text-green-700 uppercase tracking-wider block">Booking Particular Laborer</span>
        <div className="flex items-center space-x-3">
          {laborer?.profileImage ? (
            <img
              src={laborer.profileImage}
              alt={laborer.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold">
              <User className="w-6 h-6" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-900">{laborer?.name || 'Laborer'}</h2>
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-green-600" />
                <span>{laborer?.location || 'Not Specified'}</span>
              </div>
              <div className="flex items-center font-bold text-green-700">
                <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                <span>{laborer?.dailyWage || 'Not Specified'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-green-600 text-white p-4 rounded-xl shadow-md flex items-center space-x-3 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Booking request ready</p>
            <p className="text-xs text-green-100">Booking for {laborer?.name || 'Laborer'} is prepared.</p>
          </div>
        </div>
      )}

      {/* Simplified Booking Form: Title & Cost ONLY */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
        <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">
          Work Booking Details
        </h3>

        {/* 1. Title of the Work */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Title of the Work *
          </label>
          <input
            type="text"
            value={workTitle}
            onChange={(e) => setWorkTitle(e.target.value)}
            placeholder="e.g. Tomato Harvesting"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm text-gray-800 font-medium"
            required
          />
        </div>

        {/* 2. Cost (Wage) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Cost / Wage (₹) *
          </label>
          <input
            type="text"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="e.g. ₹700/day"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none text-sm text-green-700 font-bold"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-base active:scale-95 mt-2"
        >
          <Send className="w-5 h-5" />
          <span>Send Booking Request</span>
        </button>
      </form>
    </div>
  );
}
