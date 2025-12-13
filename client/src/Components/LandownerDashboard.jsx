import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const LandownerDashboard = () => {
  const [listings, setListings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching landowner data...');
      setLoading(true);
      
      // Fetch listings owned by the current user
      const listingsRes = await axios.get('/listings/my-listings');
      console.log('📋 Listings:', listingsRes.data);
      setListings(listingsRes.data);

      // Fetch notifications
      const notificationsRes = await axios.get('/notifications');
      console.log('🔔 Notifications:', notificationsRes.data);
      setNotifications(notificationsRes.data);
      
    } catch (err) {
      console.error('❌ Error fetching landowner data:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveContact = async (requestId, listingId) => {
    try {
      console.log('✅ Approving contact request:', requestId);
      
      const response = await axios.post(`/listings/${listingId}/approve-contact`, {
        requestId: requestId
      });

      console.log('Approval response:', response.data);

      if (response.data.success) {
        alert('Contact request approved! Your information has been shared.');
        fetchData(); // Refresh data
      }
    } catch (err) {
      console.error('Error approving contact:', err);
      alert(err.response?.data?.error || 'Failed to approve contact request');
    }
  };

  const markAsTaken = async (listingId) => {
    if (!window.confirm('Are you sure you want to mark this property as taken? This cannot be undone.')) {
      return;
    }

    try {
      console.log('🎯 Marking listing as taken:', listingId);
      
      const response = await axios.put(`/listings/${listingId}/mark-taken`);
      
      console.log('Mark taken response:', response.data);

      if (response.data.success) {
        alert('Property marked as taken successfully!');
        fetchData();
      }
    } catch (err) {
      console.error('Error marking as taken:', err);
      alert(err.response?.data?.error || 'Failed to mark property as taken');
    }
  };

  // Get contact request notifications
  const getContactRequestNotifications = () => {
    return notifications.filter(notification => 
      notification.type === 'contact_request' && 
      notification.actionRequired === true
    );
  };

  // Get approved contact notifications (for reference)
  const getApprovedContactNotifications = () => {
    return notifications.filter(notification => 
      notification.type === 'contact_approved'
    );
  };

  const contactRequestNotifications = getContactRequestNotifications();
  const approvedContactNotifications = getApprovedContactNotifications();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Landowner Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your properties and contact requests</p>
      </div>

      {/* Contact Requests Section */}
      {contactRequestNotifications.length > 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-800">
              Contact Requests ({contactRequestNotifications.length})
            </h2>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
              Action Required
            </span>
          </div>
          
          <div className="space-y-4">
            {contactRequestNotifications.map(notification => {
              // Find the listing for this notification
              const listing = listings.find(l => l._id === notification.listing);
              
              return (
                <div key={notification._id} className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {listing ? listing.title : 'Property'}
                      </h3>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Received: {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                        New
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleApproveContact(notification.relatedRequest, notification.listing)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      ✅ Approve & Share Contact
                    </button>
                    <button
                      onClick={() => markAsTaken(notification.listing)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      🏠 Mark as Taken
                    </button>
                  </div>
                  
                  {listing && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Property Details:</strong> {listing.bedrooms} bed, {listing.bathrooms} bath • 
                        ${listing.price}/month • {listing.location}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No Pending Contact Requests</h2>
            <p className="text-gray-600">You'll see contact requests from interested tenants here.</p>
          </div>
        </div>
      )}

      {/* Approved Contacts Section */}
      {approvedContactNotifications.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            Recently Shared Contacts ({approvedContactNotifications.length})
          </h2>
          <div className="space-y-3">
            {approvedContactNotifications.slice(0, 5).map(notification => {
              const listing = listings.find(l => l._id === notification.listing);
              return (
                <div key={notification._id} className="bg-white p-3 rounded border">
                  <p className="font-medium text-gray-800">
                    ✅ Contact shared for {listing ? listing.title : 'property'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Listings Section */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Your Properties</h2>
            <button 
              onClick={() => navigate('/add-listing')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              + Add New Property
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            {listings.length} propert{listings.length === 1 ? 'y' : 'ies'} listed
          </p>
        </div>
        
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Listed</h3>
            <p className="text-gray-600 mb-6">Start by adding your first property to receive contact requests.</p>
            <button 
              onClick={() => navigate('/add-listing')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(listing => (
                <div key={listing._id} className="bg-gray-50 rounded-lg border overflow-hidden hover:shadow-md transition">
                  {listing.images?.[0] && (
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2 line-clamp-1">{listing.title}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-1">{listing.location}</p>
                    <p className="text-lg font-bold text-blue-600 mb-3">${listing.price}/month</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        listing.availability === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {listing.availability === 'available' ? 'Available' : 'Taken'}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {listing.houseType}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{listing.bedrooms} bed</span>
                      <span>{listing.bathrooms} bath</span>
                      <span>{listing.area} sqft</span>
                    </div>
                    
                    {listing.availability === 'available' && (
                      <button
                        onClick={() => markAsTaken(listing._id)}
                        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
                      >
                        Mark as Taken
                      </button>
                    )}
                    
                    {listing.availability !== 'available' && (
                      <div className="text-center py-2 text-gray-500 text-sm">
                        Property is no longer available
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Debug Information - Remove in production */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <details>
          <summary className="cursor-pointer font-medium text-gray-700">Debug Information</summary>
          <div className="mt-2 text-sm">
            <p><strong>Total Notifications:</strong> {notifications.length}</p>
            <p><strong>Contact Requests:</strong> {contactRequestNotifications.length}</p>
            <p><strong>Approved Contacts:</strong> {approvedContactNotifications.length}</p>
            <p><strong>Listings:</strong> {listings.length}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default LandownerDashboard;