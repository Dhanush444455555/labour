import { Calendar, MapPin, IndianRupee, Phone, CheckCircle2, Clock } from 'lucide-react';

export default function BookingCard({ booking }) {
  const getStatusBadge = () => {
    if (booking.status === 'Accepted') {
      return (
        <span className="bg-green-100 text-green-700 font-bold text-xs px-3 py-1 rounded-full flex items-center">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" />
          🟢 Accepted
        </span>
      );
    }
    if (booking.status === 'Completed') {
      return (
        <span className="bg-gray-100 text-gray-700 font-bold text-xs px-3 py-1 rounded-full flex items-center">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-gray-600" />
          ✓ Completed
        </span>
      );
    }
    return (
      <span className="bg-amber-100 text-amber-700 font-bold text-xs px-3 py-1 rounded-full flex items-center">
        <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
        🟡 Pending
      </span>
    );
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg leading-tight">{booking.laborerName}</h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md mt-1 inline-block border border-gray-100">
            {booking.workType}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Meta Grid */}
      <div className="bg-gray-50 p-3 rounded-xl grid grid-cols-2 gap-2 text-xs text-gray-700">
        <div className="flex items-center">
          <Calendar className="w-3.5 h-3.5 mr-1 text-green-600 flex-shrink-0" />
          <span>{booking.workDate}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="w-3.5 h-3.5 mr-1 text-green-600 flex-shrink-0" />
          <span>{booking.location}</span>
        </div>
        <div className="flex items-center col-span-2">
          <IndianRupee className="w-3.5 h-3.5 mr-1 text-green-600 flex-shrink-0" />
          <span className="font-bold text-green-700">{booking.wage}</span>
        </div>
      </div>

      {/* Action Footer */}
      {booking.status === 'Accepted' ? (
        <a
          href={`tel:${booking.laborerPhone}`}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 text-xs active:scale-95"
        >
          <Phone className="w-4 h-4" />
          <span>📞 Call Laborer</span>
        </a>
      ) : (
        <button
          onClick={() => alert(`Viewing details for ${booking.laborerName}'s booking`)}
          className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-all text-xs active:scale-95"
        >
          View Booking
        </button>
      )}
    </div>
  );
}
