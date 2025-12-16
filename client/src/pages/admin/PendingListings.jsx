import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
export default function PendingListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingListings = async () => {
      try {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

       const response = await fetch(API_ENDPOINTS.ADMIN_PENDING_LISTINGS, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pending listings');
        }

        const data = await response.json();
        setListings(data);
      } catch (err) {
        console.error('Error fetching pending listings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingListings();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  const handleApprove = async (listingId, comments = '') => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/approve-listing/${listingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comments }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to approve listing');
      }

      setListings(listings.filter(listing => listing._id !== listingId));
      setSelectedListing(null);
    } catch (err) {
      console.error('Error approving listing:', err);
      setError(err.message);
    }
  };

  const handleReject = async (listingId, comments = 'Listing rejected') => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/reject-listing/${listingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comments }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to reject listing');
      }

      setListings(listings.filter(listing => listing._id !== listingId));
      setSelectedListing(null);
    } catch (err) {
      console.error('Error rejecting listing:', err);
      setError(err.message);
    }
  };

  const openImageModal = (listing, image, index) => {
    setSelectedListing(listing);
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const navigateImage = (direction) => {
    if (!selectedListing?.images) return;
    
    const images = selectedListing.images;
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = (currentImageIndex - 1 + images.length) % images.length;
    } else {
      newIndex = (currentImageIndex + 1) % images.length;
    }
    
    setSelectedImage(images[newIndex]);
    setCurrentImageIndex(newIndex);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
          <p className="mt-2 text-gray-600">Loading pending listings...</p>
        </div>
      </div>
    );
  }

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
      {/* Image Modal */}
      {selectedImage && selectedListing && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-6xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
            >
              &times;
            </button>
            
            <div className="flex items-center justify-center h-full">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full mr-2"
                disabled={selectedListing.images.length <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <img 
                src={selectedImage} 
                alt="Full size preview" 
                className="max-h-[80vh] max-w-full object-contain cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full ml-2"
                disabled={selectedListing.images.length <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="text-center mt-4 text-white">
              Image {currentImageIndex + 1} of {selectedListing.images.length}
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between">
          <h1 className="text-xl font-bold text-gray-900">Pending Listings</h1>
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {listings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">No pending listings found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {listings.map((listing) => (
                <div key={listing._id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-6 py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{listing.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Posted by: {listing.landowner?.name || 'Unknown'} ({listing.landowner?.email || 'No email'})
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(listing._id)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(listing._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setSelectedListing(selectedListing?._id === listing._id ? null : listing)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          {selectedListing?._id === listing._id ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                    </div>

                    {selectedListing?._id === listing._id && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Basic Information</h4>
                          <p><span className="font-medium">Description:</span> {listing.description}</p>
                          <p><span className="font-medium">Price:</span> ${listing.price}</p>
                          <p><span className="font-medium">Location:</span> {listing.location}</p>
                          <p><span className="font-medium">Exact Location:</span> {listing.exactLocation || 'Not specified'}</p>
                          <p><span className="font-medium">Subcity:</span> {listing.subcity || 'Not specified'}</p>
                        </div>

                        {/* Property Details */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Property Details</h4>
                          <p><span className="font-medium">Type:</span> {listing.houseType || 'Not specified'}</p>
                          <p><span className="font-medium">Bedrooms:</span> {listing.bedrooms || 'Not specified'}</p>
                          <p><span className="font-medium">Bathrooms:</span> {listing.bathrooms || 'Not specified'}</p>
                          <p><span className="font-medium">Area:</span> {listing.area ? `${listing.area} sqft` : 'Not specified'}</p>
                          <p><span className="font-medium">Amenities:</span> {listing.amenities?.join(', ') || 'None'}</p>
                        </div>

                        {/* Images */}
                        {listing.images?.length > 0 && (
                          <div className="col-span-full">
                            <h4 className="font-medium text-gray-900 mb-2">Images ({listing.images.length})</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {listing.images.map((image, index) => (
                                <div 
                                  key={index} 
                                  className="relative group cursor-pointer"
                                  onClick={() => openImageModal(listing, image, index)}
                                >
                                  <img 
                                    src={imageErrors[image] ? '/placeholder-image.jpg' : image}
                                    alt={`Listing ${index + 1}`}
                                    className={`w-full h-48 object-cover rounded-lg transition-opacity ${
                                      loadingImages[image] ? 'opacity-70' : 'opacity-100 hover:opacity-90'
                                    }`}
                                    onLoad={() => setLoadingImages(prev => ({...prev, [image]: false}))}
                                    onLoadStart={() => setLoadingImages(prev => ({...prev, [image]: true}))}
                                    onError={() => setImageErrors(prev => ({...prev, [image]: true}))}
                                  />
                                  {loadingImages[image] && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30 rounded-lg pointer-events-none">
                                    <span className="text-white font-medium">Click to enlarge</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Documents */}
                        {listing.documents?.length > 0 && (
                          <div className="col-span-full">
                            <h4 className="font-medium text-gray-900 mb-2">Documents ({listing.documents.length})</h4>
                            <div className="space-y-2">
                              {listing.documents.map((doc, index) => (
                                <a 
                                  key={index} 
                                  href={doc} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block text-blue-600 hover:underline"
                                >
                                  Document {index + 1} - {doc.split('/').pop()}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}