import { useState } from 'react';
import BookingCard from './BookingCard';
import { Calendar } from 'lucide-react';

export default function BookingsPage({ bookings }) {
  const [activeTab, setActiveTab] = useState('Pending');

  const filteredBookings = bookings.filter((b) => b.status === activeTab);

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-green-600" />
          My Bookings
        </h2>
        <p className="text-gray-500 text-xs mt-0.5">Track your hired and requested farm laborers</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['Pending', 'Accepted', 'Completed'].map((tab) => {
          const isActive = activeTab === tab;
          const count = bookings.filter((b) => b.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
          <p className="text-gray-500 text-sm font-medium">No {activeTab.toLowerCase()} bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
