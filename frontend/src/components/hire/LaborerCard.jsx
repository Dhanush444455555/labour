import { MapPin, Briefcase, IndianRupee } from 'lucide-react';

export default function LaborerCard({ laborer, onViewDetails, onBookLaborer }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all hover:shadow-md space-y-4">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3.5">
          <img
            src={laborer.profileImage}
            alt={laborer.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-green-100 shadow-sm"
          />
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{laborer.name}</h3>
            <div className="flex items-center text-gray-500 text-xs mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1 text-green-600 flex-shrink-0" />
              <span>{laborer.location}</span>
            </div>
          </div>
        </div>

        {/* Availability Badge */}
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center ${
          laborer.availability === 'Available'
            ? 'bg-green-100 text-green-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          <span className={`w-2 h-2 rounded-full mr-1.5 ${
            laborer.availability === 'Available' ? 'bg-green-600 animate-pulse' : 'bg-amber-600'
          }`}></span>
          {laborer.availability}
        </span>
      </div>

      {/* Details summary */}
      <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 text-xs text-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Work Type:</span>
          <span className="font-semibold text-gray-900">{laborer.skills.slice(0, 2).join(' • ')}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Experience:</span>
          <span className="font-semibold text-gray-900">{laborer.experience}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Daily Wage:</span>
          <span className="font-bold text-green-700">{laborer.dailyWage}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onViewDetails(laborer)}
          className="flex-1 bg-white border-2 border-green-600 hover:bg-green-50 text-green-700 font-bold py-2 px-4 rounded-xl shadow-sm transition-all text-sm active:scale-95 flex items-center justify-center"
        >
          Details
        </button>
        <button
          onClick={() => onBookLaborer && onBookLaborer(laborer)}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition-all text-sm active:scale-95 flex items-center justify-center"
        >
          Book
        </button>
      </div>
    </div>
  );
}
