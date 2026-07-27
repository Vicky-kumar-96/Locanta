const User = require('../models/User');

const MIN_RADIUS_M = 1000;       // 1km
const MAX_RADIUS_M = 200000;     // 200km
const DEFAULT_RADIUS_M = 25000;  // 25km — 10km was excluding most real-world results

// Find nearby providers by location & category
exports.getNearbyProviders = async (req, res) => {
  try {
    const { lat, lng, category, maxDistance } = req.query; // maxDistance in meters

    let query = { role: 'provider', isActive: true };

    if (category) {
      query['providerDetails.category'] = category;
    }

    const hasLat = lat !== undefined && lat !== null && lat !== '';
    const hasLng = lng !== undefined && lng !== null && lng !== '';

    if (hasLat && hasLng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);

      if (
        Number.isNaN(parsedLat) ||
        Number.isNaN(parsedLng) ||
        parsedLat < -90 || parsedLat > 90 ||
        parsedLng < -180 || parsedLng > 180
      ) {
        return res.status(400).json({ message: 'Invalid latitude/longitude supplied.' });
      }

      let radius = parseInt(maxDistance, 10);
      if (Number.isNaN(radius)) radius = DEFAULT_RADIUS_M;
      radius = Math.min(Math.max(radius, MIN_RADIUS_M), MAX_RADIUS_M);

      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parsedLng, parsedLat] },
          $maxDistance: radius
        }
      };
    }
    // If no coordinates were supplied, we deliberately skip the $near clause
    // instead of querying against [0,0] — that used to make every provider
    // without a saved location "invisible" once a real search radius was
    // applied, because they were thousands of km from any real searcher.

    const providers = await User.find(query).select('-password').limit(100);
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};