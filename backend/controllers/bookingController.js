const Booking = require('../models/Booking');
const User = require('../models/User');

// Create a booking (finder books a provider)
exports.createBooking = async (req, res) => {
  try {
    const { providerId, date, time, details } = req.body;

    if (!providerId || !date || !time) {
      return res.status(400).json({ message: 'providerId, date and time are required' });
    }

    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    const booking = await Booking.create({
      finder: req.user.id,
      provider: providerId,
      date,
      time,
      details
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bookings belonging to the logged-in user (as finder or provider)
exports.getMyBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'provider'
      ? { provider: req.user.id }
      : { finder: req.user.id };

    const bookings = await Booking.find(filter)
      .populate('provider', 'name email phone providerDetails')
      .populate('finder', 'name email phone')
      .sort('-createdAt');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Provider updates a booking's status (confirm/complete/cancel)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
