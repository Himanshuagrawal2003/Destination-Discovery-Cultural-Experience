import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MdChat, MdClose, MdSend, MdSmartToy, MdPerson } from 'react-icons/md';
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
            className="w-[90vw] sm:w-[380px] h-[500px] card flex flex-col mb-4 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            {/* Header */}
            <div className="bg-teal-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MdSmartToy className="text-2xl" />
                <div>
                  <h3 className="font-bold text-sm">Travel Assistant</h3>
                  <p className="text-[10px] text-teal-200 font-medium">Powered by Gemini AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-teal-600 rounded-lg transition-colors"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role !== 'user' && (
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0">
                      <MdSmartToy className="text-lg" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-teal-700 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-800/80 rounded-bl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
                      <MdPerson className="text-lg" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0">
                    <MdSmartToy className="text-lg animate-bounce" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 py-4">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about travel, cultures, food..."
                className="flex-1 input border-slate-200 focus:ring-teal-500 py-2"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center"
              >
                <MdSend className="text-lg" />
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
        className="w-14 h-14 bg-teal-700 hover:bg-teal-800 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-glow cursor-pointer transition-all border border-teal-600/20"
        aria-label="Chat with AI"
      >
        {isOpen ? <MdClose className="text-2xl" /> : <MdChat className="text-2xl" />}
      </motion.button>
    </div>
  );
}
