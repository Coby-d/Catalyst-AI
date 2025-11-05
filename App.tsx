import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ToolsPanel from './components/ToolsPanel';
import OutputDisplay from './components/OutputDisplay';
import ChatInput from './components/ChatInput';
import ChatHistoryPanel from './components/ChatHistoryPanel';
import Login from './components/Login';
import SignUp from './components/SignUp';
import SettingsModal from './components/SettingsModal';
import CommandPalette from './components/CommandPalette';
import { Chat, ChatMessage, DeveloperAction, ResearcherAction, ImageAction, Tool } from './types';
import { handleDeveloperAction, handleResearcherAction, handleImageAction, sendChatMessage, generateChatTitle, sendImageChatMessage } from './services/geminiService';
import { useAuth } from './contexts/AuthContext';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('Developer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const getStorageKey = () => user ? `chatHistory_${user.id}` : null;

  useEffect(() => {
    if (!user) {
      setChats([]);
      setActiveChatId(null);
      return;
    };
    
    const storageKey = getStorageKey();
    if (!storageKey) return;
    
    try {
      const savedChats = localStorage.getItem(storageKey);
      if (savedChats) {
        const parsedChats: Chat[] = JSON.parse(savedChats);
        setChats(parsedChats);
        if (parsedChats.length > 0 && !activeChatId) {
          setActiveChatId(parsedChats[0].id);
        }
      } else {
        setChats([]);
        setActiveChatId(null);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
      localStorage.removeItem(storageKey);
    }
  }, [user]);

  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey) {
        if (chats.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(chats));
        } else {
            localStorage.removeItem(storageKey);
        }
    }
  }, [chats, user]);

  const activeChat = chats.find(chat => chat.id === activeChatId);
  const messages = activeChat?.messages ?? [];

  const handleNewChat = useCallback(() => {
    setActiveChatId(null);
    setIsSidebarOpen(false);
  }, []);

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    const remainingChats = chats.filter(c => c.id !== id);
    setChats(remainingChats);
    if (activeChatId === id) {
        setActiveChatId(remainingChats.length > 0 ? remainingChats[0].id : null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsCommandPaletteOpen(p => !p);
        }

        const target = e.target as HTMLElement;
        const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

        if (e.key.toLowerCase() === 'n' && !isTyping) {
            e.preventDefault();
            handleNewChat();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewChat]);

  const executeAction = async (actionFn: () => Promise<ChatMessage>, userContent: string) => {
    setIsLoading(true);

    let currentChatId = activeChatId;
    const isNewChat = !currentChatId;

    if (isNewChat) {
      const newChatId = Date.now().toString();
      const newChat: Chat = {
        id: newChatId,
        title: userContent.substring(0, 40) + '...',
        messages: [],
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChatId);
      currentChatId = newChatId;
    }
    
    setChats(prev => prev.map(chat =>
      chat.id === currentChatId
        ? { ...chat, messages: [...chat.messages, { role: 'user', content: userContent }, { role: 'model', content: '' }] }
        : chat
    ));

    try {
      const modelResponse = await actionFn();
      
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          const updatedMessages = [...chat.messages];
          updatedMessages[updatedMessages.length - 1] = modelResponse;
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      }));
      
      if (isNewChat) {
        const title = await generateChatTitle(userContent);
        setChats(prev => prev.map(chat =>
          chat.id === currentChatId ? { ...chat, title } : chat
        ));
      }
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChatId) {
          const updatedMessages = [...chat.messages];
          updatedMessages[updatedMessages.length - 1] = { role: 'model', content: `Error: ${errorMessage}` };
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const onDeveloperAction = (action: DeveloperAction, input: string) => {
    const userContent = `${action}:\n\`\`\`\n${input}\n\`\`\``;
    executeAction(() => handleDeveloperAction(action, input), userContent);
  };

  const onResearcherAction = (action: ResearcherAction, input: string) => {
    const userContent = `${action}:\n\n> ${input.split('\n').join('\n> ')}`;
    executeAction(() => handleResearcherAction(action, input), userContent);
  };
  
  const onImageAction = (action: ImageAction, prompt: string, base64Image?: string, mimeType?: string) => {
    const userContent = `${action}: ${prompt}`;
    executeAction(() => handleImageAction(action, prompt, base64Image, mimeType), userContent);
  };

  const onSendMessage = (message: string) => {
    executeAction(() => sendChatMessage(message), message);
  };

  const onSendImageMessage = (prompt: string, base64Image: string, mimeType: string) => {
    const userContent = `${prompt}\n\n![User Upload](data:${mimeType};base64,${base64Image})`;
    executeAction(() => sendImageChatMessage(prompt, base64Image, mimeType), userContent);
  };

  if (isAuthLoading) {
    return (
        <div className="bg-gray-900 text-gray-200 flex flex-col h-screen font-sans items-center justify-center">
            <Spinner />
            <p className="mt-4 text-lg">Loading...</p>
        </div>
    );
  }

  if (!user) {
    if (authView === 'login') {
      return <Login onNavigateToSignUp={() => setAuthView('signup')} />;
    }
    return <SignUp onNavigateToSignIn={() => setAuthView('login')} />;
  }

  return (
    <div className="bg-gray-900 text-gray-200 flex flex-col h-screen font-sans">
      <Header 
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} 
      />
      <div className="flex flex-grow overflow-hidden">
        <ChatHistoryPanel
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onNewChat={handleNewChat}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-grow p-4 md:p-6 flex flex-col overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-6 h-full w-full">
            {/* Tools Panel Wrapper */}
            <div className="lg:w-1/2 flex flex-col lg:h-full overflow-y-auto custom-scrollbar">
              <ToolsPanel
                onDeveloperAction={onDeveloperAction}
                onResearcherAction={onResearcherAction}
                onImageAction={onImageAction}
                onSendImage={onSendImageMessage}
                isLoading={isLoading}
                activeTool={activeTool}
                setActiveTool={setActiveTool}
              />
            </div>
            {/* Chat Panel Wrapper */}
            <div className="flex-grow flex flex-col lg:w-1/2 min-h-0">
               <div className="flex-grow overflow-hidden">
                  <OutputDisplay messages={messages} isLoading={isLoading} />
               </div>
              <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
            </div>
          </div>
        </main>
      </div>
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)}
        chats={chats}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onSelectTool={setActiveTool}
      />
    </div>
  );
};

export default App;
