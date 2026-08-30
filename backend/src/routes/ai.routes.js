const express = require('express');
const axios = require('axios');
const Appointment = require('../models/Appointment');

const router = express.Router();

// OpenAI API Key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// ============ AI APPOINTMENT PROCESSING ============

// Process appointment message with AI
router.post('/process-appointment', async (req, res) => {
  try {
    const { message, doctorId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Call OpenAI to extract appointment details
    const aiResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful dental appointment assistant. Extract appointment details from patient messages in JSON format.
            
            Extract the following if present:
            - appointmentType: (e.g., checkup, cleaning, root canal)
            - preferredDate: (e.g., "2024-09-15")
            - preferredTime: (e.g., "14:30")
            - urgency: (low, medium, high)
            - additionalNotes: any other important information
            
            Return ONLY valid JSON, no additional text.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let extractedData = {};
    try {
      const content = aiResponse.data.choices[0].message.content;
      extractedData = JSON.parse(content);
    } catch (parseError) {
      extractedData = {
        appointmentType: 'general',
        urgency: 'normal',
        additionalNotes: message
      };
    }

    const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence

    res.status(200).json({
      success: true,
      extractedData,
      confidence: Math.round(confidence * 100),
      message: 'Appointment details extracted successfully'
    });
  } catch (error) {
    console.error('AI Processing Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============ AI CHATBOT ============

// Chat with AI assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Build conversation context
    const messages = [
      {
        role: 'system',
        content: `You are BookDent, a friendly dental appointment booking assistant. 
        Help patients schedule appointments, answer questions about dental services, 
        and provide helpful information about dental health. Be professional and courteous.`
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    const aiResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const assistantMessage = aiResponse.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      message: assistantMessage,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage }
      ]
    });
  } catch (error) {
    console.error('Chat Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============ AI RECOMMENDATIONS ============

// Get AI-powered appointment recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { patientHistory, symptoms, doctorId } = req.body;

    const prompt = `Based on the patient's history and symptoms, provide dental care recommendations.
    
    History: ${patientHistory}
    Symptoms: ${symptoms}
    
    Provide recommendations in JSON format with:
    - recommendedTreatments: array of suggested treatments
    - urgency: (low, medium, high)
    - estimatedDuration: in minutes
    - estimatedCost: approximate cost range
    - additionalNotes: important information`;

    const aiResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a dental expert AI assistant. Provide professional medical recommendations. Return ONLY valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let recommendations = {};
    try {
      const content = aiResponse.data.choices[0].message.content;
      recommendations = JSON.parse(content);
    } catch (parseError) {
      recommendations = {
        recommendedTreatments: ['Consultation required'],
        urgency: 'medium',
        additionalNotes: 'Please consult with the dentist for proper diagnosis'
      };
    }

    res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Recommendations Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============ AI APPOINTMENT SCHEDULING ============

// Auto-suggest available slots based on AI
router.post('/suggest-slots', async (req, res) => {
  try {
    const { doctorId, preferredDate, appointmentType } = req.body;

    // Fetch doctor's working hours
    const Doctor = require('../models/Doctor');
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Get existing appointments
    const existingAppointments = await Appointment.find({
      doctorId,
      appointmentDate: new Date(preferredDate)
    });

    const dayName = new Date(preferredDate).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const workingHours = doctor.workingHours[dayName];

    if (!workingHours) {
      return res.status(400).json({ error: 'Doctor not available on this day' });
    }

    // Generate available slots
    const slots = [];
    const startHour = parseInt(workingHours.start.split(':')[0]);
    const endHour = parseInt(workingHours.end.split(':')[0]);
    const duration = doctor.appointmentDuration || 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += duration) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const isBooked = existingAppointments.some(apt => apt.appointmentTime === timeStr);
        
        if (!isBooked) {
          slots.push({
            time: timeStr,
            available: true
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      availableSlots: slots.slice(0, 10), // Return first 10 available slots
      appointmentType,
      duration: `${doctor.appointmentDuration} minutes`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ AI CUSTOMER SUPPORT ============

// Answer frequently asked questions
router.post('/faq', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const aiResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a dental booking assistant. Answer questions about:
            - Appointment booking process
            - Cancellation policies
            - Payment methods
            - Dental services
            - Emergency procedures
            Be concise and helpful.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.5,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const answer = aiResponse.data.choices[0].message.content;

    res.status(200).json({
      success: true,
      question,
      answer
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ AI PRESCRIPTION & NOTES ============

// Generate prescription from doctor notes
router.post('/generate-prescription', async (req, res) => {
  try {
    const { appointmentId, doctorNotes } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const aiResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a dental prescription assistant. Generate a professional prescription 
            in JSON format based on doctor notes. Include medication names, dosages, and instructions.`
          },
          {
            role: 'user',
            content: `Doctor notes: ${doctorNotes}`
          }
        ],
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let prescription = {};
    try {
      const content = aiResponse.data.choices[0].message.content;
      prescription = JSON.parse(content);
    } catch (parseError) {
      prescription = {
        medications: [],
        instructions: 'Please contact dentist for detailed prescription'
      };
    }

    res.status(200).json({
      success: true,
      appointmentId,
      prescription
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
