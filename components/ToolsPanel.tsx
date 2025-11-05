import React from 'react';
import DeveloperTools from './DeveloperTools';
import ResearcherTools from './ResearcherTools';
import ImageTools from './ImageTools';
import { DeveloperAction, ResearcherAction, ImageAction, Tool } from '../types';

interface ToolsPanelProps {
  onDeveloperAction: (action: DeveloperAction, input: string) => void;
  onResearcherAction: (action: ResearcherAction, input: string) => void;
  onImageAction: (action: ImageAction, prompt: string, base64Image?: string, mimeType?: string) => void;
  onSendImage: (prompt: string, base64Image: string, mimeType: string) => void;
  isLoading: boolean;
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ 
  onDeveloperAction, 
  onResearcherAction, 
  onImageAction, 
  onSendImage, 
  isLoading,
  activeTool,
  setActiveTool
}) => {

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'Developer':
        return <DeveloperTools onSubmit={onDeveloperAction} isLoading={isLoading} />;
      case 'Researcher':
        return <ResearcherTools onSubmit={onResearcherAction} isLoading={isLoading} />;
      case 'Image':
        return <ImageTools onSubmit={onImageAction} onSendImage={onSendImage} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tool: Tool, label: string, activeColor: string }> = ({ tool, label, activeColor }) => (
    <button
      onClick={() => setActiveTool(tool)}
      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        activeTool === tool
          ? `${activeColor} text-white`
          : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-gray-800/40 rounded-xl overflow-hidden border border-gray-700/50">
      <div className="flex bg-gray-900/60">
        <TabButton tool="Developer" label="Developer" activeColor="bg-blue-600" />
        <TabButton tool="Researcher" label="Researcher" activeColor="bg-teal-600" />
        <TabButton tool="Image" label="Image" activeColor="bg-purple-600" />
      </div>
      <div className="flex-grow">
        {renderActiveTool()}
      </div>
    </div>
  );
};

export default ToolsPanel;