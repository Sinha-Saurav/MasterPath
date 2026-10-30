
import { useEffect, useRef, useState } from "react";
import {
  FiPlus,
  FiMessageSquare,
  FiSearch,
  FiMoreHorizontal,
  FiBookOpen,
  FiCode,
  FiClipboard,
  FiFileText,
  FiSend,
  FiPaperclip,
  FiTarget,
  FiCopy,
  FiCheck,
  FiChevronDown,
  FiTrash2,
  FiMenu,
  FiX,
  FiArrowUpRight,
  FiClock,
} from "react-icons/fi";

import { HiMiniSparkles } from "react-icons/hi2";

const courses = [
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    topics: ["Arrays", "Binary Search", "Linked Lists", "Trees", "Graphs", "Dynamic Programming"],
  },
  {
    id: "dbms",
    name: "Database Management Systems",
    topics: ["SQL", "Normalization", "Transactions", "Indexing", "Joins"],
  },
  {
    id: "os",
    name: "Operating Systems",
    topics: ["Process Management", "CPU Scheduling", "Deadlocks", "Memory Management"],
  },
  {
    id: "cn",
    name: "Computer Networks",
    topics: ["OSI Model", "TCP/IP", "Routing", "Transport Layer"],
  },
  {
    id: "se",
    name: "Software Engineering",
    topics: ["SDLC", "Agile", "Design Patterns", "Testing"],
  },
];

const modes = [
  { id: "explain", label: "Explain", icon: FiBookOpen },
  { id: "practice", label: "Practice", icon: FiClipboard },
  { id: "code", label: "Code help", icon: FiCode },
  { id: "documents", label: "My documents", icon: FiFileText },
];

const suggestions = [
  {
    title: "Explain a concept",
    description: "Make difficult topics easier to understand.",
    prompt: "Explain binary search with a simple example.",
    icon: FiBookOpen,
  },
  {
    title: "Practice questions",
    description: "Test your understanding of a topic.",
    prompt: "Give me 5 questions on operating system scheduling.",
    icon: FiClipboard,
  },
  {
    title: "Help with code",
    description: "Understand logic and solve coding problems.",
    prompt: "Explain the two-pointer technique with code.",
    icon: FiCode,
  },
  {
    title: "Study my materials",
    description: "Ask questions from your uploaded documents.",
    prompt: "Summarize the important concepts from my course materials.",
    icon: FiFileText,
  },
];

const initialConversations = [
  {
    id: 1,
    title: "Understanding Binary Search",
    preview: "Can you explain binary search?",
    date: "Today",
  },
  {
    id: 2,
    title: "SQL Normalization",
    preview: "What is 3NF?",
    date: "Yesterday",
  },
  {
    id: 3,
    title: "CPU Scheduling",
    preview: "Explain Round Robin scheduling.",
    date: "Yesterday",
  },
];

function createMessage(role, content, extra = {}) {
  return {
    id: Date.now() + Math.random(),
    role,
    content,
    ...extra,
  };
}

function getMockResponse(question, mode, course, topic) {
  const context = topic || course || "your selected subject";

  if (mode === "practice") {
    return {
      content: `Let's test your understanding of ${context}!\n\n**Question 1:** Which of the following statements best describes the concept?\n\nA. It is used only for storing data.\n\nB. It provides a systematic approach to solving a problem.\n\nC. It eliminates the need for algorithms.\n\nD. None of the above.\n\nTry answering first. I'll explain the answer after you respond.`,
      sources: [],
    };
  }

  if (mode === "code") {
    return {
      content: `Let's approach this step by step.\n\nFor your question about **${context}**, first identify the input, expected output, and the logic needed to solve the problem.\n\n\`\`\`javascript\nfunction solve(arr) {\n  // Start by understanding the input\n  // Then implement the required logic\n  return arr;\n}\n\`\`\`\n\nShare the exact problem statement or your code, and I can walk through the solution with you.`,
      sources: [],
    };
  }

  if (mode === "documents") {
    return {
      content: `This is a mock document-based response.\n\nOnce the RAG service is connected, I'll search your uploaded course materials for information related to:\n\n**${question}**\n\nI'll then generate an answer grounded in the retrieved document sections and provide page references.\n\nFor now, document retrieval is not connected.`,
      sources: [],
    };
  }

  return {
    content: `Let's understand this step by step.\n\n**1. Start with the basic idea**\n\n${question}\n\nThe key is to understand the underlying concept before memorizing its definition.\n\n**2. Think about an example**\n\nImagine you're solving a problem related to ${context}. Break it into smaller steps and examine how each step contributes to the final result.\n\n**3. Remember**\n\nTry explaining the concept in your own words. If you can explain it simply, you've understood it well.\n\nWould you like me to give you a practical example or a few practice questions?`,
    sources: [],
  };
}

function TutorAvatar({ small = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-hover ${
        small ? "h-8 w-8" : "h-9 w-9"
      }`}
    >
      <HiMiniSparkles size={small ? 16 : 19} />
    </div>
  );
}

function ModeButton({ mode, active, onClick }) {
  const Icon = mode.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
        active
          ? "bg-brand text-white"
          : "border border-border bg-surface text-muted hover:border-brand hover:text-brand-hover"
      }`}
    >
      <Icon size={15} />
      {mode.label}
    </button>
  );
}

function MessageContent({ message }) {
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="group min-w-0">
      <div className="whitespace-pre-wrap text-sm leading-7 text-foreground">
        {message.content.split(/(\*\*.*?\*\*|```[\s\S]*?```)/g).map((part, index) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={index} className="font-bold">
                {part.slice(2, -2)}
              </strong>
            );
          }

          if (part.startsWith("```")) {
            const code = part.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "");
            return (
              <pre
                key={index}
                className="my-3 overflow-x-auto rounded-xl bg-app p-4 text-xs leading-6 text-foreground"
              >
                <code>{code}</code>
              </pre>
            );
          }

          return <span key={index}>{part}</span>;
        })}
      </div>

      {message.sources?.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-app p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground">
            <FiFileText size={14} />
            Sources
          </p>
          {message.sources.map((source, index) => (
            <p key={index} className="text-xs text-muted">
              {source}
            </p>
          ))}
        </div>
      )}

      {message.role === "assistant" && (
        <button
          type="button"
          onClick={copyMessage}
          className="mt-2 flex items-center gap-1.5 text-[11px] text-muted opacity-100 transition hover:text-brand-hover sm:opacity-0 sm:group-hover:opacity-100"
        >
          {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
          {copied ? "Copied" : "Copy response"}
        </button>
      )}
    </div>
  );
}

export default function AITutor() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState("explain");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showContext, setShowContext] = useState(true);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const selectedCourseData = courses.find(
    (course) => course.id === selectedCourse
  );

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function startNewChat() {
    setActiveConversation(null);
    setMessages([]);
    setInput("");
    setSelectedMode("explain");
    setSidebarOpen(false);
  }

  function openConversation(conversation) {
    setActiveConversation(conversation.id);
    setMessages([
      createMessage(
        "user",
        conversation.preview
      ),
      createMessage(
        "assistant",
        "This is a preview of your previous conversation. Full conversation history will be connected to persistent storage during backend integration."
      ),
    ]);
    setSidebarOpen(false);
  }

  function handleCourseChange(courseId) {
    setSelectedCourse(courseId);
    setSelectedTopic("");
  }

  function handleSend(customPrompt) {
    const question = (customPrompt || input).trim();

    if (!question || isTyping) return;

    const userMessage = createMessage("user", question);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const currentCourse = selectedCourseData?.name || "";
    const currentTopic = selectedTopic;

    const currentConversationId = activeConversation || Date.now();

    if (!activeConversation) {
      setActiveConversation(currentConversationId);

      setConversations((prev) => [
        {
          id: currentConversationId,
          title: question.length > 32
            ? `${question.slice(0, 32)}...`
            : question,
          preview: question,
          date: "Just now",
        },
        ...prev,
      ]);
    }

    setTimeout(() => {
      const response = getMockResponse(
        question,
        selectedMode,
        currentCourse,
        currentTopic
      );

      setMessages((prev) => [
        ...prev,
        createMessage("assistant", response.content, {
          sources: response.sources,
        }),
      ]);

      setIsTyping(false);
    }, 1200);
  }

  function handleInputChange(event) {
    setInput(event.target.value);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function deleteConversation(id) {
    setConversations((prev) => prev.filter((item) => item.id !== id));

    if (activeConversation === id) {
      startNewChat();
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="mx-auto flex h-[calc(100dvh-7rem)] max-w-[1600px] min-h-[580px] gap-4 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close conversation sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      )}

      {/* Conversation sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-border bg-surface p-4 transition-transform lg:relative lg:inset-auto lg:z-auto lg:flex lg:translate-x-0 lg:rounded-panel lg:border lg:border-border ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TutorAvatar />
            <div>
              <p className="text-sm font-bold text-foreground">AI Tutor</p>
              <p className="text-[11px] text-muted">Learning assistant</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-muted hover:bg-brand-wash lg:hidden"
          >
            <FiX size={18} />
          </button>
        </div>

        <button
          type="button"
          onClick={startNewChat}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white transition hover:bg-brand-hover"
        >
          <FiPlus size={17} />
          New conversation
        </button>

        <div className="relative mt-5">
          <FiSearch
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="h-10 w-full rounded-xl border border-border bg-app pl-9 pr-3 text-xs text-foreground outline-none placeholder:text-muted focus:border-brand"
          />
        </div>

        <div className="mt-6 flex-1 overflow-y-auto">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-wider text-muted">
            Recent conversations
          </p>

          <div className="space-y-1">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-center gap-2 rounded-xl px-3 py-3 transition ${
                  activeConversation === conversation.id
                    ? "bg-brand-wash"
                    : "hover:bg-app"
                }`}
              >
                <button
                  type="button"
                  onClick={() => openConversation(conversation)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <FiMessageSquare
                    size={15}
                    className="shrink-0 text-muted"
                  />
                  <span className="truncate text-xs font-medium text-foreground">
                    {conversation.title}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => deleteConversation(conversation.id)}
                  aria-label="Delete conversation"
                  className="shrink-0 rounded-md p-1 text-muted opacity-100 hover:bg-error/10 hover:text-error sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            ))}

            {filteredConversations.length === 0 && (
              <p className="px-3 py-4 text-xs text-muted">
                No conversations found.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-brand-wash p-3">
          <div className="flex items-center gap-2">
            <HiMiniSparkles size={16} className="text-brand-hover" />
            <p className="text-xs font-semibold text-foreground">
              Learning tip
            </p>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-muted">
            Ask follow-up questions to understand concepts more deeply.
          </p>
        </div>
      </aside>

      {/* Main chat */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-panel border border-border bg-surface">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted hover:bg-brand-wash lg:hidden"
            >
              <FiMenu size={19} />
            </button>

            <TutorAvatar />

            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-foreground">
                MasterPath AI Tutor
              </h1>
              <p className="mt-0.5 text-[11px] text-muted">
                Your personal learning companion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1.5 text-[10px] font-semibold text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Demo mode
            </span>

            <button
              type="button"
              onClick={() => setShowContext((prev) => !prev)}
              className="flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-xs font-semibold text-foreground hover:border-brand"
            >
              Context
              <FiChevronDown
                size={14}
                className={`transition ${showContext ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </header>

        {/* Context controls */}
        {showContext && (
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-app/50 px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <FiBookOpen size={15} className="text-muted" />
              <select
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="h-9 max-w-[210px] rounded-lg border border-border bg-surface px-2 text-xs text-foreground outline-none focus:border-brand"
              >
                <option value="">All courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <FiTarget size={15} className="text-muted" />
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={!selectedCourse}
                className="h-9 max-w-[180px] rounded-lg border border-border bg-surface px-2 text-xs text-foreground outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All topics</option>
                {selectedCourseData?.topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            {selectedTopic && (
              <button
                type="button"
                onClick={() => setSelectedTopic("")}
                className="text-[11px] font-semibold text-brand-hover"
              >
                Clear topic
              </button>
            )}
          </div>
        )}

        {/* Chat messages */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {!hasMessages ? (
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-5 py-8 sm:px-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-hover">
                <HiMiniSparkles size={27} />
              </div>

              <h2 className="mt-5 text-center font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                What would you like to learn?
              </h2>

              <p className="mx-auto mt-3 max-w-md text-center text-sm leading-6 text-muted">
                Ask questions, understand difficult concepts, practice
                problems, or get help with your coursework.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;

                  return (
                    <button
                      type="button"
                      key={suggestion.title}
                      onClick={() => handleSend(suggestion.prompt)}
                      className="group rounded-card border border-border bg-surface p-4 text-left transition hover:border-brand/60 hover:bg-brand-wash/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand-hover">
                          <Icon size={18} />
                        </div>
                        <FiArrowUpRight
                          size={16}
                          className="text-muted transition group-hover:text-brand-hover"
                        />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-foreground">
                        {suggestion.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {suggestion.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-7 px-4 py-6 sm:px-8 sm:py-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.role === "assistant" && <TutorAvatar small />}

                  <div
                    className={`min-w-0 max-w-[88%] ${
                      message.role === "user"
                        ? "rounded-2xl rounded-br-sm bg-brand px-4 py-3 text-white"
                        : "flex-1 pt-1"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {message.content}
                      </p>
                    ) : (
                      <MessageContent message={message} />
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-3">
                  <TutorAvatar small />
                  <div className="flex items-center gap-1 rounded-xl bg-app px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-brand" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-surface p-3 sm:p-5">
          <div className="mx-auto max-w-3xl">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {modes.map((mode) => (
                <ModeButton
                  key={mode.id}
                  mode={mode}
                  active={selectedMode === mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                />
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="rounded-2xl border border-border bg-app p-3 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder={
                  selectedMode === "documents"
                    ? "Ask a question from your course materials..."
                    : "Ask anything about your studies..."
                }
                className="max-h-[140px] min-h-[42px] w-full resize-none bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted"
              />

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled
                    title="File upload will be enabled during backend integration"
                    className="flex h-8 items-center gap-2 rounded-lg px-2 text-xs text-muted opacity-50"
                  >
                    <FiPaperclip size={16} />
                    <span className="hidden sm:inline">Attach file</span>
                  </button>
                  <span className="hidden text-[10px] text-muted sm:inline">
                    Enter to send · Shift + Enter for new line
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </form>

            <p className="mt-2 text-center text-[10px] text-muted">
              AI responses may contain mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
