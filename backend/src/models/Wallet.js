const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  // Doctor Reference
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    unique: true
  },

  // Balance
  balance: {
    type: Number,
    default: 0,
    min: 0
  },

  // Transactions History
  transactions: [
    {
      type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'refund'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      method: {
        type: String,
        enum: ['stripe', 'paypal', 'credit_card', 'bank_transfer'],
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
      },
      transactionId: String,
      description: String,
      
      // Bank withdrawal details
      bankDetails: {
        accountHolder: String,
        accountNumber: String, // Last 4 digits only
        bankName: String,
        swiftCode: String,
        iban: String
      },

      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // Bank Account for Withdrawals
  bankAccounts: [
    {
      accountHolder: {
        type: String,
        required: true
      },
      accountNumber: {
        type: String,
        required: true,
        unique: true
      },
      bankName: {
        type: String,
        required: true
      },
      swiftCode: String,
      iban: {
        type: String,
        required: true
      },
      country: String,
      currency: String,
      isDefault: {
        type: Boolean,
        default: false
      },
      isVerified: {
        type: Boolean,
        default: false
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // Metadata
  totalDeposited: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', WalletSchema);
