import React from 'react';
import { Chat } from '../types';

interface ChatHistoryPanelProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const ChatHistoryPanel: React.FC<ChatHistoryPanelProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onNewChat,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      <aside className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 bg-gray-900/80 backdrop-blur-md flex-shrink-0 flex flex-col border-r border-gray-700/50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center px-3 py-2 text-sm font-semibold bg-gray-700/50 text-gray-200 rounded-lg hover:bg-blue-600 transition-colors duration-200 border border-gray-600/80"
            aria-label="Start a new chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Chat
          </button>
           <button onClick={onClose} className="ml-2 p-1 text-gray-400 hover:text-white lg:hidden" aria-label="Close sidebar">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
        </div>
        <nav className="flex-grow overflow-y-auto p-4 space-y-2">
          {chats.length > 0 ? (
            chats.map((chat) => (
              <div key={chat.id} className="relative group">
                <button
                  onClick={() => onSelectChat(chat.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md truncate transition-colors duration-150 ${
                    activeChatId === chat.id
                      ? 'bg-blue-600/50 text-white'
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  }`}
                >
                  {chat.title}
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                      onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-700"
                      aria-label="Delete chat"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-gray-500 px-4 py-8">
              No chat history. Start a new conversation!
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default ChatHistoryPanel;
