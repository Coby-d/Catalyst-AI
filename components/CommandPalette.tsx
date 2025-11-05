import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Chat, Tool } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onSelectTool: (tool: Tool) => void;
}

interface Command {
  id: string;
  type: 'action' | 'chat';
  label: string;
  action: () => void;
  icon: React.ReactNode;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, chats, onSelectChat, onNewChat, onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = useMemo(() => [
    { id: 'new-chat', type: 'action', label: 'New Chat', action: onNewChat, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> },
    { id: 'tool-dev', type: 'action', label: 'Switch to Developer Tools', action: () => onSelectTool('Developer'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg> },
    { id: 'tool-researcher', type: 'action', label: 'Switch to Researcher Tools', action: () => onSelectTool('Researcher'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> },
    { id: 'tool-image', type: 'action', label: 'Switch to Image Tools', action: () => onSelectTool('Image'), icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg> },
    ...chats.map(chat => ({
      id: chat.id,
      type: 'chat' as const,
      label: `Go to chat: "${chat.title}"`,
      action: () => onSelectChat(chat.id),
      icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72-3.72a1.5 1.5 0 010-2.122l3.72-3.72zM3.75 8.511c-.884.284-1.5 1.128-1.5 2.097v4.286c0 1.136.847 2.1 1.98 2.193l3.72-3.72a1.5 1.5 0 010-2.122l-3.72-3.72z" /></svg>,
    }))
  ], [chats, onNewChat, onSelectChat, onSelectTool]);

  const filteredCommands = useMemo(() =>
    commands.filter(cmd => cmd.label.toLowerCase().includes(searchQuery.toLowerCase())),
    [commands, searchQuery]
  );

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          command.action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  useEffect(() => {
    resultsContainerRef.current?.children[selectedIndex]?.scrollIntoView({
        block: 'nearest',
    });
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 pt-20" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-xl border border-gray-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full bg-transparent p-4 text-lg text-gray-200 focus:outline-none border-b border-gray-700"
          />
          <div className="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-gray-500 border border-gray-600 rounded px-1.5 py-0.5">
            Esc
          </div>
        </div>
        <div ref={resultsContainerRef} className="max-h-96 overflow-y-auto custom-scrollbar p-2">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((command, index) => (
              <button
                key={command.id}
                onClick={() => {
                  command.action();
                  onClose();
                }}
                className={`w-full flex items-center text-left p-3 rounded-md transition-colors ${
                  index === selectedIndex ? 'bg-blue-600/50 text-white' : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <span className="mr-3 text-gray-400">{command.icon}</span>
                <span>{command.label}</span>
              </button>
            ))
          ) : (
            <p className="p-4 text-center text-gray-500">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
