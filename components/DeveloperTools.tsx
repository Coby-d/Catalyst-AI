import React, { useState } from 'react';
// FIX: Correctly import from the newly created types.ts file
import { DeveloperAction } from '../types';

interface DeveloperToolsProps {
  onSubmit: (action: DeveloperAction, input: string) => void;
  isLoading: boolean;
}

const actionIcons: { [key in DeveloperAction]: React.ReactNode } = {
  [DeveloperAction.GENERATE_CODE]: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>,
  [DeveloperAction.EXPLAIN_CODE]: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>,
  [DeveloperAction.REFACTOR_CODE]: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l4.992-4.993m-4.993 0l-3.181 3.183a8.25 8.25 0 000 11.664l3.181 3.183" /></svg>,
  [DeveloperAction.FIND_BUGS]: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
};

const tooltipDescriptions: { [key in DeveloperAction]: string } = {
  [DeveloperAction.GENERATE_CODE]: 'Generates code based on a natural language description.',
  [DeveloperAction.EXPLAIN_CODE]: 'Explains what a piece of code does in plain English.',
  [DeveloperAction.REFACTOR_CODE]: 'Improves and cleans up existing code without changing its functionality.',
  [DeveloperAction.FIND_BUGS]: 'Analyzes code to find potential bugs and logical errors.',
};

const ActionButton: React.FC<{
  action: DeveloperAction;
  onClick: (action: DeveloperAction) => void;
  isLoading: boolean;
  tooltip: string;
}> = ({ action, onClick, isLoading, tooltip }) => (
  <div className="relative group flex justify-center">
    <button
      onClick={() => onClick(action)}
      disabled={isLoading}
      className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold bg-gray-700/50 text-gray-200 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 border border-gray-600/80"
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


const DeveloperTools: React.FC<DeveloperToolsProps> = ({ onSubmit, isLoading }) => {
  const [input, setInput] = useState('');

  const handleActionClick = (action: DeveloperAction) => {
    onSubmit(action, input);
  };

  return (
    <div className="bg-gray-900/50 p-6 rounded-xl shadow-xl h-full flex flex-col border border-gray-700/50">
      <h2 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>
        Developer Tools
      </h2>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your code or describe what you want to build..."
        className="w-full flex-grow bg-gray-800/80 border border-gray-700 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-gray-300 font-mono text-sm"
      />
      <div className="grid grid-cols-2 gap-3 mt-4">
        {Object.values(DeveloperAction).map((action) => (
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

export default DeveloperTools;
