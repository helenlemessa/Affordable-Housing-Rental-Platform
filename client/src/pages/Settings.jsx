import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [password, setPassword] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [notifications, setNotifications] = useState({ email: true, push: true });

  // Fetch user data on page load
  useEffect(() => {
    axios.get('/api/user')
      .then(response => {
        setUser(response.data);
        setNotifications({
          email: response.data.notifications.email,
          push: response.data.notifications.push,
        });
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load user data');
        setLoading(false);
      });
  }, []);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('profilePic', profilePic);
    formData.append('name', user.name);
    formData.append('email', user.email);

    axios.put('/api/user/profile', formData)
      .then(response => {
        setUser(response.data);
        alert('Profile updated successfully!');
      })
      .catch(error => {
        alert('Failed to update profile');
      });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    axios.put('/api/user/password', {
      oldPassword: password.oldPassword,
      newPassword: password.newPassword
    })
    .then(response => {
      alert('Password updated successfully!');
      setPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
    })
    .catch(error => {
      alert('Failed to change password');
    });
  };

  const handleNotificationsUpdate = (e) => {
    e.preventDefault();
    axios.put('/api/user/notifications', notifications)
      .then(response => {
        alert('Notification preferences updated');
      })
      .catch(error => {
        alert('Failed to update notifications');
      });
  };

  const handleAccountDeletion = () => {
    const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmDelete) {
      axios.delete('/api/user')
        .then(response => {
          alert('Account deleted successfully');
          // Redirect to homepage or logout user
        })
        .catch(error => {
          alert('Failed to delete account');
        });
    }
  };

  const handleLogout = () => {
    // Clear localStorage or cookies to log out the user
    window.localStorage.removeItem('auth_token');
    // Redirect to login page
    window.location.href = '/login';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="settings-page p-6">
      <h1 className="text-3xl font-semibold mb-6">Settings</h1>

      {/* Profile Information Section */}
      <div className="profile-info mb-6">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        <form onSubmit={handleProfileUpdate}>
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              className="input"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="input"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Profile Picture</label>
            <input
              type="file"
              className="input"
              onChange={(e) => setProfilePic(e.target.files[0])}
            />
          </div>
          <button className="btn bg-blue-600 text-white">Save Changes</button>
        </form>
      </div>

      {/* Password Change Section */}
      <div className="password-settings mb-6">
        <h2 className="text-xl font-semibold">Password and Security</h2>
        <form onSubmit={handlePasswordChange}>
          <div className="mb-4">
            <label className="block text-gray-700">Old Password</label>
            <input
              type="password"
              className="input"
              value={password.oldPassword}
              onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">New Password</label>
            <input
              type="password"
              className="input"
              value={password.newPassword}
              onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Confirm New Password</label>
            <input
              type="password"
              className="input"
              value={password.confirmPassword}
              onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })}
            />
          </div>
          <button className="btn bg-blue-600 text-white">Change Password</button>
        </form>
      </div>

      {/* Notification Preferences Section */}
      <div className="notifications-settings mb-6">
        <h2 className="text-xl font-semibold">Notification Preferences</h2>
        <form onSubmit={handleNotificationsUpdate}>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifications.email}
                onChange={() => setNotifications({ ...notifications, email: !notifications.email })}
                className="mr-2"
              />
              Email Notifications
            </label>
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={notifications.push}
                onChange={() => setNotifications({ ...notifications, push: !notifications.push })}
                className="mr-2"
              />
              Push Notifications
            </label>
          </div>
          <button className="btn bg-blue-600 text-white">Save Preferences</button>
        </form>
      </div>

      {/* Account Deletion Section */}
      <div className="delete-account mb-6">
        <h2 className="text-xl font-semibold text-red-600">Delete Account</h2>
        <button onClick={handleAccountDeletion} className="btn bg-red-600 text-white">
          Delete Account
        </button>
      </div>

      {/* Logout Section */}
      <div className="logout">
        <button onClick={handleLogout} className="btn bg-gray-600 text-white">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;
