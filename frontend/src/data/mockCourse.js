
export const mockCourses = {
  dsa: {
    id: "dsa",
    name: "Data Structures and Algorithms",
    description:
      "Master data structures and algorithms through clear explanations, practical examples, and problem-solving techniques. Build a strong foundation for coding interviews.",
    completedTopics: 24,
    totalTopics: 28,
    progress: 85,
    inProgressTopics: 4,
    notStartedTopics: 0,
    lastActivity: "2 days ago",
    totalQuizzes: 12,
    difficulty: "Beginner to Advanced",
    estimatedTime: "6–8 Weeks",
    tags: [
      "DSA",
      "Problem Solving",
      "Programming",
      "Beginner to Advanced",
    ],
  },

  dbms: {
    id: "dbms",
    name: "Database Management Systems",
    description:
      "Learn database design, relational models, SQL, normalization, transactions, indexing, and the principles behind reliable database systems.",
    completedTopics: 16,
    totalTopics: 23,
    progress: 70,
    inProgressTopics: 4,
    notStartedTopics: 3,
    lastActivity: "Yesterday",
    totalQuizzes: 10,
    difficulty: "Beginner to Intermediate",
    estimatedTime: "5–6 Weeks",
    tags: ["DBMS", "SQL", "Database Design", "Normalization"],
  },

  os: {
    id: "os",
    name: "Operating Systems",
    description:
      "Understand processes, threads, CPU scheduling, memory management, synchronization, and file systems through structured lessons and practice.",
    completedTopics: 15,
    totalTopics: 25,
    progress: 60,
    inProgressTopics: 5,
    notStartedTopics: 5,
    lastActivity: "3 days ago",
    totalQuizzes: 8,
    difficulty: "Intermediate",
    estimatedTime: "5–7 Weeks",
    tags: ["Operating Systems", "Processes", "Memory", "Scheduling"],
  },

  networks: {
    id: "networks",
    name: "Computer Networks",
    description:
      "Explore networking fundamentals, the OSI and TCP/IP models, routing, transport protocols, and network security.",
    completedTopics: 18,
    totalTopics: 24,
    progress: 75,
    inProgressTopics: 3,
    notStartedTopics: 3,
    lastActivity: "4 days ago",
    totalQuizzes: 9,
    difficulty: "Intermediate",
    estimatedTime: "4–6 Weeks",
    tags: ["Networking", "TCP/IP", "Protocols", "Security"],
  },

  software: {
    id: "software",
    name: "Software Engineering",
    description:
      "Learn software development processes, requirements analysis, design principles, testing, project management, and software quality.",
    completedTopics: 10,
    totalTopics: 20,
    progress: 50,
    inProgressTopics: 4,
    notStartedTopics: 6,
    lastActivity: "1 week ago",
    totalQuizzes: 7,
    difficulty: "Beginner to Intermediate",
    estimatedTime: "4–5 Weeks",
    tags: ["Software Design", "Testing", "SDLC", "Project Management"],
  },
};

export const mockMastery = [
  { name: "Arrays", score: 90, color: "bg-brand" },
  { name: "Linked Lists", score: 70, color: "bg-info" },
  { name: "Stacks & Queues", score: 60, color: "bg-success" },
  { name: "Trees", score: 40, color: "bg-warning" },
  { name: "Graphs", score: 20, color: "bg-error" },
];

export const mockNextSteps = [
  {
    id: "continue-topic",
    title: "Continue Sliding Window",
    description: "Complete the current topic",
    action: "continue",
    style: "bg-success/10 text-success",
  },
  {
    id: "take-quiz",
    title: "Take Arrays - Quiz 3",
    description: "Test your understanding",
    action: "quiz",
    style: "bg-error/10 text-error",
  },
  {
    id: "read-notes",
    title: "Review your notes",
    description: "Revisit key concepts",
    action: "notes",
    style: "bg-info/10 text-info",
  },
];
