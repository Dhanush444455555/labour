import { useState } from 'react';
import BookingCard from './BookingCard';
import { Calendar, Users, Phone, MapPin, Briefcase } from 'lucide-react';

export default function BookingsPage({ bookings = [], jobs = [] }) {
  const [mainTab, setMainTab] = useState('direct'); // 'direct' | 'alerts'
  const [directTab, setDirectTab] = useState('Pending');

  const filteredBookings = bookings.filter((b) => b.status === directTab);

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-green-600" />
          My Bookings & Alerts
        </h2>
        <p className="text-gray-500 text-xs mt-0.5">Manage your hired laborers and posted work alerts</p>
      </div>

      {/* Main Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
        <button
          onClick={() => setMainTab('direct')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            mainTab === 'direct'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Direct Bookings
        </button>
        <button
          onClick={() => setMainTab('alerts')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            mainTab === 'alerts'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Work Alerts
        </button>
      </div>

      {mainTab === 'direct' && (
        <>
          {/* Direct Bookings Tabs */}
          <div className="flex border-b border-gray-200">
            {['Pending', 'Accepted', 'Completed'].map((tab) => {
              const isActive = directTab === tab;
              const count = bookings.filter((b) => b.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setDirectTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 text-center flex items-center justify-center space-x-1.5 ${
                    isActive
                      ? 'border-green-600 text-green-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm my-4">
              <p className="text-gray-500 text-sm font-medium">No {directTab.toLowerCase()} bookings found.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              {filteredBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </>
      )}

      {mainTab === 'alerts' && (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm my-4">
              <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm font-medium">You haven't posted any work alerts yet.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                {/* Job Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{job.title}</h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {job.location} • {job.workDate}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    job.status === 'FULL' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                  }`}>
                    {job.status}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="text-sm">
                    <span className="text-gray-500">Wage:</span> <strong className="text-gray-900">{job.wage}</strong>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Workers:</span> <strong className="text-green-700">{job.acceptedCount}/{job.laborersRequired}</strong>
                  </div>
                </div>

                {/* Accepted Laborers List */}
                {job.acceptedLaborers && job.acceptedLaborers.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center">
                      <Users className="w-3 h-3 mr-1" /> Accepted Laborers
                    </h4>
                    <div className="space-y-2">
                      {job.acceptedLaborers.map((laborer) => (
                        <div key={laborer.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-xs">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{laborer.laborerName}</p>
                            <p className="text-xs text-gray-500">Accepted {new Date(laborer.acceptedAt).toLocaleDateString()}</p>
                          </div>
                          {laborer.laborerPhone && (
                            <a
                              href={`tel:${laborer.laborerPhone}`}
                              className="bg-green-100 hover:bg-green-200 text-green-700 p-2.5 rounded-full transition-colors"
                              title="Call Laborer"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
