import React, { useState, useRef } from 'react';
import { ImageAction } from '../types';

interface ImageToolsProps {
  onSubmit: (action: ImageAction, prompt: string, base64Image?: string, mimeType?: string) => void;
  onSendImage: (prompt: string, base64Image: string, mimeType: string) => void;
  isLoading: boolean;
}

const ActionButton: React.FC<{
  label: string;
  onClick: () => void;
  disabled: boolean;
  tooltip: string;
  className?: string;
  icon?: React.ReactNode;
}> = ({ label, onClick, disabled, tooltip, className = '', icon }) => (
  <div className="relative group flex justify-center">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-200 rounded-lg transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400 border border-gray-600/80 ${className}`}
      aria-label={`${label}: ${tooltip}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg border border-gray-700 z-10">
      {tooltip}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
    </div>
  </div>
);


const ImageTools: React.FC<ImageToolsProps> = ({ onSubmit, onSendImage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAction = (action: ImageAction) => {
    if (!prompt) return;
    if (action === ImageAction.EDIT_IMAGE && !imageFile) return;

    if (imageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => {
            const result = reader.result as string;
            const base64Image = result.split(',')[1];
            onSubmit(action, prompt, base64Image, imageFile.type);
        };
        reader.onerror = (error) => console.error('Error reading file:', error);
    } else {
        onSubmit(action, prompt);
    }
  };

  const handleSend = () => {
      if (!imageFile) return;
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => {
          const result = reader.result as string;
          const base64Image = result.split(',')[1];
          onSendImage(prompt, base64Image, imageFile.type);
      };
      reader.onerror = (error) => console.error('Error reading file:', error);
  }
  
  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <div className="bg-gray-900/50 p-6 rounded-xl shadow-xl flex flex-col border border-gray-700/50">
      <h2 className="text-xl font-semibold mb-4 text-purple-300 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
        Image Tools
      </h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image, or ask a question about it..."
        rows={3}
        className="w-full bg-gray-800/80 border border-gray-700 rounded-lg p-4 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none text-gray-300"
      />

      <div className="mt-4 flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-4 min-h-[150px] transition-colors duration-200">
        {previewUrl ? (
          <div className="relative group w-full h-full flex items-center justify-center">
            <img src={previewUrl} alt="Preview" className="max-h-36 object-contain rounded-md" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                <button onClick={clearImage} className="flex items-center text-white bg-red-600/80 hover:bg-red-700 rounded-full p-2 transition-colors shadow-lg" aria-label="Remove image">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center text-center text-gray-400 cursor-pointer w-full h-full p-4 hover:bg-gray-800/50 rounded-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-500 mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm">Upload an image</p>
            <span className="mt-1 text-xs text-purple-400 hover:underline">Click to browse</span>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
          </label>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
         <ActionButton
            label={ImageAction.GENERATE_IMAGE}
            onClick={() => handleAction(ImageAction.GENERATE_IMAGE)}
            disabled={isLoading || !prompt}
            tooltip="Create a new image from the text prompt."
            className="bg-gray-700/50 hover:bg-purple-600"
        />
        <ActionButton
            label={ImageAction.EDIT_IMAGE}
            onClick={() => handleAction(ImageAction.EDIT_IMAGE)}
            disabled={isLoading || !prompt || !imageFile}
            tooltip="Modify the uploaded image using the text prompt."
            className="bg-gray-700/50 hover:bg-purple-600"
        />
         <ActionButton
            label="Send"
            onClick={handleSend}
            disabled={isLoading || !imageFile}
            tooltip="Send the image and prompt to the chat."
            className="bg-blue-600 hover:bg-blue-700"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>}
        />
      </div>
    </div>
  );
};

export default ImageTools;