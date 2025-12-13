import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationContext } from '../context/NotificationContext';

const NotificationsPage = () => {
  const { notifications, markAsRead } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    if (notification.listing) {
      navigate(`/listing/${notification.listing._id || notification.listing}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Notifications</h1>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">You have no notifications</p>
        ) : (
          notifications.map(notification => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
              } hover:bg-gray-50`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{notification.message}</p>
                  {notification.details && (
                    <p className="text-sm text-gray-600 mt-1">{notification.details}</p>
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
    </div>
  );
};

export default NotificationsPage;