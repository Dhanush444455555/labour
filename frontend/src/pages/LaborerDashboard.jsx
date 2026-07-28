import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { LogOut, ThumbsUp, ThumbsDown, Check, X, RefreshCw, Bell, Calendar, Phone } from 'lucide-react';
import { socket, joinUserRoom } from '../socket';
import { api } from '../services/api';

export default function LaborerDashboard() {
  const { user, setUser } = useContext(AuthContext);
  const [availability, setAvailability] = useState('prompt'); // 'prompt' | 'available' | 'not_available'
  const [jobs, setJobs] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
  const [rejectedJobIds, setRejectedJobIds] = useState([]);
  const [acceptedJobIds, setAcceptedJobIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      joinUserRoom(user.uid);
      checkUserAvailability();
      fetchJobs();
      fetchBookings();
    }

    const handleNewWorkAlert = () => fetchJobs();
    const handleBookingRequest = () => {
      fetchBookings();
      alert('You received a new direct booking request!');
    };

    socket.on('new-work-alert', handleNewWorkAlert);
    socket.on('booking-request', handleBookingRequest);

    return () => {
      socket.off('new-work-alert', handleNewWorkAlert);
      socket.off('booking-request', handleBookingRequest);
    };
  }, [user]);

  const checkUserAvailability = async () => {
    try {
      const res = await api.getAvailability(user.uid);
      if (res.status === 'AVAILABLE') setAvailability('available');
      else if (res.status === 'NOT_AVAILABLE') setAvailability('not_available');
    } catch (e) {}
  };

  const fetchJobs = async () => {
    try {
      const data = await api.getTomorrowJobs(user.uid);
      setJobs(data || []);
      const alreadyAccepted = data.filter(j => j.isAcceptedByMe).map(j => j.id);
      setAcceptedJobIds(alreadyAccepted);
    } catch (err) {
      console.error('Error fetching tomorrow jobs:', err);
    }
    setLoading(false);
  };

  const fetchBookings = async () => {
    try {
      const data = await api.getReceivedBookings(user.uid);
      setReceivedBookings(data || []);
    } catch (e) {}
  };

  const handleSelectAvailability = async (status) => {
    const statusVal = status === 'available' ? 'AVAILABLE' : 'NOT_AVAILABLE';
    setAvailability(status);
    try {
      await api.setAvailability(user.uid, 'Tomorrow', statusVal);
      if (status === 'available') fetchJobs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (jobId) => {
    setRejectedJobIds((prev) => [...prev, jobId]);
    try {
      await api.rejectJob(user.uid, jobId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAccept = async (jobId) => {
    if (acceptedJobIds.includes(jobId)) return;
    setAcceptedJobIds((prev) => [...prev, jobId]);

    try {
      const res = await api.acceptJob(user.uid, jobId);
      if (res.isFull) {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'FULL' } : j));
      }
    } catch (err) {
      alert(err.message || 'Failed to accept job');
      setAcceptedJobIds((prev) => prev.filter(id => id !== jobId));
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    try {
      await api.acceptBooking(user.uid, bookingId);
      fetchBookings();
    } catch (e) {
      alert('Failed to accept booking');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await api.rejectBooking(user.uid, bookingId);
      fetchBookings();
    } catch (e) {
      alert('Failed to reject booking');
    }
  };

  const visibleJobs = jobs.filter((j) => !rejectedJobIds.includes(j.id));
  const pendingBookings = receivedBookings.filter((b) => b.status === 'PENDING');

  return (
    <div className="flex flex-col flex-1 w-full space-y-6 animate-in slide-in-from-bottom-4 duration-500 relative overflow-y-auto pb-10 max-w-md mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Hi, {user?.name || 'Laborer'}</h2>
          <p className="text-xs text-gray-500">Laborer Dashboard</p>
        </div>
        <button
          onClick={() => setUser(null)}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* DIRECT BOOKING REQUESTS RECEIVED */}
      {pendingBookings.length > 0 && (
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 shadow-sm space-y-3">
          <h3 className="font-bold text-amber-900 text-sm flex items-center">
            <Bell className="w-4 h-4 mr-1.5 text-amber-600" />
            Direct Booking Request ({pendingBookings.length})
          </h3>
          {pendingBookings.map((b) => (
            <div key={b.id} className="bg-white p-4 rounded-xl border border-amber-200 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{b.work_title}</p>
                  <p className="text-gray-500">From: {b.ownerName || 'Farm Owner'}</p>
                </div>
                <span className="font-bold text-green-700 text-sm">{b.wage}</span>
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleRejectBooking(b.id)}
                  className="flex-1 bg-gray-100 hover:bg-red-50 text-red-600 font-bold py-2 rounded-lg"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAcceptBooking(b.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: TOMORROW AVAILABILITY SELECTION */}
      {availability === 'prompt' && (
        <div className="space-y-6 animate-in zoom-in duration-300 my-auto py-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Are you available to work tomorrow?</h2>
            <p className="text-gray-500 text-sm">Let farm owners know your availability</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleSelectAvailability('available')}
              className="w-full bg-white hover:bg-green-50 border-2 border-green-500 hover:border-green-600 p-6 rounded-2xl shadow-md transition-all flex items-center space-x-4 active:scale-95 text-left group"
            >
              <div className="bg-green-100 p-4 rounded-full group-hover:bg-green-200 transition-colors">
                <ThumbsUp className="w-8 h-8 text-green-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">👍 UP HAND</h3>
                <p className="text-green-700 text-sm font-semibold mt-0.5">Yes, I can work tomorrow</p>
              </div>
            </button>

            <button
              onClick={() => handleSelectAvailability('not_available')}
              className="w-full bg-white hover:bg-red-50 border-2 border-red-200 hover:border-red-300 p-6 rounded-2xl shadow-md transition-all flex items-center space-x-4 active:scale-95 text-left group"
            >
              <div className="bg-red-100 p-4 rounded-full group-hover:bg-red-200 transition-colors">
                <ThumbsDown className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">👎 DOWN HAND</h3>
                <p className="text-red-600 text-sm font-semibold mt-0.5">No, I am not available tomorrow</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* NOT AVAILABLE STATE */}
      {availability === 'not_available' && (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center space-y-6 animate-in fade-in my-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
            <ThumbsDown className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Not Available Tomorrow</h3>
            <p className="text-gray-500 text-sm mt-1">Farm owners have been notified that you are taking tomorrow off.</p>
          </div>

          <button
            onClick={() => handleSelectAvailability('prompt')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Change Availability</span>
          </button>
        </div>
      )}

      {/* STEP 2 & 3: TOMORROW JOBS LIST */}
      {availability === 'available' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between bg-green-50 p-3.5 rounded-2xl border border-green-200">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-green-800">Status: Available Tomorrow</span>
            </div>
            <button
              onClick={() => setAvailability('prompt')}
              className="text-xs font-semibold text-green-700 underline hover:text-green-900"
            >
              Change
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tomorrow's Work</h2>
            <p className="text-gray-500 text-xs mt-0.5">Jobs available for tomorrow</p>
          </div>

          {visibleJobs.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center border border-gray-200 shadow-sm space-y-2">
              <p className="text-gray-600 font-bold text-base">No more available jobs for tomorrow.</p>
              <p className="text-gray-400 text-xs">New work alerts from farm owners will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleJobs.map((job) => {
                const isAccepted = acceptedJobIds.includes(job.id) || job.isAcceptedByMe;

                return (
                  <div
                    key={job.id}
                    className={`bg-white p-5 rounded-2xl shadow-md border transition-all ${
                      isAccepted ? 'border-green-300 bg-green-50/40' : 'border-gray-100'
                    }`}
                  >
                    <div className="space-y-2 pb-4 border-b border-gray-100">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-gray-500">Owner: <strong className="text-gray-900 text-sm">{job.ownerName}</strong></span>
                        <span className="font-bold text-green-700 text-lg">{job.workerWage}</span>
                      </div>

                      <div className="text-base font-bold text-gray-900">
                        Work: <span className="text-green-800">{job.workTitle}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-4">
                      {!isAccepted ? (
                        <>
                          <button
                            onClick={() => handleReject(job.id)}
                            className="flex-1 bg-white hover:bg-red-50 border-2 border-red-200 text-red-600 font-bold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 active:scale-95 text-sm"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject</span>
                          </button>

                          <button
                            onClick={() => handleAccept(job.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-95 text-sm"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex w-full space-x-2">
                          <div className="flex-1 bg-green-100 text-green-700 font-bold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 text-sm border border-green-200">
                            <Check className="w-4 h-4" />
                            <span>Accepted</span>
                          </div>
                          {job.ownerPhone && (
                            <a 
                              href={`tel:${job.ownerPhone}`}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 text-sm"
                            >
                              <Phone className="w-4 h-4" />
                              <span>Call Owner</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
