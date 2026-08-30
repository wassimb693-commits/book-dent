const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  // Doctor Reference
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },

  // Payment Details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'business'],
    required: true
  },

  // Stripe/Payoneer
  paymentMethod: {
    type: String,
    enum: ['stripe', 'payoneer', 'credit_card', 'free']
  },
  transactionId: String,
  stripeSessionId: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },

  // Dates
  paymentDate: Date,
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,

  // Invoice
  invoiceNumber: String,
  invoiceUrl: String,

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

module.exports = mongoose.model('Payment', PaymentSchema);
