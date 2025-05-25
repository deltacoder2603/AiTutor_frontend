'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, Brain, Sparkles, MessageCircle, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ApiResponse {
  response: string | object;
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatResponse = (response: string | object): string => {
    if (typeof response === 'object') {
      return JSON.stringify(response, null, 2);
    }
    
    // Convert markdown to readable format
    let formatted = response
      .replace(/#{1,6}\s*(.*)/g, '<h3 class="font-bold text-lg mb-2 text-white">$1</h3>')
      .replace(/\*{2}(.*?)\*{2}/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/20 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/```[\s\S]*?```/g, (match) => {
        const code = match.replace(/```[\w]*\n?/g, '').replace(/```$/g, '');
        return `<pre class="bg-white/10 p-3 rounded-lg mt-2 mb-2 overflow-x-auto"><code class="text-sm font-mono whitespace-pre">${code}</code></pre>`;
      })
      .replace(/\n\n/g, '</p><p class="mb-2">');
    
    // Handle bullet points
    const bulletRegex = /^\s*[\*\-\+]\s+(.*)/gm;
    formatted = formatted.replace(bulletRegex, '<li class="ml-4 mb-1">• $1</li>');
    
    // Handle numbered lists
    const numberedRegex = /^\d+\.\s+(.*)/gm;
    formatted = formatted.replace(numberedRegex, '<li class="ml-4 mb-1">$1</li>');
    
    // Wrap list items in ul tags
    formatted = formatted.replace(/(<li.*?<\/li>)/g, '<ul class="mb-2">$1</ul>');
    
    // Wrap remaining text in paragraphs
    if (!formatted.includes('<') || formatted.trim().length > 0) {
      formatted = `<p class="mb-2">${formatted}</p>`;
    }
    
    return formatted;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('https://aitutorbackend-production-1e4f.up.railway.app/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: inputValue }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: formatResponse(data.response),
        isUser: false,
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">
              AI Tutor
            </h1>
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-xl text-white/90 font-light">
            Your intelligent learning companion powered by advanced AI
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <span className="text-white/80">Ask anything, learn everything</span>
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in-up">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-12 animate-fade-in">
                <MessageCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="text-white/70 text-lg">Start a conversation with your AI tutor!</p>
                <p className="text-white/50 text-sm mt-2">Ask questions about any subject you&apos;d like to learn</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? 'animate-slide-right' : 'animate-slide-left'}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-green-500 to-teal-600'
                }`}>
                  {message.isUser ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`flex-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-xs lg:max-w-md xl:max-w-lg p-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto'
                      : 'bg-white/20 backdrop-blur-sm text-white border border-white/10'
                  }`}>
                    {message.isUser ? (
                      <p className="whitespace-pre-wrap break-words">{message.text}</p>
                    ) : (
                      <div 
                        className="whitespace-pre-wrap break-words prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: message.text }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-slide-left">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/20 backdrop-blur-sm text-white border border-white/10 p-4 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce animate-delay-100"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce animate-delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-6 border-t border-white/10 bg-white/5">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your AI tutor anything..."
                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 animate-fade-in">
          <p className="text-sm">
            Powered by advanced AI • Built with Next.js & TypeScript
          </p>
        </div>
      </div>
    </div>
  );
}
