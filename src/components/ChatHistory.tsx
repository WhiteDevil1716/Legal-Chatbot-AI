import React from 'react';
import { MessageSquare, Search, PlusCircle } from 'lucide-react';

interface ChatHistoryProps {
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

interface HistoryItem {
  id: string;
  title: string;
  date: Date;
}

function groupChatsByDate(chats: HistoryItem[]) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  return {
    today: chats.filter(chat => chat.date.toDateString() === today.toDateString()),
    yesterday: chats.filter(chat => chat.date.toDateString() === yesterday.toDateString()),
    lastWeek: chats.filter(chat => 
      chat.date > lastWeek && 
      chat.date.toDateString() !== today.toDateString() && 
      chat.date.toDateString() !== yesterday.toDateString()
    ),
    lastMonth: chats.filter(chat => 
      chat.date > lastMonth && 
      chat.date <= lastWeek
    ),
    older: chats.filter(chat => chat.date <= lastMonth)
  };
}

export function ChatHistory({ onNewChat, onSelectChat }: ChatHistoryProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [chats] = React.useState<HistoryItem[]>([
    { id: '1', title: 'Property Law Question', date: new Date() },
    { id: '2', title: 'Contract Review', date: new Date(Date.now() - 86400000) }, // Yesterday
    { id: '3', title: 'Employment Rights', date: new Date(Date.now() - 86400000 * 3) }, // 3 days ago
    // Add more sample chats as needed
  ]);

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const groupedChats = groupChatsByDate(filteredChats);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-4 py-2 mb-4"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Chat</span>
        </button>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 text-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {Object.entries({
          'Today': groupedChats.today,
          'Yesterday': groupedChats.yesterday,
          'Last Week': groupedChats.lastWeek,
          'Last Month': groupedChats.lastMonth,
          'Older': groupedChats.older
        }).map(([label, items]) => items.length > 0 && (
          <div key={label} className="mb-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">{label}</h3>
            <div className="space-y-1">
              {items.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 text-left"
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-200 truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}