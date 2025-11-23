import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Loader2, Bot } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Messages() {
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hello! I\'m your StayHub Assistant. I can help you find properties, answer questions about our vacation rentals, or discuss anything else. What would you like to know?',
      timestamp: new Date(),
    }
  ]);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      console.log('Chat response:', data);
      if (data?.reply) {
        setChatMessages(prev => [...prev, {
          id: Date.now() + '-assistant',
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        }]);
      }
      setMessageText("");
    },
    onError: (error: any) => {
      console.error('Chat error:', error);
      const errorMsg = error?.message?.includes('OPENAI_API_KEY') 
        ? "OpenAI API key not configured. Please contact admin."
        : error?.message || "Failed to send message. Please try again.";
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now() + '-user',
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    sendMessageMutation.mutate(messageText);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center gap-3 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="bg-primary/20 rounded-full p-2.5">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">StayHub AI Assistant</p>
              <p className="text-xs text-muted-foreground">Ask anything about our properties or the world</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-sm`}>
                    <div
                      className={`rounded-2xl px-4 py-2 break-words ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                      data-testid={msg.role === 'user' ? 'text-user-message' : 'text-assistant-message'}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2 items-end">
              <Input
                placeholder="Type your message... Ask about properties, bookings, or anything!"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={sendMessageMutation.isPending}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !messageText.trim()}
                size="icon"
                data-testid="button-send-chat"
              >
                {sendMessageMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
