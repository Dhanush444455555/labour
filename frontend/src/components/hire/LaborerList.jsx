import { useState } from 'react';
import LaborerSearch from './LaborerSearch';
import LaborerFilters from './LaborerFilters';
import LaborerCard from './LaborerCard';

export default function LaborerList({ laborers, onViewDetails, onBookLaborer }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredLaborers = laborers.filter((lab) => {
    // Filter by search query
    const matchesSearch =
      lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    // Filter by category
    if (activeFilter === 'available') {
      return matchesSearch && lab.availability === 'Available';
    }
    if (activeFilter === 'male') {
      return matchesSearch && lab.gender === 'Male';
    }
    if (activeFilter === 'female') {
      return matchesSearch && lab.gender === 'Female';
    }
    if (activeFilter === 'nearby') {
      return matchesSearch && lab.nearby;
    }

    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Available Laborers</h2>
        <p className="text-gray-500 text-xs mt-0.5">Find experienced workers for your farm</p>
      </div>

      {/* Search Bar */}
      <LaborerSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Filter Chips */}
      <LaborerFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

      {/* Laborer Cards List */}
      {filteredLaborers.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm my-4">
          <p className="text-gray-500 text-sm font-medium">No laborers found matching your search.</p>
          <p className="text-gray-400 text-xs mt-1">Try searching for a different name, location, or skill.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLaborers.map((laborer) => (
            <LaborerCard key={laborer.id} laborer={laborer} onViewDetails={onViewDetails} onBookLaborer={onBookLaborer} />
          ))}
        </div>
      )}
    </div>
  );
}
