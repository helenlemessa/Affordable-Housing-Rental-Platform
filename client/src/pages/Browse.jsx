// src/pages/Browse.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Browse() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    houseType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    subcity: ''
  });

  useEffect(() => {
    const fetchApprovedListings = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/listings/approved`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }

        const data = await response.json();
        setListings(data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedListings();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Updated filter function in Browse.jsx
const filteredListings = listings.filter(listing => {
  // Convert all values to lowercase and trim whitespace for consistent comparison
  const searchTermLower = searchTerm.toLowerCase().trim();
  const listingTitle = listing.title?.toLowerCase() || '';
  const listingDesc = listing.description?.toLowerCase() || '';
  const listingLoc = listing.location?.toLowerCase() || '';
  
  // Search term filter
  const matchesSearch = 
    listingTitle.includes(searchTermLower) ||
    listingDesc.includes(searchTermLower) ||
    listingLoc.includes(searchTermLower);

  // House type filter - normalize comparison
  const listingType = listing.houseType?.toLowerCase().trim() || '';
  const filterType = filters.houseType.toLowerCase().trim();
  const matchesHouseType = filters.houseType ? 
    listingType === filterType : true;

  // Other filters
  const matchesMinPrice = filters.minPrice ? 
    listing.price >= parseInt(filters.minPrice) : true;
  const matchesMaxPrice = filters.maxPrice ? 
    listing.price <= parseInt(filters.maxPrice) : true;
  const matchesBedrooms = filters.bedrooms ? 
    listing.bedrooms === parseInt(filters.bedrooms) : true;
  const matchesSubcity = filters.subcity ? 
    listing.subcity?.toLowerCase().trim() === filters.subcity.toLowerCase().trim() : true;

  return (
    matchesSearch &&
    matchesHouseType &&
    matchesMinPrice &&
    matchesMaxPrice &&
    matchesBedrooms &&
    matchesSubcity
  );
});
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">Browse Approved Listings</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search listings..."
              className="w-full p-2 border rounded"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              name="houseType"
              className="p-2 border rounded"
              value={filters.houseType}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condo">Condominium</option>
              <option value="villa">Villa</option>
            </select>

            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              className="p-2 border rounded"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />

            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              className="p-2 border rounded"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />

            <select
              name="bedrooms"
              className="p-2 border rounded"
              value={filters.bedrooms}
              onChange={handleFilterChange}
            >
              <option value="">Any Bedrooms</option>
              <option value="1">1 Bedroom</option>
              <option value="2">2 Bedrooms</option>
              <option value="3">3+ Bedrooms</option>
            </select>

            <input
              type="text"
              name="subcity"
              placeholder="Subcity"
              className="p-2 border rounded"
              value={filters.subcity}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <p className="text-gray-600">No listings found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing._id} className="bg-white rounded-lg shadow overflow-hidden">
                {listing.images?.[0] && (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{listing.title}</h2>
                  <p className="text-gray-600 mb-2">{listing.location}</p>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{listing.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-blue-600">${listing.price}/mo</span>
                    <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {listing.houseType}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-500 mb-4">
                    <span>{listing.bedrooms} beds</span>
                    <span>{listing.bathrooms} baths</span>
                    <span>{listing.area} sqft</span>
                  </div>

                  <Link
                    to={`/listing/${listing._id}`}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}