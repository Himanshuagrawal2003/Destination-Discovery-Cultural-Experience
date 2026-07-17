import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { LuMessageSquare, LuX, LuSend, LuSparkles, LuUser } from 'react-icons/lu';
import { selectUser } from '../../redux/slices/authSlice';
import api from '../../services/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! 🌍 I'm your CultureQuest AI assistant. How can I help you plan your next adventure or explore a destination today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Map frontend role to history format required by backend chatbot logic
      const conversationHistory = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));

      const res = await api.post('/ai/chatbot', {
        message: userMessage.content,
        conversationHistory,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.response },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue. Please try sending your message again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null; // Show chatbot only for authenticated users

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-[90vw] sm:w-[380px] h-[500px] bg-white dark:bg-dark-card flex flex-col mb-4 overflow-hidden border border-primary-100 dark:border-dark-border shadow-2xl rounded-3xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-accent to-[#C4B5FD] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LuSparkles className="text-xl animate-pulse text-amber-300" />
                <div className="text-left">
                  <h3 className="font-bold text-sm font-display">Travel Assistant</h3>
                  <p className="text-[10px] text-primary-50/90 font-bold uppercase tracking-wider">Powered by Gemini AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <LuX className="text-xl" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-primary-50/30 dark:bg-slate-900/50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary-100/50 dark:bg-primary-900/20 flex items-center justify-center text-accent shrink-0 border border-primary-100">
                      <LuSparkles className="text-sm" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 text-sm leading-relaxed font-medium ${
                      m.role === 'user'
                        ? 'bg-accent text-white rounded-br-none shadow-sm'
                        : 'bg-white dark:bg-dark-bg text-primary-900 dark:text-slate-200 shadow-sm border border-primary-100/50 dark:border-dark-border/60 rounded-bl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-primary-200/50 dark:bg-primary-950 flex items-center justify-center text-accent shrink-0 border border-primary-100">
                      <LuUser className="text-sm" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary-100/50 dark:bg-primary-900/20 flex items-center justify-center text-accent shrink-0 border border-primary-100 animate-bounce">
                    <LuSparkles className="text-sm" />
                  </div>
                  <div className="bg-white dark:bg-dark-bg rounded-2xl p-3 rounded-bl-none shadow-sm border border-primary-100/50 dark:border-dark-border/60 flex items-center gap-1.5 py-4">
                    <span className="w-2 h-2 bg-accent/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-accent/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-accent/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-dark-card border-t border-primary-100 dark:border-dark-border flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about travel, cultures, food..."
                className="flex-1 w-full px-4 py-2 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-accent hover:bg-accent/90 hover:shadow-glow text-white rounded-xl disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center cursor-pointer shadow-sm"
              >
                <LuSend className="text-sm" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-accent hover:bg-accent/90 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-glow cursor-pointer transition-all border border-primary-200/20"
        aria-label="Chat with AI"
      >
        {isOpen ? <LuX className="text-2xl" /> : <LuMessageSquare className="text-2xl" />}
      </motion.button>
    </div>
  );
}
