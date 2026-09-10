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
    'AI Concepts & Prompting Quiz',
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
        'Case 1: A customer-service voice assistant must understand what customers say and use a neural network trained on thousands of voice examples. What combination is needed?',
        'Case 2: A factory wants to use camera images to identify damaged products. What combination is most appropriate?',
        'Case 3: A company wants to predict which employees may leave using salary, tenure, age, department and previous performance data. What is the clearest approach?',
        'Case 4: A company wants to automatically classify customer emails as complaint, question, compliment or refund request. What combination best describes the solution?',
        'Case 5: A security system uses camera footage and a neural network to detect whether violence or fighting is happening in the scene. What combination is needed?',
        'Case 6: A bakery wants to predict how many items it will sell next week using previous sales, prices, promotions, day of the week, seasonality and other sales information. What is the clearest approach?',
      ],
      categories: [
        { id: 'nlp_dl', title: 'NLP + Deep Learning' },
        { id: 'cv_dl', title: 'Computer Vision + Deep Learning' },
        { id: 'cv_tml', title: 'Computer Vision + Traditional Machine Learning' },
        { id: 'nlp_cv', title: 'NLP + Computer Vision' },
        { id: 'nlp_tml', title: 'NLP + Traditional Machine Learning' },
        { id: 'tml', title: 'Traditional Machine Learning only' },
        { id: 'nlp_ml', title: 'NLP + Machine Learning' },
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
  // QUIZ 3: "Activity 3: AI Solution Challenge" (5 Interactive Solution Scenarios)
  // -------------------------------------------------------------
  const activity3QuestionsData = [
    {
      questionText: 'Scenario 1: Marketing Content',
      questionType: 'SCENARIO_QUESTIONS',
      options: ['Generative AI', 'AI Copilot', 'AI Agent', 'Automation', 'Machine Learning'],
      explanation: 'Generative AI creates new original text copy with a mandatory human approval gate before publishing.',
      category: 'AI Solution Architecture',
      topic: 'Marketing Content',
      difficulty: 'MEDIUM',
      scenarioQuestionsData: {
        scenarioTitle: 'Marketing Content',
        scenarioText: 'A product team needs 20 social media captions and 5 product descriptions for a new launch. A human will review everything before publishing.',
        instructions: 'Read the scenario carefully and complete the 4 steps below.',
        backgroundContext: 'The objective is to automate bulk content creation while ensuring 100% human editorial oversight.',
        subQuestions: [
          {
            id: 'sub_1_1',
            questionType: 'MCQ',
            questionText: 'Step 1: Choose the AI approach\nChoose carefully: one answer is the best fit. Selecting a wrong answer reduces marks.',
            options: [
              'AI Copilot (Assists a person with their work)',
              'AI Agent (Performs multi-step tasks using tools)',
              'Automation (Follows predefined rules and steps)',
              'Generative AI (Creates new content)',
              'Machine Learning (Learns from data to make predictions)'
            ],
            correctOptionIndex: 3,
            points: 250,
            explanation: 'Generative AI directly creates new, original copy from product specification inputs.'
          },
          {
            id: 'sub_1_2',
            questionType: 'MULTIPLE_SELECT',
            questionText: 'Step 2: Select required capabilities & system components (Select all correct options)',
            options: [
              'Generate creative social media text copy',
              'Create multi-platform product descriptions',
              'Enforce brand tone and style guidelines',
              'Human review & approval gate before publishing',
              'Train deep learning image neural network'
            ],
            correctOptionIndices: [0, 1, 2, 3],
            points: 250,
            explanation: 'The system requires content generation, tone enforcement, product description creation, and an editorial review gate.'
          },
          {
            id: 'sub_1_3',
            questionType: 'CORRECT_SEQUENCE',
            questionText: 'Step 3: Arrange the workflow in exact logical sequence',
            options: [
              'Input product brief and key features',
              'Generate initial draft copy with AI',
              'Human editor reviews and refines content',
              'Publish approved copy to marketing channels'
            ],
            correctOrder: [0, 1, 2, 3],
            points: 250,
            explanation: 'Workflow sequence: Input brief -> AI draft generation -> Human editorial review -> Publish.'
          },
          {
            id: 'sub_1_4',
            questionType: 'MCQ',
            questionText: 'Step 4: Human Control & Risk Management',
            options: [
              'Human Approval Gate (Human marketer reviews, edits, and gives final approval before publication)',
              'Exception-Based Oversight (AI publishes standard posts automatically)',
              'Full AI Autonomy (AI publishes content directly without human review)'
            ],
            correctOptionIndex: 0,
            points: 250,
            explanation: 'A Human Approval Gate ensures brand compliance and prevents unreviewed hallucinations from being published.'
          }
        ]
      }
    },
    {
      questionText: 'Scenario 2: Sales Manager Assistant',
      questionType: 'SCENARIO_QUESTIONS',
      options: ['AI Copilot', 'AI Agent', 'Automation', 'Generative AI', 'Machine Learning'],
      explanation: 'An AI Copilot empowers the executive with automated spreadsheet analysis while the human retains full decision authority.',
      category: 'AI Solution Architecture',
      topic: 'Sales Manager Assistant',
      difficulty: 'MEDIUM',
      scenarioQuestionsData: {
        scenarioTitle: 'Sales Manager Assistant',
        scenarioText: 'Every Monday, a sales manager wants AI to summarize the weekly sales spreadsheet, highlight unusual changes, and suggest questions the manager should investigate.',
        instructions: 'Read the scenario carefully and complete the 4 steps below.',
        backgroundContext: 'The VP remains fully accountable for all operational decisions; the system must assist, not make sales calls.',
        subQuestions: [
          {
            id: 'sub_2_1',
            questionType: 'MCQ',
            questionText: 'Step 1: Choose the AI approach\nChoose carefully: one answer is the best fit. Selecting a wrong answer reduces marks.',
            options: [
              'AI Copilot (Assists a person with their work)',
              'AI Agent (Performs multi-step tasks using tools)',
              'Automation (Follows predefined rules and steps)',
              'Generative AI (Creates new content)',
              'Machine Learning (Learns from data to make predictions)'
            ],
            correctOptionIndex: 0,
            points: 250,
            explanation: 'The AI acts as an interactive Copilot alongside the sales executive to summarize data and suggest questions.'
          },
          {
            id: 'sub_2_2',
            questionType: 'MULTIPLE_SELECT',
            questionText: 'Step 2: Select required capabilities & system components (Select all correct options)',
            options: [
              'Ingest weekly sales spreadsheet data',
              'Summarize key metric shifts and revenue trends',
              'Highlight unusual statistical variance or anomalies',
              'Suggest investigation questions for management review',
              'Automatically terminate underperforming sales reps'
            ],
            correctOptionIndices: [0, 1, 2, 3],
            points: 250,
            explanation: 'The Copilot must ingest spreadsheet data, calculate variances, highlight anomalies, and generate meeting discussion points.'
          },
          {
            id: 'sub_2_3',
            questionType: 'CORRECT_SEQUENCE',
            questionText: 'Step 3: Arrange the workflow in exact logical sequence',
            options: [
              'Receive weekly sales spreadsheet',
              'AI analyzes data & extracts performance trends',
              'Generate summary report & discussion prompts',
              'Sales manager reviews insights and conducts team meeting'
            ],
            correctOrder: [0, 1, 2, 3],
            points: 250,
            explanation: 'Workflow sequence: Ingest spreadsheet -> AI trend analysis -> Summary & question generation -> Executive decision review.'
          },
          {
            id: 'sub_2_4',
            questionType: 'MCQ',
            questionText: 'Step 4: Human Control & Risk Management',
            options: [
              'Copilot Decision Support (Sales manager retains 100% decision authority while AI provides insights)',
              'Automated Rule Execution (System automatically adjusts quotas and alerts without review)',
              'Autonomous Management (AI makes strategic decisions for teams without human involvement)'
            ],
            correctOptionIndex: 0,
            points: 250,
            explanation: 'Strategic management decisions require contextual human judgment and organizational accountability.'
          }
        ]
      }
    },
    {
      questionText: 'Scenario 3: Customer Support Task',
      questionType: 'SCENARIO_QUESTIONS',
      options: ['AI Agent', 'AI Copilot', 'Automation', 'Generative AI', 'Machine Learning'],
      explanation: 'An AI Agent combines multi-step reasoning, external tool execution (CRM, billing, knowledge base), and escalation guardrails.',
      category: 'AI Solution Architecture',
      topic: 'Customer Support Task',
      difficulty: 'MEDIUM',
      scenarioQuestionsData: {
        scenarioTitle: 'Customer Support Task',
        scenarioText: 'A support system receives a customer request. AI should read it, check the customer\'s account, find the answer in the knowledge base, update the ticket, and escalate complex cases.',
        instructions: 'Read the scenario carefully and complete the 4 steps below.',
        backgroundContext: 'Complex edge cases and billing disputes exceeding $20 must be escalated to human agents.',
        subQuestions: [
          {
            id: 'sub_3_1',
            questionType: 'MCQ',
            questionText: 'Step 1: Choose the AI approach\nChoose carefully: one answer is the best fit. Selecting a wrong answer reduces marks.',
            options: [
              'AI Copilot (Assists a person with their work)',
              'AI Agent (Performs multi-step tasks using tools)',
              'Automation (Follows predefined rules and steps)',
              'Generative AI (Creates new content)',
              'Machine Learning (Learns from data to make predictions)'
            ],
            correctOptionIndex: 1,
            points: 250,
            explanation: 'The system uses tools autonomously (CRM, KB API) to execute multi-step tasks, which defines an AI Agent.'
          },
          {
            id: 'sub_3_2',
            questionType: 'MULTIPLE_SELECT',
            questionText: 'Step 2: Select required capabilities & system components (Select all correct options)',
            options: [
              'Parse incoming customer support tickets',
              'Query account database & knowledge base APIs',
              'Execute automated ticket updates',
              'Escalate complex edge cases to human support agents',
              'Send arbitrary unapproved refunds'
            ],
            correctOptionIndices: [0, 1, 2, 3],
            points: 250,
            explanation: 'The AI Agent parses ticket intent, queries CRM/KB APIs, updates tickets, and escalates complex edge cases.'
          },
          {
            id: 'sub_3_3',
            questionType: 'CORRECT_SEQUENCE',
            questionText: 'Step 3: Arrange the workflow in exact logical sequence',
            options: [
              'Receive customer support request',
              'AI agent reads request and queries CRM/Knowledge Base',
              'Execute appropriate resolution action or update ticket',
              'Escalate to human agent if confidence threshold is low'
            ],
            correctOrder: [0, 1, 2, 3],
            points: 250,
            explanation: 'Workflow sequence: Receive ticket -> Query APIs -> Execute resolution -> Escalate low-confidence edge cases.'
          },
          {
            id: 'sub_3_4',
            questionType: 'MCQ',
            questionText: 'Step 4: Human Control & Risk Management',
            options: [
              'Human Escalation & Fallback (Agent operates within tool boundaries and escalates complex/high-value cases)',
              'Full Autonomous Authority (Agent resolves all tickets including high-dollar disputes with zero oversight)',
              '100% Manual Approval (Human must approve every routine response manually)'
            ],
            correctOptionIndex: 0,
            points: 250,
            explanation: 'Autonomous agents must be bounded by financial caps and clear human escalation rules to prevent financial risk.'
          }
        ]
      }
    },
    {
      questionText: 'Scenario 4: Customer Churn Prediction',
      questionType: 'SCENARIO_QUESTIONS',
      options: ['Machine Learning', 'AI Copilot', 'AI Agent', 'Automation', 'Generative AI'],
      explanation: 'Machine Learning classification models analyze historical behavioral features to forecast future subscriber churn risk.',
      category: 'AI Solution Architecture',
      topic: 'Customer Churn Prediction',
      difficulty: 'MEDIUM',
      scenarioQuestionsData: {
        scenarioTitle: 'Customer Churn Prediction',
        scenarioText: 'A company has 3 years of customer data and wants to predict which customers are most likely to cancel their subscription next month so the sales team can contact them early.',
        instructions: 'Read the scenario carefully and complete the 4 steps below.',
        backgroundContext: 'Predictions must provide risk probabilities; account managers determine intervention strategies.',
        subQuestions: [
          {
            id: 'sub_4_1',
            questionType: 'MCQ',
            questionText: 'Step 1: Choose the AI approach\nChoose carefully: one answer is the best fit. Selecting a wrong answer reduces marks.',
            options: [
              'AI Copilot (Assists a person with their work)',
              'AI Agent (Performs multi-step tasks using tools)',
              'Automation (Follows predefined rules and steps)',
              'Generative AI (Creates new content)',
              'Machine Learning (Learns from data to make predictions)'
            ],
            correctOptionIndex: 4,
            points: 250,
            explanation: 'Predicting future subscriber behavior based on historical structured data patterns is a Machine Learning classification task.'
          },
          {
            id: 'sub_4_2',
            questionType: 'MULTIPLE_SELECT',
            questionText: 'Step 2: Select required capabilities & system components (Select all correct options)',
            options: [
              'Aggregate historical customer usage & payment data',
              'Train classification model to calculate churn risk scores',
              'Flag high-risk accounts on sales dashboard',
              'Periodically retrain model to prevent model drift',
              'Generate fictional customer profiles'
            ],
            correctOptionIndices: [0, 1, 2, 3],
            points: 250,
            explanation: 'The system requires data aggregation, model training, dashboard alert integration, and regular retraining to combat drift.'
          },
          {
            id: 'sub_4_3',
            questionType: 'CORRECT_SEQUENCE',
            questionText: 'Step 3: Arrange the workflow in exact logical sequence',
            options: [
              'Extract historical subscriber behavioral data',
              'Train predictive Machine Learning classification model',
              'Output churn risk probability scores',
              'Sales team proactively contacts high-risk customers'
            ],
            correctOrder: [0, 1, 2, 3],
            points: 250,
            explanation: 'Workflow sequence: Data extraction -> Model training -> Score generation -> Proactive sales team outreach.'
          },
          {
            id: 'sub_4_4',
            questionType: 'MCQ',
            questionText: 'Step 4: Human Control & Risk Management',
            options: [
              'Model Drift & Regular Retraining (Regularly retrain model with current customer data to maintain predictive accuracy)',
              'Automated Mass Account Penalties (System automatically restricts accounts flagged as high churn risk)',
              'Autonomous Account Termination (System cancels subscriptions automatically based on prediction thresholds)'
            ],
            correctOptionIndex: 0,
            points: 250,
            explanation: 'ML models require regular retraining with fresh data to adapt to changing customer behavior patterns.'
          }
        ]
      }
    },
    {
      questionText: 'Scenario 5: Employee Leave Request',
      questionType: 'SCENARIO_QUESTIONS',
      options: ['Automation', 'AI Copilot', 'AI Agent', 'Generative AI', 'Machine Learning'],
      explanation: 'Deterministic, rule-governed workflows with 100% policy compliance require Rule-Based Automation rather than probabilistic models.',
      category: 'AI Solution Architecture',
      topic: 'Employee Leave Request',
      difficulty: 'MEDIUM',
      scenarioQuestionsData: {
        scenarioTitle: 'Employee Leave Request',
        scenarioText: 'Whenever an employee submits a leave request, the system should check whether the required information is complete and send the request to the employee\'s manager for approval.',
        instructions: 'Read the scenario carefully and complete the 4 steps below.',
        backgroundContext: 'Process must strictly follow company policy rules; incomplete or invalid requests must be rejected immediately.',
        subQuestions: [
          {
            id: 'sub_5_1',
            questionType: 'MCQ',
            questionText: 'Step 1: Choose the AI approach\nChoose carefully: one answer is the best fit. Selecting a wrong answer reduces marks.',
            options: [
              'AI Copilot (Assists a person with their work)',
              'AI Agent (Performs multi-step tasks using tools)',
              'Automation (Follows predefined rules and steps)',
              'Generative AI (Creates new content)',
              'Machine Learning (Learns from data to make predictions)'
            ],
            correctOptionIndex: 2,
            points: 250,
            explanation: 'Leave approvals follow deterministic IF-THEN rules with 100% policy compliance, requiring Rule-Based Automation.'
          },
          {
            id: 'sub_5_2',
            questionType: 'MULTIPLE_SELECT',
            questionText: 'Step 2: Select required capabilities & system components (Select all correct options)',
            options: [
              'Trigger process on employee form submission',
              'Validate required fields and leave balance rules',
              'Route approval request to direct manager',
              'Sync approved leave with HRIS and calendar',
              'Guess missing form details using AI'
            ],
            correctOptionIndices: [0, 1, 2, 3],
            points: 250,
            explanation: 'The automated workflow triggers on form submit, validates balance/policy rules, routes approval tasks, and syncs HRIS/calendars.'
          },
          {
            id: 'sub_5_3',
            questionType: 'CORRECT_SEQUENCE',
            questionText: 'Step 3: Arrange the workflow in exact logical sequence',
            options: [
              'Employee submits digital leave request form',
              'Validate required data & check leave balance',
              'Route approval notification to manager',
              'Update HRIS balance, sync calendar & notify employee'
            ],
            correctOrder: [0, 1, 2, 3],
            points: 250,
            explanation: 'Workflow sequence: Form submission -> Policy validation -> Manager routing -> HRIS/calendar update & notification.'
          },
          {
            id: 'sub_5_4',
            questionType: 'MCQ',
            questionText: 'Step 4: Human Control & Risk Management',
            options: [
              'Strict Policy Rule Compliance (Deterministic execution ensuring 100% compliance with corporate policy)',
              'AI Prediction Guessing (AI guesses missing dates or intent if data is incomplete)',
              'Automatic Unconditional Approval (System approves requests without manager validation)'
            ],
            correctOptionIndex: 0,
            points: 250,
            explanation: 'Deterministic policy workflows require 100% rule compliance and auditability rather than probabilistic AI guesses.'
          }
        ]
      }
    }
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
      questionText: 'Exercise 1 — Build an Effective Prompt',
      questionType: 'PROMPT_BUILDER',
      options: [
        'Act as a professional meeting summarization assistant.',
        'The audience is busy managers who need a quick overview.',
        'Summarize the meeting and identify key decisions, action items, and responsible people.',
        'Present the answer with clear headings and bullet points.',
        'Use only information from the supplied transcript and do not invent details.',
        'Act as a meeting participant.',
        'Focus mainly on rewriting the transcript into more formal language.',
        'Present the summary as one continuous paragraph without headings or bullet points.',
        'Include only the main topic discussed in the meeting.',
        'Write the summary without mentioning any action items.',
      ],
      promptBuilderData: {
        scenarioTitle: 'Exercise 1 — Build an Effective Prompt',
        scenarioText: 'A management team wants to use AI to turn a long business meeting transcript into a clear summary. The managers are busy and need the important decisions, action items, and responsibilities quickly. Build a prompt for an AI assistant that clearly defines who the AI should act as, who the response is for, what the AI should achieve, how the answer should be presented, and one clear limitation.',
        instruction: 'Select the useful pieces, arrange them, and review the prompt you created.',
        pieces: [
          { text: 'Use only information from the supplied transcript and do not invent details.', isCorrect: true },
          { text: 'Act as a professional meeting summarization assistant.', isCorrect: true },
          { text: 'Write the summary without mentioning any action items.', isCorrect: false },
          { text: 'Summarize the meeting and identify key decisions, action items, and responsible people.', isCorrect: true },
          { text: 'Focus mainly on rewriting the transcript into more formal language.', isCorrect: false },
          { text: 'The audience is busy managers who need a quick overview.', isCorrect: true },
          { text: 'Act as a meeting participant.', isCorrect: false },
          { text: 'Present the answer with clear headings and bullet points.', isCorrect: true },
          { text: 'Present the summary as one continuous paragraph without headings or bullet points.', isCorrect: false },
          { text: 'Include only the main topic discussed in the meeting.', isCorrect: false },
        ],
      },
      explanation: 'RCTOF Framework: Role (Professional meeting summarization assistant) + Context (Busy managers needing quick overview) + Task (Summarize decisions, action items & responsibilities) + Format (Clear headings & bullet points) + Constraint (Use only supplied transcript).',
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Exercise 2 — Improve a Weak Prompt',
      questionType: 'PROMPT_BUILDER',
      options: [
        'Act as a sales performance analyst.',
        'The audience is a sales manager preparing for a management meeting.',
        'Analyze the monthly sales data, identify the best and worst regions, and give three actionable recommendations.',
        'Present the result with a short management summary followed by bullet points.',
        'Use only the supplied sales data and do not invent figures.',
        'Act as a software developer.',
        'The audience is a group of database administrators.',
        'Write Python code to analyze the data.',
        'Create a social media campaign.',
        'Use technical language and include every available detail.',
      ],
      promptBuilderData: {
        scenarioTitle: 'Exercise 2 — Improve a Weak Prompt',
        scenarioText: 'Weak prompt: “Analyze this sales data and make a report.”\n\nBusiness requirement: The sales manager wants monthly sales performance, the best and worst regions, and three actionable recommendations for a management meeting. Improve the prompt by defining the role, context, goal, format and constraint.',
        instruction: 'Select the useful pieces, arrange them, and review the prompt you created.',
        pieces: [
          { text: 'Act as a sales performance analyst.', isCorrect: true },
          { text: 'The audience is a sales manager preparing for a management meeting.', isCorrect: true },
          { text: 'Analyze the monthly sales data, identify the best and worst regions, and give three actionable recommendations.', isCorrect: true },
          { text: 'Present the result with a short management summary followed by bullet points.', isCorrect: true },
          { text: 'Use only the supplied sales data and do not invent figures.', isCorrect: true },
          { text: 'Act as a software developer.', isCorrect: false },
          { text: 'The audience is a group of database administrators.', isCorrect: false },
          { text: 'Write Python code to analyze the data.', isCorrect: false },
          { text: 'Create a social media campaign.', isCorrect: false },
          { text: 'Use technical language and include every available detail.', isCorrect: false },
        ],
      },
      explanation: 'RCTOF Framework: Role (Sales performance analyst) + Context (Sales manager preparing for meeting) + Task (Analyze monthly sales, best/worst regions, 3 recommendations) + Format (Short management summary + bullets) + Constraint (Use supplied data only).',
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Exercise 3 — Build a Prompt for a New Situation',
      questionType: 'PROMPT_BUILDER',
      options: [
        'Act as a customer service manager.',
        'The audience is a customer service team.',
        'Create a short response explaining how to handle an angry customer professionally.',
        'Use a numbered list with five practical steps.',
        'Keep the response under 150 words and do not blame the customer.',
        'Act as a graphic designer.',
        'The audience is software engineers.',
        'Write JavaScript code for a customer portal.',
        'Use a long essay format.',
        'Include unrelated product specifications.',
      ],
      promptBuilderData: {
        scenarioTitle: 'Exercise 3 — Build a Prompt for a New Situation',
        scenarioText: 'A customer service team needs an AI assistant to help employees handle angry customers professionally. Build an effective prompt using one clear role, context, goal, format and constraint.',
        instruction: 'Select the useful pieces, arrange them, and review the prompt you created.',
        pieces: [
          { text: 'Act as a customer service manager.', isCorrect: true },
          { text: 'The audience is a customer service team.', isCorrect: true },
          { text: 'Create a short response explaining how to handle an angry customer professionally.', isCorrect: true },
          { text: 'Use a numbered list with five practical steps.', isCorrect: true },
          { text: 'Keep the response under 150 words and do not blame the customer.', isCorrect: true },
          { text: 'Act as a graphic designer.', isCorrect: false },
          { text: 'The audience is software engineers.', isCorrect: false },
          { text: 'Write JavaScript code for a customer portal.', isCorrect: false },
          { text: 'Use a long essay format.', isCorrect: false },
          { text: 'Include unrelated product specifications.', isCorrect: false },
        ],
      },
      explanation: 'RCTOF Framework: Role (Customer service manager) + Context (Customer service team) + Task (Handle angry customers professionally) + Format (Numbered list with 5 steps) + Constraint (Under 150 words & no customer blame).',
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Exercise 4 — Build a Prompt from a Business Requirement',
      questionType: 'PROMPT_BUILDER',
      options: [
        'Act as an HR communication specialist.',
        'The audience is employees who will receive a company policy update.',
        'Create a clear prompt for AI to explain the policy change and what employees need to do.',
        'Present the answer with a short summary followed by employee action points.',
        'Use only the information provided in the policy and do not invent rules.',
        'Act as a financial trader.',
        'Write a detailed Python application.',
        'Generate a social media advertisement.',
        'Assume information that is not in the policy.',
        'Use technical legal language throughout.',
      ],
      promptBuilderData: {
        scenarioTitle: 'Exercise 4 — Build a Prompt from a Business Requirement',
        scenarioText: 'A company is communicating a policy update to employees. Create an effective prompt that instructs AI to explain the change and clearly tell employees what they need to do. Use one role, context, goal, format and constraint.',
        instruction: 'Select the useful pieces, arrange them, and review the prompt you created.',
        pieces: [
          { text: 'Act as an HR communication specialist.', isCorrect: true },
          { text: 'The audience is employees who will receive a company policy update.', isCorrect: true },
          { text: 'Create a clear prompt for AI to explain the policy change and what employees need to do.', isCorrect: true },
          { text: 'Present the answer with a short summary followed by employee action points.', isCorrect: true },
          { text: 'Use only the information provided in the policy and do not invent rules.', isCorrect: true },
          { text: 'Act as a financial trader.', isCorrect: false },
          { text: 'Write a detailed Python application.', isCorrect: false },
          { text: 'Generate a social media advertisement.', isCorrect: false },
          { text: 'Assume information that is not in the policy.', isCorrect: false },
          { text: 'Use technical legal language throughout.', isCorrect: false },
        ],
      },
      explanation: 'RCTOF Framework: Role (HR communication specialist) + Context (Employees receiving policy update) + Task (Explain policy change & action items) + Format (Short summary + employee action points) + Constraint (Use provided policy info only).',
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

  // -------------------------------------------------------------
  // QUIZ 5: "AI Concepts & Prompting Quiz" (20 MCQ & True/False Questions)
  // -------------------------------------------------------------
  const activity5QuestionsData = [
    {
      questionText: "A company uses five years of sales data to predict next month's demand. Which AI is used?",
      questionType: 'MCQ',
      options: ['Natural Language Processing', 'Generative AI', 'Machine Learning', 'Computer Vision'],
      correctOptionIndex: 2,
      explanation: "Machine Learning uses historical sales data and statistical patterns to predict future demand.",
      category: 'AI Concepts',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "An AI system only detects suspicious credit card transactions. What type of AI is this?",
      questionType: 'MCQ',
      options: ['Narrow AI', 'General AI', 'Self-Aware AI', 'Super AI'],
      correctOptionIndex: 0,
      explanation: "Narrow AI is designed and specialized to solve a specific task, such as transaction fraud detection.",
      category: 'AI Concepts',
      difficulty: 'EASY',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "AI summarizes sales data; the employee reviews it and decides the action. What is this?",
      questionType: 'MCQ',
      options: ['Super AI', 'AI Agent', 'Agentic AI', 'AI Copilot'],
      correctOptionIndex: 3,
      explanation: "An AI Copilot assists human workers by surfacing insights while the human retains control and decision authority.",
      category: 'AI Concepts',
      difficulty: 'EASY',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "What makes an AI system more agentic than simply asking it to write an email?",
      questionType: 'MCQ',
      options: [
        'It produces a professional-looking email',
        'It performs a sequence of actions toward a goal',
        'It uses a longer prompt',
        'It generates text using an LLM',
      ],
      correctOptionIndex: 1,
      explanation: "Agentic AI systems possess autonomy to plan and execute multi-step tool calls and workflows to reach an overarching goal.",
      category: 'AI Concepts',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "AI accesses records, investigates issues, updates data and escalates cases. What is it?",
      questionType: 'MCQ',
      options: [
        'A rule-based system',
        'A Reactive Machine',
        'An AI Agent using information and tools',
        'A system that only generates content',
      ],
      correctOptionIndex: 2,
      explanation: "An AI Agent leverages data sources and external tools to investigate issues, update records, and route escalations.",
      category: 'AI Concepts',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "During LLM inference, what primarily happens as a response is generated?",
      questionType: 'MCQ',
      options: [
        'The AI develops consciousness',
        'It retrieves a stored human-written answer',
        'It searches the internet for the answer',
        'It calculates probabilities for the next tokens',
      ],
      correctOptionIndex: 3,
      explanation: "LLM inference functions by calculating next-token probability distributions based on context.",
      category: 'LLM Foundations',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "Which statement best explains the relationship between an LLM and a chatbot?",
      questionType: 'MCQ',
      options: [
        'The chatbot trains the LLM for every prompt',
        'LLM handles language; chatbot provides the interface',
        'ChatGPT is the LLM and GPT is the chatbot',
        'They are exactly the same technology',
      ],
      correctOptionIndex: 1,
      explanation: "The LLM serves as the underlying cognitive language engine, while the chatbot is the user interface wrapper.",
      category: 'LLM Foundations',
      difficulty: 'EASY',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "An AI gives realistic citations, but two papers cannot be found. What should you do?",
      questionType: 'MCQ',
      options: [
        'Verify the citations externally before using them',
        'Assume the papers are private',
        'Trust them because the AI sounds confident',
        'Ask AI to make the citations more professional',
      ],
      correctOptionIndex: 0,
      explanation: "Always independently verify AI-generated citations to prevent reliance on hallucinated sources.",
      category: 'AI Ethics & Safety',
      difficulty: 'EASY',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "Which prompt gives the most useful context for recommending a BI tool?",
      questionType: 'MCQ',
      options: [
        'Recommend a BI tool and be creative',
        'M365 + SQL Server; avoid coding; executives; dashboards',
        'Recommend the most popular BI tool',
        'Recommend a BI tool as quickly as possible',
      ],
      correctOptionIndex: 1,
      explanation: "Including technical environment, user constraints, target audience, and output type yields far better recommendations.",
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "Which combination gives AI the most complete instructions for a business task?",
      questionType: 'MCQ',
      options: [
        'Company name + employee name + software + file name',
        'Question + answer + keyword + token + temperature',
        'Audience + question + tool + web search + response length',
        'Role + context + goal + format + boundaries',
      ],
      correctOptionIndex: 3,
      explanation: "The RCTOF framework (Role, Context, Goal, Format, Boundaries) provides structured, comprehensive prompt instructions.",
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "Which constraints best suit a short, executive cybersecurity explanation?",
      questionType: 'MCQ',
      options: [
        'Highly technical language and maximum detail',
        '3 examples, <200 words, executive, plain business language',
        'Make it as long as possible',
        'Explain every technical term in full detail',
      ],
      correctOptionIndex: 1,
      explanation: "Executive constraints require brevity (<200 words), plain business language, and concrete examples.",
      category: 'Prompt Engineering',
      difficulty: 'EASY',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "Which questions best identify what is missing from a generic KPI request?",
      questionType: 'MCQ',
      options: [
        'Font, colors and dashboard size',
        'How to make the answer longer',
        'Context, decisions, audience, assumptions, data and needs',
        'Only the preferred dashboard software',
      ],
      correctOptionIndex: 2,
      explanation: "Generic KPI requests lack operational context, decision rationale, target audience, assumptions, and data sources.",
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "An AI Agent must always operate completely autonomously without human approval.",
      questionType: 'TRUE_FALSE',
      options: ['True', 'False'],
      correctOptionIndex: 1,
      explanation: "AI Agents can run in human-in-the-loop arrangements requiring manual approval before taking high-impact actions.",
      category: 'AI Concepts',
      difficulty: 'EASY',
      timeLimit: 20,
      points: 1000,
    },
    {
      questionText: "Generative AI is mainly known for creating new content such as text, images, music or code.",
      questionType: 'TRUE_FALSE',
      options: ['True', 'False'],
      correctOptionIndex: 0,
      explanation: "Generative AI focuses on synthesizing new media and text assets based on prompts.",
      category: 'AI Concepts',
      difficulty: 'EASY',
      timeLimit: 20,
      points: 1000,
    },
    {
      questionText: "Because AI sounds human-like, it necessarily has consciousness, beliefs and genuine emotions.",
      questionType: 'TRUE_FALSE',
      options: ['True', 'False'],
      correctOptionIndex: 1,
      explanation: "Natural-sounding output is a result of statistical pattern modeling, not sentience or consciousness.",
      category: 'AI Concepts',
      difficulty: 'EASY',
      timeLimit: 20,
      points: 1000,
    },
    {
      questionText: "Providing useful context and clues in a prompt can help AI produce a more relevant response.",
      questionType: 'TRUE_FALSE',
      options: ['True', 'False'],
      correctOptionIndex: 0,
      explanation: "Rich in-context details guide the LLM toward accurate, targeted answers.",
      category: 'Prompt Engineering',
      difficulty: 'EASY',
      timeLimit: 20,
      points: 1000,
    },
    {
      questionText: "A system researches prospects, personalizes outreach and updates the CRM. What concept fits?",
      questionType: 'MCQ',
      options: ['Reactive Machine', 'AI Agent', 'Generative AI only', 'AI Copilot only'],
      correctOptionIndex: 1,
      explanation: "Multi-step autonomous execution across tools (prospecting, outreach, CRM) describes an AI Agent.",
      category: 'AI Concepts',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "AI gets examples of KPI definitions and creates new KPIs in the same style. Which technique?",
      questionType: 'MCQ',
      options: ['Prompt Debugging', 'Meta Prompting', 'Few-Shot Prompting', 'Self-Critique Loop'],
      correctOptionIndex: 2,
      explanation: "Providing explicit examples in the prompt to demonstrate output style is Few-Shot Prompting.",
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "A manager asks AI to review a sales summary, find weaknesses and rewrite it. Which technique?",
      questionType: 'MCQ',
      options: ['Persona Prompting', 'Meta Prompting', 'Few-Shot Prompting', 'Self-Critique Loop'],
      correctOptionIndex: 3,
      explanation: "Asking AI to evaluate its own draft, detect weaknesses, and refine it is a Self-Critique Loop.",
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      points: 1000,
    },
    {
      questionText: "AI is asked questions to find missing information, then build the best prompt. Which technique?",
      questionType: 'MCQ',
      options: ['Meta Prompting', 'Persona Prompting', 'Computer Vision', 'Few-Shot Prompting'],
      correctOptionIndex: 0,
      explanation: "Using AI to generate, optimize, or extract requirements for building prompts is Meta Prompting.",
      category: 'Prompt Engineering',
      difficulty: 'MEDIUM',
      timeLimit: 30,
      points: 1000,
    },
  ];

  const q5Docs = await QuestionModel.insertMany(
    activity5QuestionsData.map((q) => ({
      ...q,
      trainerId,
      tags: ['AI-Concepts', 'Prompt-Engineering', 'Imported-Quiz'],
    }))
  );

  const quiz5 = await QuizModel.create({
    trainerId,
    title: 'Activity 5: AI Concepts & Prompting Quiz',
    category: 'AI & Prompting',
    description: 'Activity 5 — 20 Questions covering AI Types, Copilots vs Agents, LLM Inference, and Prompt Engineering Techniques.',
    instructions: 'Select the best answer for each question within the time limit.',
    questionIds: q5Docs.map((doc) => doc._id),
    status: 'READY',
    defaultTimeLimit: 30,
    defaultPoints: 1000,
  });

  return {
    quiz1,
    quiz2,
    quiz3,
    quiz4,
    quiz5,
    totalQuestionsSeeded: q1Docs.length + q2Docs.length + q3Docs.length + q4Docs.length + q5Docs.length,
  };
}
