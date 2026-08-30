const express = require('express');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const router = express.Router();

// Register Doctor
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, clinicName, clinicPhone } = req.body;

    // Check if doctor already exists
    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      return res.status(400).json({ error: 'Doctor already registered' });
    }

    // Create new doctor
    doctor = new Doctor({
      firstName,
      lastName,
      email,
      password,
      phone,
      clinicName,
      clinicPhone
    });

    await doctor.save();

    // Generate JWT Token
    const token = jwt.sign(
      { id: doctor._id, email: doctor.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        clinicName: doctor.clinicName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Doctor
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Check for doctor
    const doctor = await Doctor.findOne({ email }).select('+password');
    if (!doctor) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await doctor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: doctor._id, email: doctor.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      doctor: {
        id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        email: doctor.email,
        clinicName: doctor.clinicName,
        subscriptionPlan: doctor.subscriptionPlan
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Current Doctor
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findById(decoded.id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
