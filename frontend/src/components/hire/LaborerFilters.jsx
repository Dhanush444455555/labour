export default function LaborerFilters({ activeFilter, setActiveFilter }) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'available', label: 'Available' },
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'nearby', label: 'Nearby' }
  ];

  return (
    <div className="flex space-x-2 my-3">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.id;
        return (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              isActive
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
