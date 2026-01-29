import { useState, useEffect, useRef } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { useConversations, useCreateConversation, useChatStream } from "@/hooks/use-ai-coach";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Plus, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function AICoach() {
  const { user } = useAuth();
  const { data: conversations, isLoading: loadingConvos } = useConversations();
  const createConversation = useCreateConversation();
  
  const [activeId, setActiveId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [localMessages, setLocalMessages] = useState<Array<{role: string, content: string}>>([]);
  
  // Create initial conversation if none exist
  useEffect(() => {
    if (!loadingConvos && conversations && conversations.length === 0) {
      createConversation.mutate("General Fitness");
    } else if (conversations && conversations.length > 0 && !activeId) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, loadingConvos, activeId]);

  const { sendMessage, isStreaming, streamedContent } = useChatStream(activeId!);

  // Fetch messages for active conversation
  // Note: ideally this should be in the hook, but for now we sync local state
  useEffect(() => {
    if (!activeId) return;
    fetch(`/api/conversations/${activeId}`)
      .then(res => res.json())
      .then(data => setLocalMessages(data.messages || []));
  }, [activeId, isStreaming]); // Re-fetch when streaming stops

  const handleSend = async () => {
    if (!inputValue.trim() || !activeId) return;
    
    const msg = inputValue;
    setInputValue("");
    
    // Optimistic UI
    setLocalMessages(prev => [...prev, { role: "user", content: msg }]);
    
    await sendMessage(msg);
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [localMessages, streamedContent]);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <MobileNav />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation Sidebar (Desktop) */}
          <div className="w-64 border-r bg-muted/20 hidden lg:flex flex-col p-4">
            <Button 
              className="w-full justify-start gap-2 mb-4" 
              onClick={() => createConversation.mutate("New Session")}
            >
              <Plus className="h-4 w-4" /> New Chat
            </Button>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {conversations?.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                      activeId === c.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="truncate">{c.title}</span>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <main className="flex-1 flex flex-col bg-background relative">
            <header className="border-b p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg">AI Fitness Coach</h2>
                <p className="text-xs text-muted-foreground">Powered by GPT-4o • Ask about your health data</p>
              </div>
            </header>

            <ScrollArea className="flex-1 p-4 md:p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {localMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "rounded-2xl px-5 py-3 text-sm leading-relaxed max-w-[85%]",
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-muted text-foreground rounded-tl-none"
                    )}>
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                
                {isStreaming && (
                  <div className="flex gap-4 animate-in fade-in">
                    <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted text-foreground rounded-2xl rounded-tl-none px-5 py-3 text-sm leading-relaxed max-w-[85%]">
                      <ReactMarkdown>{streamedContent || "Thinking..."}</ReactMarkdown>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
              <div className="max-w-3xl mx-auto flex gap-3">
                <Input 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask for a workout plan or nutrition advice..."
                  className="rounded-full pl-6 pr-4 h-12 border-muted-foreground/20 focus-visible:ring-primary"
                  disabled={isStreaming}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isStreaming || !inputValue.trim()}
                  size="icon" 
                  className="h-12 w-12 rounded-full shrink-0 shadow-lg"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                AI can make mistakes. Verify important medical information.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
