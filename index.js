const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const { google } = require('googleapis');
const moment = require('moment');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Import the new node-based system
const FlowController = require('./services/FlowController');

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000');
// gmail informations 
// Initialize Flow Controller
const flowController = new FlowController();

// Middleware
app.use(cors({
  origin: "*",
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Global email transporter
let transporter = null;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_RECEIVER || 'vitneshsettlo@gmail.com';

// In-memory session storage (use Redis for production)
const userSessions = new Map();

// =================== UTILITY FUNCTIONS ===================

const generateSessionId = () => {
  return crypto.randomBytes(16).toString('hex');
};

const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const initializeEmailConfig = async (retryCount = 3) => {
  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      console.log(`🔍 Email initialization attempt ${attempt}/${retryCount}...`);
      console.log(`📧 Using email: ${process.env.EMAIL_USER}`);
      
      transporter = createTransporter();
      
      const verifyResult = await Promise.race([
        transporter.verify(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email verification timeout')), 30000)
        )
      ]);
      
      console.log('✅ Email configuration verified successfully');
      return true;
      
    } catch (error) {
      console.error(`❌ Email configuration attempt ${attempt} failed:`, error.message);
      
      if (attempt === retryCount) {
        console.log('❌ All email initialization attempts failed');
        transporter = null;
        return false;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return false;
};

// =================== EMAIL TEMPLATES ===================

const getComprehensiveEmailTemplate = (userData, sessionId, flowType = 'work') => {
  const currentDateTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const totalFields = Object.keys(userData).length;
  const completedFields = Object.values(userData).filter(value => 
    value && value !== '' && value !== 'Not provided'
  ).length;
  const completenessScore = Math.round((completedFields / totalFields) * 100);

  let priority = 'Standard';
  if (userData.targetTimeline === 'Within 6 months' || userData.targetTimeline === 'As soon as possible') {
    priority = 'High';
  }
  if (userData.savingsAmount && userData.savingsAmount.includes('25+')) {
    priority = 'VIP';
  }
  if (userData.germanLanguageLevel && !userData.germanLanguageLevel.includes('No knowledge')) {
    priority = 'High';
  }
  
  const flowTypeText = flowType === 'study' ? 'Study Abroad' : 'Work Migration';
  
  return {
    client: {
      subject: `🎉 Your Comprehensive Germany ${flowTypeText} Profile - ${userData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #e60023, #b8001f); color: white; padding: 30px; border-radius: 15px 15px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🌍 PayanaOverseas</h1>
            <h2 style="margin: 15px 0 0 0; font-size: 20px;">Your Germany ${flowTypeText} Profile</h2>
            <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; margin-top: 20px;">
              <p style="margin: 0; font-size: 16px;">Profile Completeness: ${completenessScore}%</p>
              <p style="margin: 5px 0 0 0; font-size: 16px;">Priority Level: ${priority}</p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 15px 15px;">
            <h2 style="color: #e60023; margin-top: 0;">Dear ${userData.name},</h2>
            
            <p style="font-size: 16px; line-height: 1.6;">
              Thank you for sharing comprehensive information about your ${flowTypeText.toLowerCase()} aspirations. 
              Our specialized team will review your profile and contact you within 24 hours with a 
              personalized Germany migration strategy.
            </p>
            
            <div style="background: linear-gradient(135deg, #e60023, #b8001f); color: white; padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center;">
              <h3 style="margin: 0 0 15px 0;">📞 What Happens Next?</h3>
              <div style="text-align: left; max-width: 500px; margin: 0 auto;">
                <p style="margin: 8px 0;">✅ Profile review by our Germany experts</p>
                <p style="margin: 8px 0;">✅ Personalized ${flowTypeText.toLowerCase()} strategy creation</p>
                <p style="margin: 8px 0;">✅ Direct call within 24 hours</p>
                <p style="margin: 8px 0;">✅ Custom documentation checklist</p>
              </div>
              <div style="margin-top: 20px; font-size: 18px; font-weight: bold;">
                📱 Emergency Contact: +91 9003619777
              </div>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <p style="color: #666; font-size: 14px;">
                Session ID: ${sessionId}<br>
                Generated: ${currentDateTime}
              </p>
            </div>
          </div>
        </div>
      `
    },
    
    admin: {
      subject: `🚨 ${priority} PRIORITY - New ${flowTypeText} Profile: ${userData.name} (${completenessScore}% complete)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #e60023, #b8001f); color: white; padding: 30px; text-align: center;">
            <h1>🚨 NEW ${flowTypeText.toUpperCase()} PROFILE</h1>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; flex: 1; margin: 0 10px;">
                <h3 style="margin: 0;">Priority Level</h3>
                <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${priority}</p>
              </div>
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; flex: 1; margin: 0 10px;">
                <h3 style="margin: 0;">Completeness</h3>
                <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${completenessScore}%</p>
              </div>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              ${Object.entries(userData).map(([key, value]) => 
                `<p style="margin: 5px 0;"><strong>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ${value}</p>`
              ).join('')}
            </div>
            
            <div style="background: ${priority === 'VIP' ? '#FFD700' : priority === 'High' ? '#FF6B6B' : '#4ECDC4'}; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <h3 style="margin: 0; color: white;">⚡ ACTION REQUIRED</h3>
              <p style="margin: 10px 0 0 0; color: white; font-weight: bold;">
                ${priority} Priority Lead - Contact within ${priority === 'VIP' ? '2 hours' : priority === 'High' ? '4 hours' : '24 hours'}
              </p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <p style="color: #666; font-size: 14px;">
                <strong>Session ID:</strong> ${sessionId}<br>
                <strong>Received:</strong> ${currentDateTime}
              </p>
            </div>
          </div>
        </div>
      `
    }
  };
};

// =================== TRIGGER HANDLERS ===================

const handleTriggers = async (questionNode, userData, sessionId) => {
  if (!questionNode.triggers) return;
  
  for (const trigger of questionNode.triggers) {
    switch (trigger) {
      case 'german_program_email':
        await sendGermanProgramEmail(userData, sessionId);
        break;
      case 'ug_program_email':
        await sendUGProgramEmail(userData, sessionId);
        break;
      case 'google_meet_creation':
        await createGoogleMeetAppointment(userData, sessionId);
        break;
      case 'website_redirect':
        // Handle website opening logic
        console.log(`🌐 Website redirect trigger for ${userData.journeyReady}`);
        break;
      case 'settlo_redirect':
        // Handle Settlo team redirect
        console.log(`🌐 Settlo redirect trigger`);
        break;
    }
  }
};

const sendGermanProgramEmail = async (userData, sessionId) => {
  if (!transporter || !userData.email) return;
  
  try {
    await transporter.sendMail({
      from: `"PayanaOverseas" <${process.env.EMAIL_USER}>`,
      to: userData.email,
      subject: "🇩🇪 Your German Language Program Details",
      html: `
        <h2>Welcome to German Language Program!</h2>
        <p>Dear ${userData.name},</p>
        <p>Thank you for your interest in learning German. We've prepared a comprehensive program for you.</p>
        <p>Our team will contact you shortly with program details.</p>
        <p>Best regards,<br>PayanaOverseas Team</p>
      `
    });
    console.log(`📧 German program email sent to: ${userData.email}`);
  } catch (error) {
    console.error('❌ Failed to send German program email:', error);
  }
};

const sendUGProgramEmail = async (userData, sessionId) => {
  if (!transporter || !userData.email) return;
  
  try {
    await transporter.sendMail({
      from: `"PayanaOverseas" <${process.env.EMAIL_USER}>`,
      to: userData.email,
      subject: `🎓 UG ${userData.ugMajor} Program Details`,
      html: `
        <h2>UG ${userData.ugMajor} Program Information</h2>
        <p>Dear ${userData.name},</p>
        <p>We've prepared specialized information for ${userData.ugMajor} professionals.</p>
        ${userData.ugMajor === 'Dentist' ? '<p>Includes FSP and KP exam preparation details.</p>' : ''}
        <p>Our team will contact you shortly with program details.</p>
        <p>Best regards,<br>PayanaOverseas Team</p>
      `
    });
    console.log(`📧 UG program email sent to: ${userData.email}`);
  } catch (error) {
    console.error('❌ Failed to send UG program email:', error);
  }
};

const createGoogleMeetAppointment = async (userData, sessionId) => {
  // Placeholder for Google Meet creation logic
  console.log(`📅 Creating Google Meet appointment for ${userData.name} on ${userData.appointmentDate} at ${userData.appointmentTime}`);
  // Implement Google Calendar API integration here
};

// =================== API ROUTES ===================

// Start conversation
app.post('/api/conversation/start', async (req, res) => {
  try {
    const { flowId = 'payanaWorkFlow' } = req.body; // Default to existing work flow
    const sessionId = generateSessionId();
    
    // Start the flow using FlowController
    const flowStart = flowController.startFlow(flowId);
    
    // Initialize session
    const session = {
      sessionId,
      flowId: flowStart.flowId,
      currentQuestionId: flowStart.questionId,
      userData: {},
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    userSessions.set(sessionId, session);
    
    console.log(`✅ New conversation started: ${sessionId} - Flow: ${flowId}`);
    
    res.json({
      success: true,
      sessionId,
      question: flowStart.question,
      flowInfo: flowController.getFlowInfo(flowId)
    });
  } catch (error) {
    console.error('❌ Error starting conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Handle user response
app.post('/api/conversation/respond', async (req, res) => {
  try {
    const { sessionId, questionId, response } = req.body;
    
    console.log(`📝 Response received: ${sessionId} - ${questionId} - ${response}`);
    
    const session = userSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    
    // Validate response using FlowController
    const validation = flowController.validateResponse(questionId, response);
    if (!validation.valid) {
      return res.json({
        success: false,
        error: validation.message,
        question: flowController.getQuestionNode(questionId)
      });
    }
    
    // Handle triggers for current question
    const currentQuestion = flowController.getQuestionNode(questionId);
    await handleTriggers(currentQuestion, session.userData, sessionId);
    
    // Get next question using FlowController
    const nextStep = flowController.getNextQuestion(
      session.flowId,
      questionId,
      response,
      session.userData
    );
    
    // Update session
    session.currentQuestionId = nextStep?.questionId || null;
    session.lastActivity = new Date().toISOString();
    
    if (!nextStep) {
      // End of conversation - save comprehensive data
      try {
        const flowInfo = flowController.getFlowInfo(session.flowId);
        const flowType = flowInfo.id.includes('study') ? 'study' : 'work';
        
        await saveComprehensiveData(session, flowType);
        console.log(`✅ Conversation completed: ${sessionId}`);
        
        return res.json({
          success: true,
          completed: true,
          userData: session.userData
        });
      } catch (saveError) {
        console.error('❌ Error saving comprehensive data:', saveError);
        return res.json({
          success: true,
          completed: true,
          userData: session.userData,
          saveError: saveError.message
        });
      }
    }
    
    res.json({
      success: true,
      question: nextStep.question,
      userData: session.userData,
      progress: {
        completed: Object.keys(session.userData).length,
        total: flowController.getFlowInfo(session.flowId).totalQuestions
      }
    });
    
  } catch (error) {
    console.error('❌ Error handling response:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =================== DATABASE OPERATIONS ===================

// Save comprehensive data
const saveComprehensiveData = async (session, flowType = 'work') => {
  const { sessionId, userData } = session;
  
  try {
    // Save to database
    const insertQuery = `
      INSERT INTO comprehensive_user_profiles (
        session_id, name, email, phone, age, current_city, qualification, 
        ug_major, current_job_title, current_salary, industry, experience_years,
        german_language_level, preferred_city, salary_expectations, family_status,
        savings_amount, target_timeline, concerns, support_services_interest,
        referral_source, communication_preference, best_contact_time,
        profile_data, flow_type, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, NOW())
      RETURNING id
    `;
    
    const result = await pool.query(insertQuery, [
      sessionId,
      userData.name || '',
      userData.email || '',
      userData.phone || '',
      userData.age || null,
      userData.currentCity || '',
      userData.qualification || '',
      userData.ugMajor || '',
      userData.currentJobTitle || '',
      userData.currentSalary || '',
      userData.industry || '',
      userData.experienceYears || '',
      userData.germanLanguageLevel || userData.germanLanguage || '',
      userData.preferredCity || '',
      userData.salaryExpectations || '',
      userData.familyStatus || '',
      userData.savingsAmount || '',
      userData.targetTimeline || '',
      JSON.stringify(userData.concerns || []),
      JSON.stringify(userData.supportServicesInterest || []),
      userData.referralSource || '',
      userData.communicationPreference || '',
      userData.bestContactTime || '',
      JSON.stringify(userData),
      flowType
    ]);
    
    const profileId = result.rows[0].id;
    console.log(`✅ Comprehensive profile saved: ${profileId}`);
    
    // Send emails
    if (transporter && userData.email) {
      try {
        const emailTemplates = getComprehensiveEmailTemplate(userData, sessionId, flowType);
        
        // Send client email
        await transporter.sendMail({
          from: `"PayanaOverseas" <${process.env.EMAIL_USER}>`,
          to: userData.email,
          subject: emailTemplates.client.subject,
          html: emailTemplates.client.html
        });
        
        console.log(`📧 Client email sent to: ${userData.email}`);
        
        // Send admin email
        await transporter.sendMail({
          from: `"PayanaOverseas" <${process.env.EMAIL_USER}>`,
          to: ADMIN_EMAIL,
          subject: emailTemplates.admin.subject,
          html: emailTemplates.admin.html
        });
        
        console.log(`📧 Admin email sent to: ${ADMIN_EMAIL}`);
        
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
      }
    }
    
    return profileId;
    
  } catch (error) {
    console.error('❌ Error saving comprehensive data:', error);
    throw error;
  }
};

// Create comprehensive profiles table
const createComprehensiveTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS comprehensive_user_profiles (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      age INTEGER,
      current_city VARCHAR(255),
      qualification VARCHAR(255),
      ug_major VARCHAR(255),
      current_job_title VARCHAR(255),
      current_salary VARCHAR(100),
      industry VARCHAR(255),
      experience_years VARCHAR(100),
      german_language_level VARCHAR(100),
      preferred_city VARCHAR(255),
      salary_expectations VARCHAR(100),
      family_status VARCHAR(100),
      savings_amount VARCHAR(100),
      target_timeline VARCHAR(100),
      concerns JSONB,
      support_services_interest JSONB,
      referral_source VARCHAR(255),
      communication_preference VARCHAR(100),
      best_contact_time VARCHAR(100),
      profile_data JSONB,
      flow_type VARCHAR(20) DEFAULT 'work',
      created_at TIMESTAMP DEFAULT NOW(),
      contacted BOOLEAN DEFAULT false,
      contact_notes TEXT,
      priority_level VARCHAR(20) DEFAULT 'Standard'
    )
  `;
  
  try {
    await pool.query(createTableQuery);
    console.log('✅ Comprehensive profiles table ready');
  } catch (error) {
    console.error('❌ Error creating comprehensive table:', error);
  }
};

// =================== ADDITIONAL API ROUTES ===================

// Get available flows
app.get('/api/flows', (req, res) => {
  try {
    const flows = flowController.getAvailableFlows();
    res.json({ success: true, flows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    services: {
      database: 'connected',
      email: transporter ? 'configured' : 'not configured',
      activeSessions: userSessions.size,
      flowController: 'active',
      availableFlows: flowController.getAvailableFlows().length
    },
    timestamp: new Date().toISOString()
  });
});

// Get session info (for debugging)
app.get('/api/session/:sessionId', (req, res) => {
  const session = userSessions.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    sessionId: session.sessionId,
    flowId: session.flowId,
    currentQuestion: session.currentQuestionId,
    startTime: session.startTime,
    lastActivity: session.lastActivity,
    dataFields: Object.keys(session.userData).length,
    userData: session.userData
  });
});

// Session cleanup (run periodically)
const cleanupOldSessions = () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  for (const [sessionId, session] of userSessions.entries()) {
    if (new Date(session.lastActivity) < oneDayAgo) {
      userSessions.delete(sessionId);
      console.log(`🗑️ Cleaned up old session: ${sessionId}`);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupOldSessions, 60 * 60 * 1000);

// =================== START SERVER ===================

const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');
    
    // Create comprehensive table
    await createComprehensiveTable();
    
    // Initialize email
    const emailInitialized = await initializeEmailConfig();
    console.log(`📧 Email: ${emailInitialized ? 'configured' : 'failed'}`);
    console.log(`👨‍💼 Admin email: ${ADMIN_EMAIL}`);
    
    // Initialize FlowController
    const availableFlows = flowController.getAvailableFlows();
    console.log(`📋 Available flows: ${availableFlows.map(f => f.name).join(', ')}`);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('✅ PayanaOverseas Node-Based Chatbot Server Ready');
      console.log('📧 Email service ready');
      console.log('🧠 FlowController active with node-based architecture');
      console.log('📊 Comprehensive data collection enabled');
      console.log('🎯 Multi-flow support active (Work + Study)');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
