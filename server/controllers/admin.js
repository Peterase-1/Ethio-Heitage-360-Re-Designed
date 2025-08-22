const User = require('../models/User');

// GET /api/admin/stats
async function getStats(req, res) {
  try {
    const [totalUsers, activeUsers, museumAdmins, organizers] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $in: ['museum', 'museum_admin'] } }),
      User.countDocuments({ role: 'organizer' }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalMuseums: museumAdmins,
        organizers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to compute stats' });
  }
}

// GET /api/admin/users
async function getUsers(req, res) {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const query = {};
    if (role) query.role = role;

    const [items, total] = await Promise.all([
      User.find(query)
        .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({ success: true, items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
}

// PUT /api/admin/users/:id/role
async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ success: false, message: 'Role is required' });

    const allowed = ['admin','museum','organizer','visitor','educator','tour_admin','museum_admin','super_admin'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update role' });
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
}

// POST /api/admin/users
async function createUser(req, res) {
  try {
    const { name, email, password, role = 'visitor', isActive = true } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });

    const user = new User({ name, email: email.toLowerCase(), password, role, isActive });
    await user.save();
    const plain = user.toObject();
    delete plain.password;
    res.status(201).json({ success: true, user: plain });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create user' });
  }
}

// PUT /api/admin/users/:id
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updatable = ['name', 'email', 'role', 'isActive', 'password'];
    const update = {};
    for (const k of updatable) if (k in req.body) update[k] = req.body[k];

    // If email present, normalize
    if (update.email) update.email = update.email.toLowerCase();

    const user = await User.findById(id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    Object.assign(user, update);
    await user.save(); // triggers hashing if password changed
    const out = user.toObject();
    delete out.password;
    res.json({ success: true, user: out });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
}

// GET /api/admin/museums
async function listMuseums(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { role: { $in: ['museum', 'museum_admin'] } };
    const [items, total] = await Promise.all([
      User.find(query)
        .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ success: true, items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch museums' });
  }
}

// PUT /api/admin/museums/:id/verify
async function setMuseumVerified(req, res) {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'Museum not found' });
    if (!user.museumInfo) user.museumInfo = {};
    user.museumInfo.verified = !!verified;
    await user.save();
    const out = user.toObject();
    delete out.password;
    res.json({ success: true, user: out });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update museum verification' });
  }
}

module.exports = { getStats, getUsers, updateUserRole, deleteUser, createUser, updateUser, listMuseums, setMuseumVerified };
