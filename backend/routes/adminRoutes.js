const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getStats,
  getUsers,
  getLocationIssues,
  setUserActive,
  deleteUser,
  getBookings,
  deleteBooking
} = require('../controllers/adminController');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/stats', getStats);

router.get('/users', getUsers);
router.patch('/users/:id/status', setUserActive);
router.delete('/users/:id', deleteUser);

router.get('/providers/location-issues', getLocationIssues);

router.get('/bookings', getBookings);
router.delete('/bookings/:id', deleteBooking);

module.exports = router;
