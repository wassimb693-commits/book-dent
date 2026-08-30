const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  // Appointment Details
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true,
    lowercase: true
  },
  patientPhone: {
    type: String,
    required: true
  },
  patientMessage: String,

  // Doctor Reference
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },

  // Appointment Timing
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },

  // AI Processing
  aiExtractedData: {
    appointmentType: String,
    preferredDate: String,
    preferredTime: String,
    urgency: String,
    additionalNotes: String
  },
  aiConfidence: Number,

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

module.exports = mongoose.model('Appointment', AppointmentSchema);
