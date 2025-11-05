// FIX: Removed a self-referential import of `ChatMessage` that was previously on line 1.
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: any[];
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export enum DeveloperAction {
  GENERATE_CODE = 'Generate Code',
  EXPLAIN_CODE = 'Explain Code',
  REFACTOR_CODE = 'Refactor Code',
  FIND_BUGS = 'Find Bugs',
}

export enum ResearcherAction {
  SUMMARIZE_TEXT = 'Summarize Text',
  FIND_SOURCES = 'Find Sources',
  EXPLAIN_CONCEPTS = 'Explain Concepts',
  GENERATE_OUTLINE = 'Generate Outline',
}

export enum ImageAction {
  GENERATE_IMAGE = 'Generate Image',
  EDIT_IMAGE = 'Edit Image',
}

export type Tool = 'Developer' | 'Researcher' | 'Image';