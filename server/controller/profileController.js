const Profile = require('../models/Profile');
const User = require('../models/user');

exports.getUserProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id })
      .populate('user', 'name email role')
      .populate({
        path: 'properties',
        select: 'title price location',
        match: { isPublished: true }
      });

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['bio', 'contact', 'preferences', 'socialLinks'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates!' });
  }

  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    updates.forEach(update => {
      // Handle nested objects
      if (update === 'contact' || update === 'preferences' || update === 'socialLinks') {
        for (const key in req.body[update]) {
          profile[update][key] = req.body[update][key];
        }
      } else {
        profile[update] = req.body[update];
      }
    });

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

// Get public profile
exports.getPublicProfile = async (req, res) => {
  try {
    // No need for ID validation here - middleware already handled it
    const profile = await Profile.findById(req.params.id)
      .populate('user', 'name role')
      .lean();

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      user: profile.user,
      bio: profile.bio,
      avatar: profile.avatar
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};