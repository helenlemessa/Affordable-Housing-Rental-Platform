import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaPhone, FaEnvelope, FaExclamationTriangle } from 'react-icons/fa';

export default function ListingDetail({ setShowLoginModal }) {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactStatus, setContactStatus] = useState('not_requested');
  const [landownerContact, setLandownerContact] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Fetching listing details for:', id);
        const listingResponse = await axios.get(`${import.meta.env.VITE_API_URL}/listings/${id}`);
        
        if (!listingResponse.data) {
          throw new Error('Listing not found');
        }

        const listingData = listingResponse.data;
        console.log('📋 Listing data:', listingData);
        
        if (listingData.status !== 'approved') {
          throw new Error('This listing is not available');
        }

        setListing(listingData);
        
        // Only check contact status if user is logged in
        if (isAuthenticated()) {
          await checkContactStatus();
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const checkContactStatus = async () => {
    try {
      console.log('🔍 Checking contact status for listing:', id);
      
      // Get all notifications
      const notificationsRes = await axios.get('/notifications');
      console.log('📋 All notifications:', notificationsRes.data);
      
      // Check for approved contact request
      const approvedNotification = notificationsRes.data.find(
        n => n.type === 'contact_approved' && n.listing === id
      );
      
      if (approvedNotification) {
        console.log('✅ Found approved contact request');
        setContactStatus('approved');
        setLandownerContact(approvedNotification.contactInfo);
        return;
      }
      
      // Check for pending contact request
      // We need to check both the backend contact requests and notifications
      try {
        // Try to get contact requests for this listing
        const contactRequestsRes = await axios.get(`/listings/${id}/contact-requests`);
        console.log('📋 Contact requests for listing:', contactRequestsRes.data);
        
        const userContactRequest = contactRequestsRes.data.find(
          req => req.user?._id === getCurrentUserId()
        );
        
        if (userContactRequest) {
          console.log('🕒 Found existing contact request:', userContactRequest.status);
          setContactStatus(userContactRequest.status);
          return;
        }
      } catch (contactErr) {
        console.log('No contact requests endpoint or error:', contactErr);
        // Fallback to checking notifications for pending requests
        const pendingNotification = notificationsRes.data.find(
          n => n.type === 'contact_request' && n.listing === id && n.sender === getCurrentUserId()
        );
        
        if (pendingNotification) {
          console.log('🕒 Found pending contact request in notifications');
          setContactStatus('pending');
          return;
        }
      }
      
      // If no contact request found, check if user has any contact request notification for this listing
      const userContactNotification = notificationsRes.data.find(
        n => (n.type === 'contact_request' || n.actionType === 'contact-approval') && 
             n.listing === id
      );
      
      if (userContactNotification) {
        console.log('📨 Found contact-related notification');
        setContactStatus('pending');
      } else {
        console.log('❌ No contact request found');
        setContactStatus('not_requested');
      }
      
    } catch (err) {
      console.error('Error checking contact status:', err);
      setContactStatus('not_requested');
    }
  };

  // Helper function to get current user ID
  const getCurrentUserId = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id || user._id;
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return null;
  };

  const requestContactInfo = async () => {
    // Check authentication first
    if (!isAuthenticated()) {
      console.log('❌ User not authenticated, redirecting to login');
      handleLoginRedirect();
      return;
    }

    // Check if already requested
    if (contactStatus === 'pending') {
      alert('You have already sent a contact request for this property. Please wait for the landowner to respond.');
      return;
    }

    if (contactStatus === 'approved') {
      alert('Your contact request has already been approved! Check the contact information below.');
      return;
    }

    try {
      console.log('📞 Requesting contact info for listing:', id);
      setIsRequesting(true);
      
      // Debug: Check token
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);

      const response = await axios.post(`/listings/${id}/request-contact`);
      console.log('✅ Contact request response:', response.data);

      if (response.data.success) {
        setContactStatus('pending');
        alert('Contact request sent! The landowner will review your request.');
        
        // Refresh contact status after a short delay
        setTimeout(() => {
          checkContactStatus();
        }, 1000);
      }
    } catch (err) {
      console.error('❌ Contact request error:', err);
      console.error('Error details:', err.response?.data);
      
      if (err.response?.status === 401) {
        console.log('🔄 Token expired, clearing and redirecting');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        handleLoginRedirect();
      } else if (err.response?.status === 400) {
        // Handle "already requested" error from backend
        if (err.response.data.error?.includes('already requested')) {
          setContactStatus('pending');
          alert('You have already requested contact for this property. Please wait for the landowner to respond.');
        } else {
          alert(err.response.data.error);
        }
      } else {
        alert('Failed to send contact request. Please try again.');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleLoginRedirect = () => {
    console.log('🔀 Redirecting to login page');
    if (setShowLoginModal) {
      setShowLoginModal(true);
    } else {
      navigate('/login', { state: { from: `/listing/${id}` } });
    }
  };

  const nextImage = () => {
    if (listing?.images?.length) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing?.images?.length) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
          <p className="mt-2 text-gray-600">Loading listing details...</p>
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
            onClick={() => navigate('/browse')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate('/browse')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Listings
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {listing && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Image Gallery */}
            <div className="relative">
              {listing.images?.[currentImageIndex] && (
                <img
                  src={listing.images[currentImageIndex]}
                  alt={`Listing ${currentImageIndex + 1}`}
                  className="w-full h-96 object-cover"
                />
              )}
              {listing.images?.length > 1 && (
                <>
                  <button 
                    onClick={prevImage} 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    aria-label="Previous image"
                  >
                    &lt;
                  </button>
                  <button 
                    onClick={nextImage} 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    aria-label="Next image"
                  >
                    &gt;
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {listing.images?.length || 0}
                </div>
              </div>
            </div>

            {/* Listing Details */}
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                  <p className="text-gray-600 mt-1 flex items-center">
                    <FaMapMarkerAlt className="mr-1" />
                    {listing.location}
                    {listing.exactLocation && ` (${listing.exactLocation})`}
                  </p>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  ${listing.price.toLocaleString()}/mo
                </div>
              </div>

              {/* Availability */}
              <div className="mt-2">
                {listing.availability === 'available' ? (
                  <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">Available</span>
                ) : (
                  <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">Taken</span>
                )}
              </div>

              {/* Quick Facts */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center text-gray-700">
                  <FaBed className="mr-2" />
                  {listing.bedrooms} Bedroom{listing.bedrooms !== 1 && 's'}
                </div>
                <div className="flex items-center text-gray-700">
                  <FaBath className="mr-2" />
                  {listing.bathrooms} Bathroom{listing.bathrooms !== 1 && 's'}
                </div>
                <div className="flex items-center text-gray-700">
                  <FaRulerCombined className="mr-2" />
                  {listing.area.toLocaleString()} sqft
                </div>
                <div className="flex items-center text-gray-700 capitalize">
                  {listing.houseType}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                <p className="mt-2 text-gray-600 whitespace-pre-line">{listing.description}</p>
              </div>

              {/* Amenities */}
              {listing.amenities?.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {listing.amenities.map((amenity, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Flow - FIXED VERSION */}
              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Landowner</h2>
                
                {contactStatus === 'not_requested' && (
                  <div className="space-y-4">
                    <button
                      onClick={requestContactInfo}
                      disabled={listing.availability !== 'available' || isRequesting}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                        listing.availability === 'available'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {isRequesting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Sending Request...
                        </div>
                      ) : (
                        'Request Contact Information'
                      )}
                    </button>
                    {listing.availability !== 'available' && (
                      <p className="text-sm text-gray-500 text-center">
                        This property is no longer available for contact requests.
                      </p>
                    )}
                  </div>
                )}

                {contactStatus === 'pending' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-blue-800">Contact Request Pending</p>
                        <p className="text-sm text-blue-600 mt-1">
                          The landowner will review your request and may share their contact information.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {contactStatus === 'approved' && landownerContact && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-green-800">Contact Information Shared</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="bg-white p-2 rounded-full border">
                          <FaPhone className="text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{landownerContact.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="bg-white p-2 rounded-full border">
                          <FaEnvelope className="text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{landownerContact.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-white rounded border">
                      <p className="text-sm text-gray-600">
                        Please be respectful when contacting the landowner. 
                        Remember to mention you found their property on RentEasy.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              {listing.availability !== 'available' && (
                <div className="mt-6 flex items-start text-red-600 text-sm">
                  <FaExclamationTriangle className="mt-1 mr-2 flex-shrink-0" />
                  <p>This property has been marked as taken by the landowner and is no longer available.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}