/**
 * Curated local mock database for interview questions when API key is missing or offline.
 * Covers major roles, difficulties, and types.
 */

export const MOCK_QUESTIONS = {
  "Frontend Developer": {
    "Technical": {
      "Beginner": [
        {
          id: "fe_tech_beg_1",
          question: "What is the difference between semantic and non-semantic HTML elements?",
          modelAnswer: "Semantic elements (like <header>, <article>, and <footer>) clearly describe their meaning to both the browser and the developer. Non-semantic elements (like <div> and <span>) tell us nothing about their content. Using semantic HTML improves accessibility (for screen readers), SEO performance, and makes the document structure cleaner and easier to maintain.",
          keyConcepts: "Semantic HTML, Accessibility (a11y), SEO, DOM Structure",
          difficulty: "Beginner",
          tips: "Always explain 'why' it matters (SEO, screen readers), rather than just giving a dictionary definition. Highlight layout elements like <main>, <nav>, and <section>."
        },
        {
          id: "fe_tech_beg_2",
          question: "Explain the CSS Box Model.",
          modelAnswer: "The CSS box model is essentially a box that wraps around every HTML element. It consists of: Content (the actual text or image), Padding (space around content, inside the border), Border (wraps around padding and content), and Margin (space outside the border. By default, width and height specify only the content area. Setting `box-sizing: border-box` makes width and height include padding and border, which simplifies layouts.",
          keyConcepts: "CSS Layout, Margin, Padding, border-box",
          difficulty: "Beginner",
          tips: "Explain how 'box-sizing: border-box' resolves common layout bugs where width 100% + padding overflows the screen."
        }
      ],
      "Intermediate": [
        {
          id: "fe_tech_int_1",
          question: "What is event delegation in JavaScript and why is it useful?",
          modelAnswer: "Event delegation is a technique where we attach a single event listener to a parent element rather than attaching multiple event listeners to individual child elements. It works because of 'event bubbling'—events bubble up from the target element through the DOM tree. It improves performance by saving memory and handles dynamically added children automatically since the listener is on the parent.",
          keyConcepts: "Event Bubbling, Event Capturing, DOM Events, Performance Optimization",
          difficulty: "Intermediate",
          tips: "Give a concrete example, such as handling clicks on a dynamic <ul> list of <li> elements."
        },
        {
          id: "fe_tech_int_2",
          question: "Explain closures in JavaScript and provide a common use case.",
          modelAnswer: "A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). In other words, a closure gives an inner function access to the outer function's scope even after the outer function has returned. Common use cases include creating private variables (data encapsulation), function factories, and maintaining state in asynchronous callbacks.",
          keyConcepts: "Lexical Scope, Closures, Encapsulation, Private Variables",
          difficulty: "Intermediate",
          tips: "Focus on data privacy. Demonstrate how closures prevent global variable pollution."
        }
      ],
      "Advanced": [
        {
          id: "fe_tech_adv_1",
          question: "What is the Virtual DOM in React, and how does the reconciliation algorithm work?",
          modelAnswer: "The Virtual DOM is a lightweight, in-memory representation of the real DOM. When state changes, React creates a new Virtual DOM tree and compares it with the previous one (a process called 'diffing'). React then calculates the minimum set of changes needed and updates only those specific parts in the real DOM (reconciliation). It optimizes updates using keys to identify elements and assuming different component types produce different structures.",
          keyConcepts: "Virtual DOM, Diffing Algorithm, Reconciliation, React Keys, Fiber Engine",
          difficulty: "Advanced",
          tips: "Discuss how React 16+ Fiber introduced incremental rendering, allowing React to split rendering work into chunks and prioritize animations."
        }
      ]
    },
    "HR": {
      "Intermediate": [
        {
          id: "fe_hr_int_1",
          question: "Why do you want to work as a Frontend Developer, and what draws you to our company?",
          modelAnswer: "I love Frontend Development because it sits at the intersection of coding, design, and user psychology. I get immediate visual feedback on my code and directly impact the user's experience. I am drawn to your company because you prioritize user-centric design and build tools that solve real-world problems. I want to contribute my skills in React and responsive UI design to help your product team scale.",
          keyConcepts: "Company Alignment, Motivation, User Experience (UX)",
          difficulty: "Intermediate",
          tips: "Mention a specific product feature or engineering blog post from the company to show you did your research."
        }
      ]
    }
  },
  "Software Engineer": {
    "Technical": {
      "Intermediate": [
        {
          id: "se_tech_int_1",
          question: "Explain the difference between REST APIs and GraphQL.",
          modelAnswer: "REST is architectural style based on fixed endpoints returning fixed data structures (often resulting in over-fetching or under-fetching data). GraphQL is a query language that exposes a single endpoint, allowing the client to request exactly the fields they need. REST uses standard HTTP verbs (GET, POST, etc.) for actions, whereas GraphQL uses Queries, Mutations, and Subscriptions defined in a strictly-typed schema.",
          keyConcepts: "API Architecture, HTTP Protocols, Schema Definition, Data Transfer",
          difficulty: "Intermediate",
          tips: "Discuss trade-offs: REST is easier to cache at the HTTP level; GraphQL has a steeper learning curve and makes caching more complex."
        },
        {
          id: "se_tech_int_2",
          question: "What is database indexing and how does it improve query performance?",
          modelAnswer: "A database index is a data structure (commonly a B-Tree or Hash Index) that improves the speed of data retrieval operations on a table at the cost of additional writes and storage. Instead of performing a full table scan, the database uses the index to quickly locate rows matching search criteria. While it accelerates SELECT queries, it slows down INSERT, UPDATE, and DELETE queries since the index must be updated too.",
          keyConcepts: "Database Optimization, Indexes, B-Tree, Scan vs Seek",
          difficulty: "Intermediate",
          tips: "Mention indexing strategies, like avoiding indexes on columns with low cardinality (e.g. Booleans) and creating composite indexes for multi-column filters."
        }
      ],
      "Advanced": [
        {
          id: "se_tech_adv_1",
          question: "How do you handle horizontal vs vertical scaling, and when would you choose one over the other?",
          modelAnswer: "Vertical scaling (scaling up) means adding more power (CPU, RAM) to an existing server, whereas horizontal scaling (scaling out) means adding more servers to your pool and distributing traffic via a load balancer. Vertical scaling is simple and has no architectural impact, but has hardware limits and introduces a single point of failure. Horizontal scaling offers high availability and infinite scaling, but requires stateless application architecture and handles data sync complexity.",
          keyConcepts: "System Design, Scaling, Load Balancers, High Availability, Stateless Design",
          difficulty: "Advanced",
          tips: "Frame the choice as architectural evolution: start vertical for speed/simplicity, transition to horizontal as traffic and reliability needs grow."
        }
      ]
    },
    "HR": {
      "Intermediate": [
        {
          id: "se_hr_int_1",
          question: "Describe a time when you disagreed with a technical decision made by your team. How did you handle it?",
          modelAnswer: "During a university project, the team wanted to use MongoDB for a highly relational transaction app. I believed PostgreSQL was a better fit to ensure data integrity and acid compliance. Instead of arguing, I built a quick prototype comparing schema validation and relational joins in both systems and presented the results. Seeing the concrete SQL join performance and transactional guarantees, the team agreed to switch to Postgres. We completed the project with zero data sync errors.",
          keyConcepts: "Conflict Resolution, Collaboration, Data-driven Decisions, Team Player",
          difficulty: "Intermediate",
          tips: "Use the STAR method (Situation, Task, Action, Result) to tell a structured, positive story."
        }
      ]
    }
  },
  "Data Analyst": {
    "Technical": {
      "Beginner": [
        {
          id: "da_tech_beg_1",
          question: "What is the difference between inner, left, right, and full outer joins in SQL?",
          modelAnswer: "SQL joins combine rows from two or more tables based on a related column. INNER JOIN returns rows with matching values in both tables. LEFT JOIN returns all rows from the left table and matched rows from the right table (with NULLs for unmatched right elements). RIGHT JOIN is the opposite, returning all right table rows. FULL OUTER JOIN returns all rows when there is a match in either the left or right table, filling in NULLs where matches are absent.",
          keyConcepts: "SQL Queries, Relational Databases, Joins, Data Aggregation",
          difficulty: "Beginner",
          tips: "Visualize the joins as Venn diagrams to help explain their overlaps."
        }
      ],
      "Intermediate": [
        {
          id: "da_tech_int_1",
          question: "Explain the difference between structured and unstructured data, and how you process them.",
          modelAnswer: "Structured data is highly organized, conforms to a strict schema, and is typically stored in relational databases (e.g., SQL tables containing dates, integers, strings). Unstructured data has no predefined structure (e.g., text files, audio, video, PDF reports) and is often stored in NoSQL databases or data lakes. I process structured data using SQL/Pandas. For unstructured data, I use NLP libraries or regex to extract features and load them into structured formats.",
          keyConcepts: "Data Classification, ETL Pipeline, SQL vs NoSQL, Regex",
          difficulty: "Intermediate",
          tips: "Focus on clean pipelines. Mention ETL (Extract, Transform, Load) processes for transforming unstructured inputs."
        }
      ]
    }
  }
};

// Fallback search function for mock questions
export function getMockQuestions(role, difficulty, type, count = 5) {
  // Normalize roles to fit fallback keys
  let selectedRole = "Software Engineer";
  if (MOCK_QUESTIONS[role]) {
    selectedRole = role;
  } else if (role.includes("React") || role.includes("UI") || role.includes("Full Stack")) {
    selectedRole = "Frontend Developer";
  } else if (role.includes("Data") || role.includes("Machine") || role.includes("Analyst")) {
    selectedRole = "Data Analyst";
  }

  const roleQuestions = MOCK_QUESTIONS[selectedRole];
  let pool = [];

  // Get types matching choice
  if (type === "Mixed") {
    const techPool = (roleQuestions["Technical"] && roleQuestions["Technical"][difficulty]) || [];
    const hrPool = (roleQuestions["HR"] && roleQuestions["HR"][difficulty] || roleQuestions["HR"]["Intermediate"]) || [];
    pool = [...techPool, ...hrPool];
  } else {
    pool = (roleQuestions[type] && roleQuestions[type][difficulty]) || [];
    // Fallback if difficulty has no questions
    if (pool.length === 0) {
      // Get all questions of this type regardless of difficulty
      Object.keys(roleQuestions[type] || {}).forEach(diff => {
        pool = [...pool, ...roleQuestions[type][diff]];
      });
    }
  }

  // If pool is still empty, get all questions for this role
  if (pool.length === 0) {
    Object.keys(roleQuestions).forEach(t => {
      Object.keys(roleQuestions[t] || {}).forEach(d => {
        pool = [...pool, ...roleQuestions[t][d]];
      });
    });
  }

  // Shuffle and slice to count
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  
  // If we need more questions than available, duplicate or generate dummy numbers
  let results = shuffled.slice(0, count);
  let index = 1;
  while (results.length < count) {
    const baseQ = pool[index % pool.length] || {
      question: "Sample Interview Question",
      modelAnswer: "This is a fallback placeholder answer because your selected role and type configuration exceeded the mock question pool.",
      keyConcepts: "General Engineering, Core Fundamentals",
      difficulty: difficulty,
      tips: "Review fundamental engineering and behavior principles."
    };
    results.push({
      ...baseQ,
      id: `${baseQ.id || 'fallback'}_dup_${results.length}`,
      question: `${baseQ.question} (Variation ${Math.floor(results.length / pool.length) + 1})`
    });
    index++;
  }

  return results;
}

// Custom Tip generator based on role
export function getMockTips(role) {
  const defaultTips = [
    "Structure answers using the STAR method: Situation, Task, Action, Result.",
    "Don't just code or state facts; explain your decision-making process and trade-offs.",
    "Always ask clarifying questions at the start of technical prompts.",
    "Be honest about what you do not know, and explain how you would go about finding the answer."
  ];

  const roleTips = {
    "Frontend Developer": [
      "Deeply understand HTML5 semantic tags and W3C accessibility guidelines.",
      "Master CSS layout techniques (Flexbox, Grid, Custom Properties).",
      "Be prepared to code vanilla JavaScript functions (debounce, throttle, deep clone).",
      "Understand React render cycles, reconciliation, hooks (useEffect dependencies), and state management principles."
    ],
    "React Developer": [
      "Understand reconciliation, fiber rendering, and virtual DOM diffing.",
      "Be ready to explain custom hooks development and context optimization.",
      "Understand the difference between state management tools (Zustand, Redux, Context API).",
      "Prepare for performance tuning questions (React.memo, useMemo, useCallback)."
    ],
    "Software Engineer": [
      "Master core Data Structures and Algorithms (Arrays, HashMaps, Trees, Graphs, Sorting).",
      "Understand Object-Oriented Design patterns and SOLID architectural principles.",
      "Understand relational and non-relational database design, indexes, and normalization.",
      "Prepare for System Design fundamentals (scaling, load balancers, caching strategies)."
    ],
    "Data Analyst": [
      "Master intermediate/advanced SQL queries (window functions, subqueries, complex CTEs).",
      "Brush up on statistics (probability, hypothesis testing, A/B testing frameworks).",
      "Understand data cleaning pipelines using Python (Pandas, NumPy).",
      "Review data visualization best practices using dashboard tools or Matplotlib/Seaborn."
    ]
  };

  // Match closest role
  for (const key in roleTips) {
    if (role.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(role.toLowerCase())) {
      return [...roleTips[key], ...defaultTips];
    }
  }

  return defaultTips;
}
