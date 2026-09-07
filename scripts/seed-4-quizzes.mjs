import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://teamthestrategist_db_user:YI5d7kXZ16ImHOJe@thestrategist.ix3misa.mongodb.net/quizarena?retryWrites=true&w=majority&appName=TheStrategist';

// Schema definitions
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: String,
  organization: String,
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const QuestionSchema = new mongoose.Schema({
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questionText: String,
  questionType: { type: String, default: 'MCQ' },
  options: [String],
  correctOptionIndex: Number,
  timeLimit: { type: Number, default: 30 },
  points: { type: Number, default: 1000 },
  explanation: String,
  category: { type: String, default: 'AI & Analytics' },
  difficulty: { type: String, default: 'MEDIUM' },
  tags: [String],
  promptBuilderData: { type: mongoose.Schema.Types.Mixed },
  solutionChallengeData: { type: mongoose.Schema.Types.Mixed },
  scenarioQuestionsData: { type: mongoose.Schema.Types.Mixed },
  subQuestions: { type: mongoose.Schema.Types.Mixed },
  sequenceData: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true, strict: false });
const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

const QuizSchema = new mongoose.Schema({
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  category: { type: String, default: 'General' },
  instructions: String,
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  status: { type: String, default: 'READY' },
  defaultTimeLimit: { type: Number, default: 20 },
  defaultPoints: { type: Number, default: 1000 },
  currentVersion: { type: Number, default: 1 },
}, { timestamps: true });
const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', QuizSchema);

// Quiz 1: AI or Not? (15 Questions)
const quiz1Data = {
  title: "Activity 1: AI or Not?",
  description: "Can you tell the difference between Artificial Intelligence and ordinary automation or programmed systems?",
  category: "AI Fundamentals",
  questions: [
    {
      q: "A music app studies a listener's previous songs, skips and playlists, then recommends songs the listener may enjoy.",
      opts: ["AI", "Not AI"],
      ans: 0,
      why: "The system uses patterns in the listener's behavior to make personalized recommendations. This is an AI use case."
    },
    {
      q: "A refrigerator automatically starts its cooling system when its internal temperature rises above 5°C.",
      opts: ["AI", "Not AI"],
      ans: 1,
      why: "The refrigerator follows a fixed rule: if the temperature crosses a set threshold, turn cooling on. That is automation, not AI."
    },
    {
      q: "A banking system examines a customer's transaction patterns and identifies unusual activity that may indicate fraud.",
      opts: ["AI", "Not AI"],
      ans: 0,
      why: "The system analyzes data patterns to identify unusual behavior and potential fraud. This is an AI use case."
    },
    {
      q: "A phone automatically switches to silent mode every day between 10 PM and 7 AM because the user has configured a schedule.",
      opts: ["AI", "Not AI"],
      ans: 1,
      why: "The phone is following a predefined schedule. It does not need to learn or interpret anything, so this is not AI."
    },
    {
      q: "An online shopping website looks at what a customer has viewed and purchased and recommends products they might be interested in.",
      opts: ["AI", "Not AI"],
      ans: 0,
      why: "The system uses customer behavior patterns to make personalized recommendations. This is an AI use case."
    },
    {
      q: "A car automatically turns on its headlights when a light sensor detects that the surroundings have become dark.",
      opts: ["AI", "Not AI"],
      ans: 1,
      why: "A sensor detects a simple condition and triggers a predefined action. This is ordinary automation, not AI."
    },
    {
      q: "A handwriting application analyzes a person's handwritten notes and converts them into editable digital text.",
      opts: ["AI", "Not AI"],
      ans: 0,
      why: "The system has to recognize complex visual patterns and interpret them as characters and words. That is an AI capability."
    },
    {
      q: "A phone unlocks when its front camera recognizes the user's face.",
      opts: ["AI", "Not AI"],
      ans: 0,
      why: "The phone analyzes facial features and compares the detected pattern with the enrolled face. This is an AI use case."
    },
    {
      q: "A travel application predicts that a flight is likely to be delayed by analyzing historical flight patterns, weather information and current flight data.",
      opts: ["AI", "Not AI"],
      ans: 0,
      why: "The system uses data and patterns to predict a future event. That is an AI use case."
    },
    {
      q: "A traffic light changes from green to yellow to red according to a programmed timing sequence.",
      opts: ["AI", "Not AI"],
      ans: 1,
      why: "A sensor detects a simple condition and the machine follows a predefined safety rule. This is not AI."
    },
    {
      q: "A vending machine gives you the selected drink or snack after you insert the required payment.",
      opts: ["AI", "Not AI"],
      ans: 1,
      why: "The machine is executing programmed control rules. It is automatic, but it does not require AI."
    },
    {
      q: "A photo app automatically groups pictures based on what is visible in them, such as pets, beaches or food.",
      opts: ["AI", "Not AI"],
      ans: 0,
      why: "The app analyzes image content and recognizes visual patterns to categorize photos. That is an AI use case."
    },
    {
      q: "Amazon Alexa understands when you say, 'Set an alarm for 6 AM tomorrow.'",
      opts: ["AI", "Not AI"],
      ans: 0,
      why: "The system must interpret human speech and understand the user's request. Speech and language understanding are AI capabilities."
    },
    {
      q: "An office printer automatically prints a report every Monday at 9 AM because a schedule was configured.",
      opts: ["AI", "Not AI"],
      ans: 1,
      why: "The printer is simply following a schedule that was configured in advance. This is not AI."
    },
    {
      q: "A weather app predicts whether it will rain tomorrow by analyzing weather data and patterns.",
      opts: ["AI", "Not AI"],
      ans: 0,
      why: "The system analyzes data and patterns to make a prediction about a future event. This is an AI use case."
    }
  ]
};

// Quiz 2: AI Technology Detective (ML, DL, NLP, Computer Vision)
const quiz2Data = {
  title: "Activity 2: AI Technology Detective",
  description: "Learn the difference between Traditional Machine Learning, Deep Learning, Natural Language Processing (NLP) and Computer Vision.",
  category: "Machine Learning & AI Tech",
  questions: [
    {
      q: "A telecom company predicts customer churn using plan type, monthly usage, payment history and contract length. Which category best describes this?",
      opts: ["Traditional Machine Learning", "Deep Learning", "Natural Language Processing (NLP)", "Computer Vision"],
      ans: 0,
      why: "The information is structured customer data. The goal is to predict an outcome, so Traditional ML is the clearest fit."
    },
    {
      q: "A property company predicts a home's price using location, size, number of rooms and previous sale prices. Which category applies?",
      opts: ["Traditional Machine Learning", "Deep Learning", "Natural Language Processing (NLP)", "Computer Vision"],
      ans: 0,
      why: "The inputs are structured numbers and categories. This is a classic prediction problem using business/tabular data."
    },
    {
      q: "A system learns from thousands of examples of handwritten numbers and recognizes digits in new images. Which approach is used?",
      opts: ["Traditional Machine Learning", "Deep Learning", "Natural Language Processing (NLP)", "Computer Vision"],
      ans: 1,
      why: "Neural networks learning complex patterns from many image examples is Deep Learning."
    },
    {
      q: "A voice assistant uses a neural network trained on large amounts of recorded speech to recognize spoken words. What capability is this?",
      opts: ["Traditional Machine Learning", "Deep Learning / Voice AI", "Natural Language Processing (NLP)", "Computer Vision"],
      ans: 1,
      why: "Neural networks learning complex speech patterns from a large dataset represents Deep Learning."
    },
    {
      q: "A support system reads incoming emails and identifies whether each message is a complaint, question, refund request or compliment. What technology is used?",
      opts: ["Traditional Machine Learning", "Deep Learning", "Natural Language Processing (NLP)", "Computer Vision"],
      ans: 2,
      why: "The main task is understanding human language in text. That makes NLP the clearest category."
    },
    {
      q: "An AI reads a meeting transcript and produces a short summary of key decisions. Which domain does this belong to?",
      opts: ["Traditional Machine Learning", "Deep Learning", "Natural Language Processing (NLP)", "Computer Vision"],
      ans: 2,
      why: "A transcript is human language. Reading and summarizing text is an NLP task."
    },
    {
      q: "A factory camera checks products and identifies scratches, cracks or missing parts. Which category is this?",
      opts: ["Traditional Machine Learning", "Deep Learning", "Natural Language Processing (NLP)", "Computer Vision"],
      ans: 3,
      why: "The computer must understand visual information from camera images. That is Computer Vision."
    },
    {
      q: "A customer-service voice assistant must understand human speech and use a neural network trained on voice examples. What combination is needed?",
      opts: ["NLP + Deep Learning", "Computer Vision + Deep Learning", "NLP + Traditional Machine Learning", "Computer Vision + Traditional Machine Learning"],
      ans: 0,
      why: "Speech understanding uses NLP (language) combined with Deep Learning (neural networks)."
    },
    {
      q: "A factory wants to use camera images and neural networks to identify damaged products. What combination is most appropriate?",
      opts: ["NLP + Deep Learning", "Computer Vision + Deep Learning", "Computer Vision + Traditional Machine Learning", "NLP + Traditional Machine Learning"],
      ans: 1,
      why: "Understanding images requires Computer Vision, and detecting subtle visual defects uses Deep Learning."
    },
    {
      q: "A company predicts employee turnover using salary, tenure, age, department and performance records. What is the clearest approach?",
      opts: ["Computer Vision + Deep Learning", "NLP + Deep Learning", "Traditional Machine Learning", "Computer Vision + Traditional Machine Learning"],
      ans: 2,
      why: "Inputs are structured tabular employee data and the goal is prediction, making Traditional ML the clearest fit."
    },
    {
      q: "A company automatically classifies customer emails into complaint, question, compliment or refund request. What combination best describes the solution?",
      opts: ["NLP + Machine Learning", "Computer Vision + Deep Learning", "Traditional Machine Learning only", "Computer Vision + NLP"],
      ans: 0,
      why: "Text classification requires NLP for text understanding combined with Machine Learning for classification."
    },
    {
      q: "A security system uses camera footage and a neural network to detect whether fighting is happening. What combination is needed?",
      opts: ["NLP + Traditional Machine Learning", "Computer Vision + Deep Learning", "NLP + Deep Learning", "Traditional Machine Learning only"],
      ans: 1,
      why: "Analyzing video footage is Computer Vision, and classifying complex human actions uses Deep Learning."
    }
  ]
};

// Quiz 3: Activity 3 - AI Solution & Workflow Challenge
const quiz3Data = {
  title: "Activity 3: AI Solution & Workflow Challenge",
  description: "Evaluate AI solution architectures across structured data, NLP, computer vision, predictive analytics, and workflow decision automation.",
  category: "AI Solution Architecture",
  questions: [
    {
      q: "Scenario 1: Marketing Content",
      type: "SCENARIO_QUESTIONS",
      opts: ["Generative AI", "AI Copilot", "AI Agent", "Automation", "Machine Learning"],
      why: "Generative AI creates new original text copy with a mandatory human approval gate before publishing.",
      scenarioQuestionsData: {
        scenarioTitle: "Marketing Content",
        scenarioText: "A product team needs 20 social media captions and 5 product descriptions for a new launch. A human will review everything before publishing.",
        instructions: "Read the scenario carefully and complete the 4 steps below.",
        backgroundContext: "The objective is to automate bulk content creation while ensuring 100% human editorial oversight.",
        subQuestions: [
          {
            id: "sub_1_1",
            questionType: "MCQ",
            questionText: "Step 1: Choose the AI approach\nChoose carefully: one answer is the best fit. Selecting a wrong answer reduces marks.",
            options: [
              "AI Copilot (Assists a person with their work)",
              "AI Agent (Performs multi-step tasks using tools)",
              "Automation (Follows predefined rules and steps)",
              "Generative AI (Creates new content)",
              "Machine Learning (Learns from data to make predictions)"
            ],
            correctOptionIndex: 3,
            points: 250,
            explanation: "Generative AI directly creates new, original copy from product specification inputs."
          },
          {
            id: "sub_1_2",
            questionType: "MULTIPLE_SELECT",
            questionText: "Step 2: Select required capabilities & system components (Select all correct options)",
            options: [
              "Generate creative social media text copy",
              "Create multi-platform product descriptions",
              "Enforce brand tone and style guidelines",
              "Human review & approval gate before publishing",
              "Train deep learning image neural network"
            ],
            correctOptionIndices: [0, 1, 2, 3],
            points: 250,
            explanation: "The system requires content generation, tone enforcement, product description creation, and an editorial review gate."
          },
          {
            id: "sub_1_3",
            questionType: "CORRECT_SEQUENCE",
            questionText: "Step 3: Arrange the workflow in exact logical sequence",
            options: [
              "Input product brief and key features",
              "Generate initial draft copy with AI",
              "Human editor reviews and refines content",
              "Publish approved copy to marketing channels"
            ],
            correctOrder: [0, 1, 2, 3],
            points: 250,
            explanation: "Workflow sequence: Input brief -> AI draft generation -> Human editorial review -> Publish."
          },
          {
            id: "sub_1_4",
            questionType: "MCQ",
            questionText: "Step 4: Human Control & Risk Management",
            options: [
              "Human Approval Gate (Human marketer reviews, edits, and gives final approval before publication)",
              "Exception-Based Oversight (AI publishes standard posts automatically)",
              "Full AI Autonomy (AI publishes content directly without human review)"
            ],
            correctOptionIndex: 0,
            points: 250,
            explanation: "A Human Approval Gate ensures brand compliance and prevents unreviewed hallucinations from being published."
          }
        ]
      }
    },
    {
      q: "Scenario 2: Sales Manager Assistant",
      type: "SCENARIO_QUESTIONS",
      opts: ["AI Copilot", "AI Agent", "Automation", "Generative AI", "Machine Learning"],
      why: "An AI Copilot empowers the executive with automated spreadsheet analysis while the human retains full decision authority.",
      scenarioQuestionsData: {
        scenarioTitle: "Sales Manager Assistant",
        scenarioText: "Every Monday, a sales manager wants AI to summarize the weekly sales spreadsheet, highlight unusual changes, and suggest questions the manager should investigate.",
        instructions: "Read the scenario carefully and complete the 4 steps below.",
        backgroundContext: "The VP remains fully accountable for all operational decisions; the system must assist, not make sales calls.",
        subQuestions: [
          {
            id: "sub_2_1",
            questionType: "MCQ",
            questionText: "Step 1: Choose the AI approach\nChoose carefully: one answer is the best fit. Selecting a wrong answer reduces marks.",
            options: [
              "AI Copilot (Assists a person with their work)",
              "AI Agent (Performs multi-step tasks using tools)",
              "Automation (Follows predefined rules and steps)",
              "Generative AI (Creates new content)",
              "Machine Learning (Learns from data to make predictions)"
            ],
            correctOptionIndex: 0,
            points: 250,
            explanation: "The AI acts as an interactive Copilot alongside the sales executive to summarize data and suggest questions."
          },
          {
            id: "sub_2_2",
            questionType: "MULTIPLE_SELECT",
            questionText: "Step 2: Select required capabilities & system components (Select all correct options)",
            options: [
              "Ingest weekly sales spreadsheet data",
              "Summarize key metric shifts and revenue trends",
              "Highlight unusual statistical variance or anomalies",
              "Suggest investigation questions for management review",
              "Automatically terminate underperforming sales reps"
            ],
            correctOptionIndices: [0, 1, 2, 3],
            points: 250,
            explanation: "The Copilot must ingest spreadsheet data, calculate variances, highlight anomalies, and generate meeting discussion points."
          },
          {
            id: "sub_2_3",
            questionType: "CORRECT_SEQUENCE",
            questionText: "Step 3: Arrange the workflow in exact logical sequence",
            options: [
              "Receive weekly sales spreadsheet",
              "AI analyzes data & extracts performance trends",
              "Generate summary report & discussion prompts",
              "Sales manager reviews insights and conducts team meeting"
            ],
            correctOrder: [0, 1, 2, 3],
            points: 250,
            explanation: "Workflow sequence: Ingest spreadsheet -> AI trend analysis -> Summary & question generation -> Executive decision review."
          },
          {
            id: "sub_2_4",
            questionType: "MCQ",
            questionText: "Step 4: Human Control & Risk Management",
            options: [
              "Copilot Decision Support (Sales manager retains 100% decision authority while AI provides insights)",
              "Automated Rule Execution (System automatically adjusts quotas and alerts without review)",
              "Autonomous Management (AI makes strategic decisions for teams without human involvement)"
            ],
            correctOptionIndex: 0,
            points: 250,
            explanation: "Strategic management decisions require contextual human judgment and organizational accountability."
          }
        ]
      }
    },
    {
      q: "Scenario 3: Customer Support Task",
      type: "SCENARIO_QUESTIONS",
      opts: ["AI Agent", "AI Copilot", "Automation", "Generative AI", "Machine Learning"],
      why: "An AI Agent combines multi-step reasoning, external tool execution (CRM, billing, knowledge base), and escalation guardrails.",
      scenarioQuestionsData: {
        scenarioTitle: "Customer Support Task",
        scenarioText: "A support system receives a customer request. AI should read it, check the customer's account, find the answer in the knowledge base, update the ticket, and escalate complex cases.",
        instructions: "Read the scenario carefully and complete the 4 steps below.",
        backgroundContext: "Complex edge cases and billing disputes exceeding $20 must be escalated to human agents.",
        subQuestions: [
          {
            id: "sub_3_1",
            questionType: "MCQ",
            questionText: "Step 1: Choose the AI approach\nChoose carefully: one answer is the best fit. Selecting a wrong answer reduces marks.",
            options: [
              "AI Copilot (Assists a person with their work)",
              "AI Agent (Performs multi-step tasks using tools)",
              "Automation (Follows predefined rules and steps)",
              "Generative AI (Creates new content)",
              "Machine Learning (Learns from data to make predictions)"
            ],
            correctOptionIndex: 1,
            points: 250,
            explanation: "The system uses tools autonomously (CRM, KB API) to execute multi-step tasks, which defines an AI Agent."
          },
          {
            id: "sub_3_2",
            questionType: "MULTIPLE_SELECT",
            questionText: "Step 2: Select required capabilities & system components (Select all correct options)",
            options: [
              "Parse incoming customer support tickets",
              "Query account database & knowledge base APIs",
              "Execute automated ticket updates",
              "Escalate complex edge cases to human support agents",
              "Send arbitrary unapproved refunds"
            ],
            correctOptionIndices: [0, 1, 2, 3],
            points: 250,
            explanation: "The AI Agent parses ticket intent, queries CRM/KB APIs, updates tickets, and escalates complex edge cases."
          },
          {
            id: "sub_3_3",
            questionType: "CORRECT_SEQUENCE",
            questionText: "Step 3: Arrange the workflow in exact logical sequence",
            options: [
              "Receive customer support request",
              "AI agent reads request and queries CRM/Knowledge Base",
              "Execute appropriate resolution action or update ticket",
              "Escalate to human agent if confidence threshold is low"
            ],
            correctOrder: [0, 1, 2, 3],
            points: 250,
            explanation: "Workflow sequence: Receive ticket -> Query APIs -> Execute resolution -> Escalate low-confidence edge cases."
          },
          {
            id: "sub_3_4",
            questionType: "MCQ",
            questionText: "Step 4: Human Control & Risk Management",
            options: [
              "Human Escalation & Fallback (Agent operates within tool boundaries and escalates complex/high-value cases)",
              "Full Autonomous Authority (Agent resolves all tickets including high-dollar disputes with zero oversight)",
              "100% Manual Approval (Human must approve every routine response manually)"
            ],
            correctOptionIndex: 0,
            points: 250,
            explanation: "Autonomous agents must be bounded by financial caps and clear human escalation rules to prevent financial risk."
          }
        ]
      }
    },
    {
      q: "Scenario 4: Customer Churn Prediction",
      type: "SCENARIO_QUESTIONS",
      opts: ["Machine Learning", "AI Copilot", "AI Agent", "Automation", "Generative AI"],
      why: "Machine Learning classification models analyze historical behavioral features to forecast future subscriber churn risk.",
      scenarioQuestionsData: {
        scenarioTitle: "Customer Churn Prediction",
        scenarioText: "A company has 3 years of customer data and wants to predict which customers are most likely to cancel their subscription next month so the sales team can contact them early.",
        instructions: "Read the scenario carefully and complete the 4 steps below.",
        backgroundContext: "Predictions must provide risk probabilities; account managers determine intervention strategies.",
        subQuestions: [
          {
            id: "sub_4_1",
            questionType: "MCQ",
            questionText: "Step 1: Choose the AI approach\nChoose carefully: one answer is the best fit. Selecting a wrong answer reduces marks.",
            options: [
              "AI Copilot (Assists a person with their work)",
              "AI Agent (Performs multi-step tasks using tools)",
              "Automation (Follows predefined rules and steps)",
              "Generative AI (Creates new content)",
              "Machine Learning (Learns from data to make predictions)"
            ],
            correctOptionIndex: 4,
            points: 250,
            explanation: "Predicting future subscriber behavior based on historical structured data patterns is a Machine Learning classification task."
          },
          {
            id: "sub_4_2",
            questionType: "MULTIPLE_SELECT",
            questionText: "Step 2: Select required capabilities & system components (Select all correct options)",
            options: [
              "Aggregate historical customer usage & payment data",
              "Train classification model to calculate churn risk scores",
              "Flag high-risk accounts on sales dashboard",
              "Periodically retrain model to prevent model drift",
              "Generate fictional customer profiles"
            ],
            correctOptionIndices: [0, 1, 2, 3],
            points: 250,
            explanation: "The system requires data aggregation, model training, dashboard alert integration, and regular retraining to combat drift."
          },
          {
            id: "sub_4_3",
            questionType: "CORRECT_SEQUENCE",
            questionText: "Step 3: Arrange the workflow in exact logical sequence",
            options: [
              "Extract historical subscriber behavioral data",
              "Train predictive Machine Learning classification model",
              "Output churn risk probability scores",
              "Sales team proactively contacts high-risk customers"
            ],
            correctOrder: [0, 1, 2, 3],
            points: 250,
            explanation: "Workflow sequence: Data extraction -> Model training -> Score generation -> Proactive sales team outreach."
          },
          {
            id: "sub_4_4",
            questionType: "MCQ",
            questionText: "Step 4: Human Control & Risk Management",
            options: [
              "Model Drift & Regular Retraining (Regularly retrain model with current customer data to maintain predictive accuracy)",
              "Automated Mass Account Penalties (System automatically restricts accounts flagged as high churn risk)",
              "Autonomous Account Termination (System cancels subscriptions automatically based on prediction thresholds)"
            ],
            correctOptionIndex: 0,
            points: 250,
            explanation: "ML models require regular retraining with fresh data to adapt to changing customer behavior patterns."
          }
        ]
      }
    },
    {
      q: "Scenario 5: Employee Leave Request",
      type: "SCENARIO_QUESTIONS",
      opts: ["Automation", "AI Copilot", "AI Agent", "Generative AI", "Machine Learning"],
      why: "Deterministic, rule-governed workflows with 100% policy compliance require Rule-Based Automation rather than probabilistic models.",
      scenarioQuestionsData: {
        scenarioTitle: "Employee Leave Request",
        scenarioText: "Whenever an employee submits a leave request, the system should check whether the required information is complete and send the request to the employee's manager for approval.",
        instructions: "Read the scenario carefully and complete the 4 steps below.",
        backgroundContext: "Process must strictly follow company policy rules; incomplete or invalid requests must be rejected immediately.",
        subQuestions: [
          {
            id: "sub_5_1",
            questionType: "MCQ",
            questionText: "Step 1: Choose the AI approach\nChoose carefully: one answer is the best fit. Selecting a wrong answer reduces marks.",
            options: [
              "AI Copilot (Assists a person with their work)",
              "AI Agent (Performs multi-step tasks using tools)",
              "Automation (Follows predefined rules and steps)",
              "Generative AI (Creates new content)",
              "Machine Learning (Learns from data to make predictions)"
            ],
            correctOptionIndex: 2,
            points: 250,
            explanation: "Leave approvals follow deterministic IF-THEN rules with 100% policy compliance, requiring Rule-Based Automation."
          },
          {
            id: "sub_5_2",
            questionType: "MULTIPLE_SELECT",
            questionText: "Step 2: Select required capabilities & system components (Select all correct options)",
            options: [
              "Trigger process on employee form submission",
              "Validate required fields and leave balance rules",
              "Route approval request to direct manager",
              "Sync approved leave with HRIS and calendar",
              "Guess missing form details using AI"
            ],
            correctOptionIndices: [0, 1, 2, 3],
            points: 250,
            explanation: "The automated workflow triggers on form submit, validates balance/policy rules, routes approval tasks, and syncs HRIS/calendars."
          },
          {
            id: "sub_5_3",
            questionType: "CORRECT_SEQUENCE",
            questionText: "Step 3: Arrange the workflow in exact logical sequence",
            options: [
              "Employee submits digital leave request form",
              "Validate required data & check leave balance",
              "Route approval notification to manager",
              "Update HRIS balance, sync calendar & notify employee"
            ],
            correctOrder: [0, 1, 2, 3],
            points: 250,
            explanation: "Workflow sequence: Form submission -> Policy validation -> Manager routing -> HRIS/calendar update & notification."
          },
          {
            id: "sub_5_4",
            questionType: "MCQ",
            questionText: "Step 4: Human Control & Risk Management",
            options: [
              "Strict Policy Rule Compliance (Deterministic execution ensuring 100% compliance with corporate policy)",
              "AI Prediction Guessing (AI guesses missing dates or intent if data is incomplete)",
              "Automatic Unconditional Approval (System approves requests without manager validation)"
            ],
            correctOptionIndex: 0,
            points: 250,
            explanation: "Deterministic policy workflows require 100% rule compliance and auditability rather than probabilistic AI guesses."
          }
        ]
      }
    }
  ]
};

// Quiz 4: Activity 4 - Prompt Engineering Challenge
const quiz4Data = {
  title: "Activity 4: Prompt Engineering Challenge",
  description: "Master the RCTOF framework for effective Generative AI prompt construction.",
  category: "Prompt Engineering",
  questions: [
    {
      q: 'Exercise 1 — Build an Effective Prompt',
      type: 'PROMPT_BUILDER',
      opts: [
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
      why: 'RCTOF Framework: Role (Professional meeting summarization assistant) + Context (Busy managers needing quick overview) + Task (Summarize decisions, action items & responsibilities) + Format (Clear headings & bullet points) + Constraint (Use only supplied transcript).',
    },
    {
      q: 'Exercise 2 — Improve a Weak Prompt',
      type: 'PROMPT_BUILDER',
      opts: [
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
      why: 'RCTOF Framework: Role (Sales performance analyst) + Context (Sales manager preparing for meeting) + Task (Analyze monthly sales, best/worst regions, 3 recommendations) + Format (Short management summary + bullets) + Constraint (Use supplied data only).',
    },
    {
      q: 'Exercise 3 — Build a Prompt for a New Situation',
      type: 'PROMPT_BUILDER',
      opts: [
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
      why: 'RCTOF Framework: Role (Customer service manager) + Context (Customer service team) + Task (Handle angry customers professionally) + Format (Numbered list with 5 steps) + Constraint (Under 150 words & no customer blame).',
    },
    {
      q: 'Exercise 4 — Build a Prompt from a Business Requirement',
      type: 'PROMPT_BUILDER',
      opts: [
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
      why: 'RCTOF Framework: Role (HR communication specialist) + Context (Employees receiving policy update) + Task (Explain policy change & action items) + Format (Short summary + employee action points) + Constraint (Use provided policy info only).',
    }
  ]
};

const allQuizzes = [quiz1Data, quiz2Data, quiz3Data, quiz4Data];

async function seedQuizzes() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Ensure Trainer / Admin User exists
    const adminEmail = 'mail@thestrategist.co.in';
    let trainer = await User.findOne({ email: adminEmail });
    if (!trainer) {
      const hashedPassword = await bcrypt.hash('AjayThomas@1', 10);
      trainer = await User.create({
        email: adminEmail,
        name: 'Admin',
        role: 'TRAINER',
        passwordHash: hashedPassword,
        organization: 'KVJ Analytics',
      });
      console.log('Created Admin trainer account in DB.');
    }

    for (const qData of allQuizzes) {
      console.log(`Processing Quiz: ${qData.title}...`);

      // Upsert questions
      const questionIds = [];
      for (const qItem of qData.questions) {
        const qType = qItem.type || 'MCQ';
        let question = await Question.findOne({
          trainerId: trainer._id,
          questionText: qItem.q
        });

        if (!question) {
          question = await Question.create({
            trainerId: trainer._id,
            questionText: qItem.q,
            questionType: qType,
            options: qItem.opts || [],
            correctOptionIndex: qItem.ans !== undefined ? qItem.ans : 0,
            timeLimit: 30,
            points: 1000,
            explanation: qItem.why,
            category: qData.category,
            difficulty: 'MEDIUM',
            tags: [qData.category],
            promptBuilderData: qItem.promptBuilderData,
            solutionChallengeData: qItem.solutionChallengeData,
            scenarioQuestionsData: qItem.scenarioQuestionsData,
            subQuestions: qItem.subQuestions,
            sequenceData: qItem.sequenceData,
          });
        } else {
          question.questionType = qType;
          question.options = qItem.opts || [];
          question.correctOptionIndex = qItem.ans !== undefined ? qItem.ans : 0;
          question.explanation = qItem.why;
          if (qItem.promptBuilderData) question.promptBuilderData = qItem.promptBuilderData;
          if (qItem.solutionChallengeData) question.solutionChallengeData = qItem.solutionChallengeData;
          if (qItem.scenarioQuestionsData) question.scenarioQuestionsData = qItem.scenarioQuestionsData;
          if (qItem.subQuestions) question.subQuestions = qItem.subQuestions;
          if (qItem.sequenceData) question.sequenceData = qItem.sequenceData;
          await question.save();
        }
        questionIds.push(question._id);
      }

      // Upsert Quiz
      let quiz = await Quiz.findOne({ title: qData.title });
      if (!quiz) {
        quiz = await Quiz.create({
          trainerId: trainer._id,
          title: qData.title,
          description: qData.description,
          category: qData.category,
          instructions: "Read each question carefully and select the best answer before the timer expires.",
          questionIds,
          status: 'READY',
          defaultTimeLimit: 30,
          defaultPoints: 1000,
        });
        console.log(`Created Quiz: "${quiz.title}" with ${questionIds.length} questions.`);
      } else {
        quiz.questionIds = questionIds;
        quiz.description = qData.description;
        quiz.category = qData.category;
        quiz.status = 'READY';
        await quiz.save();
        console.log(`Updated Quiz: "${quiz.title}" with ${questionIds.length} questions.`);
      }
    }

    console.log('All 4 Quizzes successfully seeded into MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    process.exit(1);
  }
}

seedQuizzes();
