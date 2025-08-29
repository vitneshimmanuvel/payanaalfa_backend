// Complete question nodes library - preserving ALL your existing questions
const questionNodes = {
  
  // =================== BASIC INFORMATION NODES ===================
  
  ask_name: {
    id: 'ask_name',
    category: 'basic_info',
    type: 'text',
    inputType: 'text',
    text: 'Welcome to PayanaOverseas Solutions! Please enter your full name:',
    validation: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-Z\s]+$/,
      errorMessage: 'Please enter a valid name (at least 2 letters, letters and spaces only)'
    },
    dataField: 'name',
    tags: ['personal', 'required', 'basic'],
    weight: 10
  },

  ask_age: {
    id: 'ask_age',
    category: 'basic_info',
    type: 'text',
    inputType: 'number',
    text: (userData) => `Thanks ${userData.name}! What's your age?`,
    validation: {
      required: true,
      min: 16,
      max: 65,
      errorMessage: 'Please enter a valid age (between 16-65 years)'
    },
    dataField: 'age',
    tags: ['personal', 'required', 'basic'],
    weight: 9
  },

  ask_email: {
    id: 'ask_email',
    category: 'basic_info',
    type: 'text',
    inputType: 'email',
    text: 'Please share your email address:',
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Please enter a valid email address (e.g., example@gmail.com)'
    },
    dataField: 'email',
    tags: ['contact', 'required', 'basic'],
    weight: 8
  },

  // =================== PROGRAM SELECTION NODE ===================
  
  ask_study_or_work: {
    id: 'ask_study_or_work',
    category: 'program_selection',
    type: 'select',
    text: (userData) => `Hi ${userData.name}! Are you looking to Study or Work abroad?`,
    options: ['Work', 'Study'],
    dataField: 'purpose',
    tags: ['program', 'branching', 'required'],
    weight: 7
  },

  // =================== STUDY PATH NODES (NEW) ===================
  
  ask_qualification_study: {
    id: 'ask_qualification_study',
    category: 'education',
    type: 'select',
    text: 'What is your highest qualification?',
    options: ['12th Completed', 'UG Completed', 'PG Completed'],
    dataField: 'qualification',
    tags: ['education', 'study_path'],
    weight: 6
  },

  ask_experience_years_study: {
    id: 'ask_experience_years_study',
    category: 'experience',
    type: 'select',
    text: 'How many years of experience do you have?',
    options: ['2 years', '3 years', '5+ years'],
    dataField: 'experienceYears',
    tags: ['experience', 'study_path'],
    weight: 5
  },

  ask_ielts_willing: {
    id: 'ask_ielts_willing',
    category: 'language_tests',
    type: 'select',
    text: 'Are you willing to write IELTS?',
    options: ['Yes', 'No'],
    dataField: 'ieltsWilling',
    tags: ['language', 'tests', 'study_path'],
    weight: 4
  },

  ask_profession_study: {
    id: 'ask_profession_study',
    category: 'career',
    type: 'select',
    text: 'Which profession are you interested in?',
    options: ['Nursing', 'Engineering', 'Management', 'Others'],
    dataField: 'profession',
    tags: ['career', 'study_path'],
    weight: 3
  },

  ask_financial_constraints: {
    id: 'ask_financial_constraints',
    category: 'financial',
    type: 'select',
    text: 'Do you have any financial constraints?',
    options: ['We can manage', 'Loan assist needed', 'Scholarship needed'],
    dataField: 'constraints',
    tags: ['financial', 'study_path'],
    weight: 2
  },

  ask_resume_upload_study: {
    id: 'ask_resume_upload_study',
    category: 'documents',
    type: 'file',
    text: 'Kindly share your resume:',
    options: ['Upload Resume', 'Skip Upload'],
    dataField: 'resumeUploaded',
    tags: ['documents', 'optional'],
    weight: 1
  },

  ask_german_language_study: {
    id: 'ask_german_language_study',
    category: 'language',
    type: 'select',
    text: 'Are you willing to learn German language?',
    options: ['Yes', 'No'],
    dataField: 'germanLanguage',
    tags: ['language', 'study_path'],
    weight: 0
  },

  ask_country_preference: {
    id: 'ask_country_preference',
    category: 'preferences',
    type: 'text',
    inputType: 'text',
    text: 'Which country are you prepared for and why?',
    validation: {
      required: true,
      minLength: 10,
      errorMessage: 'Please provide at least 10 characters explaining your choice'
    },
    dataField: 'countryPreference', 
    tags: ['preferences', 'study_path'],
    weight: -1
  },

  ask_intake_year: {
    id: 'ask_intake_year',
    category: 'timeline',
    type: 'select',
    text: 'Which intake year are you planning for?',
    options: ['2025', '2026', '2027'],
    dataField: 'intakeYear',
    tags: ['timeline', 'study_path'],
    weight: -2
  },

  // =================== WORK PATH NODES (ALL YOUR EXISTING WORK QUESTIONS) ===================
  
  ask_passport: {
    id: 'ask_passport',
    category: 'documents',
    type: 'select',
    text: 'Do you have a valid passport?',
    options: ['Yes', 'No'],
    dataField: 'passport',
    tags: ['documents', 'work_path', 'required'],
    weight: 6
  },

  ask_resume_choice: {
    id: 'ask_resume_choice',
    category: 'documents',
    type: 'select',
    text: 'Do you have a resume to upload?',
    options: ['Upload Resume', 'No Resume'],
    dataField: 'resume_choice',
    tags: ['documents', 'work_path'],
    weight: 5
  },

  ask_qualification_work: {
    id: 'ask_qualification_work',
    category: 'education',
    type: 'select',
    text: 'What is your highest qualification?',
    options: ['12th Completed', 'UG Completed', 'PG Completed'],
    dataField: 'qualification',
    tags: ['education', 'work_path'],
    weight: 4
  },

  ask_work_experience: {
    id: 'ask_work_experience',
    category: 'experience',
    type: 'select',
    text: 'How many years of work experience do you have?',
    options: ['No experience', '1-2yr', '2-3yr', '3-5yr', '5+yr'],
    dataField: 'experience',
    tags: ['experience', 'work_path'],
    weight: 3
  },

  ask_interested_categories: {
    id: 'ask_interested_categories',
    category: 'preferences',
    type: 'select',
    text: 'Are you interested in any of these categories?',
    options: ['Yes', 'No'],
    dataField: 'interestedInCategories',
    tags: ['preferences', 'work_path'],
    weight: 2
  },

  ask_german_language_work: {
    id: 'ask_german_language_work',
    category: 'language',
    type: 'select',
    text: 'Are you ready to learn the German language?',
    options: ['Yes', 'No'],
    dataField: 'germanLanguage',
    tags: ['language', 'work_path'],
    weight: 1,
    triggers: ['german_program_email'] // Email trigger
  },

  ask_continue_program: {
    id: 'ask_continue_program',
    category: 'program',
    type: 'select',
    text: 'Can you continue with this program?',
    options: ['Yes', 'No'],
    dataField: 'continueProgram',
    tags: ['program', 'work_path'],
    weight: 0
  },

  ask_program_start_time: {
    id: 'ask_program_start_time',
    category: 'timeline',
    type: 'select',
    text: 'When can you kick start your program?',
    options: ['Immediately', 'Need some time', 'Need more clarification'],
    dataField: 'programStartTime',
    tags: ['timeline', 'work_path'],
    weight: -1
  },

  ask_schedule_consultation: {
    id: 'ask_schedule_consultation',
    category: 'consultation',
    type: 'select',
    text: 'Would you like to schedule a consultation call with our expert?',
    options: ['Yes', 'No'],
    dataField: 'scheduleConsultation',
    tags: ['consultation', 'work_path'],
    weight: -2
  },

  ask_appointment_type: {
    id: 'ask_appointment_type',
    category: 'consultation',
    type: 'select',
    text: 'How would you prefer to have your consultation?',
    options: ['In-person appointment', 'Google Meet appointment'],
    dataField: 'appointmentType',
    tags: ['consultation', 'work_path'],
    weight: -3
  },

  ask_appointment_time: {
    id: 'ask_appointment_time',
    category: 'consultation',
    type: 'select',
    text: 'What time works best for you?',
    options: ['Morning', 'Evening'],
    dataField: 'appointmentTime',
    tags: ['consultation', 'work_path'],
    weight: -4
  },

  ask_appointment_date: {
    id: 'ask_appointment_date',
    category: 'consultation',
    type: 'text',
    inputType: 'date',
    text: 'Please choose your preferred date (format: YYYY-MM-DD):',
    validation: {
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      errorMessage: 'Please enter date in YYYY-MM-DD format (e.g., 2025-08-15)'
    },
    dataField: 'appointmentDate',
    tags: ['consultation', 'work_path'],
    weight: -5
  },

  ask_appointment_confirmation: {
    id: 'ask_appointment_confirmation',
    category: 'consultation',
    type: 'select',
    text: (userData) => `Perfect! Your ${userData.appointmentTime?.toLowerCase()} appointment is scheduled for ${userData.appointmentDate}. Would you like to confirm this appointment?`,
    options: ['Confirm', 'No'],
    dataField: 'appointmentConfirmed',
    tags: ['consultation', 'work_path'],
    weight: -6,
    triggers: ['google_meet_creation'] // Trigger Google Meet
  },

  ask_germany_entry_year: {
    id: 'ask_germany_entry_year',
    category: 'timeline',
    type: 'select',
    text: 'When do you want to enter into Germany?',
    options: ['2025', '2026', '2027'],
    dataField: 'entryYear',
    tags: ['timeline', 'work_path'],
    weight: -7
  },

  ask_journey_ready: {
    id: 'ask_journey_ready',
    category: 'program',
    type: 'select',
    text: 'Ready to start your journey?',
    options: ['Yes', 'Claim Free Passport', 'Register Now'],
    dataField: 'journeyReady',
    tags: ['program', 'work_path'],
    weight: -8,
    triggers: ['website_redirect'] // Website opening trigger
  },

  ask_financial_job_support: {
    id: 'ask_financial_job_support',
    category: 'financial',
    type: 'select',
    text: 'Do you need local financial job support to achieve your abroad dream?',
    options: ['Yes', 'No', 'Contact Settlo Team'],
    dataField: 'financialJobSupport',
    tags: ['financial', 'work_path'],
    weight: -9,
    triggers: ['settlo_redirect'] // Settlo website trigger
  },

  // =================== UG MAJOR NODES (ALL YOUR EXISTING UG LOGIC) ===================
  
  ask_ug_major: {
    id: 'ask_ug_major',
    category: 'education',
    type: 'select',
    text: 'What is your UG major?',
    options: ['Nurses', 'Dentist', 'Engineering', 'Arts Background', 'MBBS'],
    dataField: 'ugMajor',
    tags: ['education', 'ug_path'],
    weight: 10
  },

  ask_ug_work_experience: {
    id: 'ask_ug_work_experience',
    category: 'experience',
    type: 'select',
    text: 'Do you have any work experience?',
    options: ['Yes', 'No'],
    dataField: 'workExperience',
    tags: ['experience', 'ug_path'],
    weight: 9
  },

  ask_ug_experience_years: {
    id: 'ask_ug_experience_years',
    category: 'experience',
    type: 'select',
    text: 'How many years of experience?',
    options: ['1-2yr', '2-3yr', '3-5yr', '5+yr'],
    dataField: 'experienceYears',
    tags: ['experience', 'ug_path'],
    weight: 8
  },

  ask_ug_german_language: {
    id: 'ask_ug_german_language',
    category: 'language',
    type: 'select',
    text: (userData) => {
      if (userData.ugMajor === 'Dentist') {
        return 'Are you willing to learn German language and ready to clear FSP and KP exams?';
      }
      return 'Are you willing to learn German language?';
    },
    options: ['Yes', 'No'],
    dataField: 'germanLanguageUG',
    tags: ['language', 'ug_path'],
    weight: 7,
    triggers: ['ug_program_email'] // UG-specific email
  },

  ask_ug_program_continue: {
    id: 'ask_ug_program_continue',
    category: 'program',
    type: 'select',
    text: 'Please kindly check your mail. Can you continue with this program?',
    options: ['Yes', 'No'],
    dataField: 'ugProgramContinue',
    tags: ['program', 'ug_path'],
    weight: 6
  },

  ask_ug_program_start_time: {
    id: 'ask_ug_program_start_time',
    category: 'timeline',
    type: 'select',
    text: 'When can you kick start your program?',
    options: ['Immediately', 'Need some time', 'Need more clarification'],
    dataField: 'ugProgramStartTime',
    tags: ['timeline', 'ug_path'],
    weight: 5
  },

  ask_email_correction: {
    id: 'ask_email_correction',
    category: 'basic_info',
    type: 'text',
    inputType: 'email',
    text: 'No problem! Please enter your email correctly and we\'ll send you alternative opportunities.',
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Please enter a valid email address'
    },
    dataField: 'correctedEmail',
    tags: ['contact', 'correction'],
    weight: 0
  },

  // =================== MESSAGE NODES ===================
  
  study_not_available: {
    id: 'study_not_available',
    category: 'message',
    type: 'message',
    text: 'Study programs are currently being updated. Please contact our team directly for study-related queries.',
    dataField: null,
    tags: ['message', 'redirect'],
    weight: -5
  },

  no_passport_message: {
    id: 'no_passport_message',
    category: 'message',
    type: 'message',
    text: 'You have some time to make financial setups. Now you have to start learning German language now. Ready to start your journey?',
    dataField: null,
    tags: ['message', 'work_path'],
    weight: -10
  },

  in_person_location: {
    id: 'in_person_location',
    category: 'message',
    type: 'message',
    text: 'Perfect! Our office is located at: 📍 Payana Overseas Solutions<br>Manipal Centre, Dickenson Rd, Bangalore - 560042',
    dataField: null,
    tags: ['message', 'location'],
    weight: -11
  },

  show_study_eligibility: {
    id: 'show_study_eligibility',
    category: 'result',
    type: 'message',
    text: (userData) => {
      return `
        <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 25px; border-radius: 15px; margin: 15px 0;">
          <h3 style="margin: 0 0 15px 0; text-align: center;">🎉 Great News ${userData.name}!</h3>
          <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px;">
            <h4 style="margin: 0 0 10px 0;">You are eligible to apply for:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Germany Study Programs</li>
              <li>Scholarship Opportunities</li>
              <li>Language Learning Support</li>
              <li>Career Guidance</li>
            </ul>
            <div style="text-align: center; margin-top: 20px;">
              <p style="margin: 0; font-size: 18px; font-weight: bold;">📞 Our team will contact you within 24 hours!</p>
              <p style="margin: 5px 0 0 0;">Emergency Contact: +91 9003619777</p>
            </div>
          </div>
        </div>
      `;
    },
    dataField: null,
    tags: ['result', 'final', 'study_path'],
    weight: -15
  },

  show_work_summary: {
    id: 'show_work_summary',
    category: 'result',
    type: 'summary',
    text: 'Thank you for providing all the information!',
    dataField: null,
    tags: ['result', 'final', 'work_path'],
    weight: -20,
    bitta : alfa .

  }
};

module.exports = questionNodes;
