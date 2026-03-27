"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore, Message, User } from "@/app/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User as UserIcon, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatModuleProps {
  otherUser: User | undefined;
}

export function ChatModule({ otherUser }: ChatModuleProps) {
  const { messages, currentUser, sendMessage } = useAppStore();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMessages = messages.filter(m => 
    (m.fromId === currentUser?.id && m.toId === otherUser?.id) ||
    (m.fromId === otherUser?.id && m.toId === currentUser?.id)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && otherUser) {
      sendMessage(otherUser.id, text.trim());
      setText("");
    }
  };

  if (!otherUser) return null;

  return (
    <Card className="flex flex-col h-[500px] shadow-lg border-none">
      <CardHeader className="py-3 px-4 bg-muted/50 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">{otherUser.name}</CardTitle>
          <div className="ml-auto flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground italic">No messages yet. Start a conversation.</p>
              </div>
            )}
            {chatMessages.map((msg) => {
              const isMine = msg.fromId === currentUser?.id;
              return (
                <div key={msg.id} className={cn("flex flex-col", isMine ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                    isMine ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {format(new Date(msg.timestamp), "h:mm a")}
                  </span>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-3 border-t bg-card">
        <form onSubmit={handleSend} className="flex w-full gap-2">
          <Input 
            placeholder="Type your message..." 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
