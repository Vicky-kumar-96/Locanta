const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register User (Finder or Provider)
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      category,
      hourlyRate,
      description,
      latitude,
      longitude,
    } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);
    const location =
      latitude && longitude && !Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)
        ? {
            type: "Point",
            coordinates: [parsedLng, parsedLat],
          }
        : undefined;

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "finder",
      phone,
      providerDetails:
        role === "provider" ? { category, hourlyRate, description } : undefined,
      location,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (user.isActive === false) {
      return res.status(403).json({ message: "This account has been disabled. Contact support." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get logged-in user's full profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update logged-in user's profile (provider details, phone, name, optional location)
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      category,
      hourlyRate,
      description,
      availability,
      latitude,
      longitude,
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    if (user.role === "provider") {
      user.providerDetails = {
        category: category ?? user.providerDetails?.category,
        hourlyRate: hourlyRate ?? user.providerDetails?.hourlyRate,
        description: description ?? user.providerDetails?.description,
        availability: availability ?? user.providerDetails?.availability,
      };

      // Update location only if both latitude and longitude are provided and valid
      if (
        latitude !== undefined &&
        longitude !== undefined &&
        latitude !== "" &&
        longitude !== ""
      ) {
        const parsedLat = parseFloat(latitude);
        const parsedLng = parseFloat(longitude);
        if (!Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)) {
          user.location = {
            type: "Point",
            coordinates: [parsedLng, parsedLat],
          };
        }
      }
    }

    await user.save();
    const { password, ...safeUser } = user.toObject();
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
