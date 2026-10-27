
import { useState } from "react";
import {
  FiArrowUp,
  FiCheck,
  FiMessageCircle,
  FiPlus,
} from "react-icons/fi";
import { RiRobot3Fill } from "react-icons/ri";
import { HiMiniSparkles } from "react-icons/hi2";

const suggestedPrompts = [
  "Explain this concept simply",
  "Give me a real-world example",
  "Walk me through a solution",
  "Generate practice questions",
];

export default function TopicAITutor({
  topicTitle = "Two Pointer Technique",
  onSendMessage,
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  function sendMessage(message = input) {
    const text = message.trim();

    if (!text || isThinking) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");

    if (onSendMessage) {
      setIsThinking(true);

      Promise.resolve(onSendMessage(text))
        .then((reply) => {
          setMessages((current) => [
            ...current,
            {
              id: `${Date.now()}-assistant`,
              role: "assistant",
              content:
                typeof reply === "string"
                  ? reply
                  : "I couldn't generate a response. Please try again.",
            },
          ]);
        })
        .catch(() => {
          setMessages((current) => [
            ...current,
            {
              id: `${Date.now()}-assistant`,
              role: "assistant",
              content:
                "Sorry, I couldn't process that request. Please try again.",
            },
          ]);
        })
        .finally(() => setIsThinking(false));

      return;
    }

    // Temporary demo response until the AI service is connected.
    setIsThinking(true);

    setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: `Let's explore "${topicTitle}" step by step. This is a demo response; the real AI Tutor will provide topic-specific explanations once the AI service is connected.`,
        },
      ]);
      setIsThinking(false);
    }, 500);
  }

  function startNewChat() {
    setMessages([]);
    setInput("");
    setIsThinking(false);
  }

  return (
    <section className="flex h-[560px] min-h-0 flex-col overflow-hidden rounded-panel border border-border bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-border p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
            <RiRobot3Fill size={22} />
          </span>

          <div className="min-w-0">
            <h2 className="font-heading font-bold text-foreground">
              AI Tutor
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <span className="size-2 rounded-full bg-success" />
              Demo mode
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={startNewChat}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-brand-wash"
        >
          <FiPlus size={14} />
          New chat
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <>
            <div className="rounded-xl bg-brand-wash p-4">
              <div className="flex items-center gap-2">
                <HiMiniSparkles className="text-brand" />
                <p className="text-sm font-semibold text-foreground">
                  Let's learn together!
                </p>
              </div>

              <p className="mt-2 text-sm leading-6 text-muted">
                Ask me anything about{" "}
                <span className="font-medium text-foreground">
                  {topicTitle}
                </span>
                . I can help explain concepts, explore examples, and guide
                your problem-solving process.
              </p>
            </div>

            <p className="text-xs font-semibold text-muted">
              SUGGESTED QUESTIONS
            </p>

            <div className="flex flex-col items-start gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="max-w-full rounded-full border border-border px-3 py-2 text-left text-xs leading-5 text-brand-hover transition hover:border-brand hover:bg-brand-wash"
                >
                  <FiMessageCircle className="mr-1.5 inline" size={13} />
                  {prompt}
                </button>
              ))}
            </div>
          </>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] rounded-xl px-3.5 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-brand text-white"
                    : "bg-app text-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))
        )}

        {isThinking && (
          <div
            role="status"
            className="flex items-center gap-2 text-xs text-muted"
          >
            <span className="size-2 animate-pulse rounded-full bg-brand" />
            Preparing a response...
          </div>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
        className="border-t border-border p-3"
      >
        <div className="flex items-end gap-2 rounded-xl border border-border bg-app p-2 focus-within:border-brand">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            placeholder={`Ask about ${topicTitle}...`}
            aria-label="Ask the AI Tutor a question"
            className="max-h-24 min-h-9 flex-1 resize-y bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted"
          />

          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            aria-label="Send message"
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiArrowUp size={18} />
          </button>
        </div>

        <p className="mt-2 text-center text-[10px] text-muted">
          Demo responses are illustrative, not AI-generated.
        </p>
      </form>
    </section>
  );
}
