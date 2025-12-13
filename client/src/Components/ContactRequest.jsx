// components/ContactRequest.jsx
import { useState } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ContactRequest = ({ listing }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

 // components/ContactRequest.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await axios.post('/api/contact-requests', {
      listing: listing._id,
      message,
      fromUser: user._id,
      toUser: listing.landowner._id
    });

    console.log('Contact request response:', response.data); // Debug log

    // Only proceed if first request was successful
    try {
      await axios.post('/api/notifications/schedule-property-status', {
        listingId: listing._id,
        contactDate: new Date(),
        userId: listing.user._id
      });
    } catch (schedulingError) {
      console.error('Scheduling failed:', schedulingError);
      // Don't fail the whole request if scheduling fails
    }

    setSuccess(true);
  } catch (error) {
    console.error('Full error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    alert(`Failed to send contact request: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-3">Contact Landowner</h3>
      {success ? (
        <div className="text-green-600 mb-3">
          Contact request sent! The landowner will be notified.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            className="w-full p-2 border rounded mb-3"
            rows="4"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactRequest;