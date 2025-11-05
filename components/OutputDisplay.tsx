import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../types';
import Spinner from './Spinner';

interface OutputDisplayProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ messages, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-6">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl lg:max-w-2xl px-4 py-2 md:px-5 md:py-3 rounded-2xl ${message.role === 'user' ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-gray-700/70 text-gray-200 rounded-bl-lg'}`}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.sources && message.sources.length > 0 && (
                 <div className="mt-4 border-t border-gray-600 pt-2">
                    <h4 className="text-xs font-semibold text-gray-400 mb-1">Sources:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {message.sources.map((source, i) => (
                        source.web?.uri && <li key={i} className="text-xs">
                          <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline break-all" title={source.web.uri}>
                            {source.web.title || source.web.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                 </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length -1]?.content === '' && (
          <div className="flex justify-start">
            <div className="max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl bg-gray-700/70 text-gray-200 flex items-center">
              <Spinner />
              <span className="ml-2">Thinking...</span>
            </div>
          </div>
        )}
         {messages.length === 0 && !isLoading && (
            <div className="flex-grow flex items-center justify-center h-full">
                <h1 className="text-4xl font-semibold text-gray-500">What's on your mind today?</h1>
            </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};

export default OutputDisplay;