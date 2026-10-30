
export const mockProgressStats = [
  {
    label: "Average quiz score",
    value: "82%",
    detail: "Across completed quizzes",
    icon: "quiz",
  },
  {
    label: "Study time",
    value: "42.5h",
    detail: "Total focused learning",
    icon: "clock",
  },
  {
    label: "Topics mastered",
    value: "55",
    detail: "Across all enrolled courses",
    icon: "target",
  },
  {
    label: "Learning consistency",
    value: "86%",
    detail: "Based on your study activity",
    icon: "activity",
  },
];

export const weeklyActivity = [
  { label: "Mon", hours: 1.5 },
  { label: "Tue", hours: 2.5 },
  { label: "Wed", hours: 1.8 },
  { label: "Thu", hours: 3.2 },
  { label: "Fri", hours: 2.2 },
  { label: "Sat", hours: 4.1 },
  { label: "Sun", hours: 3.0 },
];

export const monthlyActivity = [
  { label: "Week 1", hours: 9.5 },
  { label: "Week 2", hours: 12.2 },
  { label: "Week 3", hours: 8.8 },
  { label: "Week 4", hours: 12.0 },
];

export const weeklyQuizPerformance = [
  { label: "Mon", score: 65 },
  { label: "Tue", score: 72 },
  { label: "Wed", score: 68 },
  { label: "Thu", score: 78 },
  { label: "Fri", score: 74 },
  { label: "Sat", score: 88 },
  { label: "Sun", score: 82 },
];

export const monthlyQuizPerformance = [
  { label: "Week 1", score: 68 },
  { label: "Week 2", score: 74 },
  { label: "Week 3", score: 79 },
  { label: "Week 4", score: 82 },
];

export const mockCourseMastery = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    shortName: "DSA",
    mastery: 85,
    masteredTopics: 24,
    totalTopics: 28,
    color: "bg-brand",
    topics: [
      { name: "Arrays", mastery: 95 },
      { name: "Binary Search", mastery: 88 },
      { name: "Strings", mastery: 92 },
      { name: "Linked Lists", mastery: 78 },
      { name: "Trees", mastery: 65 },
      { name: "Dynamic Programming", mastery: 42 },
    ],
  },
  {
    id: "dbms",
    name: "Database Management Systems",
    shortName: "DBMS",
    mastery: 76,
    masteredTopics: 17,
    totalTopics: 23,
    color: "bg-info",
    topics: [
      { name: "SQL Basics", mastery: 95 },
      { name: "Joins", mastery: 82 },
      { name: "Normalization", mastery: 75 },
      { name: "Transactions", mastery: 65 },
      { name: "Indexing", mastery: 48 },
    ],
  },
  {
    id: "os",
    name: "Operating Systems",
    shortName: "OS",
    mastery: 69,
    masteredTopics: 15,
    totalTopics: 25,
    color: "bg-success",
    topics: [
      { name: "Process Management", mastery: 85 },
      { name: "CPU Scheduling", mastery: 78 },
      { name: "Deadlocks", mastery: 65 },
      { name: "Memory Management", mastery: 52 },
      { name: "Page Replacement", mastery: 40 },
    ],
  },
  {
    id: "cn",
    name: "Computer Networks",
    shortName: "CN",
    mastery: 61,
    masteredTopics: 12,
    totalTopics: 20,
    color: "bg-warning",
    topics: [
      { name: "OSI Model", mastery: 90 },
      { name: "TCP/IP", mastery: 75 },
      { name: "Routing", mastery: 58 },
      { name: "Transport Layer", mastery: 45 },
    ],
  },
];

export const mockLearningHistory = [
  {
    id: 1,
    title: "Binary Search Quiz",
    course: "Data Structures & Algorithms",
    type: "Quiz",
    result: "90%",
    date: "Today",
  },
  {
    id: 2,
    title: "Completed SQL Joins",
    course: "Database Management Systems",
    type: "Topic",
    result: "Mastered",
    date: "Yesterday",
  },
  {
    id: 3,
    title: "CPU Scheduling Practice",
    course: "Operating Systems",
    type: "Quiz",
    result: "80%",
    date: "Yesterday",
  },
  {
    id: 4,
    title: "Process Management",
    course: "Operating Systems",
    type: "Topic",
    result: "Mastered",
    date: "2 days ago",
  },
  {
    id: 5,
    title: "Array Fundamentals",
    course: "Data Structures & Algorithms",
    type: "Topic",
    result: "Mastered",
    date: "3 days ago",
  },
];

export const mockLearningInsights = [
  {
    title: "Strongest area",
    topic: "Arrays",
    course: "DSA",
    mastery: 95,
    type: "strong",
  },
  {
    title: "Needs improvement",
    topic: "Dynamic Programming",
    course: "DSA",
    mastery: 42,
    type: "weak",
  },
];
