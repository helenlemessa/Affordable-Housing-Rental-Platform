import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [socket, setSocket] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [actionType, setActionType] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

 const fetchNotifications = async () => {
  if (!isAuthenticated || !user) {
    console.log('❌ User not authenticated, skipping notification fetch');
    setNotifications([]);
    setUnreadCount(0);
    return;
  }

  try {
    console.log('🔄 Fetching notifications...');
    const res = await axios.get('/notifications');
    console.log('✅ Notifications fetched:', res.data);
    
    // Handle the array response directly (no more .notifications property)
    const notificationsData = Array.isArray(res.data) ? res.data : [];
    setNotifications(notificationsData);
    
    const unread = notificationsData.filter(n => !n.read).length;
    setUnreadCount(unread);
    setConnectionStatus('connected');
    
    console.log(`📊 ${notificationsData.length} notifications, ${unread} unread`);
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    console.error('Error details:', error.response?.data);
    setConnectionStatus('disconnected');
  }
};

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      
      setNotifications(prev => 
        prev.map(n => n._id === id ? {...n, read: true} : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'mark_read',
          notificationId: id
        }));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    if (notification.actionRequired) {
      setSelectedNotification(notification);
      setActionType(notification.actionType);
      setShowActionModal(true);
    } else {
      if (notification.listing) {
        navigate(`/listing/${notification.listing._id || notification.listing}`);
      } else if (notification.notificationType === 'status-change') {
        navigate('/my-listings');
      }
      setIsOpen(false);
    }
  };

  const handleActionConfirm = async () => {
    try {
      if (actionType === 'contact-approval') {
        const response = await axios.post(
          `/listings/${selectedNotification.listing}/approve-contact`,
          { requestId: selectedNotification.relatedRequest }
        );

        if (response.data.success) {
          alert('Contact request approved successfully!');
          
          setNotifications(prev => 
            prev.map(n => 
              n._id === selectedNotification._id 
                ? { ...n, actionRequired: false, read: true }
                : n
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else if (actionType === 'mark-taken') {
        const response = await axios.put(
          `/listings/${selectedNotification.listing}/mark-taken`
        );

        if (response.data.success) {
          alert('Property marked as taken successfully!');
          
          setNotifications(prev => 
            prev.map(n => 
              n._id === selectedNotification._id 
                ? { ...n, actionRequired: false, read: true }
                : n
            )
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
      setShowActionModal(false);
    } catch (err) {
      alert('Failed to process action: ' + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setConnectionStatus('disconnected');
    } else {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const setupWebSocket = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('No token available for WebSocket connection');
    return;
  }

  const wsUrl = `${API_ENDPOINTS.WS_NOTIFICATIONS}?token=${encodeURIComponent(token)}`;
  const newSocket = new WebSocket(wsUrl);
  setSocket(newSocket);

  newSocket.onopen = () => {
    console.log('✅ WebSocket connected successfully');
    setConnectionStatus('connected');
    setRetryCount(0);
    
    // Immediately fetch notifications when WebSocket connects
    fetchNotifications();
  };

  newSocket.onmessage = (event) => {
    try {
      const notification = JSON.parse(event.data);
      console.log('📨 Received WebSocket notification:', notification);
      
      // Add the new notification to the top
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Contact Request', {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
      
      // Show alert for important notifications
      if (notification.type === 'contact_request' && notification.actionRequired) {
        alert(`New contact request: ${notification.message}`);
      }
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  
      };

      newSocket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

      newSocket.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        setConnectionStatus('disconnected');
        
        if (retryCount < 5 && isAuthenticated) {
          const delay = Math.min(2000 * Math.pow(2, retryCount), 30000);
          console.log(`🔄 Reconnecting in ${delay}ms...`);
          setTimeout(setupWebSocket, delay);
          setRetryCount(prev => prev + 1);
        }
      };
    };

    setupWebSocket();

    const interval = setInterval(() => {
      if (connectionStatus !== 'connected' && isAuthenticated) {
        fetchNotifications();
      }
    }, 30000);

    return () => {
      if (socket) {
        socket.close();
      }
      clearInterval(interval);
    };
  }, [retryCount, isAuthenticated]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={24} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {connectionStatus === 'connecting' && (
                <span className="ml-2 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              )}
              {connectionStatus === 'disconnected' && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close notifications"
            >
              ✕
            </button>
          </div>
          
          <div className="max-h-[500px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {connectionStatus === 'connecting' ? 'Loading...' : 'No notifications yet'}
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification._id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  } ${
                    notification.actionRequired ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{notification.message}</p>
                      {notification.details && (
                        <p className="text-sm text-gray-500 mt-1">{notification.details}</p>
                      )}
                      {notification.actionRequired && (
                        <div className="mt-2 text-xs text-blue-600">
                          {notification.actionType === 'contact-approval'
                            ? 'Action required: Approve contact request'
                            : 'Action required: Mark property as taken'}
                        </div>
                      )}
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {actionType === 'contact-approval' 
                ? 'Approve Contact Request' 
                : 'Mark Property as Taken'}
            </h3>
            
            <p className="mb-4">
              {actionType === 'contact-approval'
                ? 'Do you want to share your contact information with the requester?'
                : 'Are you sure you want to mark this property as taken?'}
            </p>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleActionConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;