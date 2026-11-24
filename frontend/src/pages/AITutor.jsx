
import { useEffect, useRef, useState } from "react";
import {
  FiPlus,
  FiBookOpen,
  FiSend,
  FiTarget,
  FiCopy,
  FiCheck,
  FiChevronDown,
  FiMenu,
  FiX,
  FiFileText,
} from "react-icons/fi";

import { HiMiniSparkles } from "react-icons/hi2";
import api from "../services/api";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function createMessage(role, content, extra = {}) {
  return {
    id: Date.now() + Math.random(),
    role,
    content,
    ...extra,
  };
}

function getErrorMessage(error, fallback) {
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.detail ||
    error.response?.data?.message ||
    fallback
  );
}

// --------------------------------------------------
// Tutor avatar
// --------------------------------------------------

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

// --------------------------------------------------
// Message content
// --------------------------------------------------

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
        {message.content
          .split(/(\*\*.*?\*\*|```[\s\S]*?```)/g)
          .map((part, index) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={index} className="font-bold">
                  {part.slice(2, -2)}
                </strong>
              );
            }

            if (part.startsWith("```")) {
              const code = part
                .replace(/^```[a-z]*\n?/i, "")
                .replace(/```$/, "");

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
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-foreground">
            <FiFileText size={14} />
            Retrieved sources
          </p>

          <div className="space-y-3">
            {message.sources.map((source, index) => (
              <div
                key={source.chunk_id || source.document_id || index}
                className="rounded-lg border border-border bg-surface p-3"
              >
                <p className="text-xs font-semibold text-foreground">
                  {source.title || "Course document"}
                </p>

                {source.page_number != null && (
                  <p className="mt-1 text-[10px] text-brand-hover">
                    Page {source.page_number}
                  </p>
                )}

                {source.content && (
                  <p className="mt-2 text-xs leading-5 text-muted">
                    {source.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {message.role === "assistant" && (
        <button
          type="button"
          onClick={copyMessage}
          className="mt-2 flex items-center gap-1.5 text-[11px] text-muted transition hover:text-brand-hover"
        >
          {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
          {copied ? "Copied" : "Copy response"}
        </button>
      )}
    </div>
  );
}

// --------------------------------------------------
// Main AI Tutor
// --------------------------------------------------

export default function AITutor() {
  // Course and topic state
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [coursesLoading, setCoursesLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [contextError, setContextError] = useState("");

  // Chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState("");

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showContext, setShowContext] = useState(true);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const hasMessages = messages.length > 0;

  // --------------------------------------------------
  // Fetch enrolled courses
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function fetchCourses() {
      try {
        setCoursesLoading(true);
        setContextError("");

        const response = await api.get("/me/courses");

        if (!cancelled) {
          setCourses(response.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          setContextError(
            getErrorMessage(error, "Failed to load your courses.")
          );
        }
      } finally {
        if (!cancelled) {
          setCoursesLoading(false);
        }
      }
    }

    fetchCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // Fetch topics when course changes
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedCourse) {
      setTopics([]);
      setSelectedTopic("");
      return;
    }

    let cancelled = false;

    async function fetchTopics() {
      try {
        setTopicsLoading(true);
        setContextError("");
        setTopics([]);
        setSelectedTopic("");

        const response = await api.get(
          `/me/courses/${selectedCourse}/mastery`
        );

        if (!cancelled) {
          setTopics(response.data.topics || []);
        }
      } catch (error) {
        if (!cancelled) {
          setTopics([]);
          setContextError(
            getErrorMessage(error, "Failed to load course topics.")
          );
        }
      } finally {
        if (!cancelled) {
          setTopicsLoading(false);
        }
      }
    }

    fetchTopics();

    return () => {
      cancelled = true;
    };
  }, [selectedCourse]);

  // --------------------------------------------------
  // Scroll to latest message
  // --------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // --------------------------------------------------
  // Start new chat
  // --------------------------------------------------

  function startNewChat() {
    setMessages([]);
    setInput("");
    setChatError("");
    setSidebarOpen(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  // --------------------------------------------------
  // Change course
  // --------------------------------------------------

  function handleCourseChange(courseId) {
    setSelectedCourse(courseId);
    setSelectedTopic("");
  }

  // --------------------------------------------------
  // Send message to AI Tutor
  // --------------------------------------------------

  async function handleSend(event) {
    event?.preventDefault();

    const question = input.trim();

    if (!question || isTyping) return;

    const userMessage = createMessage("user", question);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setChatError("");
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await api.post("/ai-tutor/query", {
        question,
        context: {
          course_id: selectedCourse
            ? Number(selectedCourse)
            : null,

          topic_id: selectedTopic
            ? Number(selectedTopic)
            : null,
        },
      });

      const result = response.data;

      const answer =
        result?.answer ||
        result?.response ||
        result?.message;

      if (!answer || typeof answer !== "string") {
        throw new Error(
          "The AI Tutor returned an unexpected response."
        );
      }

      const assistantMessage = createMessage(
        "assistant",
        answer,
        {
          sources: Array.isArray(result.sources)
            ? result.sources
            : [],
        }
      );

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setChatError(
        getErrorMessage(
          error,
          "Unable to get a response. Please try again."
        )
      );
    } finally {
      setIsTyping(false);
    }
  }

  // --------------------------------------------------
  // Input handling
  // --------------------------------------------------

  function handleInputChange(event) {
    setInput(event.target.value);

    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(
        textarea.scrollHeight,
        140
      )}px`;
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="mx-auto flex h-[calc(100dvh-7rem)] max-w-[1600px] min-h-[580px] gap-4 overflow-hidden">

      {/* Mobile sidebar backdrop */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-border bg-surface p-4 transition-transform lg:relative lg:inset-auto lg:z-auto lg:flex lg:translate-x-0 lg:rounded-panel lg:border ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TutorAvatar />

            <div>
              <p className="text-sm font-bold text-foreground">
                AI Tutor
              </p>
              <p className="text-[11px] text-muted">
                Learning assistant
              </p>
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

        <div className="mt-6 flex-1">
          <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-wider text-muted">
            Current session
          </p>

          <div className="rounded-xl bg-brand-wash p-3">
            <div className="flex items-center gap-2">
              <HiMiniSparkles
                size={16}
                className="text-brand-hover"
              />
              <p className="text-xs font-semibold text-foreground">
                Learning assistant
              </p>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-muted">
              Ask follow-up questions to understand concepts more deeply.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border p-3">
          <p className="text-xs font-semibold text-foreground">
            Messages in this chat
          </p>

          <p className="mt-1 text-xs text-muted">
            {messages.filter((message) => message.role === "user").length}{" "}
            questions asked
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

          <button
            type="button"
            onClick={() => setShowContext((prev) => !prev)}
            className="flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-xs font-semibold text-foreground hover:border-brand"
          >
            Context

            <FiChevronDown
              size={14}
              className={`transition ${
                showContext ? "rotate-180" : ""
              }`}
            />
          </button>
        </header>

        {/* Course and topic context */}

        {showContext && (
          <div className="flex flex-wrap items-center gap-3 border-b border-border bg-app/50 px-4 py-3 sm:px-5">

            {/* Course selector */}

            <div className="flex items-center gap-2">
              <FiBookOpen size={15} className="text-muted" />

              <select
                value={selectedCourse}
                onChange={(event) =>
                  handleCourseChange(event.target.value)
                }
                disabled={coursesLoading}
                className="h-9 max-w-[230px] rounded-lg border border-border bg-surface px-2 text-xs text-foreground outline-none focus:border-brand disabled:opacity-50"
              >
                <option value="">
                  {coursesLoading
                    ? "Loading courses..."
                    : "All courses"}
                </option>

                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic selector */}

            <div className="flex items-center gap-2">
              <FiTarget size={15} className="text-muted" />

              <select
                value={selectedTopic}
                onChange={(event) =>
                  setSelectedTopic(event.target.value)
                }
                disabled={!selectedCourse || topicsLoading}
                className="h-9 max-w-[210px] rounded-lg border border-border bg-surface px-2 text-xs text-foreground outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {topicsLoading
                    ? "Loading topics..."
                    : "All topics"}
                </option>

                {topics.map((topic) => (
                  <option
                    key={topic.topic_id}
                    value={topic.topic_id}
                  >
                    {topic.topic_name}
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

            {contextError && (
              <p className="w-full text-xs text-error">
                {contextError}
              </p>
            )}
          </div>
        )}

        {/* Messages */}

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
                Ask questions, understand difficult concepts, and get help
                with your coursework.
              </p>

              <div className="mx-auto mt-8 w-full max-w-md rounded-2xl border border-border bg-app p-4">
                <div className="flex items-center gap-2">
                  <FiBookOpen
                    size={17}
                    className="text-brand-hover"
                  />

                  <p className="text-xs font-semibold text-foreground">
                    Personalised learning
                  </p>
                </div>

                <p className="mt-2 text-xs leading-5 text-muted">
                  Select a course or topic above to give the AI Tutor
                  additional learning context. You can also ask general
                  questions without selecting either.
                </p>
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
                  {message.role === "assistant" && (
                    <TutorAvatar small />
                  )}

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

        {/* Chat error */}

        {chatError && (
          <div className="border-t border-border bg-error/5 px-4 py-2">
            <p className="mx-auto max-w-3xl text-xs text-error">
              {chatError}
            </p>
          </div>
        )}

        {/* Composer */}

        <div className="border-t border-border bg-surface p-3 sm:p-5">
          <div className="mx-auto max-w-3xl">

            <form
              onSubmit={handleSend}
              className="rounded-2xl border border-border bg-app p-3 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isTyping}
                placeholder="Ask anything about your studies..."
                className="max-h-[140px] min-h-[42px] w-full resize-none bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted disabled:opacity-60"
              />

              <div className="mt-2 flex items-center justify-between">
                <span className="hidden text-[10px] text-muted sm:inline">
                  Enter to send · Shift + Enter for new line
                </span>

                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
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
