import React, { useState } from 'react';
// FIX: Correctly import from the newly created types.ts file
import { ResearcherAction } from '../types';

interface ResearcherToolsProps {
  onSubmit: (action: ResearcherAction, input: string) => void;
  isLoading: boolean;
}

const actionIcons: { [key in ResearcherAction]: React.ReactNode } = {
  [ResearcherAction.SUMMARIZE_TEXT]: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>,
  [ResearcherAction.FIND_SOURCES]: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
  [ResearcherAction.EXPLAIN_CONCEPTS]: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a15.045 15.045 0 01-4.5 0M3.75 6.75h16.5v10.5h-16.5V6.75z" /></svg>,
  [ResearcherAction.GENERATE_OUTLINE]: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
};

const tooltipDescriptions: { [key in ResearcherAction]: string } = {
    [ResearcherAction.SUMMARIZE_TEXT]: 'Condenses a long piece of text into a brief summary.',
    [ResearcherAction.FIND_SOURCES]: 'Finds relevant sources and citations for a given topic.',
    [ResearcherAction.EXPLAIN_CONCEPTS]: 'Breaks down complex ideas into simple, easy-to-understand explanations.',
    [ResearcherAction.GENERATE_OUTLINE]: 'Creates a structured outline for an essay, paper, or presentation.',
};

const ActionButton: React.FC<{
  action: ResearcherAction;
  onClick: (action: ResearcherAction) => void;
  isLoading: boolean;
  tooltip: string;
}> = ({ action, onClick, isLoading, tooltip }) => (
  <div className="relative group flex justify-center">
    <button
      onClick={() => onClick(action)}
      disabled={isLoading}
      className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold bg-gray-700/50 text-gray-200 rounded-lg hover:bg-teal-600 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 border border-gray-600/80"
      aria-label={`${action}: ${tooltip}`}
    >
      {actionIcons[action]}
      {action}
    </button>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg border border-gray-700 z-10">
      {tooltip}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
    </div>
  </div>
);

const ResearcherTools: React.FC<ResearcherToolsProps> = ({ onSubmit, isLoading }) => {
  const [input, setInput] = useState('');

  const handleActionClick = (action: ResearcherAction) => {
    onSubmit(action, input);
  };

  return (
    <div className="bg-gray-900/50 p-6 rounded-xl shadow-xl h-full flex flex-col border border-gray-700/50">
       <h2 className="text-xl font-semibold mb-4 text-teal-300 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        Researcher Tools
      </h2>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste text from an article, paper, or document..."
        className="w-full flex-grow bg-gray-800/80 border border-gray-700 rounded-lg p-4 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none text-gray-300"
      />
      <div className="grid grid-cols-2 gap-3 mt-4">
        {Object.values(ResearcherAction).map((action) => (
          <ActionButton
            key={action}
            action={action}
            onClick={handleActionClick}
            isLoading={isLoading}
            tooltip={tooltipDescriptions[action]}
          />
        ))}
      </div>
    </div>
  );
};

export default ResearcherTools;
