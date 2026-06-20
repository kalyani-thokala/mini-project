import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import ExamQuestion from "./models/ExamQuestion.js";
import InterviewQuestion from "./models/InterviewQuestion.js";
import QuestionTemplate from "./models/QuestionTemplate.js";
import CodingProblem from "./models/CodingProblem.js";

dotenv.config();

// Definition lists of subtopics
const examCategories = [
  { name: "Aptitude", subtopics: ["Percentage", "Profit & Loss", "Time & Work", "Probability", "Ratio"] },
  { name: "Reasoning", subtopics: ["Coding-Decoding", "Blood Relations", "Series", "Puzzles"] },
  { name: "Verbal Ability", subtopics: ["Grammar", "Vocabulary", "Reading Comprehension"] },
  { name: "Java", subtopics: ["OOP", "Collections", "Streams", "Threads"] },
  { name: "Python", subtopics: ["OOP", "Functions", "Decorators", "Data Structures"] },
  { name: "React", subtopics: ["Hooks", "useState", "useEffect", "Context API", "Redux", "Routing", "Performance"] },
  { name: "JavaScript", subtopics: ["Closures", "Promises", "Async/Await", "Scope", "DOM"] },
  { name: "DBMS", subtopics: ["Normalization", "Joins", "Transactions", "Indexing"] },
  { name: "Operating Systems", subtopics: ["Scheduling", "Deadlocks", "Memory Management"] },
  { name: "Computer Networks", subtopics: ["TCP/IP", "DNS", "Routing", "HTTP"] }
];

const interviewRoles = [
  { name: "Frontend Developer", topics: ["HTML", "CSS", "JavaScript", "React", "State Management", "Routing", "Performance"] },
  { name: "Backend Developer", topics: ["Node.js", "Express", "REST APIs", "Authentication", "MongoDB"] },
  { name: "Full Stack Developer", topics: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "REST APIs", "MongoDB"] },
  { name: "React Developer", topics: ["Hooks", "useState", "useEffect", "Context API", "Redux", "Routing", "Performance"] },
  { name: "Java Developer", topics: ["OOP", "Collections", "Streams", "Exception Handling"] },
  { name: "Python Developer", topics: ["Functions", "OOP", "Decorators", "Data Structures"] },
  { name: "Data Analyst", topics: ["SQL", "Data Cleansing", "Data Visualization", "Statistics", "Pandas", "NumPy"] },
  { name: "HR Interview", topics: ["Self Introduction", "Strengths", "Weaknesses", "Teamwork", "Leadership"] }
];

const codingCategories = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Stacks",
  "Queues",
  "Trees",
  "Graphs",
  "Recursion",
  "Dynamic Programming"
];

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/interviewace");
    console.log(`MongoDB Seed Connected to: ${conn.connection.host}`);

    // Clean existing tables
    await User.deleteMany({});
    await ExamQuestion.deleteMany({});
    await InterviewQuestion.deleteMany({});
    await QuestionTemplate.deleteMany({});
    await CodingProblem.deleteMany({});
    console.log("All old collections cleared.");

    // 1. Seed System Admin
    const adminPassword = await bcrypt.hash("AdminPassword@123", 10);
    await User.create({
      fullName: "System Administrator",
      email: "admin@prepmaster.com",
      password: adminPassword,
      role: "admin",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Bear",
      emailVerified: true,
      emailVerifiedAt: new Date()
    });
    console.log("Seeded System Administrator.");

    // 2. Seed QuestionTemplates
    const templates = [];
    examCategories.forEach(cat => {
      cat.subtopics.forEach(subtopic => {
        templates.push({
          category: cat.name,
          topic: subtopic,
          difficulty: "medium",
          template: `Identify the primary feature of ${subtopic} in ${cat.name} context. (Template Variable: {varName})`,
          variables: { varName: ["Option A", "Option B", "Option C"] },
          explanationTemplate: `A clear explanation of ${subtopic} for the correct choice.`
        });
      });
    });
    await QuestionTemplate.insertMany(templates);
    console.log(`Seeded ${templates.length} QuestionTemplates.`);

    // 3. Generate ExamQuestions (>= 100 per category = 1000+ total)
    console.log("Generating ExamQuestions...");
    const examQuestionsList = [];
    examCategories.forEach(cat => {
      let count = 0;
      while (count < 100) {
        cat.subtopics.forEach(subtopic => {
          if (count >= 100) return;
          const index = count + 1;
          const difficulty = index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard";

          let questionText = "";
          let options = [];
          let correctAnswer = "";
          let explanation = "";

          if (cat.name === "Aptitude") {
            if (subtopic === "Percentage") {
              const val1 = 5 + (index * 7) % 75;
              const val2 = 100 + (index * 13) % 800;
              const ans = parseFloat(((val1 * val2) / 100).toFixed(2));
              questionText = `What is ${val1}% of ${val2}?`;
              correctAnswer = `${ans}`;
              options = [`${ans}`, `${(ans + 3.5).toFixed(2)}`, `${(ans - 2.1).toFixed(2)}`, `${(ans * 1.15).toFixed(2)}`].sort();
              explanation = `${val1}% of ${val2} is calculated as (${val1} / 100) * ${val2} = ${ans}.`;
            } else if (subtopic === "Profit & Loss") {
              const cp = 120 + (index * 17) % 400;
              const profitPercent = 5 + (index * 3) % 35;
              const sp = parseFloat((cp * (1 + profitPercent / 100)).toFixed(2));
              questionText = `An item bought for Rs. ${cp} is sold at a profit of ${profitPercent}%. What is its selling price?`;
              correctAnswer = `Rs. ${sp}`;
              options = [`Rs. ${sp}`, `Rs. ${(sp - 12.5).toFixed(2)}`, `Rs. ${(sp + 20).toFixed(2)}`, `Rs. ${cp}`].sort();
              explanation = `Selling Price = Cost Price * (1 + Profit%/100) = ${cp} * (1 + ${profitPercent}/100) = Rs. ${sp}.`;
            } else if (subtopic === "Time & Work") {
              const daysA = 6 + (index * 2) % 18;
              const daysB = 10 + (index * 4) % 24;
              const ans = parseFloat(((daysA * daysB) / (daysA + daysB)).toFixed(2));
              questionText = `If A can finish a job in ${daysA} days and B in ${daysB} days, how many days will they take to complete it together?`;
              correctAnswer = `${ans} days`;
              options = [`${ans} days`, `${(ans + 1.2).toFixed(2)} days`, `${(ans - 0.8).toFixed(2)} days`, `8 days`].sort();
              explanation = `Rate together = 1/${daysA} + 1/${daysB}. Days required = (${daysA} * ${daysB}) / (${daysA} + ${daysB}) = ${ans} days.`;
            } else if (subtopic === "Probability") {
              const total = 10 + (index * 3) % 20;
              const red = 3 + (index) % 6;
              const ans = parseFloat((red / total).toFixed(3));
              questionText = `A box holds ${red} red and ${total - red} blue balls. Find the probability of randomly choosing a red ball.`;
              correctAnswer = `${ans}`;
              options = [`${ans}`, `${(ans * 1.25).toFixed(3)}`, `${(ans - 0.08).toFixed(3)}`, `0.500`].sort();
              explanation = `Probability = Favorable cases / Total cases = ${red} / ${total} = ${ans}.`;
            } else { // Ratio
              const r1 = 2 + (index) % 4;
              const r2 = 3 + (index) % 5;
              const factor = 4 + (index * 3) % 12;
              const val1 = r1 * factor;
              const val2 = r2 * factor;
              questionText = `Two figures relate in the ratio ${r1}:${r2}. If their sum totals ${val1 + val2}, what is the value of the larger figure?`;
              correctAnswer = `${Math.max(val1, val2)}`;
              options = [`${Math.max(val1, val2)}`, `${Math.min(val1, val2)}`, `${val1 + val2}`, `${Math.max(val1, val2) + 12}`].sort();
              explanation = `Let values be ${r1}x and ${r2}x. Sum = ${r1 + r2}x = ${val1 + val2} => x = ${factor}. Larger is ${Math.max(r1, r2)} * ${factor} = ${Math.max(val1, val2)}.`;
            }
          } else {
            // Parameterized concepts for other subjects
            const questionConcepts = [
              {
                q: `What role does ${subtopic} play inside ${cat.name} applications? (Variant #${index})`,
                a: `Maintains primary structural and functional properties of ${subtopic}`,
                o: [
                  `Maintains primary structural and functional properties of ${subtopic}`,
                  `Handles asynchronous network connections for ${subtopic}`,
                  `Bypasses browser rendering trees completely`,
                  `Compiles binary code directly into native instructions`
                ],
                exp: `${subtopic} provides key definitions and encapsulation of features inside ${cat.name}.`
              },
              {
                q: `Which standard optimization is recommended for ${subtopic} under ${difficulty} workloads? (Variant #${index})`,
                a: `Apply localized indexing and modular caching for ${subtopic}`,
                o: [
                  `Apply localized indexing and modular caching for ${subtopic}`,
                  `Increase virtual disk swaps constantly`,
                  `Force garbage collectors to run synchronously in loops`,
                  `Refactor entire systems into plain flat text structures`
                ],
                exp: `Local indexes and cache buffers reduce latency and execution overhead of ${subtopic}.`
              },
              {
                q: `Under what conditions is ${subtopic} considered a bottleneck inside ${cat.name}? (Variant #${index})`,
                a: `When concurrent request loads exceed execution thread limits`,
                o: [
                  `When concurrent request loads exceed execution thread limits`,
                  `When the system theme changes dynamically from light to dark`,
                  `When variables use snake_case rather than camelCase`,
                  `When the main database instance is fully normalized`
                ],
                exp: `Thread limits and synchronization blocking can lead to significant delays in ${subtopic}.`
              }
            ];

            const concept = questionConcepts[index % questionConcepts.length];
            questionText = concept.q;
            correctAnswer = concept.a;
            options = [...concept.o].sort();
            explanation = concept.exp;
          }

          examQuestionsList.push({
            category: cat.name,
            topic: subtopic,
            difficulty,
            question: questionText,
            options,
            correctAnswer,
            explanation,
            isTemplateGenerated: true
          });

          count++;
        });
      }
    });

    await ExamQuestion.insertMany(examQuestionsList);
    console.log(`Generated and Seeded ${examQuestionsList.length} ExamQuestions successfully.`);

    // 4. Generate InterviewQuestions (>= 50 per role = 400+ total)
    console.log("Generating InterviewQuestions...");
    const interviewQuestionsList = [];
    interviewRoles.forEach(role => {
      let count = 0;
      while (count < 50) {
        role.topics.forEach(topic => {
          if (count >= 50) return;
          const index = count + 1;
          const difficulty = index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard";

          const templates = [
            `Can you describe how you would design a solution using ${topic} in a production ${role.name} codebase? (V${index})`,
            `What are the major caveats or trade-offs of using ${topic} under heavy request volumes? (V${index})`,
            `Tell me about a time you ran into a performance degradation related to ${topic} and how you diagnosed it. (V${index})`,
            `How does the internal execution model of ${topic} behave inside a modern system? (V${index})`
          ];

          const questionText = templates[index % templates.length];
          interviewQuestionsList.push({
            role: role.name,
            topic,
            difficulty,
            question: questionText
          });

          count++;
        });
      }
    });

    await InterviewQuestion.insertMany(interviewQuestionsList);
    console.log(`Generated and Seeded ${interviewQuestionsList.length} InterviewQuestions successfully.`);

    // 5. Generate CodingProblems (>= 50 per category = 450+ total)
    console.log("Generating CodingProblems...");
    const codingProblemsList = [];
    codingCategories.forEach(catName => {
      let count = 0;
      while (count < 50) {
        const index = count + 1;
        const difficulty = index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard";

        const title = `${catName} Challenge #${index}`;
        const description = `Implement an efficient algorithm for ${catName} problem variation #${index}. Given the constraints, find the optimal layout to traverse or process the input node lists and return expected results.`;
        
        codingProblemsList.push({
          title,
          category: catName,
          difficulty,
          description,
          constraints: [
            `1 <= input.length <= 10^${index % 3 === 0 ? 3 : 5}`,
            `Memory footprint should not exceed O(${index % 3 === 0 ? "1" : "N"}) auxiliary space.`
          ],
          examples: [
            {
              input: `data = [Sample Input ${index}]`,
              output: `[Result Output ${index}]`,
              explanation: `Standard expected output structure matching the algorithmic rules of ${catName}.`
            }
          ],
          solution: `// Solution Code for ${title}\nfunction solve(data) {\n  // Procedural implementation details\n  return true;\n}`
        });

        count++;
      }
    });

    await CodingProblem.insertMany(codingProblemsList);
    console.log(`Generated and Seeded ${codingProblemsList.length} CodingProblems successfully.`);

    console.log("MongoDB Database Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Database Seeding Error:", error);
    process.exit(1);
  }
};

seedDB();
