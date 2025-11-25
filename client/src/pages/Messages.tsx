import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Send, Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
}

export default function Messages() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const conversationId = params.get('conversationId');
  
  const [messageText, setMessageText] = useState("");
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [wsReady, setWsReady] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
  });

  // Fetch messages for selected conversation
  const { data: messages } = useQuery<Message[]>({
    queryKey: conversationId ? [`/api/conversations/${conversationId}/messages`] : [],
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/messages', {
        conversationId,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: conversationId ? [`/api/conversations/${conversationId}/messages`] : [] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    },
  });

  // Setup WebSocket for real-time updates
  useEffect(() => {
    if (!conversationId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      setWsReady(true);
      ws.send(JSON.stringify({ type: 'join', conversationId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'typing') {
          setTypingUsers(prev => new Set(prev).add(data.userId));
          setTimeout(() => {
            setTypingUsers(prev => {
              const updated = new Set(prev);
              updated.delete(data.userId);
              return updated;
            });
          }, 3000);
        }
      } catch (error) {
        console.error('WebSocket parse error:', error);
      }
    };

    ws.onerror = () => setWsReady(false);
    ws.onclose = () => setWsReady(false);

    wsRef.current = ws;
    return () => ws.close();
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !conversationId) return;
    
    // Broadcast typing stop
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'typing-stop', 
        conversationId,
        userId: user?.id 
      }));
    }
    
    sendMessageMutation.mutate(messageText);
  };

  const handleTyping = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ 
        type: 'typing', 
        conversationId,
        userId: user?.id 
      }));
    }
  };

  // If no conversation selected, show list
  if (!conversationId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-8 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Messages</h2>
            <p className="text-muted-foreground mb-4">
              {conversations?.length ? 'Select a conversation to view messages' : 'No conversations yet. Start by contacting a host!'}
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 rounded-full p-2.5">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Host Chat</p>
                <p className="text-xs text-muted-foreground">{wsReady ? '🟢 Connected' : '🔴 Offline'}</p>
              </div>
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
