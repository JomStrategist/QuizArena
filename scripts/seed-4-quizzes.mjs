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
  timeLimit: { type: Number, default: 20 },
  points: { type: Number, default: 1000 },
  explanation: String,
  category: { type: String, default: 'AI & Analytics' },
  difficulty: { type: String, default: 'MEDIUM' },
  tags: [String],
}, { timestamps: true });
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

// Quiz 3: Activity 3 - AI Business Capabilities & Automation
const quiz3Data = {
  title: "Activity 3: AI Business Capabilities & Automation",
  description: "Evaluate AI capabilities across structured data, natural language processing, visual recognition, and decision automation.",
  category: "Business AI Applications",
  questions: [
    {
      q: "Which scenario represents an optimal application of Natural Language Processing (NLP) in enterprise customer service?",
      opts: [
        "Automatically converting customer voice calls and emails into structured intent categories and sentiment scores",
        "Calculating the monthly average invoice amount using SQL queries",
        "Sorting scanned PDF invoices by file size",
        "Sending automated birthday email templates to users based on a calendar date"
      ],
      ans: 0,
      why: "NLP is specifically designed to parse unstructured human text and voice data to extract underlying intent and sentiment."
    },
    {
      q: "When implementing an AI-driven predictive maintenance model in manufacturing, which input data type is most critical?",
      opts: [
        "Time-series sensor telemetry data (vibration, temperature, pressure)",
        "Employee payroll spreadsheets",
        "Company branding guidelines and logos",
        "Static PDF user manuals"
      ],
      ans: 0,
      why: "Predictive maintenance relies on real-time and historical time-series sensor data to detect early anomaly patterns before failure."
    },
    {
      q: "What is the primary technical distinction between Traditional Machine Learning and Generative AI?",
      opts: [
        "Traditional ML focuses on classification/prediction from historical data; Generative AI creates new content (text, image, code)",
        "Traditional ML requires internet access; Generative AI works offline without data",
        "Traditional ML only works with numbers; Generative AI only works with audio",
        "There is no technical difference between them"
      ],
      ans: 0,
      why: "Traditional ML predicts or classifies existing data schemas, whereas Generative AI generates novel unstructured outputs based on foundation model training."
    },
    {
      q: "An automated system flags transactions over $10,000 made outside the home country. Is this AI or Rule-Based Automation?",
      opts: [
        "Rule-Based Automation (fixed IF-THEN conditional logic)",
        "Artificial Intelligence (Machine Learning model)",
        "Deep Learning Neural Network",
        "Computer Vision"
      ],
      ans: 0,
      why: "Fixed threshold conditions (IF amount > $10,000 AND location != home) are deterministic rule-based automation, not AI."
    },
    {
      q: "A loan approval platform uses historical repayment records, credit history, and employment stability to estimate default probability. This is an example of:",
      opts: [
        "Predictive Analytics / Machine Learning",
        "Computer Vision",
        "Generative AI",
        "Unsupervised Audio Processing"
      ],
      ans: 0,
      why: "Supervised machine learning algorithms evaluate risk probability based on historical feature vectors."
    }
  ]
};

// Quiz 4: Activity 4 - Prompt Engineering Challenge
const quiz4Data = {
  title: "Activity 4: Prompt Engineering Challenge",
  description: "Master prompt design principles including Role definition, Context setting, Task instructions, Constraints, and Output formatting.",
  category: "Prompt Engineering",
  questions: [
    {
      q: "Which element of the RCTOF prompt engineering framework defines WHO the AI should act as during response generation?",
      opts: ["Role / Persona", "Context", "Task", "Output Format"],
      ans: 0,
      why: "The Role specifies the persona, perspective, and domain expertise the AI model should adopt."
    },
    {
      q: "Consider the prompt: 'Act as a Senior Data Analyst. Summarize Q3 sales data into 3 bullet points, ignoring draft entries. Do not exceed 100 words.' What element is 'Do not exceed 100 words'?",
      opts: ["Constraint", "Role", "Context", "Task"],
      ans: 0,
      why: "Constraints set boundary parameters (length, tone, excluded words, negative constraints) for the AI generation."
    },
    {
      q: "What technique involves providing 1-3 explicit input-output demonstration pairs within the prompt to guide the model?",
      opts: ["Few-Shot Prompting", "Zero-Shot Prompting", "Chain of Thought Prompting", "Negative Prompting"],
      ans: 0,
      why: "Few-shot prompting includes concrete example demonstrations so the LLM learns the exact target formatting pattern."
    },
    {
      q: "Why is 'Chain of Thought' (CoT) prompting effective for complex logical or mathematical problems?",
      opts: [
        "It forces the model to break down its reasoning step-by-step before arriving at the final answer",
        "It makes the AI generate responses 10x faster",
        "It bypasses token limits in LLMs",
        "It automatically translates text into Python code"
      ],
      ans: 0,
      why: "Asking the model to 'think step by step' encourages intermediate reasoning steps, significantly reducing hallucination in multi-step problems."
    },
    {
      q: "Which prompt is the most structured and effective for generating a JSON API response?",
      opts: [
        "Act as a backend engineer. Convert the user input into a JSON object containing keys: 'id', 'status', and 'summary'. Output ONLY valid JSON without markdown wrapping.",
        "Give me JSON data for a user.",
        "Write some code for an API.",
        "Can you format a user nicely?"
      ],
      ans: 0,
      why: "Clear role definition, explicit schema specifications, and strict negative constraints ('output ONLY valid JSON') ensure reliable structured outputs."
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
        let question = await Question.findOne({
          trainerId: trainer._id,
          questionText: qItem.q
        });

        if (!question) {
          question = await Question.create({
            trainerId: trainer._id,
            questionText: qItem.q,
            questionType: 'MCQ',
            options: qItem.opts,
            correctOptionIndex: qItem.ans,
            timeLimit: 20,
            points: 1000,
            explanation: qItem.why,
            category: qData.category,
            difficulty: 'MEDIUM',
            tags: [qData.category],
          });
        } else {
          question.options = qItem.opts;
          question.correctOptionIndex = qItem.ans;
          question.explanation = qItem.why;
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
          defaultTimeLimit: 20,
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
