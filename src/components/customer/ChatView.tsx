import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';
import { apiService } from "../../services/api";
import { Bot, User, Send, Loader2 } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

interface ChatViewProps {
  onBack?: () => void;   // ✅ new prop
}

export default function ChatView({ onBack }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await apiService.askQuestion(userMessage.text);
      const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error in chat:", error);
      toast.error("Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-muted/20">
      <Card className="flex-1 flex flex-col shadow-xl border border-border bg-card m-6">
        <CardHeader className="border-b border-border bg-gradient-to-r from-accent/10 to-primary/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/20">
                <Bot className="w-6 h-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-primary">
                  AI Live Chat Assistant
                </CardTitle>
                <p className="text-sm text-muted-foreground">Powered by advanced AI technology</p>
              </div>
            </div>

            {onBack && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBack} 
                className="hover:bg-accent/10 border-accent/20 px-4 py-2"
              >
                ← Back to Dashboard
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-grow p-0">
          {/* Chat Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-grow p-4">
            <div className="space-y-4 min-h-full">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center py-12"
                >
                  <div className="p-3 rounded-full bg-accent/20 mb-3">
                    <Bot className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-primary">Welcome to AI Assistant</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    I'm here to help you with any questions about your banking needs.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">Account Balance</span>
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">Transactions</span>
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">Loans</span>
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">Cards</span>
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                    className={`flex gap-4 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={msg.sender === 'user' ? undefined : undefined} />
                      <AvatarFallback className={msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'}>
                        {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <motion.div
                      initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className={`max-w-[80%] ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      } flex flex-col`}
                    >
                      <div
                        className={`px-5 py-4 rounded-2xl shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-muted-foreground rounded-bl-md border border-border'
                        }`}
                      >
                        <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs text-muted-foreground mt-1 px-2"
                      >
                        {msg.sender === 'user' ? 'You' : 'AI Assistant'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-md border border-border px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-accent" />
                      <span className="text-base">AI is thinking...</span>
                    </div>
                    <div className="flex gap-1 mt-3">
                      <motion.div
                        className="w-2 h-2 bg-accent rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-accent rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-accent rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border bg-muted/30 p-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  placeholder="Type your message here... (Press Enter to send)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="pr-12 h-12 rounded-full border-2 border-border focus:border-accent/50 transition-colors bg-background"
                  disabled={loading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full p-0 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
