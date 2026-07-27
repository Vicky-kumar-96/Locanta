const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['finder', 'provider', 'admin'], 
    default: 'finder' 
  },
  phone: { type: String },
  profileImage: { type: String, default: '' }, // Cloudinary URL
  
  // Provider Specific Fields
  providerDetails: {
    category: { type: String }, // Electrician, Plumber, Carpenter, Tutor, Mechanic
    hourlyRate: { type: Number },
    pricing: { type: String },
    availability: { type: Boolean, default: true },
    description: { type: String }
  },

  // GeoJSON for nearby location queries
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] } // [longitude, latitude], intentionally no default
  },

  // Admin controls
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);