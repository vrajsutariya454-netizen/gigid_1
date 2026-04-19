"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";

type Message = {
  id: string;
  type: "bot" | "user";
  text: string;
};

const FAQ_LIST = [
  {
    q: "How do I boost my Trust Score?",
    a: "You can boost your Trust Score by verifying your identity, linking more gig platforms (like Ola or Uber), and maintaining a consistent earning history across platforms.",
  },
  {
    q: "How do I verify my identity?",
    a: "Navigate to your profile settings to upload Government ID proof and perform a Liveness face scan. Verification typically clears within seconds.",
  },
  {
    q: "Can I link multiple gig platforms?",
    a: "Yes! GigID acts as an aggregator. Connect Swiggy, Zomato, Ola, and more through your Data Hub to consolidate your reputation.",
  },
  {
    q: "How is my data kept private?",
    a: "We use Zero-Knowledge Proofs (ZKPs) meaning we verify your data is truthful (e.g., verifying income limits) without exposing your sensitive underlying work data to third parties.",
  },
];

export function ChatbotFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "bot",
      text: "Hi there! I'm your GigID assistant. Pick a question below or ask me anything related to your work hub.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleFAQClick = (faq: { q: string; a: string }) => {
    // Add user question
    const userMsg: Message = { id: Date.now().toString(), type: "user", text: faq.q };
    setMessages((prev) => [...prev, userMsg]);
    
    // Simulate delay for bot response
    setTimeout(() => {
      const botMsg: Message = { id: (Date.now() + 1).toString(), type: "bot", text: faq.a };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue("");
    
    const userMsg: Message = { id: Date.now().toString(), type: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);

    // Simple fallback reply
    setTimeout(() => {
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        type: "bot", 
        text: "I'm still learning custom conversational queries! For now, try asking me one of the predefined questions from the menu above." 
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ 
              position: "fixed", 
              bottom: "calc(var(--nav-height, 0px) + 110px)", 
              right: "32px",
              zIndex: 9999 
            }}
            className="w-80 h-[480px] bg-background/90 backdrop-blur-2xl border border-border shadow-2xl rounded-3xl flex flex-col overflow-hidden noise"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <MessageSquare size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">GigID Assistant</h3>
                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-muted-foreground hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 pb-0 flex flex-col gap-4 scrollbar-hide">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex w-full ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
                      ${msg.type === "user" 
                        ? "bg-primary text-white rounded-br-sm" 
                        : "bg-muted/50 border border-white/5 text-foreground rounded-bl-sm glass-card"
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* FAQ Suggestions */}
              {messages[messages.length - 1]?.type === "bot" && (
                <div className="flex flex-col gap-2 mt-4 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Suggested Questions</span>
                  <div className="flex flex-wrap gap-2">
                    {FAQ_LIST.map((faq, i) => (
                      <button
                        key={i}
                        onClick={() => handleFAQClick(faq)}
                        className="text-left px-3 py-2 rounded-xl bg-secondary/50 border border-primary/20 hover:bg-primary/20 hover:border-primary/50 transition-all text-xs text-primary font-medium active:scale-95"
                      >
                        {faq.q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-background border-t border-border mt-auto relative z-10">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full h-12 bg-secondary/30 border border-white/10 rounded-full px-5 pr-12 text-sm text-foreground outline-none focus:border-primary/50 focus:bg-secondary/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="absolute right-1.5 p-2 rounded-full bg-primary text-white disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-all hover:scale-105 active:scale-95"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "calc(var(--nav-height, 0px) + 110px)",
          right: "32px",
          zIndex: 9998
        }}
        className="w-14 h-14 rounded-full flex items-center justify-center bg-foreground text-background shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none border border-border"
        aria-label="Toggle Assistant Chatbot"
      >
        <MessageSquare size={24} />
      </button>
    </>
  );
}
