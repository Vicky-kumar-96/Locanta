const User = require('../models/User');
const Booking = require('../models/Booking');

// GET /api/admin/stats — high-level counts for the admin dashboard
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, finders, providers, admins, bookingsByStatus, providersWithoutLocation] =
      await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: 'finder' }),
        User.countDocuments({ role: 'provider' }),
        User.countDocuments({ role: 'admin' }),
        Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        User.countDocuments({
          role: 'provider',
          $or: [{ location: { $exists: false } }, { 'location.coordinates': { $exists: false } }]
        })
      ]);

    const bookingCounts = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    bookingsByStatus.forEach((b) => {
      if (b._id in bookingCounts) bookingCounts[b._id] = b.count;
    });

    res.json({
      totalUsers,
      finders,
      providers,
      admins,
      totalBookings: Object.values(bookingCounts).reduce((a, b) => a + b, 0),
      bookingCounts,
      providersWithoutLocation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users?role=&search=&page=&limit=
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort('-createdAt')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      User.countDocuments(query)
    ]);

    res.json({ users, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/providers/location-issues — providers who won't show up in nearby search
exports.getLocationIssues = async (req, res) => {
  try {
    const providers = await User.find({
      role: 'provider',
      $or: [{ location: { $exists: false } }, { 'location.coordinates': { $exists: false } }]
    }).select('name email phone providerDetails createdAt');

    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/users/:id/status — enable/disable an account
exports.setUserActive = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be true or false' });
    }

    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You can't disable your own account" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You can't delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Clean up bookings tied to this user so dashboards don't error on populate
    await Booking.deleteMany({ $or: [{ finder: user._id }, { provider: user._id }] });

    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/bookings?status=&page=&limit=
exports.getBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('finder', 'name email phone')
        .populate('provider', 'name email phone providerDetails')
        .sort('-createdAt')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Booking.countDocuments(query)
    ]);

    res.json({ bookings, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
