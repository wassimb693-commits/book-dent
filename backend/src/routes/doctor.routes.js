const express = require('express');
const Doctor = require('../models/Doctor');

const router = express.Router();

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isActive: true }).select('-password');

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor by ID
router.get('/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId).select('-password');

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update doctor profile
router.put('/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { clinicName, clinicDescription, address, specializations, appointmentDuration, workingHours } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        clinicName,
        clinicDescription,
        address,
        specializations,
        appointmentDuration,
        workingHours
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      doctor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search doctors by specialization
router.get('/search/specialization/:specialization', async (req, res) => {
  try {
    const { specialization } = req.params;

    const doctors = await Doctor.find({
      specializations: specialization,
      isActive: true
    }).select('-password');

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctor statistics
router.get('/:doctorId/stats', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const Appointment = require('../models/Appointment');

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const totalAppointments = await Appointment.countDocuments({ doctorId });
    const confirmedAppointments = await Appointment.countDocuments({ 
      doctorId, 
      status: 'confirmed' 
    });
    const pendingAppointments = await Appointment.countDocuments({ 
      doctorId, 
      status: 'pending' 
    });

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        confirmedAppointments,
        pendingAppointments,
        rating: doctor.rating,
        reviewCount: doctor.reviewCount,
        subscriptionPlan: doctor.subscriptionPlan
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
