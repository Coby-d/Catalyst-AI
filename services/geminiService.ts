import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
import { ChatMessage, DeveloperAction, ResearcherAction, ImageAction } from '../types';

// FIX: Initialize the GoogleGenAI client with the API key from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getDeveloperPrompt = (action: DeveloperAction, input: string): string => {
  switch (action) {
    case DeveloperAction.GENERATE_CODE:
      return `Generate code for the following description, making sure to include language identifiers for markdown code blocks: ${input}`;
    case DeveloperAction.EXPLAIN_CODE:
      return `Explain the following code snippet:\n\`\`\`\n${input}\n\`\`\``;
    case DeveloperAction.REFACTOR_CODE:
      return `Refactor the following code to improve it. Provide the refactored code in a markdown block with the correct language identifier:\n\`\`\`\n${input}\n\`\`\``;
    case DeveloperAction.FIND_BUGS:
      return `Find potential bugs in the following code. Explain the bug and provide a corrected version in a markdown block with the correct language identifier:\n\`\`\`\n${input}\n\`\`\``;
    default:
      throw new Error('Unknown developer action');
  }
};

export const handleDeveloperAction = async (action: DeveloperAction, input: string): Promise<ChatMessage> => {
  const prompt = getDeveloperPrompt(action, input);
  // FIX: Use 'gemini-2.5-pro' for complex coding tasks as per guidelines.
  const model = 'gemini-2.5-pro';
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return {
    role: 'model',
    content: response.text,
  };
};

const getResearcherPrompt = (action: ResearcherAction, input: string): string => {
  switch (action) {
    case ResearcherAction.SUMMARIZE_TEXT:
      return `Summarize the following text:\n\n${input}`;
    case ResearcherAction.FIND_SOURCES:
      return `Find reliable sources and citations for the following topic: ${input}`;
    case ResearcherAction.EXPLAIN_CONCEPTS:
      return `Explain the following concept in simple terms: ${input}`;
    case ResearcherAction.GENERATE_OUTLINE:
      return `Generate a structured outline for a paper/article on this topic: ${input}`;
    default:
      throw new Error('Unknown researcher action');
  }
};

export const handleResearcherAction = async (action: ResearcherAction, input: string): Promise<ChatMessage> => {
  const prompt = getResearcherPrompt(action, input);
  // FIX: Use 'gemini-2.5-flash' for general text tasks as per guidelines.
  const model = 'gemini-2.5-flash';
  
  const useSearch = action === ResearcherAction.FIND_SOURCES;
  
  // FIX: Use Google Search grounding for finding sources.
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      ...(useSearch && { tools: [{ googleSearch: {} }] }),
    },
  });

  return {
    role: 'model',
    content: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
  };
};

export const handleImageAction = async (action: ImageAction, prompt: string, base64Image?: string, mimeType?: string): Promise<ChatMessage> => {
    // Use the high-quality Imagen 4 model for image generation
    if (action === ImageAction.GENERATE_IMAGE) {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });
        
        const imageBytes = response.generatedImages[0]?.image?.imageBytes;
        if (imageBytes) {
            const imageUrl = `data:image/png;base64,${imageBytes}`;
            return {
                role: 'model',
                content: `Here is the generated image:\n\n![${prompt}](${imageUrl})`
            };
        } else {
             return { role: 'model', content: "Sorry, I couldn't generate an image. Please try again." };
        }
    // Use gemini-2.5-flash-image for image editing, as it's designed for that purpose
    } else if (action === ImageAction.EDIT_IMAGE) {
        if (!base64Image || !mimeType) {
            throw new Error("Image data is required for editing.");
        }
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType: mimeType } },
                    { text: prompt }
                ]
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart?.inlineData) {
            const base64Data = imagePart.inlineData.data;
            const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${base64Data}`;
             return {
                role: 'model',
                content: `Here is the edited image:\n\n![Edited image](${imageUrl})`
            };
        } else {
            return { role: 'model', content: "Sorry, I couldn't edit the image. Please try again." };
        }
    }
    throw new Error("Unknown image action");
};

export const sendChatMessage = async (message: string): Promise<ChatMessage> => {
  // FIX: Use 'gemini-2.5-flash' for general chat.
  const model = 'gemini-2.5-flash';
  
  const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: message,
  });

  return {
    role: 'model',
    content: response.text,
  };
};

export const sendImageChatMessage = async (prompt: string, base64Image: string, mimeType: string): Promise<ChatMessage> => {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { data: base64Image, mimeType: mimeType } }
            ]
        },
    });
    return {
        role: 'model',
        content: response.text,
    };
};

export const generateChatTitle = async (firstMessage: string): Promise<string> => {
  const prompt = `Generate a very short, concise title (4 words maximum) for a conversation that starts with this message. Respond with only the title, no extra text, formatting, or quotation marks: "${firstMessage}"`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        stopSequences: ["\n"] 
      }
    });
    return response.text.trim() || firstMessage.substring(0, 40) + '...';
  } catch (error) {
    console.error("Error generating title:", error);
    return firstMessage.substring(0, 40) + '...';
  }
};