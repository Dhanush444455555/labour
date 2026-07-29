import { ArrowLeft, Phone, Calendar, MapPin, Briefcase, IndianRupee, CheckCircle, ShieldCheck } from 'lucide-react';

export default function LaborerProfile({ laborer, onBack, onBookLaborer }) {
  if (!laborer) return null;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-sm font-semibold text-gray-600 hover:text-green-700 transition-colors py-1"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Back to Laborers</span>
      </button>

      {/* Main Profile Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center space-y-4 relative">
        <img
          src={laborer.profileImage}
          alt={laborer.name}
          className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-green-100 shadow-md"
        />

        <div>
          <h2 className="text-2xl font-bold text-gray-900">{laborer.name}</h2>
          <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-green-600" />
            <span>{laborer.location}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
          <span className="w-2.5 h-2.5 rounded-full bg-green-600 animate-pulse mr-2"></span>
          <span>{laborer.availability} for work</span>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
        <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
          Laborer Details
        </h3>

        <div className="grid grid-cols-1 gap-4 text-sm">
          {/* Phone */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500 text-xs">Phone:</span>
            <span className="font-bold text-gray-900">{laborer.phone}</span>
          </div>

          {/* Gender */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500 text-xs">Gender:</span>
            <span className="font-semibold text-gray-900">{laborer.gender || 'Unspecified'}</span>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500 text-xs">Location:</span>
            <span className="font-semibold text-gray-900">{laborer.location}</span>
          </div>

          {/* Experience */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500 text-xs">Experience:</span>
            <span className="font-semibold text-gray-900">{laborer.experience}</span>
          </div>

          {/* Expected Wage */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-500 text-xs">Expected Wage:</span>
            <span className="font-bold text-green-700">{laborer.dailyWage}</span>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-gray-600 block">Skills & Expertise:</span>
          <div className="flex flex-wrap gap-2">
            {laborer.skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-green-50 text-green-800 text-xs font-medium px-3 py-1.5 rounded-xl border border-green-200 flex items-center"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-600" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Two Main Action Buttons */}
      <div className="space-y-3 pt-2">
        <a
          href={`tel:${laborer.phone}`}
          className="w-full bg-white hover:bg-green-50 border-2 border-green-600 text-green-700 font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 text-base active:scale-95"
        >
          <Phone className="w-5 h-5 text-green-600" />
          <span>📞 Call Laborer</span>
        </a>

        <button
          onClick={() => onBookLaborer(laborer)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-base active:scale-95"
        >
          <Calendar className="w-5 h-5" />
          <span>📅 Book Laborer</span>
        </button>
      </div>
    </div>
  );
}
