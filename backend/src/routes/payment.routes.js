const express = require('express');
const Stripe = require('stripe');
const Doctor = require('../models/Doctor');
const Payment = require('../models/Payment');
const Wallet = require('../models/Wallet');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Plan pricing
const PLANS = {
  free: { price: 0, name: 'Free', appointments: 5 },
  pro: { price: 1000, name: 'Pro', appointments: 50 }, // $10
  business: { price: 3000, name: 'Business', appointments: 999 } // $30
};

// ============ STRIPE PAYMENT ============

// Create Stripe Checkout Session
router.post('/stripe/create-session', async (req, res) => {
  try {
    const { doctorId, plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `BookDent ${PLANS[plan].name} Plan`,
              description: `${PLANS[plan].appointments} appointments per month`
            },
            unit_amount: PLANS[plan].price
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      customer_email: doctor.email,
      client_reference_id: doctorId,
      metadata: {
        doctorId,
        plan
      }
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe Webhook
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { doctorId, plan } = session.metadata;

      // Create payment record
      const payment = new Payment({
        doctorId,
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        plan,
        paymentMethod: 'stripe',
        transactionId: session.payment_intent,
        stripeSessionId: session.id,
        paymentStatus: 'completed',
        paymentDate: new Date(),
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      await payment.save();

      // Add money to wallet
      let wallet = await Wallet.findOne({ doctorId });
      if (!wallet) {
        wallet = new Wallet({ doctorId, balance: 0, transactions: [] });
      }
      wallet.balance += session.amount_total / 100;
      wallet.transactions.push({
        type: 'deposit',
        amount: session.amount_total / 100,
        method: 'stripe',
        status: 'completed',
        transactionId: session.payment_intent
      });
      await wallet.save();

      // Update doctor subscription
      const doctor = await Doctor.findByIdAndUpdate(
        doctorId,
        {
          subscriptionPlan: plan,
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true
        },
        { new: true }
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// ============ PAYPAL PAYMENT ============

router.post('/paypal/create-order', async (req, res) => {
  try {
    const { doctorId, plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // PayPal API integration would go here
    res.status(200).json({
      success: true,
      message: 'PayPal integration ready',
      plan,
      amount: PLANS[plan].price / 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ CREDIT CARD PAYMENT (Generic) ============

router.post('/card/charge', async (req, res) => {
  try {
    const { doctorId, plan, cardToken } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Create charge using Stripe
    const charge = await stripe.charges.create({
      amount: PLANS[plan].price,
      currency: 'usd',
      source: cardToken,
      description: `BookDent ${plan} subscription for ${doctor.clinicName}`
    });

    if (charge.status === 'succeeded') {
      // Create payment record
      const payment = new Payment({
        doctorId,
        amount: charge.amount / 100,
        currency: charge.currency.toUpperCase(),
        plan,
        paymentMethod: 'credit_card',
        transactionId: charge.id,
        paymentStatus: 'completed',
        paymentDate: new Date(),
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      await payment.save();

      // Add to wallet
      let wallet = await Wallet.findOne({ doctorId });
      if (!wallet) {
        wallet = new Wallet({ doctorId, balance: 0, transactions: [] });
      }
      wallet.balance += charge.amount / 100;
      wallet.transactions.push({
        type: 'deposit',
        amount: charge.amount / 100,
        method: 'credit_card',
        status: 'completed',
        transactionId: charge.id
      });
      await wallet.save();

      // Update doctor
      await Doctor.findByIdAndUpdate(
        doctorId,
        {
          subscriptionPlan: plan,
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Payment successful',
        payment: {
          id: charge.id,
          amount: charge.amount / 100,
          status: 'completed'
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ WALLET MANAGEMENT ============

// Get wallet balance
router.get('/wallet/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;

    let wallet = await Wallet.findOne({ doctorId }).populate('doctorId', 'clinicName');
    if (!wallet) {
      wallet = new Wallet({ doctorId, balance: 0, transactions: [] });
      await wallet.save();
    }

    res.status(200).json({
      success: true,
      balance: wallet.balance,
      transactions: wallet.transactions.slice(-10) // Last 10 transactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Withdraw money to bank account
router.post('/wallet/withdraw', async (req, res) => {
  try {
    const { doctorId, amount, bankDetails } = req.body;

    const wallet = await Wallet.findOne({ doctorId });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create withdrawal record
    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'withdrawal',
      amount,
      method: 'bank_transfer',
      status: 'pending',
      bankDetails: {
        accountHolder: bankDetails.accountHolder,
        accountNumber: bankDetails.accountNumber.slice(-4), // Hide full account number
        bankName: bankDetails.bankName,
        swiftCode: bankDetails.swiftCode,
        iban: bankDetails.iban
      }
    });

    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Withdrawal request submitted',
      newBalance: wallet.balance,
      amount: amount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment history
router.get('/history/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;

    const payments = await Payment.find({ doctorId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
