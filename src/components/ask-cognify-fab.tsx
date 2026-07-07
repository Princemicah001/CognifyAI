
'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { MessageCircle, X, Sparkles, Send, LoaderCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';
import { askCognify } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

type Message = {
    role: 'user' | 'model';
    content: string;
};

export function AskCognifyFAB() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isRestored, setIsRestored] = useState(false);

    // Restore chat session on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedIsOpen = localStorage.getItem('cognify_chat_open') === 'true';
        const savedMessages = localStorage.getItem('cognify_chat_messages');
        const savedInput = localStorage.getItem('cognify_chat_input');

        setIsOpen(savedIsOpen);
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error("Failed to parse saved chat messages:", e);
            }
        }
        if (savedInput) {
            setInput(savedInput);
        }
        setIsRestored(true);
    }, []);

    // Save chat session on change
    useEffect(() => {
        if (!isRestored) return;
        localStorage.setItem('cognify_chat_open', String(isOpen));
    }, [isOpen, isRestored]);

    useEffect(() => {
        if (!isRestored) return;
        localStorage.setItem('cognify_chat_messages', JSON.stringify(messages));
    }, [messages, isRestored]);

    useEffect(() => {
        if (!isRestored) return;
        localStorage.setItem('cognify_chat_input', input);
    }, [input, isRestored]);

    useEffect(() => {
        // Scroll to the bottom when a new message is added or AI starts thinking
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isPending]);


    const handleSendMessage = (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (textToSend.trim() === '' || isPending) return;

        const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
        setMessages(newMessages);
        
        if (!textOverride) {
            setInput('');
        }

        startTransition(async () => {
            const result = await askCognify({
                query: textToSend,
                history: newMessages.slice(0, -1), // Send history without the current message
            });

            if (result.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error,
                });
                setMessages(prev => prev.slice(0, -1)); // Remove user message if AI fails
            } else if (result.response) {
                setMessages(prev => [...prev, { role: 'model', content: result.response! }]);
            }
        });
    };

    return (
        <>
            <div className={cn(
                "fixed bottom-6 right-6 z-50 transition-transform duration-300 ease-in-out",
                isOpen && "translate-y-24 opacity-0 pointer-events-none"
            )}>
                <Button
                    size="icon"
                    className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open AI Chat"
                >
                    <Sparkles className="h-6 w-6" />
                </Button>
            </div>

            <div className={cn(
                "fixed bottom-6 right-6 z-50 w-full max-w-sm transition-all duration-300 ease-in-out",
                !isOpen && "translate-y-full opacity-0 pointer-events-none"
            )}>
                <Card className="shadow-2xl">
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div className="space-y-1.5">
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="text-primary" />
                                Ask Cognify
                            </CardTitle>
                            <CardDescription>Your personal AI study assistant.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close Chat</span>
                        </Button>
                    </CardHeader>
                    <CardContent className="h-80 p-0">
                        <ScrollArea className="h-full" ref={scrollAreaRef}>
                            <div className="p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="flex flex-col items-center justify-center space-y-4 text-center py-4 px-2">
                                        <div className="p-3 bg-primary/10 rounded-full">
                                            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Welcome to Cognify!</p>
                                            <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                                                Ask me how to use the app, explain any academic concept, or help you study!
                                            </p>
                                        </div>
                                        <div className="w-full space-y-1.5 pt-1">
                                            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground text-left px-1">
                                                Suggested Questions
                                            </p>
                                            <div className="grid grid-cols-1 gap-1.5 text-left">
                                                <button
                                                    onClick={() => handleSendMessage("How do I create a study guide?")}
                                                    disabled={isPending}
                                                    className="w-full text-xs text-left p-2 rounded-lg border bg-card hover:bg-muted transition text-foreground font-medium flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <span className="text-primary">•</span> How do I create a study guide?
                                                </button>
                                                <button
                                                    onClick={() => handleSendMessage("Can you expand a syllabus or course outline?")}
                                                    disabled={isPending}
                                                    className="w-full text-xs text-left p-2 rounded-lg border bg-card hover:bg-muted transition text-foreground font-medium flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <span className="text-primary">•</span> Can you expand a course outline?
                                                </button>
                                                <button
                                                    onClick={() => handleSendMessage("How do assessments work and how is essay graded?")}
                                                    disabled={isPending}
                                                    className="w-full text-xs text-left p-2 rounded-lg border bg-card hover:bg-muted transition text-foreground font-medium flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <span className="text-primary">•</span> How are tests & essays evaluated?
                                                </button>
                                                <button
                                                    onClick={() => handleSendMessage("Explain standard deviation with a simple example.")}
                                                    disabled={isPending}
                                                    className="w-full text-xs text-left p-2 rounded-lg border bg-card hover:bg-muted transition text-foreground font-medium flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <span className="text-primary">•</span> Explain standard deviation with an example
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {messages.map((msg, index) => (
                                    <div key={index} className={cn(
                                        "flex items-start gap-3",
                                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                                    )}>
                                        <div className={cn(
                                            "p-3 rounded-lg max-w-[90%] text-sm",
                                            msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                        )}>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {isPending && (
                                    <div className="flex items-start gap-3 justify-start">
                                        <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            <span className="text-sm text-muted-foreground">Cognify is thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="pt-4 border-t">
                        <div className="relative w-full">
                           <Textarea 
                                placeholder="Type your question..." 
                                className="pr-16"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                disabled={isPending}
                           />
                           <Button 
                                size="icon" 
                                className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8"
                                onClick={handleSendMessage}
                                disabled={isPending || input.trim() === ''}
                                aria-label="Send Message"
                           >
                               <Send className="h-4 w-4" />
                           </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
