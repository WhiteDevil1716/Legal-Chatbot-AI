import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Scale, BookOpen, AlertCircle, Paperclip, Mic, User } from 'lucide-react';
import { generateLegalResponse } from './services/llm';
import { getCurrentUser, type UserProfile } from './services/auth';
import { ChatHistory } from './components/ChatHistory';

interface Message {
  content: string;
  type: 'user' | 'bot';
  references?: string[];
  documents?: { title: string; url: string }[];
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      content: input,
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateLegalResponse(input);
      const botMessage: Message = {
        ...response,
        type: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        content: 'I apologize, but I encountered an error. Please try again.',
        type: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  const handleSelectChat = (chatId: string) => {
    // Load chat history from the selected chat
    console.log('Loading chat:', chatId);
  };

  const handleAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleVoiceChat = () => {
    setIsRecording(!isRecording);
    // Implement voice chat logic here
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="text-orange-500 w-8 h-8" />
            <button 
              onClick={handleNewChat}
              className="text-2xl font-bold hover:text-orange-500 transition-colors"
            >
              LegalAssist AI
            </button>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">{user.email}</span>
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <User className="w-8 h-8 p-1 bg-gray-700 rounded-full" />
              )}
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-800 p-6 hidden md:block">
          <ChatHistory onNewChat={handleNewChat} onSelectChat={handleSelectChat} />
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col bg-gray-900">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-6 ${
                  message.type === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'
                }`}
              >
                <div
                  className={`rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  }`}
                >
                  <p>{message.content}</p>
                  {message.references && (
                    <div className="mt-3 text-sm">
                      <h4 className="font-semibold text-orange-300">References:</h4>
                      <ul className="list-disc list-inside text-gray-300">
                        {message.references.map((ref, i) => (
                          <li key={i}>{ref}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {message.documents && (
                    <div className="mt-3 text-sm">
                      <h4 className="font-semibold text-orange-300">Related Documents:</h4>
                      <ul className="space-y-1">
                        {message.documents.map((doc, i) => (
                          <li key={i}>
                            <a
                              href={doc.url}
                              className="text-red-400 hover:text-red-300 underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {doc.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="container mx-auto flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  // Handle file upload
                  console.log('File selected:', e.target.files?.[0]);
                }}
              />
              <button
                type="button"
                onClick={handleAttachment}
                className="p-2 text-gray-400 hover:text-gray-300 focus:outline-none"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your legal question here..."
                className="flex-1 bg-gray-900 text-gray-100 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleVoiceChat}
                className={`p-2 ${isRecording ? 'text-red-500' : 'text-gray-400'} hover:text-gray-300 focus:outline-none`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!input.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
                <span className="sr-only">{isLoading ? 'Processing...' : 'Send'}</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default App;