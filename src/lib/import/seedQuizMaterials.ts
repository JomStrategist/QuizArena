import { connectToDatabase } from '@/lib/db/connect';
import { QuizModel } from '@/models/Quiz';
import { QuestionModel } from '@/models/Question';
import mongoose from 'mongoose';

export async function seedQuizMaterials(trainerIdString: string = '650000000000000000000001') {
  await connectToDatabase();
  const trainerId = new mongoose.Types.ObjectId(trainerIdString);

  // -------------------------------------------------------------
  // QUIZ 1: "Activity 1: AI or Not?" (15 Binary Choice Questions)
  // -------------------------------------------------------------
  const activity1QuestionsData = [
    {
      questionText: 'Spam email filter sorting messages into spam or inbox',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'Learns from patterns in email text and user feedback to identify spam.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'Automatic dishwasher running a 45-minute cycle',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'Follows a fixed rule/timer, no learning or pattern recognition.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'Facial recognition unlocking a smartphone',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'Analyzes facial features and visual patterns from camera data.',
      category: 'Computer Vision',
      difficulty: 'EASY',
    },
    {
      questionText: 'Microwave heating food when you press 2 minutes',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'Simple timer execution without intelligent decision making.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'Music app recommending songs you might like',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'Predicts preferences based on past listening behavior and data patterns.',
      category: 'Machine Learning',
      difficulty: 'EASY',
    },
    {
      questionText: 'Car navigation recalculating the fastest route based on live traffic',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'Analyzes real-time traffic data and predicts optimal travel paths.',
      category: 'AI Basics',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Calculator multiplying 45 x 12',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'Executes explicit mathematical formulas without learning.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'Chatbot answering customer questions using natural language',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'Processes and generates human language understanding context.',
      category: 'NLP',
      difficulty: 'EASY',
    },
    {
      questionText: 'Motion-sensor light turning on when someone walks past',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'Simple hardware sensor trigger, no data learning or pattern processing.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'E-commerce store suggesting products based on previous purchases',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'Recommends items by finding patterns in customer shopping data.',
      category: 'Machine Learning',
      difficulty: 'EASY',
    },
    {
      questionText: 'Automatic sliding doors opening at a supermarket',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'Infrared or optical sensor trigger without predictive logic.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'Self-driving car detecting pedestrians and stopping',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'Computer vision and real-time decision making from sensor data.',
      category: 'Computer Vision',
      difficulty: 'HARD',
    },
    {
      questionText: 'Digital alarm clock ringing at 7:00 AM',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'Compares system time to set alarm value, no AI required.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
    {
      questionText: 'Voice assistant recognizing your spoken command',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 0,
      explanation: 'Speech recognition and natural language processing.',
      category: 'NLP',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Traffic light changing from red to green on a fixed 60-second timer',
      questionType: 'TRUE_FALSE',
      options: ['AI', 'Not AI'],
      correctOptionIndex: 1,
      explanation: 'Static time-based cycling without real-time data processing.',
      category: 'AI Basics',
      difficulty: 'EASY',
    },
  ];

  const q1Docs = await QuestionModel.insertMany(
    activity1QuestionsData.map((q) => ({
      ...q,
      trainerId,
      timeLimit: 20,
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
    defaultTimeLimit: 20,
    defaultPoints: 1000,
  });

  // -------------------------------------------------------------
  // QUIZ 2: "Activity 2: AI Technology Detective" (Drag & Drop + MCQs)
  // -------------------------------------------------------------
  const activity2QuestionsData = [
    {
      questionText: 'Sort the Solutions into Categories: Traditional ML, Deep Learning, NLP, and Computer Vision',
      questionType: 'DRAG_AND_DROP',
      options: [
        'Customer churn prediction',
        'House price prediction',
        'Handwritten digit recognition',
        'Speech recognition',
        'Customer email classification',
        'Meeting summary generator',
        'Factory defect detection',
        'Traffic camera vehicle counting',
      ],
      categories: [
        { id: 'ml', title: 'Traditional Machine Learning', description: 'Structured business data' },
        { id: 'dl', title: 'Deep Learning', description: 'Neural networks & complex patterns' },
        { id: 'nlp', title: 'Natural Language Processing', description: 'Human language & text' },
        { id: 'cv', title: 'Computer Vision', description: 'Images and video' },
      ],
      categoryAssignments: {
        '0': 'ml',
        '1': 'ml',
        '2': 'dl',
        '3': 'dl',
        '4': 'nlp',
        '5': 'nlp',
        '6': 'cv',
        '7': 'cv',
      },
      explanation: 'Categorize based on problem domain (text, vision) vs data structure (tabular, neural networks).',
      category: 'AI Architectures',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'A customer-service voice assistant must understand what customers say and use a neural network trained on thousands of voice examples. What combination is needed?',
      questionType: 'MCQ',
      options: [
        'NLP + Deep Learning',
        'Computer Vision + Deep Learning',
        'NLP + Traditional Machine Learning',
        'Traditional Machine Learning only',
      ],
      correctOptionIndex: 0,
      explanation: 'Speech/language is NLP; neural network on large voice dataset is Deep Learning.',
      category: 'AI Architectures',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'A factory wants to use camera images to identify damaged products. What combination is most appropriate?',
      questionType: 'MCQ',
      options: [
        'NLP + Deep Learning',
        'Computer Vision + Deep Learning',
        'Computer Vision + Traditional Machine Learning',
        'Traditional Machine Learning only',
      ],
      correctOptionIndex: 1,
      explanation: 'Camera images require Computer Vision, and visual pattern learning uses Deep Learning.',
      category: 'Computer Vision',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'A company wants to predict which employees may leave using salary, tenure, age, and performance data. What is the clearest approach?',
      questionType: 'MCQ',
      options: [
        'Computer Vision + Deep Learning',
        'NLP + Deep Learning',
        'Traditional Machine Learning',
        'NLP + Traditional Machine Learning',
      ],
      correctOptionIndex: 2,
      explanation: 'Structured employee tabular data for churn prediction is classic Traditional ML.',
      category: 'Machine Learning',
      difficulty: 'EASY',
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
    instructions: 'Categorize solutions and pick optimal AI technology combinations.',
    questionIds: q2Docs.map((doc) => doc._id),
    status: 'READY',
    defaultTimeLimit: 30,
    defaultPoints: 1000,
  });

  // -------------------------------------------------------------
  // QUIZ 3: "Activity 3: AI Solution & Workflow Sequence Challenge"
  // -------------------------------------------------------------
  const activity3QuestionsData = [
    {
      questionText: 'Arrange the End-to-End AI Solution Workflow in the Correct Logical Sequence',
      questionType: 'CORRECT_SEQUENCE',
      options: [
        'Step A: Business Problem Definition & Data Collection',
        'Step B: Data Preprocessing & Feature Selection',
        'Step C: Model Training & Hyperparameter Tuning',
        'Step D: Evaluation, Safety & Guardrail Validation',
        'Step E: Production Deployment & Monitoring',
      ],
      correctOrder: [0, 1, 2, 3, 4],
      explanation: 'AI workflows follow: Problem -> Preprocessing -> Training -> Evaluation -> Deployment.',
      category: 'AI Engineering',
      difficulty: 'MEDIUM',
    },
    {
      questionText: 'Order the steps for setting up a RAG (Retrieval-Augmented Generation) pipeline',
      questionType: 'CORRECT_SEQUENCE',
      options: [
        'Document Chunking & Embedding Generation',
        'Indexing Vector Database',
        'User Query Embedding & Retrieval Search',
        'LLM Response Generation with Context',
      ],
      correctOrder: [0, 1, 2, 3],
      explanation: 'RAG requires chunking -> indexing -> semantic search -> augmented generation.',
      category: 'Generative AI',
      difficulty: 'HARD',
    },
  ];

  const q3Docs = await QuestionModel.insertMany(
    activity3QuestionsData.map((q) => ({
      ...q,
      trainerId,
      timeLimit: 30,
      points: 1000,
      tags: ['Workflow-Sequence', 'Workshop-Activity3'],
    }))
  );

  const quiz3 = await QuizModel.create({
    trainerId,
    title: 'Activity 3: AI Solution & Workflow Challenge',
    category: 'AI Workflows',
    description: 'Correct the sequence of AI development workflows and pipeline architectures.',
    instructions: 'Re-order the steps into the correct logical sequence.',
    questionIds: q3Docs.map((doc) => doc._id),
    status: 'READY',
    defaultTimeLimit: 30,
    defaultPoints: 1000,
  });

  // -------------------------------------------------------------
  // QUIZ 4: "Activity 4: Prompt Engineering Challenge (RCTOF)"
  // -------------------------------------------------------------
  const activity4QuestionsData = [
    {
      questionText: 'Which element of the RCTOF prompt engineering framework defines WHO the AI should act as during response generation?',
      questionType: 'MCQ',
      options: ['Role / Persona', 'Context', 'Task', 'Output Format'],
      correctOptionIndex: 0,
      explanation: 'Role defines persona or identity (e.g. "Act as a Senior AI Architect").',
      category: 'Prompt Engineering',
      difficulty: 'EASY',
    },
    {
      questionText: 'Assemble an Effective RCTOF Prompt for Corporate Training Support',
      questionType: 'PROMPT_BUILDER',
      options: ['Role', 'Context', 'Task', 'Output Format'],
      promptBlocks: {
        role: ['Act as an Expert Technical Trainer', 'Act as a General Assistant'],
        context: ['Target audience is corporate engineers', 'Target audience is high school students'],
        task: ['Draft a 5-step interactive workshop overview', 'Write a short story'],
        outputFormat: ['Format as structured Markdown with bullet points', 'Format as plain unformatted text'],
      },
      explanation: 'Effective RCTOF prompt combines specific role, context, explicit task, and structured format.',
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
    instructions: 'Select answer choices or assemble RCTOF prompt blocks to complete the challenge.',
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
