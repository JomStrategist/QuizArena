import { connectToDatabase } from '@/lib/db/connect';
import { QuizModel } from '@/models/Quiz';
import { QuestionModel } from '@/models/Question';
import mongoose from 'mongoose';

export async function seedQuizMaterials(trainerIdString: string = '650000000000000000000001') {
  await connectToDatabase();
  const trainerId = new mongoose.Types.ObjectId(trainerIdString);

  // Clear previous seeded materials to ensure exact fresh synchronization
  const seededTitles = [
    'Activity 1: AI or Not? Challenge',
    'Activity 2: AI Technology Detective',
    'Activity 3: AI Solution & Workflow Challenge',
    'Activity 4: Prompt Engineering Challenge',
  ];

  await QuizModel.deleteMany({ title: { $in: seededTitles } });

  // -------------------------------------------------------------
  // QUIZ 1: "Activity 1: AI or Not?" (15 Binary Choice Questions)
  // -------------------------------------------------------------
  const activity1QuestionsData = [
    {
      questionText: "A music app studies a listener's previous songs, skips and playlists, then recommends songs the listener may enjoy.",
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: "The system uses patterns in the listener's behavior to make personalized recommendations. This is an AI use case.",
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: "A refrigerator automatically starts its cooling system when its internal temperature rises above 5°C.",
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'The refrigerator follows a fixed rule: if the temperature crosses a set threshold, turn cooling on. That is automation, not AI.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: "A banking system examines a customer's transaction patterns and identifies unusual activity that may indicate fraud.",
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'The system analyzes data patterns to identify unusual behavior and potential fraud. This is an AI use case.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'A phone automatically switches to silent mode every day between 10 PM and 7 AM because the user has configured a schedule.',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'The phone is following a predefined schedule. It does not need to learn or interpret anything, so this is not AI.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'An online shopping website looks at what a customer has viewed and purchased and recommends products they might be interested in.',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'The system uses customer behavior patterns to make personalized recommendations. This is an AI use case.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'A car automatically turns on its headlights when a light sensor detects that the surroundings have become dark.',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'A sensor detects a simple condition and triggers a predefined action. This is ordinary automation, not AI.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'A handwriting application analyzes a person\'s handwritten notes and converts them into editable digital text.',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'The system has to recognize complex visual patterns and interpret them as characters and words. That is an AI capability.',
      category: 'Computer Vision',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'A phone unlocks when its front camera recognizes the user\'s face.',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'The phone analyzes facial features and compares the detected pattern with the enrolled face. This is an AI use case.',
      category: 'Computer Vision',
      difficulty: 'EASY',
    },
    {
      questionText: 'A travel application predicts that a flight is likely to be delayed by analyzing historical flight patterns, weather information and current flight data.',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'The system uses data and patterns to predict a future event. That is an AI use case.',
      category: 'Machine Learning',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'A traffic light changes from green to yellow to red according to a programmed timing sequence.',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'A sensor detects a simple condition and the machine follows a predefined safety rule. This is not AI.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'A vending machine gives you the selected drink or snack after you insert the required payment.',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'The machine is executing programmed control rules. It is automatic, but it does not require AI.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'A photo app automatically groups pictures based on what is visible in them, such as pets, beaches or food.',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'The app analyzes image content and recognizes visual patterns to categorize photos. That is an AI use case.',
      category: 'Computer Vision',
      difficulty: 'EASY',
    },
    {
      questionText: 'Amazon Alexa understands when you say, "Set an alarm for 6 AM tomorrow."',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'The system must interpret human speech and understand the user\'s request. Speech and language understanding are AI capabilities.',
      category: 'NLP',
      difficulty: 'EASY',
    },
    {
      questionText: 'An office printer automatically prints a report every Monday at 9 AM because a schedule was configured.',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'The printer is simply following a schedule that was configured in advance. This is not AI.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'A weather app predicts whether it will rain tomorrow by analyzing weather data and patterns.',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'The system analyzes data and patterns to make a prediction about a future event. This is an AI use case.',
      category: 'Machine Learning',
      difficulty: 'EASY',
    },
  ];

  const q1Docs = await QuestionModel.insertMany(
    activity1QuestionsData.map((q) => ({
      ...q,
      trainerId,
      timeLimit: 15,
      points: 1000,
      tags: ['AI-vs-NotAI', 'Workshop-Activity1'],
    }))
  );

  const quiz1 = await QuizModel.create({
    trainerId,
    title: 'Activity 1: AI or Not? Challenge',
    category: 'AI Foundations',
    description: 'Mini Activity — 15 Situations to classify whether a system uses AI or ordinary automation.',
    instructions: 'Examine each situation and select AI or Not AI based on whether it learns from data or uses fixed rules.',
    questionIds: q1Docs.map((doc) => doc._id),
    status: 'READY',
    defaultTimeLimit: 15,
    defaultPoints: 1000,
  });

  // -------------------------------------------------------------
  // QUIZ 2: "Activity 2: AI Technology Detective" (Exactly 2 Drag & Drop Activities)
  // -------------------------------------------------------------
  const activity2QuestionsData = [
    {
      questionText: 'Activity 1 — Sort the Solutions',
      questionType: 'DRAG_AND_DROP',
      options: [
        'Customer churn prediction',
        'House price prediction',
        'Next month\'s sales forecast',
        'Handwritten digit recognition',
        'Speech recognition',
        'Complex medical image learning',
        'Customer email classification',
        'Meeting summary',
        'Language translation',
        'Factory defect detection',
        'Traffic camera vehicle counting',
        'Reading a barcode from a camera',
      ],
      categories: [
        { id: 'ml', title: 'Traditional Machine Learning', description: 'Structured business data used to predict or classify.' },
        { id: 'dl', title: 'Deep Learning', description: 'Neural networks learn complex patterns from many examples.' },
        { id: 'nlp', title: 'Natural Language Processing (NLP)', description: 'The main job is to understand or work with human language.' },
        { id: 'cv', title: 'Computer Vision', description: 'The main job is to understand images or video.' },
      ],
      categoryAssignments: {
        '0': 'ml',
        '1': 'ml',
        '2': 'ml',
        '3': 'dl',
        '4': 'dl',
        '5': 'dl',
        '6': 'nlp',
        '7': 'nlp',
        '8': 'nlp',
        '9': 'cv',
        '10': 'cv',
        '11': 'cv',
      },
      explanation: 'Drag each of the 12 cards into the category that best describes it. You can also click a card, then click a category.',
      category: 'AI Architectures',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Activity 2 — Choose the AI Combination',
      questionType: 'DRAG_AND_DROP',
      options: [
        'Case 1: A customer-service voice assistant must understand spoken words and use a neural network trained on voice recordings.',
        'Case 2: A factory uses camera images and deep learning to identify damaged products on the assembly line.',
        'Case 3: A company predicts employee churn using structured HR data like salary, tenure, department, and age.',
        'Case 4: A support system automatically classifies customer emails as complaints, questions, or refund requests.',
        'Case 5: A security system uses video footage and neural networks to detect violent activity in real-time.',
        'Case 6: A bakery predicts next week\'s item sales using past sales history, prices, promotions, and day of week.',
      ],
      categories: [
        { id: 'nlp_dl', title: 'NLP + Deep Learning', description: 'Understands human speech/language using neural networks.' },
        { id: 'cv_dl', title: 'Computer Vision + Deep Learning', description: 'Understands images or video footage using neural networks.' },
        { id: 'tml', title: 'Traditional Machine Learning', description: 'Predicts outcomes using structured tabular data.' },
        { id: 'nlp_ml', title: 'NLP + Machine Learning', description: 'Classifies text and language using classification models.' },
      ],
      categoryAssignments: {
        '0': 'nlp_dl',
        '1': 'cv_dl',
        '2': 'tml',
        '3': 'nlp_ml',
        '4': 'cv_dl',
        '5': 'tml',
      },
      explanation: 'Now choose the best combination for each real-life case. Some cases use one concept; others combine a problem area with a learning approach.',
      category: 'AI Architectures',
      difficulty: 'MEDIUM',
    },
  ];

  const q2Docs = await QuestionModel.insertMany(
    activity2QuestionsData.map((q) => ({
      ...q,
      trainerId,
      timeLimit: 30,
      points: 1000,
      tags: ['AI-Detective', 'Workshop-Activity2'],
    }))
  );

  const quiz2 = await QuizModel.create({
    trainerId,
    title: 'Activity 2: AI Technology Detective',
    category: 'AI Classification',
    description: 'Learn the difference between Traditional ML, Deep Learning, NLP, and Computer Vision.',
    instructions: 'Categorize solutions into technology areas and select the best AI technology combinations.',
    questionIds: q2Docs.map((doc) => doc._id),
    status: 'READY',
    defaultTimeLimit: 30,
    defaultPoints: 1000,
  });

  // -------------------------------------------------------------
  // QUIZ 3: "Activity 3: AI Solution & Workflow Challenge" (13 Questions)
  // -------------------------------------------------------------
  const activity3QuestionsData = [
    // Part 1: AI Solution Business Scenarios
    {
      questionText: 'Marketing Content: A product team needs 20 social media captions and 5 product descriptions for a new launch. A human will review everything before publishing.',
      questionType: 'MCQ',
      options: ['Generative AI', 'AI Copilot', 'AI Agent', 'Machine Learning', 'Automation'],
      correctOptionIndex: 0,
      explanation: 'Creating new text content with human review is the primary use case for Generative AI.',
      category: 'AI Solution Architecture',
      difficulty: 'EASY',
    },
    {
      questionText: 'Sales Manager Assistant: Every Monday, a sales manager wants AI to summarize the weekly sales spreadsheet, highlight unusual changes, and suggest questions the manager should investigate.',
      questionType: 'MCQ',
      options: ['Generative AI', 'AI Copilot', 'AI Agent', 'Machine Learning', 'Automation'],
      correctOptionIndex: 1,
      explanation: 'Working alongside a manager to summarize data and suggest investigation paths represents an AI Copilot.',
      category: 'AI Solution Architecture',
      difficulty: 'EASY',
    },
    {
      questionText: 'Customer Support Task: A support system receives a customer request. AI should read it, check the customer\'s account, find the answer in the knowledge base, update the ticket, and escalate complex cases.',
      questionType: 'MCQ',
      options: ['Generative AI', 'AI Copilot', 'AI Agent', 'Machine Learning', 'Automation'],
      correctOptionIndex: 2,
      explanation: 'Completing connected multi-step actions across business tools autonomously represents an AI Agent.',
      category: 'AI Solution Architecture',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Customer Churn Prediction: A company has 3 years of customer data and wants to predict which customers are most likely to cancel their subscription next month so the sales team can contact them early.',
      questionType: 'MCQ',
      options: ['Generative AI', 'AI Copilot', 'AI Agent', 'Machine Learning', 'Automation'],
      correctOptionIndex: 3,
      explanation: 'Learning patterns from historical tabular data to predict future behavior is Machine Learning.',
      category: 'AI Solution Architecture',
      difficulty: 'EASY',
    },
    {
      questionText: 'Employee Leave Request: Whenever an employee submits a leave request, the system should check whether the required information is complete and send the request to the employee\'s manager for approval.',
      questionType: 'MCQ',
      options: ['Generative AI', 'AI Copilot', 'AI Agent', 'Machine Learning', 'Automation'],
      correctOptionIndex: 4,
      explanation: 'Following fixed predefined conditional rules without learning or content creation is Automation.',
      category: 'AI Solution Architecture',
      difficulty: 'EASY',
    },

    // Part 2: Workflow Automation Challenges (Sequence)
    {
      questionText: 'Build the Automated Leave Request Workflow in the exact logical sequence:',
      questionType: 'CORRECT_SEQUENCE',
      options: [
        'Form Submitted',
        'Check Leave Details',
        'Manager Approval',
        'Send Approval / Rejection Notification',
      ],
      correctOrder: [0, 1, 2, 3],
      explanation: 'Leave workflow sequence: Form Submitted -> Check Details -> Manager Approval -> Send Notification.',
      category: 'Workflow Automation',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Build the Automated Sales Report Workflow in the exact logical sequence:',
      questionType: 'CORRECT_SEQUENCE',
      options: [
        'Monthly Schedule',
        'Get Sales Data',
        'Prepare Sales Report',
        'Send Report to Management',
      ],
      correctOrder: [0, 1, 2, 3],
      explanation: 'Sales report workflow sequence: Schedule -> Fetch Data -> Prepare Report -> Deliver to Management.',
      category: 'Workflow Automation',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Build the Customer Complaint Automation Workflow in the exact logical sequence:',
      questionType: 'CORRECT_SEQUENCE',
      options: [
        'Complaint Received',
        'Capture Complaint Details',
        'Check Complaint Priority',
        'High Priority → Escalate to Manager',
        'Normal Priority → Send Acknowledgement',
        'Update Complaint Status',
      ],
      correctOrder: [0, 1, 2, 3, 4, 5],
      explanation: 'Complaint workflow: Received -> Capture Details -> Priority Check -> Escalation/Acknowledgement Branches -> Update Status.',
      category: 'Workflow Automation',
      difficulty: 'HARD',
    },

    // Part 3: AI Governance Questions
    {
      questionText: 'A team wants to summarize customer support conversations containing names, emails, and phone numbers. What should the team do before using an AI tool?',
      questionType: 'MCQ',
      options: [
        'Use a public AI tool directly because it is faster',
        'Remove or anonymize sensitive personal information before using AI',
        'Upload everything because the AI tool is only used internally',
        'Ask employees to manually copy sensitive details into public AI prompt boxes',
      ],
      correctOptionIndex: 1,
      explanation: 'Sensitive personal identifiable information (PII) must be anonymized before submitting data to AI services.',
      category: 'AI Governance',
      difficulty: 'EASY',
    },
    {
      questionText: 'An employee uses AI to prepare a financial report. The AI generates an incorrect figure, and the employee submits it to management without checking. Who is responsible for ensuring accuracy?',
      questionType: 'MCQ',
      options: [
        'The AI is responsible because it generated the number',
        'The AI vendor company is responsible for the financial report',
        'The employee/team using the AI must review and verify the output',
        'Nobody is responsible because AI can hallucinate',
      ],
      correctOptionIndex: 2,
      explanation: 'Accountability remains with the human professional using the AI tool.',
      category: 'AI Governance',
      difficulty: 'EASY',
    },
    {
      questionText: 'Which AI use case requires the strongest governance and risk controls?',
      questionType: 'MCQ',
      options: [
        'AI creates ideas for a company\'s social media posts',
        'AI summarizes an internal team meeting',
        'AI recommends whether a job applicant should be hired',
        'AI creates a draft internal newsletter',
      ],
      correctOptionIndex: 2,
      explanation: 'Employment, hiring, and financial credit decisions carry high ethical/legal impact and require stringent governance controls.',
      category: 'AI Governance',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Select all responsible actions to take when an AI chatbot gives inconsistent customer answers:',
      questionType: 'MCQ',
      options: [
        'Monitor chatbot outputs & test with representative questions',
        'Allow the chatbot to run completely unmonitored',
        'Define clear escalation triggers to hand over complex cases to human agents',
        'Investigate and correct recurring errors in the knowledge base',
      ],
      correctOptionIndex: 0,
      explanation: 'Responsible AI deployments require output monitoring, safety testing, human handover rules, and root cause fixes.',
      category: 'AI Governance',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Order the governance steps for introducing an AI system for employee performance data:',
      questionType: 'CORRECT_SEQUENCE',
      options: [
        'Define purpose and intended use',
        'Identify data being used',
        'Assess privacy, security, bias and risks',
        'Establish human oversight and approval',
        'Test the AI system',
        'Monitor system after deployment',
      ],
      correctOrder: [0, 1, 2, 3, 4, 5],
      explanation: 'Governance lifecycle: Purpose -> Data -> Risk Assessment -> Governance & Oversight -> Testing -> Ongoing Monitoring.',
      category: 'AI Governance',
      difficulty: 'HARD',
    },
  ];

  const q3Docs = await QuestionModel.insertMany(
    activity3QuestionsData.map((q) => ({
      ...q,
      trainerId,
      timeLimit: 30,
      points: 1000,
      tags: ['AI-Solution-Challenge', 'Workshop-Activity3'],
    }))
  );

  const quiz3 = await QuizModel.create({
    trainerId,
    title: 'Activity 3: AI Solution & Workflow Challenge',
    category: 'AI Solution Architecture',
    description: 'Solve real-world business scenarios, build end-to-end automated workflows, and master AI governance.',
    instructions: 'Select optimal AI approaches, build ordered workflows, and choose responsible AI governance answers.',
    questionIds: q3Docs.map((doc) => doc._id),
    status: 'READY',
    defaultTimeLimit: 30,
    defaultPoints: 1000,
  });

  // -------------------------------------------------------------
  // QUIZ 4: "Activity 4: Prompt Engineering Challenge (RCTOF)" (4 Prompt Builder Exercises)
  // -------------------------------------------------------------
  const activity4QuestionsData = [
    {
      questionText: 'Exercise 1: Build an Effective Prompt for Data Governance for Non-Technical Managers',
      questionType: 'PROMPT_BUILDER',
      options: ['Role', 'Context', 'Task', 'Output Format', 'Constraint'],
      promptBlocks: {
        role: ['Act as a Data Governance trainer.', 'Act as a senior software developer.'],
        context: ['The audience is department managers with no technical background.', 'The audience is experienced Python programmers.'],
        task: ['Explain Data Governance in a simple and practical way.', 'Create a database application.'],
        outputFormat: ['Present the answer using clear headings and bullet points.', 'Provide the answer as Python code.'],
        constraint: ['Keep the explanation under 200 words.', 'Make the response at least 2,000 words.'],
      },
      explanation: 'RCTOF Framework: Role (Data Governance trainer) + Context (Non-technical managers) + Task (Simple explanation) + Format (Headings & bullets) + Constraint (<200 words).',
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Exercise 2: Improve a Weak Prompt for Sales Performance Analysis',
      questionType: 'PROMPT_BUILDER',
      options: ['Role', 'Context', 'Task', 'Output Format', 'Constraint'],
      promptBlocks: {
        role: ['Act as a sales performance analyst.', 'Act as a software developer.'],
        context: ['The audience is a sales manager preparing for a management meeting.', 'The audience is a group of database administrators.'],
        task: ['Analyze the monthly sales data, identify the best and worst regions, and give three actionable recommendations.', 'Write Python code to analyze the data.'],
        outputFormat: ['Present the result with a short management summary followed by bullet points.', 'Create a social media campaign.'],
        constraint: ['Use only the supplied sales data and do not invent figures.', 'Use technical language and include every available detail.'],
      },
      explanation: 'RCTOF Framework: Role (Sales analyst) + Context (Sales manager meeting) + Task (Analyze data & recommend) + Format (Executive summary & bullets) + Constraint (Use supplied data only).',
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Exercise 3: Build a Customer Service Prompt for Handling Angry Customers',
      questionType: 'PROMPT_BUILDER',
      options: ['Role', 'Context', 'Task', 'Output Format', 'Constraint'],
      promptBlocks: {
        role: ['Act as a customer service manager.', 'Act as a graphic designer.'],
        context: ['The audience is a customer service team.', 'The audience is software engineers.'],
        task: ['Create a short response explaining how to handle an angry customer professionally.', 'Write JavaScript code for a customer portal.'],
        outputFormat: ['Use a numbered list with five practical steps.', 'Use a long essay format.'],
        constraint: ['Keep the response under 150 words and do not blame the customer.', 'Include unrelated product specifications.'],
      },
      explanation: 'RCTOF Framework: Role (CS manager) + Context (CS team) + Task (Professional handling guide) + Format (5 numbered steps) + Constraint (<150 words & no blame).',
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Exercise 4: Build an HR Policy Update Prompt for Employees',
      questionType: 'PROMPT_BUILDER',
      options: ['Role', 'Context', 'Task', 'Output Format', 'Constraint'],
      promptBlocks: {
        role: ['Act as an HR communication specialist.', 'Act as a financial trader.'],
        context: ['The audience is employees who will receive a company policy update.', 'The audience is software engineers.'],
        task: ['Create a clear prompt for AI to explain the policy change and what employees need to do.', 'Write a detailed Python application.'],
        outputFormat: ['Present the answer with a short summary followed by employee action points.', 'Generate a social media advertisement.'],
        constraint: ['Use only the information provided in the policy and do not invent rules.', 'Use technical legal language throughout.'],
      },
      explanation: 'RCTOF Framework: Role (HR spec) + Context (Employees receiving policy) + Task (Explain change & action points) + Format (Summary & action items) + Constraint (Policy info only).',
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
    },
  ];

  const q4Docs = await QuestionModel.insertMany(
    activity4QuestionsData.map((q) => ({
      ...q,
      trainerId,
      timeLimit: 30,
      points: 1000,
      tags: ['RCTOF-Prompting', 'Workshop-Activity4'],
    }))
  );

  const quiz4 = await QuizModel.create({
    trainerId,
    title: 'Activity 4: Prompt Engineering Challenge',
    category: 'Prompt Engineering',
    description: 'Master the RCTOF framework for effective Generative AI prompt construction.',
    instructions: 'Select and assemble RCTOF prompt blocks into clear, high-performing prompts.',
    questionIds: q4Docs.map((doc) => doc._id),
    status: 'READY',
    defaultTimeLimit: 30,
    defaultPoints: 1000,
  });

  return {
    quiz1,
    quiz2,
    quiz3,
    quiz4,
    totalQuestionsSeeded: q1Docs.length + q2Docs.length + q3Docs.length + q4Docs.length,
  };
}
