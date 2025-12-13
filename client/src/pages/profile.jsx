import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const endpoint = id ? `/api/profile/${id}` : `/api/profile/me`;

        const headers = id ? {} : { Authorization: `Bearer ${token}` };

        if (!id && !token) {
          setError("You must be logged in to view your profile.");
          setLoading(false);
          return;
        }

        const res = await fetch(endpoint, { headers });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) return <div className="p-4">Loading profile...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!profile) return <div className="p-4">Profile not found.</div>;

  const isOwnProfile = !id;

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Cover Photo */}
      <div className="relative w-full h-64 bg-gray-300">
        <img
          src={profile.coverPhoto}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {/* Profile Image */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <img
            src={profile.avatar}
            alt="Avatar"
            className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-20 max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{profile.user.name}</h2>
          <p className="text-gray-500">{profile.user.email}</p>
          <p className="text-gray-700 mt-2 italic">{profile.bio || "No bio added yet."}</p>

          {isOwnProfile && (
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Edit Profile
            </button>
          )}
        </div>

        {/* Info Sections */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <h3 className="text-lg font-semibold mb-2">Contact Info</h3>
            <p>Phone: {profile.contact?.phone || "Not provided"}</p>
          </div>

          {/* Preferences */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <h3 className="text-lg font-semibold mb-2">Preferences</h3>
            <p>
              Budget: {profile.preferences?.budgetRange?.min} -{" "}
              {profile.preferences?.budgetRange?.max}
            </p>
            <p>
              Locations:{" "}
              {profile.preferences?.locationPreferences?.length
                ? profile.preferences.locationPreferences.join(", ")
                : "None"}
            </p>
            <p>
              Amenities:{" "}
              {profile.preferences?.amenities?.length
                ? profile.preferences.amenities.join(", ")
                : "None"}
            </p>
          </div>

          {/* Verification */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <h3 className="text-lg font-semibold mb-2">Verification</h3>
            <p>
              ID Verified:{" "}
              {profile.verificationStatus?.identityVerified ? "✅ Yes" : "❌ No"}
            </p>
            <p>
              Phone Verified:{" "}
              {profile.verificationStatus?.phoneVerified ? "✅ Yes" : "❌ No"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
