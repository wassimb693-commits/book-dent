const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DoctorSchema = new mongoose.Schema({
  // Personal Info
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone is required']
  },

  // Clinic Info
  clinicName: {
    type: String,
    required: [true, 'Clinic name is required']
  },
  clinicDescription: String,
  address: {
    street: String,
    city: String,
    country: String
  },
  clinicImage: String,
  clinicPhone: String,

  // Subscription
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro', 'business'],
    default: 'free'
  },
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  isActive: {
    type: Boolean,
    default: false
  },

  // Appointment Settings
  appointmentDuration: {
    type: Number,
    default: 30
  },
  workingHours: {
    monday: { start: '09:00', end: '17:00' },
    tuesday: { start: '09:00', end: '17:00' },
    wednesday: { start: '09:00', end: '17:00' },
    thursday: { start: '09:00', end: '17:00' },
    friday: { start: '09:00', end: '17:00' },
    saturday: { start: '09:00', end: '17:00' },
    sunday: null
  },
  maxAppointmentsPerMonth: {
    type: Number,
    default: 5
  },
  appointmentsCount: {
    type: Number,
    default: 0
  },

  // Profile
  specializations: [String],
  experience: Number,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
DoctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
DoctorSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Doctor', DoctorSchema);
