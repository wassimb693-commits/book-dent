const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

const router = express.Router();

// Create new appointment
router.post('/create', async (req, res) => {
  try {
    const { patientName, patientEmail, patientPhone, patientMessage, doctorId, appointmentDate, appointmentTime } = req.body;

    // Validate input
    if (!patientName || !patientEmail || !patientPhone || !doctorId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Create appointment
    const appointment = new Appointment({
      patientName,
      patientEmail,
      patientPhone,
      patientMessage,
      doctorId,
      appointmentDate,
      appointmentTime,
      status: 'pending'
    });

    await appointment.save();

    // Notify doctor via Socket.io
    const io = require('../server').io;
    io.emit(`doctor-${doctorId}`, {
      type: 'new_appointment',
      appointment
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all appointments for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({ doctorId })
      .populate('doctorId', 'clinicName')
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update appointment status
router.put('/:appointmentId/status', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Notify patient
    const io = require('../server').io;
    io.emit(`appointment-${appointmentId}`, {
      type: 'status_updated',
      status,
      appointment
    });

    res.status(200).json({
      success: true,
      message: `Appointment ${status}`,
      appointment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointment by ID
router.get('/:appointmentId', async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId).populate('doctorId');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
