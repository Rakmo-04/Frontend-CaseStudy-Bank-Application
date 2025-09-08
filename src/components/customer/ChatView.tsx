import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { apiService } from "../../services/api";

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

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>AI Live Chat Assistant</CardTitle>

          {/* ✅ Back Button */}
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              ← Back
            </Button>
          )}
        </CardHeader>

        <CardContent className="flex flex-col flex-grow">
          {/* Chat Messages */}
          <ScrollArea className="flex-grow p-3 border rounded-md bg-muted/30">
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white ml-auto'
                      : 'bg-secondary text-black mr-auto'
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
              {loading && (
                <p className="text-sm text-muted-foreground italic">AI is typing...</p>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex space-x-2 mt-3">
            <Input
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button onClick={sendMessage} disabled={loading}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
