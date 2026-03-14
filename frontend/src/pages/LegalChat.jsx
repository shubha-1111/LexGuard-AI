import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

const MessageBubble = ({ msg }) => {
  const isUser = msg.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-2xl px-4 py-3 rounded-lg text-sm leading-relaxed ${
        isUser
          ? "bg-blue-900 text-white rounded-br-none"
          : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
      }`}>
        {!isUser && (
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs font-semibold text-blue-700">LexGuard AI</p>
            <button
              onClick={handleCopy}
              className="text-xs text-gray-400 hover:text-gray-600 ml-4"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
        <p className="whitespace-pre-wrap">{msg.content}</p>
        {msg.precedents?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-1">
              Related precedents:
            </p>
            {msg.precedents.slice(0, 3).map((p, i) => (
              <p key={i} className="text-xs text-gray-500">
                • {p.document?.title || "Precedent " + (i + 1)}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex justify-start mb-4">
    <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none shadow-sm">
      <div className="flex gap-1 items-center h-4">
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </div>
);

const SUGGESTIONS = [
  "Summarize the uploaded documents",
  "What are the key legal issues in this case?",
  "Explain IPC Section 302",
  "What is the punishment for cheating under IPC 420?",
  "List important deadlines from the documents",
];

export default function LegalChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm LexGuard AI, your legal assistant. I can answer questions about your uploaded case documents, explain legal sections, and help with legal research. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (question) => {
    const q = question || input.trim();
    if (!q || loading) return;

    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await API.post("/ai/legal-chat", { question: q });
      const data = res.data;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "I could not find a relevant answer. Please try rephrasing your question.",
          precedents: data.precedents || [],
        },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-6">

          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              AI Legal Assistant
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Ask questions about your cases, documents, or legal sections
            </p>
          </div>

          {/* Suggestion chips */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-blue-400 hover:text-blue-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto min-h-[400px] max-h-[500px] bg-gray-50 rounded-lg p-2">
            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="text-red-500 text-xs mt-2">{error}</p>
          )}

          {/* Input */}
          <div className="mt-4 flex gap-2">
            <textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a legal question... (Enter to send, Shift+Enter for new line)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-blue-900 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-blue-800 transition-colors self-end"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Powered by your own documents and legal knowledge base — no external API used
          </p>

        </div>
      </div>
    </div>
  );
}